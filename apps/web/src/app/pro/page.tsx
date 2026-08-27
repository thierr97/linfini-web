import type { Metadata } from 'next'
import Image from 'next/image'
import ProHeader from '@/components/ProHeader'
import Footer from '@/components/Footer'
import DevisForm from '@/components/DevisForm'
import ProHero from '@/components/ProHero'
import {
  IconUsers, IconUtensils, IconTicket, IconBriefcase, IconClipboard,
  IconLandmark, IconSun, IconMartini, IconMic, IconCheck, IconMail,
} from '@/components/icons'
import {
  TARIFS_CRENEAUX, TARIFS_ESPACES, TARIFS_PROFILS, INCLUS_SALLE, NOTE_MOBILIER, fmtPrix,
} from '@/lib/tarifs-salle'

export const metadata: Metadata = {
  title: 'Espace Pro — Séminaires & événements d\'entreprise',
  description:
    "Privatisez L'Infini au Gosier pour vos séminaires, soirées d'entreprise, lancements de produit et galas. Location de salle dès 1 200 € HT, jusqu'à 600 personnes, restauration et prestations clé en main, devis sous 24h.",
}

// Palette jour : ivoire, encre, or brand — l'univers nocturne du site passé en négatif
const IVOIRE = '#FBFAF7'
const ENCRE = '#14120E'
const SABLE = '#E9E4D8'
const OR_FONCE = '#8A6B2B'

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
    img: '/images/pro/seminaire.jpg',
  },
  {
    titre: 'Soirées d\'entreprise',
    detail: 'Fin d\'année, team building, anniversaire de société — dîner, open bar, DJ et animations clé en main.',
    Icon: IconMartini,
    img: '/images/pro/soiree-entreprise.jpg',
  },
  {
    titre: 'Lancements & showrooms',
    detail: 'Présentation produit, scène équipée son & lumière, scénographie sur mesure, captation photo/vidéo.',
    Icon: IconMic,
    img: '/images/pro/lancement.jpg',
  },
  {
    titre: 'Cocktails & galas',
    detail: 'Réception debout jusqu\'à 600 invités, service traiteur premium, hôtesses et vestiaire.',
    Icon: IconUsers,
    img: '/images/pro/gala.jpg',
  },
]

const LIEU = [
  { src: '/images/salle-event.jpg', alt: 'Banquet dressé pour un événement d\'entreprise', label: 'Banquets & dîners assis', large: true },
  { src: '/images/terrasse.jpg', alt: 'Terrasse extérieure de L\'Infini au Gosier', label: 'Terrasse extérieure', large: false },
  { src: '/images/cocktail.jpg', alt: 'Cocktail signature du bar de L\'Infini', label: 'Cocktails signature', large: false },
  { src: '/images/decoration.jpg', alt: 'Décoration florale sur mesure', label: 'Décoration sur mesure', large: false },
]

const ESPACES = [
  { label: 'Grande Salle', detail: 'Intérieur climatisé', Icon: IconLandmark },
  { label: 'Terrasse Extérieure', detail: 'Vue panoramique', Icon: IconSun },
  { label: 'Bar Lounge', detail: 'Espace cocktail', Icon: IconMartini },
  { label: 'Scène & Podium', detail: 'Équipé son & lumière', Icon: IconMic },
]

const GRILLES = [
  { titre: 'Créneaux', tarifs: TARIFS_CRENEAUX },
  { titre: 'Espaces', tarifs: TARIFS_ESPACES },
  { titre: 'Profils', tarifs: TARIFS_PROFILS },
]

const PRESTATIONS = [
  'Restauration — pauses, buffet, cocktail dînatoire, menu gastronomique',
  'Privatisation totale ou partielle du lieu',
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
  'Tarifs HT — facturation entreprise, TVA 8,5%',
  'Acompte 30% · solde à l\'événement',
  'Annulation sans frais jusqu\'à 30 jours',
  'ERP type P · Licence IV · personnel déclaré',
  'Parking et accès PMR',
]

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-center gap-4 mb-8">
      <span className="h-px w-10 bg-or/60" />
      <h2 className="text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: OR_FONCE }}>
        {children}
      </h2>
      <span className="h-px w-10 bg-or/60" />
    </div>
  )
}

