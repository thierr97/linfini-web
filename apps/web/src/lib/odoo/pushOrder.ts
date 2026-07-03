// Injection d'une commande web payée dans la caisse Odoo POS (SMILE BAR).
// La commande apparaît dans la session ouverte, encaissée avec le moyen
// « Paiement Internet », remise ligne à ligne si le prix payé < prix caisse.

import { odooCall } from './client'

const POS_CONFIG_ID = Number(process.env.ODOO_POS_CONFIG_ID ?? 2)   // L'INFINI - SMILE BAR
const PM_INTERNET_ID = Number(process.env.ODOO_POS_PM_ID ?? 12)     // « Paiement Internet » (journal Stripe)
const TVA_RATE = 0.085                                              // TVA Guadeloupe incluse dans les prix

export interface WebOrderLine {
  id: string      // id product.template Odoo (côté site)
  name: string
  price: number   // prix TTC payé en ligne
  qty: number
}

export interface OdooPushResult {
  orderId: number
  ref: string
}

export async function pushOrderToPos(order: {
  code: string
  customerName: string
  note?: string | null
  lines: WebOrderLine[]
  total: number
}): Promise<OdooPushResult> {
  // 1. Session ouverte sur la caisse SMILE BAR
  const sessions = await odooCall<any[]>('pos.session', 'search_read',
    [[['config_id', '=', POS_CONFIG_ID], ['state', '=', 'opened']]],
    { fields: ['id', 'name'], limit: 1 }
  )
  if (!sessions.length) throw new Error('Aucune session de caisse ouverte (SMILE BAR)')
  const sessionId = sessions[0].id

  // 2. Variantes produit + prix caisse (pour calculer la remise)
  const tmplIds = order.lines.map(l => Number(l.id)).filter(n => Number.isFinite(n) && n > 0)
  const variants = tmplIds.length
    ? await odooCall<any[]>('product.product', 'search_read',
        [[['product_tmpl_id', 'in', tmplIds]]],
        { fields: ['id', 'product_tmpl_id', 'list_price'] })
    : []
  const byTmpl = new Map(variants.map(v => [v.product_tmpl_id[0], v]))

  let amountTotal = 0
  let amountHT = 0
  const posLines = order.lines.map(l => {
    const v = byTmpl.get(Number(l.id))
    const listPrice: number = v?.list_price && v.list_price > 0 ? v.list_price : l.price
    // remise = écart entre prix caisse et prix payé en ligne
    const discount = l.price < listPrice ? Math.round((1 - l.price / listPrice) * 10000) / 100 : 0
    const incl = Math.round(l.price * l.qty * 100) / 100
    const ht = Math.round((incl / (1 + TVA_RATE)) * 100) / 100
    amountTotal += incl
    amountHT += ht
    if (!v) throw new Error(`Produit Odoo introuvable pour « ${l.name} » (template ${l.id})`)
    return [0, 0, {
      product_id: v.id,
      qty: l.qty,
      price_unit: listPrice,
      discount,
      price_subtotal: ht,
      price_subtotal_incl: incl,
      full_product_name: l.name,
    }]
  })
  amountTotal = Math.round(amountTotal * 100) / 100
  const amountTax = Math.round((amountTotal - amountHT) * 100) / 100

  // 3. Création de la commande POS (draft)
  const orderId = await odooCall<number>('pos.order', 'create', [{
    session_id: sessionId,
    lines: posLines,
    amount_tax: amountTax,
    amount_total: amountTotal,
    amount_paid: 0,
    amount_return: 0,
    floating_order_name: `WEB #${order.code} — ${order.customerName}`.slice(0, 60),
    internal_note: [
      `PAYÉ PAR INTERNET (Stripe) — Retrait #${order.code}`,
      `Client : ${order.customerName}`,
      order.note ? `Note : ${order.note}` : '',
    ].filter(Boolean).join('\n'),
  }])

  // 4. Encaissement « Paiement Internet » (fallback Carte si le moyen n'existe plus)
  const wizardCtx = { active_id: orderId, active_ids: [orderId], active_model: 'pos.order' }
  try {
    const wid = await odooCall<number>('pos.make.payment', 'create',
      [{ amount: amountTotal, payment_method_id: PM_INTERNET_ID }], { context: wizardCtx })
    await odooCall('pos.make.payment', 'check', [[wid]], { context: wizardCtx })
  } catch {
    const wid = await odooCall<number>('pos.make.payment', 'create',
      [{ amount: amountTotal, payment_method_id: 2 }], { context: wizardCtx })
    await odooCall('pos.make.payment', 'check', [[wid]], { context: wizardCtx })
  }

  const [read] = await odooCall<any[]>('pos.order', 'read', [[orderId], ['pos_reference', 'state']])
  return { orderId, ref: read?.pos_reference ?? String(orderId) }
}
