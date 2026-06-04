import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

export async function POST(req: NextRequest) {
  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json(
      { error: 'Configuration de paiement manquante.' },
      { status: 500 }
    )
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2026-02-25.clover',
  })

  let body: {
    ticketTypeId: string
    quantity: number
    buyerFirstName: string
    buyerLastName: string
    buyerEmail: string
    buyerPhone?: string
    eventSlug: string
  }

  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Corps de requête invalide.' }, { status: 400 })
  }

  const {
    ticketTypeId,
    quantity,
    buyerFirstName,
    buyerLastName,
    buyerEmail,
    buyerPhone,
    eventSlug,
  } = body

  if (!ticketTypeId || !quantity || !buyerFirstName || !buyerLastName || !buyerEmail || !eventSlug) {
    return NextResponse.json({ error: 'Paramètres manquants.' }, { status: 400 })
  }

  if (quantity < 1 || quantity > 20) {
    return NextResponse.json({ error: 'Quantité invalide.' }, { status: 400 })
  }

  try {
    const { prisma } = await import('@linfini/db')

    // Récupérer le type de billet avec l'événement
    const ticketType = await prisma.ticketType.findUnique({
      where: { id: ticketTypeId },
      include: { event: true },
    })

    if (!ticketType) {
      return NextResponse.json({ error: 'Type de billet introuvable.' }, { status: 404 })
    }

    if (!ticketType.active) {
      return NextResponse.json({ error: 'Ce type de billet n\'est plus disponible.' }, { status: 400 })
    }

    // Vérifier les dates de vente
    const now = new Date()
    if (ticketType.salesStart && new Date(ticketType.salesStart) > now) {
      return NextResponse.json({ error: 'La vente n\'a pas encore commencé.' }, { status: 400 })
    }
    if (ticketType.salesEnd && new Date(ticketType.salesEnd) < now) {
      return NextResponse.json({ error: 'La vente est terminée.' }, { status: 400 })
    }

    // Vérifier la disponibilité
    const remaining = ticketType.quantity - ticketType.sold
    if (remaining < quantity) {
      return NextResponse.json(
        {
          error:
            remaining <= 0
              ? 'Ces billets sont épuisés.'
              : `Seulement ${remaining} billet${remaining > 1 ? 's' : ''} disponible${remaining > 1 ? 's' : ''}.`,
        },
        { status: 400 }
      )
    }

    // Vérifier maxPerOrder
    if (quantity > ticketType.maxPerOrder) {
      return NextResponse.json(
        { error: `Maximum ${ticketType.maxPerOrder} billet${ticketType.maxPerOrder > 1 ? 's' : ''} par commande.` },
        { status: 400 }
      )
    }

    const unitPrice = ticketType.price
    const totalAmount = unitPrice * quantity

    // Créer le ticket en DB avec status RESERVED
    const ticket = await prisma.ticket.create({
      data: {
        eventId: ticketType.eventId,
        ticketTypeId: ticketType.id,
        buyerEmail,
        buyerFirstName,
        buyerLastName,
        buyerPhone: buyerPhone || null,
        quantity,
        unitPrice,
        total: totalAmount,
        status: 'RESERVED',
      },
    })

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    // Créer la session Stripe Checkout
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      customer_email: buyerEmail,
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: `${ticketType.name} — ${ticketType.event.title}`,
              description: ticketType.description || undefined,
            },
            unit_amount: Math.round(unitPrice * 100),
          },
          quantity,
        },
      ],
      metadata: {
        ticketId: ticket.id,
        eventSlug,
      },
      success_url: `${appUrl}/evenements/confirmation?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/evenements/${eventSlug}`,
    })

    // Mettre à jour le ticket avec la session Stripe
    await prisma.ticket.update({
      where: { id: ticket.id },
      data: { stripeSessionId: session.id },
    })

    return NextResponse.json({ url: session.url })
  } catch (err) {
    console.error('[checkout] Error:', err)
    return NextResponse.json(
      { error: 'Erreur lors de la création de la session de paiement.' },
      { status: 500 }
    )
  }
}
