export const dynamic = 'force-dynamic'

import EditEventForm from './EditEventForm'
import { notFound } from 'next/navigation'

async function getEvent(id: string) {
  try {
    const { prisma } = await import('@linfini/db')
    return await prisma.event.findUnique({
      where: { id },
      include: { ticketTypes: { orderBy: { position: 'asc' } } },
    })
  } catch {
    return null
  }
}

export default async function EditEventPage({ params }: { params: Promise<{ id: string }> }) {
  const event = await getEvent((await params).id)
  if (!event) notFound()
  return <EditEventForm event={event} />
}
