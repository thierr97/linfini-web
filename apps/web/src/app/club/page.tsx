import Image from 'next/image'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import BottleForm from './BottleForm'
import type { BizoukEvent } from '@/app/api/bizouk/route'

export const revalidate = 3600

async function getBizoukEvents(): Promise<BizoukEvent[]> {
  try {
    const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
    const res = await fetch(`${base}/api/bizouk?period=upcoming`, { next: { revalidate: 3600 } })
    if (!res.ok) return []
    return res.json()
  } catch { return [] }
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long',
  })
}

function formatTime(d: string) {
  return new Date(d).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
}

const FORMULES_VIP = [
  { label: 'Carré VIP (entrée incluse)', price: '50 €' },
  { label: 'Entrée + 1 Bouteille', price: '60 €' },
  { label: 'Pack 4 personnes (4 entrées + 1 bouteille)', price: '130 €' },
  { label: 'Pack 6 personnes (6 entrées + 2 bouteilles)', price: '220 €' },
]

export default async function ClubPage() {
  const events = await getBizoukEvents()

  return (
    <div className="min-h-screen bg-noir">
      <Header />

      {/* Hero */}
      <section className="pt-32 pb-16 px-4 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-braise/10 to-transparent pointer-events-none" />
        <div className="relative z-10">
          <Image src="/logos/infini-events.jpg" alt="L'Infini Club" width={120} height={120}
            className="w-20 h-20 object-contain mx-auto mb-6 rounded-xl" />
          <p className="text-braise text-sm font-semibold tracking-widest uppercase mb-3">ERP Type P</p>
          <h1 className="font-display text-5xl md:text-7xl font-bold text-creme mb-4">
            L&apos;Infini <span className="text-gradient">Club</span>
          </h1>
          <p className="text-white/40 max-w-lg mx-auto">
            Soirées DJ, concerts et événements privés. La nuit caribéenne à son apogée.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            <a href="#billetterie"
              className="bg-braise hover:bg-ambre text-white px-8 py-3 rounded-full font-bold transition-colors">
              Billetterie
            </a>
            <a href="#reservation-bouteille"
              className="border border-or/40 hover:border-or text-or px-8 py-3 rounded-full font-bold transition-colors">
              Réserver une bouteille
            </a>
          </div>
        </div>
      </section>

      {/* Billetterie */}
      <section id="billetterie" className="py-16 px-4 bg-charbon">
        <div className="max-w-5xl mx-auto">
          <div className="mb-10">
            <p className="text-braise text-sm font-semibold tracking-widest uppercase mb-2">Billetterie Bizouk</p>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-creme">Prochaines soirées</h2>
          </div>

          {events.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
              {events.map(event => (
                <a
                  key={event.id}
                  href={event.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group bg-noir rounded-2xl border border-white/5 hover:border-braise/40 overflow-hidden transition-all hover:scale-[1.01] hover:shadow-2xl block"
                >
                  <div className="aspect-video relative overflow-hidden">
                    {event.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={event.image_url} alt={event.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-braise/20 to-noir flex items-center justify-center text-6xl">🎵</div>
                    )}
                    {event.price_min != null && (
                      <div className="absolute top-3 right-3 bg-braise text-white text-xs font-bold px-3 py-1 rounded-full">
                        À partir de {event.price_min} €
                      </div>
                    )}
                  </div>
                  <div className="p-5">
                    <p className="text-braise text-xs font-semibold uppercase tracking-wider mb-1">
                      {formatDate(event.start_date)} · {formatTime(event.start_date)}
                    </p>
                    <h3 className="font-display text-lg font-bold text-creme mb-1">{event.title}</h3>
                    <p className="text-white/30 text-xs mb-3">📍 {event.venue_name} · {event.venue_city}</p>
                    <div className="flex justify-end">
                      <span className="text-braise text-sm font-bold group-hover:text-ambre transition-colors">
                        Acheter mes billets →
                      </span>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          ) : (
            <div className="bg-noir/60 rounded-2xl border border-white/5 p-8 text-center mb-8">
              <div className="text-5xl mb-4">🎵</div>
              <p className="text-creme/60 text-lg font-semibold mb-2">Prochaines dates à venir</p>
              <p className="text-white/30 text-sm mb-6">Suivez-nous sur Instagram pour ne rien manquer</p>
              <a href="https://www.instagram.com/infinievents.gp/" target="_blank" rel="noopener noreferrer"
                className="bg-braise hover:bg-ambre text-white px-6 py-3 rounded-full text-sm font-bold transition-colors inline-block">
                @infinievents.gp
              </a>
            </div>
          )}

          <div className="flex justify-center">
            <Link href="/evenements"
              className="border border-white/10 hover:border-white/30 text-white/50 hover:text-white px-6 py-3 rounded-full text-sm font-semibold transition-colors">
              Voir tous les événements →
            </Link>
          </div>

          {/* Formules VIP */}
          <div className="mt-12">
            <h3 className="font-display text-xl font-bold text-creme mb-5">Formules & Tarifs VIP</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {FORMULES_VIP.map(f => (
                <div key={f.label} className="bg-noir/50 rounded-xl p-5 border border-braise/20 flex items-center justify-between gap-4">
                  <p className="text-white/70 text-sm">{f.label}</p>
                  <p className="text-braise font-bold text-xl whitespace-nowrap">{f.price}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Formulaire réservation bouteille */}
      <BottleForm />

      <Footer />
    </div>
  )
}
