import { NextRequest, NextResponse } from 'next/server'

function checkAdmin(req: NextRequest) {
  return req.headers.get('x-admin-key') === process.env.ADMIN_SECRET_KEY
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!checkAdmin(req)) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  const { id } = await params
  const body = await req.json()
  const { prisma } = await import('@linfini/db')

  const event = await prisma.event.update({
    where: { id },
    data: {
      ...(body.title !== undefined && { title: body.title }),
      ...(body.description !== undefined && { description: body.description }),
      ...(body.shortDesc !== undefined && { shortDesc: body.shortDesc }),
      ...(body.date !== undefined && { date: new Date(body.date) }),
      ...(body.doorsOpen !== undefined && { doorsOpen: body.doorsOpen ? new Date(body.doorsOpen) : null }),
      ...(body.venue !== undefined && { venue: body.venue }),
      ...(body.imageUrl !== undefined && { imageUrl: body.imageUrl }),
      ...(body.dressCode !== undefined && { dressCode: body.dressCode }),
      ...(body.ageRestriction !== undefined && { ageRestriction: body.ageRestriction ? Number(body.ageRestriction) : null }),
      ...(body.categories !== undefined && { categories: body.categories }),
      ...(body.published !== undefined && { published: body.published }),
      ...(body.featured !== undefined && { featured: body.featured }),
      ...(body.soldOut !== undefined && { soldOut: body.soldOut }),
    },
    include: { ticketTypes: true },
  })
  return NextResponse.json(event)
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!checkAdmin(req)) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  const { id } = await params
  const { prisma } = await import('@linfini/db')
  await prisma.event.delete({ where: { id } })
  return NextResponse.json({ success: true })
}

// Ajouter un type de billet
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!checkAdmin(req)) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  const { id: eventId } = await params
  const body = await req.json()
  const { prisma } = await import('@linfini/db')

  const ticketType = await prisma.ticketType.create({
    data: {
      eventId,
      name: body.name,
      description: body.description || null,
      price: Number(body.price),
      quantity: Number(body.quantity),
      maxPerOrder: Number(body.maxPerOrder) || 10,
      includes: body.includes || [],
      active: true,
      position: body.position || 0,
    },
  })
  return NextResponse.json(ticketType)
}
