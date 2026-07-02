import { NextRequest, NextResponse } from 'next/server'

function checkAdmin(req: NextRequest) {
  return req.headers.get('x-admin-key') === process.env.ADMIN_SECRET_KEY
}

export async function GET(req: NextRequest) {
  if (!checkAdmin(req)) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  const eventId = req.nextUrl.searchParams.get('eventId')
  const { prisma } = await import('@linfini/db')

  const tickets = await prisma.ticket.findMany({
    where: eventId ? { eventId } : undefined,
    include: { event: { select: { title: true } }, ticketType: { select: { name: true } } },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(tickets)
}
