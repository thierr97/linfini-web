export const dynamic = 'force-dynamic'
import type { Metadata } from 'next'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import type { BizoukEvent } from '@/app/api/bizouk/route'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Événements — L\'Infini Club',
  description: 'Soirées, concerts et événements privés à L\'Infini Guadeloupe.',
}

async function getBizoukEvents(period: 'upcoming' | 'past'): Promise<BizoukEvent[]> {
  try {
    const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
    const res = await fetch(`${base}/api/bizouk?period=${period}`, { next: { revalidate: 3600 } })
    if (!res.ok) return []
    return res.json()
  } catch { return [] }
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })
}

function formatTime(d: string) {
  return new Date(d).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
}

export default async function EvenementsPage() {
  const [upcoming, past] = await Promise.all([
    getBizoukEvents('upcoming'),
    getBizoukEvents('past'),
  ])

  return (
    <div className="min-h-screen bg-noir">
      <Header />

      {/* Hero */}
      <section className="pt-32 pb-16 px-4 text-center">
        <p className="text-braise text-sm font-semibold tracking-widest uppercase mb-3">Agenda</p>
        <h1 className="font-display text-5xl md:text-7xl font-bold text-creme mb-4">
          Nos <span className="text-gradient">Événements</span>
        </h1>
        <p className="text-white/40 max-w-lg mx-auto">
          Soirées DJ, concerts et événements privés dans le plus grand complexe nocturne de Guadeloupe.
        </p>
      </section>

      <div className="max-w-5xl mx-auto px-4 pb-24">

        {/* Prochains événements */}
        {upcoming.length > 0 ? (
          <div className="mb-16">
            <h2 className="font-display text-2xl font-bold text-or mb-8">Prochaines soirées</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {upcoming.map(event => (
                <a
                  key={event.id}
                  href={event.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group bg-charbon rounded-2xl border border-white/5 hover:border-braise/40 overflow-hidden transition-all hover:scale-[1.01] hover:shadow-2xl block"
                >
                  {/* Flyer */}
                  <div className="aspect-video bg-gradient-to-br from-braise/20 to-charbon relative overflow-hidden">
                    {event.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={event.image_url}
                        alt={event.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-6xl">🎵</div>
                    )}
                    {event.price_min != null && (
                      <div className="absolute top-3 right-3 bg-braise text-white text-xs font-bold px-3 py-1 rounded-full">
                        À partir de {event.price_min} €
                      </div>
                    )}
                  </div>

                  <div className="p-6">
                    <p className="text-braise text-xs font-semibold uppercase tracking-wider mb-1">
                      {formatDate(event.start_date)} · {formatTime(event.start_date)}
                    </p>
                    <h3 className="font-display text-xl font-bold text-creme mb-1">{event.title}</h3>
                    {event.subtitle && (
                      <p className="text-white/50 text-sm mb-1">{event.subtitle}</p>
                    )}
                    <p className="text-white/30 text-xs mb-3">📍 {event.venue_name} · {event.venue_city}</p>
                    {event.description && (
                      <p
                        className="text-white/40 text-sm line-clamp-2 mb-4"
                        dangerouslySetInnerHTML={{ __html: event.description.replace(/&amp;/g, '&') }}
                      />
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-white/20 uppercase tracking-wide">{event.event_type}</span>
                      <span className="text-braise text-sm font-bold group-hover:text-ambre transition-colors">
                        Acheter mes billets →
                      </span>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-24 text-white/30 mb-16">
            <div className="text-6xl mb-4">🎵</div>
            <p className="text-xl font-semibold text-creme/40 mb-2">Bientôt de nouvelles soirées</p>
            <p className="text-sm">Suivez-nous sur Instagram pour ne rien manquer</p>
            <a href="https://www.instagram.com/infinievents.gp/" target="_blank" rel="noopener noreferrer"
              className="inline-block mt-6 bg-braise text-white px-6 py-3 rounded-full text-sm font-semibold hover:bg-ambre transition-colors">
              @infinievents.gp
            </a>
          </div>
        )}

        {/* Soirées passées */}
        {past.length > 0 && (
          <div className="mb-16">
            <h2 className="font-display text-xl font-bold text-white/30 mb-6">Soirées passées</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {past.slice(0, 6).map(event => (
                <a key={event.id} href={event.url} target="_blank" rel="noopener noreferrer"
                  className="group rounded-xl overflow-hidden border border-white/5 hover:border-white/10 transition-all opacity-60 hover:opacity-100">
                  <div className="aspect-video bg-charbon relative">
                    {event.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={event.image_url} alt={event.title}
                        className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-3xl">🎵</div>
                    )}
                  </div>
                  <div className="p-3 bg-charbon">
                    <p className="text-creme/60 text-xs font-semibold truncate">{event.title}</p>
                    <p className="text-white/30 text-xs">{formatDate(event.start_date)}</p>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Privatisation CTA */}
        <div className="bg-gradient-to-r from-braise/20 to-ambre/10 rounded-2xl border border-braise/20 p-8 text-center">
          <h3 className="font-display text-2xl font-bold text-creme mb-3">Organisez votre événement</h3>
          <p className="text-white/50 mb-6 max-w-md mx-auto">
            Anniversaire, soirée d&apos;entreprise, mariage — nous mettons notre espace à votre disposition.
          </p>
          <a href="mailto:evenements@linfini.gp"
            className="bg-braise hover:bg-ambre text-white px-8 py-3 rounded-full font-bold transition-colors inline-block">
            Demander un devis →
          </a>
        </div>
      </div>

      <Footer />
    </div>
  )
}
