import type { Metadata } from 'next'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Tarifs — Location de salle',
  description: "Tarifs de location de la salle événementielle L'Infini au Gosier : mariages, anniversaires, séminaires. Jusqu'à 600 personnes, devis sous 24h.",
}

const CAPACITES = [
  { type: 'Cocktail Debout', nb: '600', icon: '🥂' },
  { type: 'Banquet Assis', nb: '120', icon: '🍽️' },
  { type: 'Théâtre', nb: '300', icon: '🎭' },
  { type: 'Réunion (U)', nb: '60', icon: '💼' },
  { type: 'Classe', nb: '80', icon: '📋' },
]

const ESPACES = [
  { label: 'Grande Salle', detail: 'Intérieur climatisé', icon: '🏛️' },
  { label: 'Terrasse Extérieure', detail: 'Vue panoramique', icon: '🌴' },
  { label: 'Bar Lounge', detail: 'Espace cocktail', icon: '🍹' },
  { label: 'Scène & Podium', detail: 'Équipé son & lumière', icon: '🎤' },
]

const SERVICES = [
  'Location de salle (intérieur & extérieur)',
  'Restauration — buffet, menu gastronomique',
  'Bar & cocktails premium',
  'DJ & sonorisation professionnelle',
  'Décoration thématique sur mesure',
  'Agent de sécurité',
  'Photographe & vidéaste',
  'Coordination événement clé en main',
]

export default function TarifsPage() {
  return (
    <main className="min-h-screen bg-noir">
      <Header />

      {/* Hero */}
      <section className="pt-32 pb-16 px-4 text-center">
        <p className="text-braise text-sm font-semibold tracking-widest uppercase mb-3">Votre événement</p>
        <h1 className="font-display text-5xl md:text-6xl font-bold text-creme mb-4">
          Un lieu d&apos;exception
        </h1>
        <p className="text-white/40 text-lg max-w-xl mx-auto">
          Chaque événement est unique — nos tarifs sont personnalisés selon vos besoins exacts.
        </p>
      </section>

      <div className="max-w-5xl mx-auto px-4 pb-24 space-y-16">

        {/* Capacités */}
        <section>
          <h2 className="text-sm font-semibold text-white/40 uppercase tracking-widest mb-6 text-center">Capacités d&apos;accueil</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {CAPACITES.map(c => (
              <div key={c.type} className="bg-charbon border border-white/5 rounded-2xl p-6 text-center">
                <div className="text-3xl mb-2">{c.icon}</div>
                <p className="font-display text-4xl font-bold text-or mb-1">{c.nb}</p>
                <p className="text-white/40 text-xs leading-tight">{c.type}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Espaces */}
        <section>
          <h2 className="text-sm font-semibold text-white/40 uppercase tracking-widest mb-6 text-center">Nos espaces</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {ESPACES.map(e => (
              <div key={e.label} className="bg-charbon border border-white/5 rounded-2xl p-6 text-center hover:border-or/30 transition-colors">
                <div className="text-3xl mb-3">{e.icon}</div>
                <p className="text-creme font-semibold text-sm mb-1">{e.label}</p>
                <p className="text-white/30 text-xs">{e.detail}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Prestations */}
        <section>
          <h2 className="text-sm font-semibold text-white/40 uppercase tracking-widest mb-6 text-center">Prestations disponibles</h2>
          <div className="bg-charbon border border-white/5 rounded-2xl p-8 grid grid-cols-1 md:grid-cols-2 gap-4">
            {SERVICES.map(s => (
              <div key={s} className="flex items-center gap-3">
                <span className="text-or text-lg">✓</span>
                <span className="text-white/60 text-sm">{s}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Tarification */}
        <section className="bg-or/5 border border-or/20 rounded-2xl p-8 text-center">
          <div className="text-4xl mb-4">💬</div>
          <h3 className="font-display text-2xl font-bold text-or mb-3">Tarification sur devis</h3>
          <p className="text-white/50 max-w-lg mx-auto mb-2 text-sm leading-relaxed">
            Nos tarifs varient selon le type d&apos;événement, la durée, le nombre d&apos;invités et les prestations choisies. Nous établissons un devis personnalisé et vous répondons sous 24h.
          </p>
          <p className="text-white/30 text-xs mb-8">TVA 8,5% · Acompte 30% · Annulation 30 jours</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/#devis"
              className="inline-block bg-braise hover:bg-ambre text-white px-10 py-4 rounded-full font-bold text-lg transition-all hover:scale-105 shadow-lg shadow-braise/20">
              Demander un devis →
            </Link>
            <a href="mailto:direction.infini971@gmail.com"
              className="inline-block border border-white/20 hover:border-or/50 text-white/60 hover:text-white px-10 py-4 rounded-full font-bold text-lg transition-all">
              Écrire par email
            </a>
          </div>
        </section>

      </div>

      <Footer />
    </main>
  )
}
