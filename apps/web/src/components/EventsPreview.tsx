import Link from 'next/link'
import type { BizoukEvent } from '@/lib/bizouk'

// Wrapper qui rend un lien interne (Next Link) ou externe (<a>) selon la source
function EventLink({
  event,
  className,
  children,
}: {
  event: BizoukEvent
  className: string
  children: React.ReactNode
}) {
  if (event.source === 'local') {
    return <Link href={event.url} className={className}>{children}</Link>
  }
  return (
    <a href={event.url} target="_blank" rel="noopener noreferrer" className={className}>
      {children}
    </a>
  )
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('fr-FR', {
    weekday: 'short', day: 'numeric', month: 'long',
  })
}

function formatTime(d: string) {
  return new Date(d).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
}

export default function EventsPreview({ events }: { events: BizoukEvent[] }) {
  if (events.length === 0) return null

  return (
    <section className="py-20 px-4 bg-noir relative overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-64 bg-braise/8 blur-3xl pointer-events-none" />

      <div className="max-w-6xl mx-auto relative">
        {/* Header */}
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-braise text-sm font-semibold tracking-widest uppercase mb-2">Agenda</p>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-creme">
              Prochaines <span className="text-gradient">soirées</span>
            </h2>
          </div>
          <Link
            href="/evenements"
            className="hidden md:flex items-center gap-2 text-white/40 hover:text-braise transition-colors text-sm font-semibold"
          >
            Voir tout l&apos;agenda →
          </Link>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {events.slice(0, 3).map(event => (
            <EventLink
              key={event.id}
              event={event}
              className="group bg-charbon rounded-2xl border border-white/5 hover:border-braise/40 overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-braise/10 block"
            >
              {/* Flyer */}
              <div className="aspect-[4/3] bg-gradient-to-br from-braise/20 to-charbon relative overflow-hidden">
                {event.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={event.image_url}
                    alt={event.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-5xl">🎵</div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-noir/80 via-transparent to-transparent" />

                {/* Badge prix */}
                {event.price_min != null && (
                  <div className="absolute top-3 right-3 bg-braise text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                    À partir de {event.price_min} €
                  </div>
                )}
                {event.source === 'local' && (
                  <div className="absolute top-3 left-3 bg-or/20 border border-or/40 text-or text-xs font-bold px-3 py-1 rounded-full">
                    Billetterie L&apos;Infini
                  </div>
                )}

                {/* Date flottante en bas */}
                <div className="absolute bottom-3 left-3">
                  <span className="bg-noir/80 backdrop-blur-sm text-braise text-xs font-bold px-3 py-1 rounded-full border border-braise/20">
                    {formatDate(event.start_date)} · {formatTime(event.start_date)}
                  </span>
                </div>
              </div>

              <div className="p-5">
                <h3 className="font-display text-lg font-bold text-creme mb-1 line-clamp-1">{event.title}</h3>
                {event.subtitle && (
                  <p className="text-white/40 text-sm mb-2 line-clamp-1">{event.subtitle}</p>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-white/20 text-xs">📍 {event.venue_city}</span>
                  <span className="text-braise text-sm font-bold group-hover:text-ambre transition-colors">
                    {event.source === 'local' ? 'Voir & acheter →' : 'Billets →'}
                  </span>
                </div>
              </div>
            </EventLink>
          ))}
        </div>

        {/* CTA mobile */}
        <div className="mt-8 text-center md:hidden">
          <Link
            href="/evenements"
            className="inline-block border border-braise/40 text-braise px-6 py-3 rounded-full text-sm font-semibold hover:bg-braise hover:text-white transition-all"
          >
            Voir tout l&apos;agenda →
          </Link>
        </div>
      </div>
    </section>
  )
}
