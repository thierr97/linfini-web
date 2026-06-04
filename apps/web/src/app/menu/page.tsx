import type { Metadata } from 'next'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import MenuInteractive from '@/components/MenuInteractive'
import { dataService } from '@/lib/data'

export const metadata: Metadata = {
  title: 'Menu — Le District',
  description: 'Tapas, Les Box, Desserts — commandez et payez directement en ligne.',
}

// Pas de cache → données toujours fraîches après modification admin
export const dynamic = 'force-dynamic'

export default async function MenuPage() {
  const menu = await dataService.getMenu()

  return (
    <div className="min-h-screen bg-noir text-creme">
      <Header />
      <div className="max-w-4xl mx-auto px-4 pt-32 pb-12">
        <h1 className="font-display text-5xl font-bold text-center mb-2 text-creme">
          Notre <span className="text-gradient">Menu</span>
        </h1>
        <p className="text-center text-white/40 mb-12">
          Service {menu.settings.service} · Sélectionnez et payez directement en ligne
        </p>
        <MenuInteractive categories={menu.categories} />
      </div>
      <Footer />
    </div>
  )
}
