import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const Stripe = (await import('stripe')).default
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2026-02-25.clover' })

    const { lines, customerName, customerEmail, customerPhone, note } = await req.json()

    if (!lines?.length) {
      return NextResponse.json({ error: 'Panier vide.' }, { status: 400 })
    }

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

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: lineItems,
      customer_email: customerEmail || undefined,
      locale: 'fr',
      metadata: {
        type: 'food_order',
        customerName: customerName || '',
        customerPhone: customerPhone || '',
        note: note || '',
        lines: JSON.stringify(lines),
      },
      success_url: `https://infinigp.fr/menu/confirmation?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `https://infinigp.fr/menu`,
    })

    return NextResponse.json({ url: session.url })
  } catch (err: any) {
    console.error('[POST /api/order]', err)
    return NextResponse.json({ error: err.message || 'Erreur serveur.' }, { status: 500 })
  }
}
