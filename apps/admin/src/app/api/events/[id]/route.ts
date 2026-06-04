import { NextRequest, NextResponse } from 'next/server'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { prisma } = await import('@linfini/db')
    const body = await req.json()
    const { id } = await params

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
      soldOut,
      ticketTypes,
    } = body

    const event = await prisma.$transaction(async (tx: any) => {
      const updated = await tx.event.update({
        where: { id },
        data: {
          ...(title !== undefined && { title }),
          ...(slug !== undefined && { slug }),
          ...(description !== undefined && { description }),
          ...(shortDesc !== undefined && { shortDesc }),
          ...(date !== undefined && { date: new Date(date) }),
          ...(doorsOpen !== undefined && { doorsOpen: doorsOpen ? new Date(doorsOpen) : null }),
          ...(venue !== undefined && { venue }),
          ...(imageUrl !== undefined && { imageUrl }),
          ...(dressCode !== undefined && { dressCode }),
          ...(ageRestriction !== undefined && { ageRestriction }),
          ...(categories !== undefined && { categories }),
          ...(published !== undefined && { published }),
          ...(featured !== undefined && { featured }),
          ...(soldOut !== undefined && { soldOut }),
        },
      })

      if (Array.isArray(ticketTypes)) {
        for (const tt of ticketTypes) {
          if (tt.id) {
            // Update existing ticket type
            await tx.ticketType.update({
              where: { id: tt.id },
              data: {
                name: tt.name,
                description: tt.description ?? null,
                price: tt.price,
                quantity: tt.quantity,
                maxPerOrder: tt.maxPerOrder ?? 10,
                salesStart: tt.salesStart ? new Date(tt.salesStart) : null,
                salesEnd: tt.salesEnd ? new Date(tt.salesEnd) : null,
                includes: tt.includes ?? [],
                active: tt.active ?? true,
                position: tt.position ?? 0,
              },
            })
          } else {
            // Create new ticket type
            await tx.ticketType.create({
              data: {
                eventId: id,
                name: tt.name,
                description: tt.description ?? null,
                price: tt.price,
                quantity: tt.quantity,
                maxPerOrder: tt.maxPerOrder ?? 10,
                salesStart: tt.salesStart ? new Date(tt.salesStart) : null,
                salesEnd: tt.salesEnd ? new Date(tt.salesEnd) : null,
                includes: tt.includes ?? [],
                active: tt.active ?? true,
                position: tt.position ?? 0,
              },
            })
          }
        }
      }

      return tx.event.findUnique({
        where: { id },
        include: { ticketTypes: { orderBy: { position: 'asc' } } },
      })
    })

    return NextResponse.json({ success: true, event })
  } catch (err: any) {
    console.error('[PATCH /api/events/:id]', err)
    if (err?.code === 'P2025') {
      return NextResponse.json({ error: 'Événement introuvable.' }, { status: 404 })
    }
    if (err?.code === 'P2002') {
      return NextResponse.json({ error: 'Ce slug est déjà utilisé.' }, { status: 409 })
    }
    return NextResponse.json({ error: 'Erreur interne du serveur.' }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { prisma } = await import('@linfini/db')
    const { id } = await params

    await prisma.$transaction(async (tx: any) => {
      // Supprimer les tickets d'abord (contraintes FK)
      await tx.ticket.deleteMany({ where: { eventId: id } })
      await tx.ticketType.deleteMany({ where: { eventId: id } })
      await tx.event.delete({ where: { id } })
    })

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('[DELETE /api/events/:id]', err)
    if (err?.code === 'P2025') {
      return NextResponse.json({ error: 'Événement introuvable.' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Erreur interne du serveur.' }, { status: 500 })
  }
}
