import type { Metadata } from 'next'
import Image from 'next/image'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: 'Bar & Cocktails — Le Smile Bar',
  description: 'Carte complète du Smile Bar : cocktails créations, cocktails classiques, softs, bières, champagnes et bouteilles.',
}

// ── DATA from official menu PDF ──────────────────────────────────

const SOFTS = [
  { name: 'Jus de fruits', desc: 'Orange / Passion / Ananas · Pomme / Mangue / Goyave', price: 5 },
  { name: 'Coca / Coca Zéro', desc: '33cl', price: 5 },
  { name: 'Sprite', desc: '33cl', price: 5 },
  { name: 'Schweppes', desc: '33cl', price: 5 },
  { name: 'Fuze Tea', desc: '33cl', price: 5 },
  { name: 'Red Bull', desc: '25cl', price: 5 },
  { name: 'Long Horn', desc: '33cl', price: 5 },
  { name: 'Ordinaire', desc: 'Eau gazeuse maison', price: 5 },
  { name: 'Eaux', desc: 'Perrier 50cl / Plate 50cl / 1,5l', price: 3 },
]

const BIERES = [
  { name: 'Heineken', desc: '33cl', price: 6 },
  { name: 'Corona', desc: '33cl', price: 6 },
  { name: 'Gwada', desc: '33cl — Bière locale', price: 6 },
  { name: 'Desperados', desc: 'Original / Lime / Mojito', price: 6 },
]

const APERITIFS = [
  { name: 'Ti Punch Blanc', desc: 'Rhum blanc agricole', price: 5 },
  { name: 'Ti Punch Vieux', desc: 'Rhum vieux', price: 7 },
  { name: 'Martini Blanc / Rouge', desc: 'Verre 10cl', price: 9 },
  { name: 'Ricard / Pastis', desc: 'Verre', price: 9 },
  { name: 'Get 27 / 31', desc: 'Liqueur de menthe', price: 9 },
  { name: 'Amaretto', desc: 'Disaronno', price: 9 },
  { name: 'Campari', desc: 'Aperitivo italiano', price: 9 },
  { name: "Bailey's", desc: "Liqueur d'Irish Cream", price: 9 },
]

const COCKTAILS_CREATIONS = [
  { name: 'Le Smile', ingredients: 'Hennessy, Crème de framboise, citron, coulis de framboise, sirop de vanille et Miel', price: 15, signature: true },
  { name: "Maya L'abeille", ingredients: 'Rhum vieux, Amaretto, Sirop de vanille, Jus d\'ananas, passion, cannelle et miel', price: 14 },
  { name: 'PopStar', ingredients: 'Vodka Ciroc rouge, Sirop de vanille, sirop et coulis de passion', price: 14 },
  { name: "Tropi'Kal", ingredients: 'Rhum vieux, sirop pêche, coulis passion, mangue et grenadine', price: 14 },
  { name: 'Peachy', ingredients: 'Vodka, crème de pêche, Jus de passion, sirop de violette et champagne', price: 15 },
  { name: 'PiweeZ', ingredients: 'Gin, Jus de pomme, Coulis et Sirop de kiwi, citron vert, Schweppes', price: 14 },
  { name: 'Double G', ingredients: 'Gin, Sirop de Gingembre, Triple Sec, Citron', price: 14 },
  { name: 'Balthazar', ingredients: 'Henessy, Rhum vieux, Sirop de bois bandé, Sirop de gingembre, Sirop de vanille, Citron et notre Ingrédient secret 😎', price: 15, signature: true },
  { name: 'Sweety', ingredients: 'Jus de goyave, Passion, Sirop de vanille et Coulis de framboise', price: 10, virgin: true },
  { name: 'Kiweez', ingredients: "Jus de pomme, jus d'ananas, sirop, coulis de kiwi et citron", price: 10, virgin: true },
  { name: "Exotik'", ingredients: "Jus d'ananas, coulis passion, citron et Sirop d'orgeat", price: 10, virgin: true },
]

