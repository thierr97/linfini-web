import { notFound } from 'next/navigation'
import ScannerClient from './ScannerClient'

async function getEvent(id: string) {
  try {
    const { prisma } = await import('@linfini/db')
    return await prisma.event.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        date: true,
        venue: true,
        tickets: {
          where: { status: 'USED' },
          select: { id: true },
        },
      },
    })
  } catch {
    return null
  }
}

export default async function ScanPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const event = await getEvent(id)
  if (!event) notFound()

  return (
    <ScannerClient
      eventId={event.id}
      eventTitle={event.title}
      eventDate={new Date(event.date).toLocaleDateString('fr-FR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
      })}
      scannedCount={event.tickets.length}
    />
  )
}
