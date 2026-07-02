import type { Metadata } from 'next'
import Image from 'next/image'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import BarInteractive from '@/components/BarInteractive'

export const metadata: Metadata = {
  title: 'Bar & Cocktails — Le Smile Bar',
  description: 'Carte complète du Smile Bar : cocktails créations, cocktails classiques, softs, bières, champagnes et bouteilles.',
}

export default function BarPage() {
  return (
    <div className="min-h-screen bg-noir">
      <Header />

      {/* Hero */}
      <section className="pt-28 pb-10 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-or/5 to-transparent pointer-events-none" />
        <div className="max-w-4xl mx-auto flex flex-col items-center text-center">
          <Image src="/logos/smile-bar.png" alt="Smile Bar" width={200} height={200} className="w-32 h-32 object-contain mb-5" />
          <p className="text-or text-sm font-semibold tracking-widest uppercase mb-3">Le Smile Bar</p>
          <h1 className="font-display text-5xl md:text-6xl font-bold text-creme mb-3">
            Notre <span className="text-gradient">Carte</span>
          </h1>
          <p className="text-white/40 max-w-lg mb-2">Route de Montauban, 97190 Gosier · @Le_smilebar</p>
          <p className="text-white/30 text-sm">Sélectionnez vos boissons · Payez en ligne · Apple Pay · Google Pay · Carte</p>
        </div>
      </section>

      {/* Golden Hour */}
      <section className="px-4 pb-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-r from-or/20 via-ambre/10 to-or/20 border border-or/30 rounded-2xl p-6 text-center">
            <h2 className="font-display text-3xl font-bold text-or mb-1">⭐ Golden Hour</h2>
            <p className="text-white/60 text-sm mb-5">De 18h30 à 20h30</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { label: '2 Boissons + 1 assiette de Tapas', price: '30 €' },
                { label: '4 Boissons + 1 planche à partager', price: '40 €' },
                { label: '1 Bouteille de Vin + 1 planche à partager', price: '50 €' },
              ].map(f => (
                <div key={f.label} className="bg-noir/50 rounded-xl p-4 border border-or/20">
                  <p className="text-creme/70 text-sm mb-2">{f.label}</p>
                  <p className="text-or font-bold text-2xl">{f.price}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Carte interactive avec panier */}
      <div className="max-w-4xl mx-auto px-4 pb-8">
        <BarInteractive />
      </div>

      <Footer />
    </div>
  )
}
