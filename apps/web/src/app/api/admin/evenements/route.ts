import { NextRequest, NextResponse } from 'next/server'

function checkAdmin(req: NextRequest) {
  const key = req.headers.get('x-admin-key')
  return key === process.env.ADMIN_SECRET_KEY
}

export async function GET(req: NextRequest) {
  if (!checkAdmin(req)) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  const { prisma } = await import('@linfini/db')
  const events = await prisma.event.findMany({
    include: { ticketTypes: { orderBy: { position: 'asc' } } },
    orderBy: { date: 'desc' },
  })
  return NextResponse.json(events)
}

export async function POST(req: NextRequest) {
  if (!checkAdmin(req)) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  const body = await req.json()
  const { prisma } = await import('@linfini/db')

  const slug = body.title
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') + '-' + Date.now()

  const event = await prisma.event.create({
    data: {
      title: body.title,
      slug,
      description: body.description || null,
      shortDesc: body.shortDesc || null,
      date: new Date(body.date),
      doorsOpen: body.doorsOpen ? new Date(body.doorsOpen) : null,
      venue: body.venue || "L'Infini Club",
      imageUrl: body.imageUrl || null,
      dressCode: body.dressCode || null,
      ageRestriction: body.ageRestriction ? Number(body.ageRestriction) : null,
      categories: body.categories || [],
      published: body.published ?? false,
      featured: body.featured ?? false,
    },
  })
  return NextResponse.json(event)
}
