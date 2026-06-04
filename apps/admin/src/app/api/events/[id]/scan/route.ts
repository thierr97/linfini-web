import { NextRequest, NextResponse } from 'next/server'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: eventId } = await params

  let body: { code: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Corps invalide.' }, { status: 400 })
  }

  const { code } = body
  if (!code?.trim()) {
    return NextResponse.json({ error: 'Code manquant.' }, { status: 400 })
  }

  try {
    const { prisma } = await import('@linfini/db')

    const ticket = await prisma.ticket.findFirst({
      where: { code: code.trim(), eventId },
      include: {
        event: { select: { title: true, date: true } },
        ticketType: { select: { name: true } },
      },
    })

    if (!ticket) {
      return NextResponse.json(
        { result: 'INVALID', message: 'Billet introuvable ou ne correspond pas à cet événement.' },
        { status: 404 }
      )
    }

    if (ticket.status === 'USED') {
      return NextResponse.json({
        result: 'ALREADY_USED',
        message: 'Billet déjà scanné.',
        scannedAt: ticket.scannedAt,
        ticket: {
          buyerFirstName: ticket.buyerFirstName,
          buyerLastName: ticket.buyerLastName,
          ticketType: ticket.ticketType.name,
          quantity: ticket.quantity,
        },
      })
    }

    if (ticket.status === 'CANCELLED' || ticket.status === 'REFUNDED') {
      return NextResponse.json({
        result: 'INVALID',
        message: `Billet ${ticket.status === 'CANCELLED' ? 'annulé' : 'remboursé'}.`,
      })
    }

    if (ticket.status === 'RESERVED') {
      return NextResponse.json({
        result: 'INVALID',
        message: 'Paiement non complété pour ce billet.',
      })
    }

    // PAID ou CONFIRMED → valider
    await prisma.ticket.update({
      where: { id: ticket.id },
      data: { status: 'USED', scannedAt: new Date() },
    })

    return NextResponse.json({
      result: 'OK',
      message: `Bienvenue ${ticket.buyerFirstName} ${ticket.buyerLastName} !`,
      ticket: {
        buyerFirstName: ticket.buyerFirstName,
        buyerLastName: ticket.buyerLastName,
        buyerEmail: ticket.buyerEmail,
        ticketType: ticket.ticketType.name,
        quantity: ticket.quantity,
        total: ticket.total,
      },
    })
  } catch (err) {
    console.error('[scan] Erreur:', err)
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 })
  }
}
