export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { revalidatePath } from 'next/cache'

async function getEvents() {
  try {
    const { prisma } = await import('@linfini/db')
    return await prisma.event.findMany({
      include: { ticketTypes: true, tickets: true },
      orderBy: { date: 'asc' },
    })
  } catch {
    return []
  }
}

async function togglePublish(formData: FormData) {
  'use server'
  const id = formData.get('id') as string
  const published = formData.get('published') === 'true'
  try {
    const { prisma } = await import('@linfini/db')
    await prisma.event.update({ where: { id }, data: { published: !published } })
    revalidatePath('/dashboard/events')
  } catch {}
}

export default async function EventsPage() {
  const events = await getEvents()

  return (
    <div className="min-h-screen bg-noir text-white">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Événements</h1>
          <p className="text-white/40 text-sm mt-1">{events.length} événement{events.length !== 1 ? 's' : ''}</p>
        </div>
        <Link
          href="/dashboard/events/nouveau"
          className="bg-braise hover:bg-ambre text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          + Nouvel événement
        </Link>
      </div>

      {events.length === 0 ? (
        <div className="bg-charbon rounded-xl border border-white/10 p-16 text-center">
          <div className="text-5xl mb-4">🎉</div>
          <p className="text-white/40 text-lg font-medium">Aucun événement programmé</p>
          <p className="text-white/20 text-sm mt-2">Créez votre premier événement pour commencer la billetterie.</p>
          <Link
            href="/dashboard/events/nouveau"
            className="inline-block mt-6 bg-braise hover:bg-ambre text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors"
          >
            + Créer un événement
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {events.map((event: any) => {
            const totalTickets = event.ticketTypes.reduce((sum: number, t: any) => sum + t.quantity, 0)
            const soldTickets = event.tickets.filter((t: any) => ['PAID', 'CONFIRMED', 'USED'].includes(t.status)).length
            const revenue = event.tickets
              .filter((t: any) => ['PAID', 'CONFIRMED', 'USED'].includes(t.status))
              .reduce((sum: number, t: any) => sum + t.total, 0)
            const isPast = new Date(event.date) < new Date()

            return (
              <div key={event.id} className="bg-charbon rounded-xl border border-white/10 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="font-bold text-white text-lg leading-tight">{event.title}</h3>
                      <div className="flex items-center gap-2">
                        {event.published ? (
                          <span className="text-xs bg-green-500/20 text-green-400 border border-green-500/30 px-2 py-0.5 rounded-full font-medium">
                            Publié
                          </span>
                        ) : (
                          <span className="text-xs bg-white/5 text-white/40 border border-white/10 px-2 py-0.5 rounded-full font-medium">
                            Brouillon
                          </span>
                        )}
                        {event.soldOut && (
                          <span className="text-xs bg-red-500/20 text-red-400 border border-red-500/30 px-2 py-0.5 rounded-full font-medium">
                            Complet
                          </span>
                        )}
                        {event.featured && (
                          <span className="text-xs bg-or/20 text-or border border-or/30 px-2 py-0.5 rounded-full font-medium">
                            En vedette
                          </span>
                        )}
                        {isPast && (
                          <span className="text-xs bg-white/5 text-white/30 border border-white/10 px-2 py-0.5 rounded-full font-medium">
                            Passé
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="text-white/50 text-sm mt-1">
                      {new Date(event.date).toLocaleDateString('fr-FR', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                    <p className="text-white/30 text-sm">{event.venue}</p>
                  </div>

                  <div className="flex items-center gap-6 shrink-0">
                    <div className="text-right">
                      <div className="text-sm font-semibold text-white">
                        {soldTickets} / {totalTickets}
                      </div>
                      <div className="text-xs text-white/40">billets vendus</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-or">
                        {revenue.toFixed(2)} €
                      </div>
                      <div className="text-xs text-white/40">chiffre d'affaires</div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/5">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/dashboard/events/${event.id}`}
                      className="text-sm text-white/50 hover:text-white border border-white/10 hover:border-white/20 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      Éditer
                    </Link>
                    <Link
                      href={`/dashboard/events/${event.id}/billets`}
                      className="text-sm text-white/50 hover:text-white border border-white/10 hover:border-white/20 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      Billets ({event.tickets.length})
                    </Link>
                  </div>

                  <form action={togglePublish}>
                    <input type="hidden" name="id" value={event.id} />
                    <input type="hidden" name="published" value={String(event.published)} />
                    <button
                      type="submit"
                      className={`text-sm px-3 py-1.5 rounded-lg transition-colors ${
                        event.published
                          ? 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white border border-white/10'
                          : 'bg-braise/20 text-braise hover:bg-braise hover:text-white border border-braise/30'
                      }`}
                    >
                      {event.published ? 'Dépublier' : 'Publier'}
                    </button>
                  </form>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
