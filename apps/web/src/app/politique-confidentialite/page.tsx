import type { Metadata } from 'next'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: 'Politique de confidentialité',
  description: "Politique de confidentialité et protection des données personnelles — L'Infini Guadeloupe.",
  robots: { index: false },
}

const SECTIONS = [
  {
    title: 'Responsable du traitement',
    content: [
      "La SAS LES 4 AS (SIREN 951 381 060), dont le siège social est situé 14 Centre Commercial Le Pavillon, ZI Jarry, 97122 Baie-Mahault, Guadeloupe, est responsable du traitement des données personnelles collectées sur le site infinigp.fr.",
      "Contact : direction.infini971@gmail.com.",
    ],
  },
  {
    title: 'Données collectées',
    content: [
      "Nous collectons uniquement les données nécessaires au traitement de vos demandes : nom, prénom, adresse e-mail, numéro de téléphone, date et détails de votre réservation ou de votre projet d'événement, ainsi que les informations de paiement traitées de manière sécurisée par notre prestataire Stripe (nous ne stockons aucune donnée bancaire).",
    ],
  },
  {
    title: 'Finalités du traitement',
    content: [
      "Vos données sont utilisées pour : la gestion des réservations de table, l'établissement de devis pour vos événements privés, la billetterie des soirées, la gestion de votre compte client et l'envoi de confirmations par e-mail.",
      "Aucune donnée n'est vendue ni transmise à des tiers à des fins commerciales.",
    ],
  },
  {
    title: 'Durée de conservation',
    content: [
      "Les données liées aux réservations et devis sont conservées 3 ans après le dernier contact. Les données de facturation sont conservées 10 ans conformément aux obligations comptables légales.",
    ],
  },
  {
    title: 'Vos droits',
    content: [
      "Conformément au Règlement Général sur la Protection des Données (RGPD) et à la loi Informatique et Libertés, vous disposez d'un droit d'accès, de rectification, d'effacement, de limitation, d'opposition et de portabilité de vos données.",
      "Pour exercer ces droits, contactez-nous à direction.infini971@gmail.com. Vous pouvez également introduire une réclamation auprès de la CNIL (cnil.fr).",
    ],
  },
  {
    title: 'Cookies',
    content: [
      "Le site utilise uniquement des cookies techniques nécessaires à son fonctionnement (session, panier, authentification). Aucun cookie publicitaire ou de suivi tiers n'est déposé sans votre consentement.",
    ],
  },
]

export default function PolitiqueConfidentialitePage() {
  return (
    <main className="min-h-screen bg-noir">
      <Header />
      <section className="pt-32 pb-24 px-4">
        <div className="max-w-3xl mx-auto">
          <p className="text-or text-sm font-semibold tracking-widest uppercase mb-3">Vos données</p>
          <h1 className="font-display text-4xl font-bold text-creme mb-12">Politique de confidentialité</h1>
          <div className="space-y-10">
            {SECTIONS.map((s) => (
              <div key={s.title}>
                <h2 className="font-display text-xl font-semibold text-creme mb-4">{s.title}</h2>
                {s.content.map((p, i) => (
                  <p key={i} className="text-white/50 text-sm leading-relaxed mb-2">{p}</p>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </main>
  )
}
