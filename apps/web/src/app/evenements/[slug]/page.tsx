import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import TicketPurchase from '@/components/TicketPurchase'

export const dynamic = 'force-dynamic'

interface LineupArtist {
  name: string
  role: string
}

async function getEvent(slug: string) {
  try {
    const { prisma } = await import('@linfini/db')
    return await prisma.event.findUnique({
      where: { slug, published: true },
      include: {
        ticketTypes: {
          where: { active: true },
          orderBy: { position: 'asc' },
        },
      },
    })
  } catch {
    return null
  }
}

function formatDate(d: Date | string) {
  return new Date(d).toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function formatTime(d: Date | string) {
  return new Date(d).toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const event = await getEvent(slug)
  if (!event) return { title: 'Événement introuvable' }
  return {
    title: event.title,
    description: event.shortDesc || event.description?.slice(0, 160) || `Soirée ${event.title} à L'Infini Guadeloupe`,
    openGraph: {
      title: event.title,
      description: event.shortDesc || '',
      images: event.imageUrl ? [{ url: event.imageUrl }] : [{ url: '/og-image.jpg' }],
    },
  }
}

export default async function EventPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const event = await getEvent(slug)

  if (!event) notFound()

  const lineup: LineupArtist[] = (() => {
    try {
      const raw = event.lineup
      if (!raw) return []
      if (Array.isArray(raw)) return raw as unknown as LineupArtist[]
      if (typeof raw === 'string') return JSON.parse(raw) as LineupArtist[]
      return []
    } catch {
      return []
    }
  })()

  return (
    <div className="min-h-screen bg-noir">
      <Header />

      {/* Bannière */}
      <section className="relative w-full h-[60vh] min-h-[400px] max-h-[680px]">
        {event.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={event.imageUrl}
            alt={event.title}
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-braise via-charbon to-noir" />
        )}
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-noir via-noir/60 to-transparent" />

        {/* Badges */}
        <div className="absolute top-24 left-6 flex gap-3">
          {event.categories.map((cat) => (
            <span
              key={cat}
              className="bg-white/10 backdrop-blur text-white/80 text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider"
            >
              {cat}
            </span>
          ))}
        </div>
        {event.soldOut && (
          <div className="absolute top-24 right-6">
            <span className="bg-red-600 text-white text-sm font-bold px-4 py-1.5 rounded-full uppercase tracking-wider shadow-lg">
              Complet
            </span>
          </div>
        )}

        {/* Titre */}
        <div className="absolute bottom-0 left-0 right-0 px-4 pb-8 max-w-5xl mx-auto">
          <p className="text-braise text-sm font-semibold tracking-widest uppercase mb-2">
            {formatDate(event.date)}
          </p>
          <h1 className="font-display text-4xl md:text-6xl font-bold text-creme leading-tight">
            {event.title}
          </h1>
        </div>
      </section>

      {/* Contenu */}
      <div className="max-w-5xl mx-auto px-4 py-12 grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Colonne principale */}
        <div className="lg:col-span-2 space-y-10">
          {/* Infos pratiques */}
          <div className="bg-charbon rounded-2xl border border-white/5 p-6 grid grid-cols-2 gap-6">
            <div>
              <p className="text-xs text-white/40 uppercase tracking-wider mb-1">Date</p>
              <p className="text-creme font-semibold capitalize">{formatDate(event.date)}</p>
            </div>
            <div>
              <p className="text-xs text-white/40 uppercase tracking-wider mb-1">Début</p>
              <p className="text-creme font-semibold">{formatTime(event.date)}</p>
            </div>
            {event.doorsOpen && (
              <div>
                <p className="text-xs text-white/40 uppercase tracking-wider mb-1">Portes</p>
                <p className="text-creme font-semibold">{formatTime(event.doorsOpen)}</p>
              </div>
            )}
            <div>
              <p className="text-xs text-white/40 uppercase tracking-wider mb-1">Lieu</p>
              <p className="text-creme font-semibold">{event.venue}</p>
            </div>
            {event.dressCode && (
              <div>
                <p className="text-xs text-white/40 uppercase tracking-wider mb-1">Dress code</p>
                <p className="text-creme font-semibold">{event.dressCode}</p>
              </div>
            )}
            {event.ageRestriction && (
              <div>
                <p className="text-xs text-white/40 uppercase tracking-wider mb-1">Âge minimum</p>
                <p className="text-creme font-semibold">{event.ageRestriction} ans</p>
              </div>
            )}
          </div>

          {/* Description */}
          {event.description && (
            <div>
              <h2 className="font-display text-2xl font-bold text-or mb-4">À propos</h2>
              <div className="text-white/60 leading-relaxed whitespace-pre-line">
                {event.description}
              </div>
            </div>
          )}

          {/* Lineup */}
          {lineup.length > 0 && (
            <div>
              <h2 className="font-display text-2xl font-bold text-or mb-6">Lineup</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {lineup.map((artist, i) => (
                  <div
                    key={i}
                    className="bg-charbon border border-white/5 hover:border-braise/30 rounded-xl p-4 text-center transition-colors"
                  >
                    <p className="font-display text-lg font-bold text-creme">{artist.name}</p>
                    <p className="text-braise text-xs font-semibold uppercase tracking-wider mt-1">
                      {artist.role}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Colonne billets */}
        <div className="lg:col-span-1">
          <div className="sticky top-24">
            <h2 className="font-display text-2xl font-bold text-or mb-6">Billets</h2>
            {event.soldOut ? (
              <div className="bg-charbon border border-red-600/30 rounded-2xl p-6 text-center">
                <p className="text-4xl mb-3">🎫</p>
                <p className="text-red-400 font-bold text-lg mb-2">Événement complet</p>
                <p className="text-white/40 text-sm">
                  Toutes les places ont été vendues. Restez connectés pour nos prochaines soirées.
                </p>
              </div>
            ) : (
              <TicketPurchase
                ticketTypes={event.ticketTypes}
                eventTitle={event.title}
                eventSlug={event.slug}
              />
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
