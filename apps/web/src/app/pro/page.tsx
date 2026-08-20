import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import DevisForm from '@/components/DevisForm'
import {
  IconUsers, IconUtensils, IconTicket, IconBriefcase, IconClipboard,
  IconLandmark, IconSun, IconMartini, IconMic, IconCheck, IconMail, IconChat,
} from '@/components/icons'

export const metadata: Metadata = {
  title: 'Espace Pro — Séminaires & événements d\'entreprise',
  description:
    "Privatisez L'Infini au Gosier pour vos séminaires, soirées d'entreprise, lancements de produit et galas. Jusqu'à 600 personnes, prestations clé en main, devis sous 24h.",
}

const CAPACITES = [
  { type: 'Cocktail Debout', nb: '600', Icon: IconUsers },
  { type: 'Banquet Assis', nb: '120', Icon: IconUtensils },
  { type: 'Théâtre', nb: '300', Icon: IconTicket },
  { type: 'Réunion (U)', nb: '60', Icon: IconBriefcase },
  { type: 'Classe', nb: '80', Icon: IconClipboard },
]

const FORMATS = [
  {
    titre: 'Séminaires & conférences',
    detail: 'Plénière jusqu\'à 300 places, sonorisation, micros, vidéoprojection, pauses café et déjeuner sur place.',
    Icon: IconBriefcase,
  },
  {
    titre: 'Soirées d\'entreprise',
    detail: 'Fin d\'année, team building, anniversaire de société — dîner, open bar, DJ et animations clé en main.',
    Icon: IconMartini,
  },
  {
    titre: 'Lancements & showrooms',
    detail: 'Présentation produit, scène équipée son & lumière, scénographie sur mesure, captation photo/vidéo.',
    Icon: IconMic,
  },
  {
    titre: 'Cocktails & galas',
    detail: 'Réception debout jusqu\'à 600 invités, service traiteur premium, hôtesses et vestiaire.',
    Icon: IconUsers,
  },
]

const ESPACES = [
  { label: 'Grande Salle', detail: 'Intérieur climatisé', Icon: IconLandmark },
  { label: 'Terrasse Extérieure', detail: 'Vue panoramique', Icon: IconSun },
  { label: 'Bar Lounge', detail: 'Espace cocktail', Icon: IconMartini },
  { label: 'Scène & Podium', detail: 'Équipé son & lumière', Icon: IconMic },
]

const PRESTATIONS = [
  'Privatisation totale ou partielle du lieu',
  'Restauration — pauses, buffet, menu gastronomique',
  'Bar & cocktails premium, open bar entreprise',
  'Régie son, lumière & vidéoprojection',
  'DJ, animations & artistes live',
  'Décoration & scénographie sur mesure',
  'Agents de sécurité & hôtesses d\'accueil',
  'Photographe & vidéaste',
  'Coordination événement clé en main',
]

const ETAPES = [
  {
    n: '1',
    titre: 'Décrivez votre projet',
    detail: 'Remplissez le formulaire ci-dessous — format, date, nombre de participants, prestations souhaitées.',
  },
  {
    n: '2',
    titre: 'Devis sous 24h',
    detail: 'Notre équipe vous rappelle, affine le cahier des charges et vous adresse un devis personnalisé.',
  },
  {
    n: '3',
    titre: 'Événement clé en main',
    detail: 'Un interlocuteur unique coordonne la salle, la technique, la restauration et le personnel le jour J.',
  },
]

const GARANTIES = [
  'Devis détaillé sous 24h, sans engagement',
  'Facturation entreprise — TVA 8,5%',
  'Acompte 30% · solde à l\'événement',
  'Annulation sans frais jusqu\'à 30 jours',
  'ERP type P · Licence IV · personnel déclaré',
  'Parking et accès PMR',
]

