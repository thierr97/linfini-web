import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { prisma } = await import('@linfini/db')
    const body = await req.json()

    const {
      title,
      slug,
      description,
      shortDesc,
      date,
      doorsOpen,
      venue,
      imageUrl,
      dressCode,
      ageRestriction,
      categories,
      published,
      featured,
      ticketTypes,
    } = body

    if (!title || !slug || !date) {
      return NextResponse.json({ error: 'Titre, slug et date sont obligatoires.' }, { status: 400 })
    }

    if (!Array.isArray(ticketTypes) || ticketTypes.length === 0) {
      return NextResponse.json({ error: 'Au moins un type de billet est requis.' }, { status: 400 })
    }

    const event = await prisma.$transaction(async (tx: any) => {
      const newEvent = await tx.event.create({
        data: {
          title,
          slug,
          description: description ?? null,
          shortDesc: shortDesc ?? null,
          date: new Date(date),
          doorsOpen: doorsOpen ? new Date(doorsOpen) : null,
          venue: venue ?? "L'Infini Club",
          imageUrl: imageUrl ?? null,
          dressCode: dressCode ?? null,
          ageRestriction: ageRestriction ?? null,
          categories: categories ?? [],
          published: published ?? false,
          featured: featured ?? false,
        },
      })

      await tx.ticketType.createMany({
        data: ticketTypes.map((tt: any, i: number) => ({
          eventId: newEvent.id,
          name: tt.name,
          description: tt.description ?? null,
          price: tt.price,
          quantity: tt.quantity,
          maxPerOrder: tt.maxPerOrder ?? 10,
          salesStart: tt.salesStart ? new Date(tt.salesStart) : null,
          salesEnd: tt.salesEnd ? new Date(tt.salesEnd) : null,
          includes: tt.includes ?? [],
          active: true,
          position: tt.position ?? i,
        })),
      })

      return tx.event.findUnique({
        where: { id: newEvent.id },
        include: { ticketTypes: true },
      })
    })

    return NextResponse.json({ success: true, event })
  } catch (err: any) {
    console.error('[POST /api/events]', err)
    if (err?.code === 'P2002') {
      return NextResponse.json({ error: 'Ce slug est déjà utilisé par un autre événement.' }, { status: 409 })
    }
    return NextResponse.json({ error: 'Erreur interne du serveur.' }, { status: 500 })
  }
}
