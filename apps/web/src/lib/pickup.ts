// Commandes click & collect : code de retrait + injection caisse Odoo.
// Point d'entrée unique : ensurePickupOrder(sessionId) — idempotent, appelé
// par la page de confirmation ET par le webhook Stripe (le premier arrivé crée).

import { pushOrderToPos, type WebOrderLine } from '@/lib/odoo/pushOrder'

async function db() {
  const { prisma } = await import('@linfini/db')
  return prisma
}

function randomCode(): string {
  return String(Math.floor(Math.random() * 1_000_000)).padStart(6, '0')
}

async function generateUniqueCode(prisma: any): Promise<string> {
  for (let i = 0; i < 8; i++) {
    const code = randomCode()
    const clash = await prisma.pickupOrder.findUnique({ where: { code } })
    if (!clash) return code
  }
  throw new Error('Impossible de générer un code de retrait unique')
}

export interface PickupOrderView {
  id: string
  code: string
  customerName: string
  customerEmail: string | null
  note: string | null
  lines: WebOrderLine[]
  total: number
  status: string
  odooRef: string | null
  odooError: string | null
  createdAt: string
}

function toView(o: any): PickupOrderView {
  return {
    id: o.id,
    code: o.code,
    customerName: o.customerName,
    customerEmail: o.customerEmail,
    note: o.note,
    lines: o.lines as WebOrderLine[],
    total: o.total,
    status: o.status,
    odooRef: o.odooRef,
    odooError: o.odooError,
    createdAt: (o.createdAt instanceof Date ? o.createdAt : new Date(o.createdAt)).toISOString(),
  }
}

/** Caisse de retrait à indiquer au client : chaque zone a sa propre caisse
 *  (📍 en tête de note). Sans zone connue → Smile Bar. */
const PICKUP_COUNTERS: Record<string, string> = {
  'Maestro':    'à la caisse du Maestro',
  'Smile Bar':  'au Smile Bar',
  'Boîte 1':    'à la caisse de la Boîte 1',
  'Boîte 2':    'à la caisse de la Boîte 2',
  'Terrasse 1': 'à la caisse de la Terrasse 1',
  'Terrasse 2': 'à la caisse de la Terrasse 2',
}

export function pickupCounter(order: { note?: string | null }): string {
  const loc = order.note?.match(/📍 ([^·]+)/)?.[1]?.trim()
  return (loc && PICKUP_COUNTERS[loc]) || 'au Smile Bar'
}

/** Crée (ou retrouve) la commande de retrait pour une session Stripe payée. */
export async function ensurePickupOrder(sessionId: string): Promise<PickupOrderView> {
  const prisma = await db()

  const existing = await prisma.pickupOrder.findUnique({ where: { stripeSessionId: sessionId } })
  if (existing) return toView(existing)

  // Vérification côté Stripe : la session doit être réellement payée
  const Stripe = (await import('stripe')).default
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2026-02-25.clover' })
  const session = await stripe.checkout.sessions.retrieve(sessionId)

  if (session.payment_status !== 'paid') throw new Error('Paiement non confirmé')
  if (session.metadata?.type !== 'food_order') throw new Error('Session Stripe inattendue')

  const rawLines: WebOrderLine[] = JSON.parse(session.metadata?.lines ?? '[]')
  if (!rawLines.length) throw new Error('Commande vide')

  // Remise fidélité éventuelle (déjà appliquée au paiement via coupon Stripe) :
  // on répercute le même % sur les lignes stockées pour rester cohérent avec le
  // total réellement payé (confirmation, écran bar, caisse Odoo).
  const discount = Number(session.metadata?.clientDiscount ?? 0) || 0
  const lines: WebOrderLine[] = discount > 0
    ? rawLines.map(l => ({ ...l, price: Math.round(l.price * (1 - discount / 100) * 100) / 100 }))
    : rawLines

  const code = await generateUniqueCode(prisma)
  const total = (session.amount_total ?? 0) / 100

  let order
  try {
    order = await prisma.pickupOrder.create({
      data: {
        code,
        stripeSessionId: sessionId,
        customerName: session.metadata?.customerName || 'Client',
        customerEmail: session.customer_email || session.customer_details?.email || null,
        note: [
          session.metadata?.location ? `📍 ${session.metadata.location}` : '',
          session.metadata?.note,
          discount > 0 ? `Remise fidélité ${discount}%` : '',
        ].filter(Boolean).join(' · ') || null,
        lines: lines as any,
        total,
      },
    })
  } catch (e: any) {
    // Course webhook / page de confirmation : l'autre a gagné, on relit
    const raced = await prisma.pickupOrder.findUnique({ where: { stripeSessionId: sessionId } })
    if (raced) return toView(raced)
    throw e
  }

  // Injection caisse Odoo — ne bloque jamais le client si la caisse est fermée
  await syncOrderToOdoo(order.id)

  // Email avec le code — best effort
  try {
    const fresh = await prisma.pickupOrder.findUnique({ where: { id: order.id } })
    if (fresh?.customerEmail) {
      const { sendPickupCodeEmail } = await import('@/lib/email')
      await sendPickupCodeEmail(toView(fresh))
    }
  } catch (e) {
    console.error('[pickup] email échoué:', e)
  }

  const final = await prisma.pickupOrder.findUnique({ where: { id: order.id } })
  return toView(final)
}

/** (Re)tente l'injection en caisse Odoo. Stocke l'erreur au lieu de la propager. */
export async function syncOrderToOdoo(orderId: string): Promise<PickupOrderView> {
  const prisma = await db()
  const order = await prisma.pickupOrder.findUnique({ where: { id: orderId } })
  if (!order) throw new Error('Commande introuvable')
  if (order.odooOrderId) return toView(order)

  try {
    const res = await pushOrderToPos({
      code: order.code,
      customerName: order.customerName,
      note: order.note,
      lines: order.lines as unknown as WebOrderLine[],
      total: order.total,
    })
    const updated = await prisma.pickupOrder.update({
      where: { id: orderId },
      data: { odooOrderId: res.orderId, odooRef: res.ref, odooError: null },
    })
    return toView(updated)
  } catch (e: any) {
    console.error('[pickup] injection Odoo échouée:', e?.message)
    const updated = await prisma.pickupOrder.update({
      where: { id: orderId },
      data: { odooError: String(e?.message ?? e).slice(0, 500) },
    })
    return toView(updated)
  }
}

export async function getPickupOrder(idOrCode: { id?: string; code?: string }): Promise<PickupOrderView | null> {
  const prisma = await db()
  const order = idOrCode.id
    ? await prisma.pickupOrder.findUnique({ where: { id: idOrCode.id } })
    : await prisma.pickupOrder.findUnique({ where: { code: idOrCode.code! } })
  return order ? toView(order) : null
}

/** Commandes actives des dernières 24 h pour l'écran de préparation. */
export async function listActiveOrders(): Promise<PickupOrderView[]> {
  const prisma = await db()
  const since = new Date(Date.now() - 24 * 3600 * 1000)
  const orders = await prisma.pickupOrder.findMany({
    where: { createdAt: { gte: since } },
    orderBy: { createdAt: 'desc' },
    take: 100,
  })
  return orders.map(toView)
}

export async function setOrderStatus(id: string, status: string): Promise<PickupOrderView> {
  const allowed = ['NEW', 'PREP', 'READY', 'SERVED', 'CANCELLED']
  if (!allowed.includes(status)) throw new Error('Statut invalide')
  const prisma = await db()
  const updated = await prisma.pickupOrder.update({ where: { id }, data: { status: status as any } })
  return toView(updated)
}
