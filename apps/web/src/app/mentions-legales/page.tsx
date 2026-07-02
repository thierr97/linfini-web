import type { Metadata } from 'next'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: 'Mentions légales',
  description: "Mentions légales du site infinigp.fr — L'Infini Guadeloupe, SAS LES 4 AS.",
  robots: { index: false },
}

const SECTIONS = [
  {
    title: 'Éditeur du site',
    content: [
      "Le site infinigp.fr est édité par la société LES 4 AS, société par actions simplifiée (SAS) au capital de 10 000 €.",
      "Siège social : 14 Centre Commercial Le Pavillon, ZI Jarry — 14 Rue Henri Becquerel, 97122 Baie-Mahault, Guadeloupe.",
      "SIREN : 951 381 060 · SIRET : 951 381 060 00015 · RCS Pointe-à-Pitre.",
      "N° TVA intracommunautaire : FR60 951 381 060.",
      "Entrepreneur de spectacles vivants.",
      "Établissement L'Infini : 99 Route de Montauban, 97190 Le Gosier, Guadeloupe.",
      "Directeur de la publication : le représentant légal de la SAS LES 4 AS.",
      "Contact : direction.infini971@gmail.com · +590 690 27 28 75.",
    ],
  },
  {
    title: 'Hébergement',
    content: [
      "Le site est hébergé par Vercel Inc., 340 S Lemon Ave #4133, Walnut, CA 91789, États-Unis — vercel.com.",
    ],
  },
  {
    title: 'Propriété intellectuelle',
    content: [
      "L'ensemble des contenus du site (textes, photographies, logos, marques, vidéos) est la propriété exclusive de la SAS LES 4 AS ou de ses partenaires. Toute reproduction, représentation ou diffusion, totale ou partielle, sans autorisation écrite préalable est interdite et constitue une contrefaçon sanctionnée par le Code de la propriété intellectuelle.",
    ],
  },
  {
    title: 'Responsabilité',
    content: [
      "La SAS LES 4 AS s'efforce d'assurer l'exactitude des informations publiées sur le site (horaires, tarifs, programmation) mais ne saurait être tenue responsable des erreurs, omissions ou modifications intervenues après publication. Les tarifs et la programmation sont donnés à titre indicatif et peuvent évoluer sans préavis.",
    ],
  },
  {
    title: 'Données personnelles',
    content: [
      "Les données collectées via les formulaires du site (réservation, devis, billetterie, compte client) sont traitées conformément à notre politique de confidentialité, accessible depuis le pied de page du site.",
    ],
  },
]

export default function MentionsLegalesPage() {
  return (
    <main className="min-h-screen bg-noir">
      <Header />
      <section className="pt-32 pb-24 px-4">
        <div className="max-w-3xl mx-auto">
          <p className="text-or text-sm font-semibold tracking-widest uppercase mb-3">Informations légales</p>
          <h1 className="font-display text-4xl font-bold text-creme mb-12">Mentions légales</h1>
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