export default function ProPage() {
  return (
    <main className="min-h-screen bg-noir">
      <Header />

      {/* Hero */}
      <section className="relative pt-36 pb-20 px-4 text-center overflow-hidden">
        <Image
          src="/images/salle-event.jpg"
          alt="Banquet dressé sur la terrasse de L'Infini"
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-25"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-noir/70 via-noir/55 to-noir pointer-events-none" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full bg-or/5 blur-3xl pointer-events-none" />
        <div className="relative">
        <p className="text-braise text-sm font-semibold tracking-widest uppercase mb-3">Espace Pro</p>
        <h1 className="font-display text-5xl md:text-6xl font-bold text-creme mb-4">
          Vos événements <span className="text-gradient">d&apos;entreprise</span>
        </h1>
        <p className="text-white/40 text-lg max-w-xl mx-auto mb-8">
          Séminaires, soirées d&apos;entreprise, lancements, galas — privatisez L&apos;Infini
          et confiez l&apos;organisation à une équipe dédiée.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a href="#devis-pro"
            className="inline-block bg-braise hover:bg-ambre text-white px-10 py-4 rounded-full font-bold text-lg transition-all duration-300 shadow-lg shadow-braise/20 hover:shadow-ambre/30">
            Demander un devis →
          </a>
          <a href="tel:+590690272875"
            className="inline-block border border-white/20 hover:border-or/50 text-white/60 hover:text-white px-10 py-4 rounded-full font-bold text-lg transition-colors duration-300">
            +590 690 27 28 75
          </a>
        </div>
        </div>
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

        {/* Formats d'événements */}
        <section>
          <h2 className="text-sm font-semibold text-white/40 uppercase tracking-widest mb-6 text-center">Nos formats</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {FORMATS.map(({ titre, detail, Icon }) => (
              <div key={titre} className="glass-card card-glow rounded-2xl p-7">
                <Icon className="w-7 h-7 mb-4 text-or/70" />
                <h3 className="text-creme font-semibold text-lg mb-2">{titre}</h3>
                <p className="text-white/40 text-sm leading-relaxed">{detail}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Le lieu en images */}
        <section>
          <h2 className="text-sm font-semibold text-white/40 uppercase tracking-widest mb-6 text-center">Le lieu en images</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative md:col-span-2 h-64 md:h-72 rounded-2xl overflow-hidden group">
              <Image src="/images/salle-event.jpg" alt="Banquet dressé pour un événement d'entreprise"
                fill sizes="(min-width: 768px) 66vw, 100vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-noir/80 via-transparent to-transparent" />
              <p className="absolute bottom-4 left-5 text-creme font-semibold">Banquets & dîners assis</p>
            </div>
            <div className="relative h-64 md:h-72 rounded-2xl overflow-hidden group">
              <Image src="/images/terrasse.jpg" alt="Terrasse extérieure de L'Infini au Gosier"
                fill sizes="(min-width: 768px) 33vw, 100vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-noir/80 via-transparent to-transparent" />
              <p className="absolute bottom-4 left-5 text-creme font-semibold">Terrasse extérieure</p>
            </div>
            <div className="relative h-64 rounded-2xl overflow-hidden group">
              <Image src="/images/cocktail.jpg" alt="Cocktail signature du bar de L'Infini"
                fill sizes="(min-width: 768px) 33vw, 100vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-noir/80 via-transparent to-transparent" />
              <p className="absolute bottom-4 left-5 text-creme font-semibold">Cocktails signature</p>
            </div>
            <div className="relative h-64 rounded-2xl overflow-hidden group">
              <Image src="/images/decoration.jpg" alt="Décoration florale sur mesure"
                fill sizes="(min-width: 768px) 33vw, 100vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-noir/80 via-transparent to-transparent" />
              <p className="absolute bottom-4 left-5 text-creme font-semibold">Décoration sur mesure</p>
            </div>
            <Link href="/galerie"
              className="relative h-64 rounded-2xl overflow-hidden glass-card card-glow flex flex-col items-center justify-center text-center p-6 group">
              <p className="font-display text-2xl font-bold text-or mb-2">+ de photos</p>
              <p className="text-white/40 text-sm mb-4">Découvrez nos événements passés</p>
              <span className="border border-white/20 group-hover:border-or/50 text-white/60 group-hover:text-white px-6 py-2.5 rounded-full text-sm font-semibold transition-colors">
                Voir la galerie →
              </span>
            </Link>
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
          <h2 className="text-sm font-semibold text-white/40 uppercase tracking-widest mb-6 text-center">Prestations clé en main</h2>
          <div className="glass-card rounded-2xl p-8 grid grid-cols-1 md:grid-cols-2 gap-4">
            {PRESTATIONS.map(s => (
              <div key={s} className="flex items-center gap-3">
                <IconCheck className="w-4 h-4 text-or shrink-0" />
                <span className="text-white/60 text-sm">{s}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Comment ça marche */}
        <section>
          <h2 className="text-sm font-semibold text-white/40 uppercase tracking-widest mb-6 text-center">Comment ça marche</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {ETAPES.map(({ n, titre, detail }) => (
              <div key={n} className="glass-card rounded-2xl p-7 text-center">
                <p className="font-display text-4xl font-bold text-or/60 mb-3">{n}</p>
                <h3 className="text-creme font-semibold mb-2">{titre}</h3>
                <p className="text-white/40 text-sm leading-relaxed">{detail}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Garanties / conditions */}
        <section className="relative bg-or/5 border border-or/20 rounded-3xl p-8 md:p-12 overflow-hidden">
          <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-or/10 blur-3xl pointer-events-none" />
          <div className="flex items-start gap-4 mb-6">
            <IconChat className="w-8 h-8 text-or/80 shrink-0" />
            <div>
              <h3 className="font-display text-2xl font-bold text-or mb-2">Tarification sur devis</h3>
              <p className="text-white/50 text-sm leading-relaxed max-w-2xl">
                Chaque événement d&apos;entreprise est dimensionné sur mesure : durée, effectif,
                technique et prestations. Nous construisons le devis avec vous, ligne par ligne.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {GARANTIES.map(g => (
              <div key={g} className="flex items-center gap-3">
                <IconCheck className="w-4 h-4 text-or shrink-0" />
                <span className="text-white/60 text-sm">{g}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Formulaire devis */}
        <section id="devis-pro" className="scroll-mt-28">
          <div className="text-center mb-8">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-creme mb-3">
              Demande de <span className="text-gradient">devis pro</span>
            </h2>
            <p className="text-white/40 max-w-lg mx-auto text-sm">
              Réponse sous 24h ouvrées. Pour une demande urgente, appelez-nous directement.
            </p>
          </div>
          <div className="glass-card rounded-3xl p-6 md:p-10">
            <DevisForm />
          </div>
        </section>

        {/* Contact direct */}
        <section className="text-center">
          <p className="text-white/40 text-sm mb-4">Vous préférez un contact direct ?</p>
          <a href="mailto:direction.infini971@gmail.com"
            className="inline-flex items-center gap-2 border border-white/20 hover:border-or/50 text-white/60 hover:text-white px-8 py-3.5 rounded-full font-semibold transition-colors duration-300">
            <IconMail className="w-4 h-4" /> direction.infini971@gmail.com
          </a>
        </section>

      </div>

      <Footer />
    </main>
  )
}
