import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const Stripe = (await import('stripe')).default
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2026-02-25.clover' })

    const { lines, customerName, customerEmail, customerPhone, note } = await req.json()

    if (!lines?.length) {
      return NextResponse.json({ error: 'Panier vide.' }, { status: 400 })
    }

    // Remise fidélité : appliquée automatiquement si le client connecté y a droit
    // (jamais dérivée du client — on relit la remise en base côté serveur).
    let clientDiscount = 0
    let clientEmail: string | undefined
    try {
      const sess = await getSession()
      if (sess?.id) {
        const { prisma } = await import('@linfini/db')
        const client = await prisma.client.findUnique({
          where: { id: sess.id },
          select: { discount: true, active: true, email: true },
        })
        if (client?.active && client.discount > 0) {
          clientDiscount = Math.min(100, client.discount)
          clientEmail = client.email
        }
      }
    } catch (e) { console.error('[order] lecture remise client', e) }

    const lineItems = lines.map((line: any) => ({
      price_data: {
        currency: 'eur',
        product_data: {
          name: line.name,
          description: line.details || undefined,
        },
        unit_amount: Math.round(line.price * 100),
      },
      quantity: line.qty,
    }))

    const params: any = {
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: lineItems,
      customer_email: customerEmail || clientEmail || undefined,
      locale: 'fr',
      metadata: {
        type: 'food_order',
        customerName: customerName || '',
        customerPhone: customerPhone || '',
        note: note || '',
        lines: JSON.stringify(lines),
        clientDiscount: String(clientDiscount),
      },
      success_url: `https://infinigp.fr/menu/confirmation?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `https://infinigp.fr/menu`,
    }

    // Coupon % réutilisable par taux (affiché « -X% » sur la page de paiement)
    if (clientDiscount > 0) {
      const couponId = `fidelite-${clientDiscount}`
      try {
        await stripe.coupons.retrieve(couponId)
      } catch {
        await stripe.coupons.create({ id: couponId, percent_off: clientDiscount, duration: 'once', name: `Remise fidélité ${clientDiscount}%` })
      }
      params.discounts = [{ coupon: couponId }]
    }

    const session = await stripe.checkout.sessions.create(params)
    return NextResponse.json({ url: session.url })
  } catch (err: any) {
    console.error('[POST /api/order]', err)
    return NextResponse.json({ error: err.message || 'Erreur serveur.' }, { status: 500 })
  }
}
