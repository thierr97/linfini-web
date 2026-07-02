import type { Metadata } from 'next'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Link from 'next/link'
import {
  IconUsers, IconUtensils, IconTicket, IconBriefcase, IconClipboard,
  IconLandmark, IconSun, IconMartini, IconMic, IconCheck, IconChat,
} from '@/components/icons'

export const metadata: Metadata = {
  title: 'Tarifs — Location de salle',
  description: "Tarifs de location de la salle événementielle L'Infini au Gosier : mariages, anniversaires, séminaires. Jusqu'à 600 personnes, devis sous 24h.",
}

const CAPACITES = [
  { type: 'Cocktail Debout', nb: '600', Icon: IconUsers },
  { type: 'Banquet Assis', nb: '120', Icon: IconUtensils },
  { type: 'Théâtre', nb: '300', Icon: IconTicket },
  { type: 'Réunion (U)', nb: '60', Icon: IconBriefcase },
  { type: 'Classe', nb: '80', Icon: IconClipboard },
]

const ESPACES = [
  { label: 'Grande Salle', detail: 'Intérieur climatisé', Icon: IconLandmark },
  { label: 'Terrasse Extérieure', detail: 'Vue panoramique', Icon: IconSun },
  { label: 'Bar Lounge', detail: 'Espace cocktail', Icon: IconMartini },
  { label: 'Scène & Podium', detail: 'Équipé son & lumière', Icon: IconMic },
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
      <section className="relative pt-36 pb-16 px-4 text-center overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full bg-or/5 blur-3xl pointer-events-none" />
        <p className="text-braise text-sm font-semibold tracking-widest uppercase mb-3">Votre événement</p>
        <h1 className="font-display text-5xl md:text-6xl font-bold text-creme mb-4">
          Un lieu <span className="text-gradient">d&apos;exception</span>
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
            {CAPACITES.map(({ type, nb, Icon }) => (
              <div key={type} className="glass-card card-glow rounded-2xl p-6 text-center">
                <Icon className="w-7 h-7 mx-auto mb-3 text-or/70" />
                <p className="font-display text-4xl font-bold text-or mb-1">{nb}</p>
                <p className="text-white/40 text-xs leading-tight">{type}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Espaces */}
        <section>
          <h2 className="text-sm font-semibold text-white/40 uppercase tracking-widest mb-6 text-center">Nos espaces</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {ESPACES.map(({ label, detail, Icon }) => (
              <div key={label} className="glass-card card-glow rounded-2xl p-6 text-center">
                <Icon className="w-7 h-7 mx-auto mb-3 text-or/70" />
                <p className="text-creme font-semibold text-sm mb-1">{label}</p>
                <p className="text-white/30 text-xs">{detail}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Prestations */}
        <section>
          <h2 className="text-sm font-semibold text-white/40 uppercase tracking-widest mb-6 text-center">Prestations disponibles</h2>
          <div className="glass-card rounded-2xl p-8 grid grid-cols-1 md:grid-cols-2 gap-4">
            {SERVICES.map(s => (
              <div key={s} className="flex items-center gap-3">
                <IconCheck className="w-4 h-4 text-or shrink-0" />
                <span className="text-white/60 text-sm">{s}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Tarification */}
        <section className="relative bg-or/5 border border-or/20 rounded-3xl p-8 md:p-12 text-center overflow-hidden">
          <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-or/10 blur-3xl pointer-events-none" />
          <IconChat className="w-9 h-9 mx-auto mb-4 text-or/80" />
          <h3 className="font-display text-2xl font-bold text-or mb-3">Tarification sur devis</h3>
          <p className="text-white/50 max-w-lg mx-auto mb-2 text-sm leading-relaxed">
            Nos tarifs varient selon le type d&apos;événement, la durée, le nombre d&apos;invités et les prestations choisies. Nous établissons un devis personnalisé et vous répondons sous 24h.
          </p>
          <p className="text-white/30 text-xs mb-8">TVA 8,5% · Acompte 30% · Annulation 30 jours</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/#devis"
              className="inline-block bg-braise hover:bg-ambre text-white px-10 py-4 rounded-full font-bold text-lg transition-all duration-300 shadow-lg shadow-braise/20 hover:shadow-ambre/30">
              Demander un devis →
            </Link>
            <a href="mailto:direction.infini971@gmail.com"
              className="inline-block border border-white/20 hover:border-or/50 text-white/60 hover:text-white px-10 py-4 rounded-full font-bold text-lg transition-colors duration-300">
              Écrire par email
            </a>
          </div>
        </section>

      </div>

      <Footer />
    </main>
  )
}
