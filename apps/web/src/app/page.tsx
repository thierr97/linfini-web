import Header from '@/components/Header'
import Hero from '@/components/Hero'
import EventsPreview from '@/components/EventsPreview'
import ConceptSection from '@/components/ConceptSection'
import MenuSection from '@/components/MenuSection'
import PizzaTeaser from '@/components/PizzaTeaser'
import BarSection from '@/components/BarSection'
import GaleriePreview from '@/components/GaleriePreview'
import LocationSection from '@/components/LocationSection'
import ReservationForm from '@/components/ReservationForm'
import DevisForm from '@/components/DevisForm'
import Footer from '@/components/Footer'
import { getAllEvents } from '@/lib/bizouk'
import { getPosMenu, pickItems } from '@/lib/odoo/posMenu'

// ISR 15 min : prix du teaser bar synchronisés avec la caisse Odoo
export const revalidate = 900

// IDs Odoo des produits mis en avant sur l'accueil
const TEASER_APERITIFS = [364, 365, 367, 370, 372, 374] // Ti Punch B/V, Martini Blanc, Get 27, Amaretto, Bailey's
const TEASER_COCKTAILS = [384, 385, 391]                // Le Smile, Maya L'abeille, Balthazar

async function getMenuItems() {
  try {
    const { prisma } = await import('@linfini/db')
    return await prisma.item.findMany({
      where: { active: true, featured: true },
      include: { category: true },
      take: 8,
    })
  } catch { return [] }
}

export default async function HomePage() {
  const [featured, upcomingEvents, posMenu] = await Promise.all([
    getMenuItems(),
    getAllEvents('upcoming'),
    getPosMenu(),
  ])

  return (
    <main className="min-h-screen bg-noir">
      <Header />
      <Hero />
      <EventsPreview events={upcomingEvents} />
      <ConceptSection />
      <MenuSection items={featured} />
      <PizzaTeaser />
      <BarSection aperitifs={pickItems(posMenu, TEASER_APERITIFS)} cocktails={pickItems(posMenu, TEASER_COCKTAILS)} />
      <GaleriePreview />
      <section id="reservation" className="py-24 px-4 bg-charbon">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-braise text-sm font-semibold tracking-widest uppercase mb-3">Réserver une table</p>
            <h2 className="font-display text-4xl font-bold text-creme">
              Votre soirée <span className="text-gradient">commence ici</span>
            </h2>
          </div>
          <ReservationForm />
        </div>
      </section>
      {/* Devis événement */}
      <section id="devis" className="py-24 px-4 bg-noir">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-or text-sm font-semibold tracking-widest uppercase mb-3">Événement privé</p>
            <h2 className="font-display text-4xl font-bold text-creme mb-4">
              Demande de <span className="text-gradient">devis</span>
            </h2>
            <p className="text-white/40 max-w-xl mx-auto">
              Mariage, anniversaire, soirée d'entreprise... Décrivez votre projet et nous vous répondons sous 24h avec une proposition personnalisée.
            </p>
          </div>
          <DevisForm />
        </div>
      </section>
      <LocationSection />
      <Footer />
    </main>
  )
}
