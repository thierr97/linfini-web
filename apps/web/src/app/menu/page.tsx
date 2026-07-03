import type { Metadata } from 'next'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import MenuInteractive from '@/components/MenuInteractive'
import { getPosMenu, menuSections } from '@/lib/odoo/posMenu'

export const metadata: Metadata = {
  title: 'Menu — Restaurant & Bar',
  description: 'Tapas, plats franco-créoles, desserts, cocktails — commandez et payez directement en ligne.',
}

// ISR 15 min : les prix viennent de la caisse Odoo (spec §3)
export const revalidate = 900

export default async function MenuPage() {
  const menu = await getPosMenu()

  return (
    <div className="min-h-screen bg-noir text-creme">
      <Header />
      <div className="max-w-6xl mx-auto px-4 pt-32 pb-12">
        <h1 className="font-display text-5xl font-bold text-center mb-2 text-creme">
          Notre <span className="text-gradient">Menu</span>
        </h1>
        <p className="text-center text-white/40 mb-12">
          Service {menu.settings.service} · Sélectionnez et payez directement en ligne
        </p>
        <MenuInteractive categories={menuSections(menu)} />
      </div>
      <Footer />
    </div>
  )
}
