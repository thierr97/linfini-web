import { NextRequest, NextResponse } from 'next/server'

const VALID_STATUSES = ['RESERVED', 'PAID', 'CONFIRMED', 'USED', 'CANCELLED', 'REFUNDED']

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; ticketId: string }> }
) {
  try {
    const { prisma } = await import('@linfini/db')
    const { ticketId, id: eventId } = await params
    const body = await req.json()
    const { status } = body

    if (!status || !VALID_STATUSES.includes(status)) {
      return NextResponse.json(
        { error: `Statut invalide. Valeurs acceptées: ${VALID_STATUSES.join(', ')}` },
        { status: 400 }
      )
    }

    const ticket = await prisma.ticket.update({
      where: { id: ticketId, eventId },
      data: {
        status,
        ...(status === 'USED' && { scannedAt: new Date() }),
      },
    })

    return NextResponse.json({ success: true, ticket })
  } catch (err: any) {
    console.error('[PATCH /api/events/:id/tickets/:ticketId]', err)
    if (err?.code === 'P2025') {
      return NextResponse.json({ error: 'Billet introuvable.' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Erreur interne du serveur.' }, { status: 500 })
  }
}
