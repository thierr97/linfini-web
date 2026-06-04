import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

// Désactive le bodyParser de Next.js pour lire le raw body (requis pour la vérification de signature Stripe)
export const config = {
  api: {
    bodyParser: false,
  },
}

export async function POST(req: NextRequest) {
  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: 'Stripe non configuré.' }, { status: 500 })
  }

  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Webhook secret manquant.' }, { status: 500 })
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2026-02-25.clover',
  })

  const sig = req.headers.get('stripe-signature')
  if (!sig) {
    return NextResponse.json({ error: 'Signature manquante.' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    const rawBody = await req.text()
    event = stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err) {
    console.error('[webhook/stripe] Signature invalide:', err)
    return NextResponse.json({ error: 'Signature invalide.' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session

    const ticketId = session.metadata?.ticketId
    if (!ticketId) {
      console.error('[webhook/stripe] ticketId manquant dans les metadata')
      return NextResponse.json({ received: true })
    }

    try {
      const { prisma } = await import('@linfini/db')

      // Récupérer le ticket
      const ticket = await prisma.ticket.findUnique({
        where: { id: ticketId },
      })

      if (!ticket) {
        console.error('[webhook/stripe] Ticket introuvable:', ticketId)
        return NextResponse.json({ received: true })
      }

      // Mettre à jour le ticket : CONFIRMED + stripePaymentId
      await prisma.ticket.update({
        where: { id: ticketId },
        data: {
          status: 'CONFIRMED',
          stripePaymentId: session.payment_intent as string | null,
        },
      })

      // Incrémenter le compteur sold du type de billet
      await prisma.ticketType.update({
        where: { id: ticket.ticketTypeId },
        data: {
          sold: {
            increment: ticket.quantity,
          },
        },
      })

      // Mettre à jour l'événement soldOut si tous les billets sont vendus
      const ticketType = await prisma.ticketType.findUnique({
        where: { id: ticket.ticketTypeId },
      })

      if (ticketType) {
        const allTypesForEvent = await prisma.ticketType.findMany({
          where: { eventId: ticket.eventId, active: true },
        })
        const allSoldOut = allTypesForEvent.every((tt) => tt.sold >= tt.quantity)
        if (allSoldOut) {
          await prisma.event.update({
            where: { id: ticket.eventId },
            data: { soldOut: true },
          })
        }
      }

      // Envoyer l'email de confirmation avec le billet + QR code
      try {
        const fullTicket = await prisma.ticket.findUnique({
          where: { id: ticketId },
          include: { event: true, ticketType: true },
        })
        if (fullTicket) {
          const { sendTicketConfirmationEmail } = await import('@/lib/email')
          await sendTicketConfirmationEmail(fullTicket)
        }
      } catch (emailErr) {
        console.error('[webhook/stripe] Erreur email:', emailErr)
        // Ne pas faire échouer le webhook pour un email raté
      }

      console.log(`[webhook/stripe] Ticket ${ticketId} confirmé`)
    } catch (err) {
      console.error('[webhook/stripe] Erreur DB:', err)
      // On retourne quand même 200 pour éviter les retry Stripe
      return NextResponse.json({ received: true })
    }
  }

  return NextResponse.json({ received: true })
}