const COCKTAILS_CLASSIQUES = [
  { name: 'Mojito / Mojitoska / Mojitosky', ingredients: 'Rhum Blanc, Citron, Menthe fraîche, Sucre et Soda', price: 12 },
  { name: 'Royal Mojito', ingredients: 'Rhum Blanc, Citron, Menthe fraîche, Sucre et Champagne', price: 15 },
  { name: 'Caipirinia / Caipiroska', ingredients: 'Cachaca, Citron, Sucre', price: 12 },
  { name: 'Daiquiri', ingredients: 'Rhum Blanc, Citron, Sucre', price: 12 },
  { name: 'Margarita', ingredients: 'Tequila, Triple Sec, citron, sucre', price: 12 },
  { name: 'Tequila Sunrise', ingredients: "Téquila, Jus D'orange, grenadine", price: 12 },
  { name: 'Maï-Taï', ingredients: 'Rhum Blanc, Rhum vieux, Triple sec, orgeat, ananas', price: 12 },
  { name: 'Aperol Spritz', ingredients: "Aperol, Champagne, tranche d'Orange", price: 15 },
  { name: 'Expresso Martini', ingredients: 'Vodka, Expresso, liqueur de café, vanille et sucre', price: 12 },
  { name: 'Moscow Mule', ingredients: 'Vodka, Citron, sucre, Ginger Beer', price: 12 },
  { name: 'Amaretto Sour', ingredients: "Liqueur d'Amaretto, citron, sucre", price: 12 },
  { name: 'Long Island', ingredients: 'Rhum blanc, Vodka, Tequila, Gin, Triple sec, citron, sucre et coca', price: 12 },
]

const CHAMPAGNES = [
  { name: 'Nicolas Feuillate', price: 90 },
  { name: 'Moët Impérial Brut', price: 100 },
  { name: 'Moët Nectar Impérial', price: 120 },
  { name: 'Moët Nectar Impérial Rosé', price: 120 },
  { name: 'Ruinart Blanc de Blanc', price: 190 },
  { name: 'Dom Perignon', price: 450 },
]

const VODKAS = [
  { name: 'Smirnoff', price: 80 },
  { name: 'Absolut', price: 90 },
  { name: 'Belvedere', price: 110 },
  { name: 'Ciroc', price: 120 },
]

const WHISKYS = [
  { name: "Jack Daniel's", price: 110 },
  { name: "Jack Daniel's Honey", price: 110 },
  { name: 'William Lawson', price: 80 },
]

const COGNACS = [
  { name: 'Gauthier', price: 110 },
  { name: 'Henessy', price: 130 },
]

function PriceRow({ items }: { items: { name: string; desc?: string; price: number }[] }) {
  return (
    <div className="bg-charbon rounded-2xl border border-white/5 overflow-hidden">
      {items.map((item, i) => (
        <div key={item.name} className={`flex justify-between items-center px-5 py-3.5 ${i < items.length - 1 ? 'border-b border-white/5' : ''}`}>
          <div>
            <p className="font-medium text-creme text-sm">{item.name}</p>
            {item.desc && <p className="text-xs text-white/35 mt-0.5">{item.desc}</p>}
          </div>
          <span className="text-ambre font-bold shrink-0 ml-4">{item.price.toFixed(2)} €</span>
        </div>
      ))}
    </div>
  )
}