export default function ProPage() {
  return (
    <main className="min-h-screen" style={{ backgroundColor: IVOIRE, color: ENCRE }}>
      <ProHeader />

      {/* Hero — L'Infini en plein jour, envolée 3D */}
      <ProHero />

      <div className="max-w-5xl mx-auto px-4 pt-20 pb-24 space-y-20">

        {/* Capacités */}
        <section id="capacites" className="reveal scroll-mt-28">
          <Eyebrow>Capacités d&apos;accueil</Eyebrow>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {CAPACITES.map(({ type, nb, Icon }) => (
              <div key={type} className="bg-white rounded-2xl p-6 text-center border transition-shadow hover:shadow-[0_8px_30px_rgba(138,107,43,0.12)]"
                style={{ borderColor: SABLE }}>
                <Icon className="w-7 h-7 mx-auto mb-3 text-or" />
                <p className="font-display text-4xl font-bold text-or mb-1">{nb}</p>
                <p className="text-xs leading-tight" style={{ color: '#6B675E' }}>{type}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Formats d'événements */}
        <section id="formats" className="reveal scroll-mt-28">
          <Eyebrow>Nos formats</Eyebrow>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {FORMATS.map(({ titre, detail, Icon, img }) => (
              <div key={titre} className="bg-white rounded-2xl overflow-hidden border group transition-shadow hover:shadow-[0_12px_40px_rgba(138,107,43,0.14)]"
                style={{ borderColor: SABLE }}>
                <div className="relative h-44">
                  <Image src={img} alt={titre}
                    fill sizes="(min-width: 768px) 50vw, 100vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105" />
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <Icon className="w-5 h-5 text-or" />
                    <h3 className="font-semibold text-lg" style={{ color: ENCRE }}>{titre}</h3>
                  </div>
                  <p className="text-sm leading-relaxed" style={{ color: '#6B675E' }}>{detail}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Le lieu en images */}
        <section id="lieu" className="reveal scroll-mt-28">
          <Eyebrow>Le lieu en images</Eyebrow>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {LIEU.map(({ src, alt, label, large }) => (
              <div key={src} className={`relative h-64 ${large ? 'md:col-span-2' : ''} rounded-2xl overflow-hidden group`}>
                <Image src={src} alt={alt}
                  fill sizes={large ? '(min-width: 768px) 66vw, 100vw' : '(min-width: 768px) 33vw, 100vw'}
                  className="object-cover transition-transform duration-500 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <p className="absolute bottom-4 left-5 text-white font-semibold drop-shadow">{label}</p>
              </div>
            ))}
            <a href="#devis-pro"
              className="relative h-64 md:h-auto rounded-2xl border bg-white flex flex-col items-center justify-center text-center p-6 group transition-shadow hover:shadow-[0_12px_40px_rgba(138,107,43,0.14)]"
              style={{ borderColor: SABLE }}>
              <p className="font-display text-2xl font-bold text-or mb-2">Visite privée</p>
              <p className="text-sm mb-4" style={{ color: '#6B675E' }}>
                Découvrez les espaces sur place avec notre équipe, sur rendez-vous
              </p>
              <span className="border group-hover:border-or px-6 py-2.5 rounded-full text-sm font-semibold transition-colors"
                style={{ borderColor: SABLE, color: ENCRE }}>
                Planifier une visite →
              </span>
            </a>
          </div>
        </section>

        {/* Espaces */}
        <section className="reveal">
          <Eyebrow>Nos espaces</Eyebrow>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {ESPACES.map(({ label, detail, Icon }) => (
              <div key={label} className="bg-white rounded-2xl p-6 text-center border transition-shadow hover:shadow-[0_8px_30px_rgba(138,107,43,0.12)]"
                style={{ borderColor: SABLE }}>
                <Icon className="w-7 h-7 mx-auto mb-3 text-or" />
                <p className="font-semibold text-sm mb-1" style={{ color: ENCRE }}>{label}</p>
                <p className="text-xs" style={{ color: '#6B675E' }}>{detail}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Prestations */}
        <section id="prestations" className="reveal scroll-mt-28">
          <Eyebrow>Prestations clé en main</Eyebrow>
          <div className="bg-white rounded-2xl p-8 grid grid-cols-1 md:grid-cols-2 gap-4 border" style={{ borderColor: SABLE }}>
            {PRESTATIONS.map(s => (
              <div key={s} className="flex items-center gap-3">
                <IconCheck className="w-4 h-4 shrink-0 text-[#8A6B2B]" />
                <span className="text-sm" style={{ color: '#44403A' }}>{s}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Comment ça marche */}
        <section className="reveal">
          <Eyebrow>Comment ça marche</Eyebrow>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {ETAPES.map(({ n, titre, detail }) => (
              <div key={n} className="bg-white rounded-2xl p-7 text-center border" style={{ borderColor: SABLE }}>
                <p className="font-display text-4xl font-bold mb-3 text-or">{n}</p>
                <h3 className="font-semibold mb-2" style={{ color: ENCRE }}>{titre}</h3>
                <p className="text-sm leading-relaxed" style={{ color: '#6B675E' }}>{detail}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Tarifs location salle */}
        <section id="tarifs" className="reveal scroll-mt-28">
          <Eyebrow>Nos tarifs de location</Eyebrow>
          <p className="text-center text-sm max-w-2xl mx-auto mb-8" style={{ color: '#6B675E' }}>
            Une grille simple et transparente, hors taxes. La salle est le point de départ :
            la restauration, le bar et les prestations viennent composer votre événement.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {GRILLES.map(({ titre, tarifs }) => (
              <div key={titre} className="bg-white rounded-2xl p-6 border transition-shadow hover:shadow-[0_8px_30px_rgba(138,107,43,0.12)]"
                style={{ borderColor: SABLE }}>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] mb-4" style={{ color: OR_FONCE }}>{titre}</p>
                <ul className="divide-y" style={{ borderColor: SABLE }}>
                  {tarifs.map(t => (
                    <li key={t.id} className="py-3 flex items-baseline justify-between gap-3" style={{ borderColor: SABLE }}>
                      <div>
                        <p className="font-semibold text-sm" style={{ color: ENCRE }}>{t.label}</p>
                        <p className="text-xs" style={{ color: '#8B8677' }}>{t.detail}</p>
                      </div>
                      <p className="font-display text-xl font-bold text-or whitespace-nowrap">{fmtPrix(t)}</p>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="mt-4 bg-white rounded-2xl p-6 md:p-8 border grid grid-cols-1 md:grid-cols-[1fr_auto] gap-6 items-start" style={{ borderColor: SABLE }}>
            <div>
              <p className="font-semibold mb-3" style={{ color: ENCRE }}>Inclus dans le tarif de base</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
                {INCLUS_SALLE.map(i => (
                  <div key={i} className="flex items-center gap-3">
                    <IconCheck className="w-4 h-4 shrink-0 text-[#8A6B2B]" />
                    <span className="text-sm" style={{ color: '#44403A' }}>{i}</span>
                  </div>
                ))}
              </div>
              <p className="text-xs mt-4" style={{ color: '#8B8677' }}>{NOTE_MOBILIER} Tarifs HT, TVA 8,5 % en sus.</p>
            </div>
            <div className="rounded-xl p-5 md:max-w-xs" style={{ backgroundColor: '#F3EFE5' }}>
              <div className="flex items-center gap-2 mb-2">
                <IconUtensils className="w-5 h-5 text-or" />
                <p className="font-semibold text-sm" style={{ color: ENCRE }}>Et à table ?</p>
              </div>
              <p className="text-sm leading-relaxed mb-3" style={{ color: '#6B675E' }}>
                Pauses, buffets, cocktails dînatoires ou menu gastronomique : notre cuisine
                franco-créole s&apos;adapte à votre format et à votre effectif.
              </p>
              <a href="#devis-pro" className="text-sm font-semibold text-braise hover:underline">Composer mon événement →</a>
            </div>
          </div>
        </section>

        {/* Garanties / conditions */}
        <section className="reveal rounded-3xl p-8 md:p-12 border" style={{ backgroundColor: '#F3EFE5', borderColor: SABLE }}>
          <h3 className="font-display text-2xl font-bold mb-2" style={{ color: ENCRE }}>Un devis, ligne par ligne</h3>
          <p className="text-sm leading-relaxed max-w-2xl mb-6" style={{ color: '#6B675E' }}>
            Salle, restauration, bar, technique, personnel : chaque poste est chiffré selon
            votre durée, votre effectif et vos envies. Aucun frais caché.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {GARANTIES.map(g => (
              <div key={g} className="flex items-center gap-3">
                <IconCheck className="w-4 h-4 shrink-0 text-[#8A6B2B]" />
                <span className="text-sm" style={{ color: '#44403A' }}>{g}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Formulaire devis — version claire, lisibilité avant tout */}
        <section id="devis-pro" className="reveal scroll-mt-28">
          <div className="bg-white rounded-3xl p-6 md:p-12 border shadow-[0_12px_50px_rgba(138,107,43,0.10)]" style={{ borderColor: SABLE }}>
            <div className="text-center mb-10">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] mb-3" style={{ color: OR_FONCE }}>Votre projet d&apos;entreprise</p>
              <h2 className="font-display text-3xl md:text-4xl font-bold mb-3" style={{ color: ENCRE }}>
                Parlons de votre <span className="text-gradient">événement</span>
              </h2>
              <p className="max-w-lg mx-auto text-sm" style={{ color: '#6B675E' }}>
                Réponse sous 24h ouvrées. Pour une demande urgente, appelez-nous directement.
              </p>
            </div>
            <DevisForm variant="light" />
            <p className="text-center text-sm mt-8" style={{ color: '#8B8677' }}>
              Vous préférez un contact direct ?{' '}
              <a href="mailto:direction.infini971@gmail.com" className="inline-flex items-center gap-1.5 transition-colors hover:text-braise" style={{ color: '#44403A' }}>
                <IconMail className="w-4 h-4" /> direction.infini971@gmail.com
              </a>
            </p>
          </div>
        </section>

      </div>

      <Footer variant="pro" />
    </main>
  )
}
