import Header from '@/components/Header'
import Hero from '@/components/Hero'
import ConceptSection from '@/components/ConceptSection'
import MenuSection from '@/components/MenuSection'
import PizzaTeaser from '@/components/PizzaTeaser'
import BarSection from '@/components/BarSection'
import GaleriePreview from '@/components/GaleriePreview'
import LocationSection from '@/components/LocationSection'
import ReservationForm from '@/components/ReservationForm'
import Footer from '@/components/Footer'

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
  const featured = await getMenuItems()

  return (
    <main className="min-h-screen bg-noir">
      <Header />
      <Hero />
      <ConceptSection />
      <MenuSection items={featured} />
      <PizzaTeaser />
      <BarSection />
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
      <LocationSection />
      <Footer />
    </main>
  )
}