export default function BarPage() {
  return (
    <div className="min-h-screen bg-noir">
      <Header />

      {/* Hero */}
      <section className="pt-28 pb-12 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-or/5 to-transparent pointer-events-none" />
        <div className="max-w-4xl mx-auto flex flex-col items-center text-center">
          <Image src="/logos/smile-bar.png" alt="Smile Bar" width={200} height={200} className="w-40 h-40 object-contain mb-6" />
          <p className="text-or text-sm font-semibold tracking-widest uppercase mb-3">Le Smile Bar</p>
          <h1 className="font-display text-5xl md:text-6xl font-bold text-creme mb-3">
            Notre <span className="text-gradient">Carte</span>
          </h1>
          <p className="text-white/40 max-w-lg">Route de Montauban, 97190 Gosier · @Le_smilebar</p>
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

      <div className="max-w-4xl mx-auto px-4 pb-24 space-y-14">

        {/* Cocktails Créations */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <span className="text-3xl">🍹</span>
            <h2 className="font-display text-3xl font-bold text-or">Cocktails Créations</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {COCKTAILS_CREATIONS.map(c => (
              <div key={c.name} className={`relative rounded-xl p-4 border transition-all ${c.signature ? 'border-or/40 bg-or/5' : c.virgin ? 'border-green-500/20 bg-green-500/5' : 'border-white/5 bg-charbon hover:border-white/10'}`}>
                {c.signature && <span className="absolute -top-2 -right-2 bg-or text-noir text-xs font-bold px-2 py-0.5 rounded-full">★ Signature</span>}
                {c.virgin && <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">Sans alcool</span>}
                <div className="flex justify-between items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-creme">{c.name}</p>
                    <p className="text-xs text-white/40 mt-1 leading-relaxed">{c.ingredients}</p>
                  </div>
                  <span className="text-ambre font-bold shrink-0">{c.price} €</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Cocktails Classiques */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <span className="text-3xl">🍸</span>
            <h2 className="font-display text-3xl font-bold text-or">Cocktails Classiques</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {COCKTAILS_CLASSIQUES.map(c => (
              <div key={c.name} className="bg-charbon rounded-xl p-4 border border-white/5 hover:border-braise/20 transition-all">
                <div className="flex justify-between items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-creme">{c.name}</p>
                    <p className="text-xs text-white/40 mt-1">{c.ingredients}</p>
                  </div>
                  <span className="text-ambre font-bold shrink-0">{c.price} €</span>
                </div>
              </div>
            ))}
          </div>
          <p className="text-white/30 text-xs mt-3 text-center">+ 0,50 € supplément miel</p>
        </section>

        {/* Apéritifs + Softs côte à côte */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <section>
            <div className="flex items-center gap-3 mb-5">
              <span className="text-2xl">🥃</span>
              <h2 className="font-display text-2xl font-bold text-or">Apéritifs</h2>
            </div>
            <PriceRow items={APERITIFS} />
          </section>
          <section>
            <div className="flex items-center gap-3 mb-5">
              <span className="text-2xl">🥤</span>
              <h2 className="font-display text-2xl font-bold text-or">Softs</h2>
            </div>
            <PriceRow items={SOFTS} />
          </section>
        </div>

        {/* Bières */}
        <section>
          <div className="flex items-center gap-3 mb-5">
            <span className="text-2xl">🍺</span>
            <h2 className="font-display text-2xl font-bold text-or">Bières</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {BIERES.map(b => (
              <div key={b.name} className="bg-charbon rounded-xl p-4 border border-white/5 text-center">
                <p className="font-bold text-creme">{b.name}</p>
                <p className="text-xs text-white/35 mt-1">{b.desc}</p>
                <p className="text-ambre font-bold text-xl mt-2">{b.price} €</p>
              </div>
            ))}
          </div>
        </section>

        {/* Bouteilles */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <span className="text-3xl">🍾</span>
            <h2 className="font-display text-3xl font-bold text-or">Nos Bouteilles</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="text-or font-semibold mb-3 uppercase tracking-wider text-sm">🥂 Champagnes</h3>
              <PriceRow items={CHAMPAGNES} />
            </div>
            <div>
              <h3 className="text-or font-semibold mb-3 uppercase tracking-wider text-sm">🍸 Vodkas</h3>
              <PriceRow items={VODKAS} />
              <h3 className="text-or font-semibold mb-3 mt-6 uppercase tracking-wider text-sm">🥃 Cognac</h3>
              <PriceRow items={COGNACS} />
            </div>
            <div>
              <h3 className="text-or font-semibold mb-3 uppercase tracking-wider text-sm">🥃 Whisky</h3>
              <PriceRow items={WHISKYS} />
            </div>
          </div>
        </section>

      </div>
      <Footer />
    </div>
  )
}
