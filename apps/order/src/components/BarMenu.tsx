'use client'
import { useCart } from '@/stores/cart'

const BOISSONS = {
  'Cocktails Créations': [
    { id: 'le-smile', name: 'Le Smile ★', desc: 'Hennessy, crème de framboise, citron, coulis de framboise, vanille, miel', price: 15, featured: true },
    { id: 'maya-labeille', name: "Maya L'abeille", desc: 'Rhum vieux, Amaretto, vanille, ananas, passion, cannelle, miel', price: 14 },
    { id: 'popstar', name: 'PopStar', desc: 'Vodka Ciroc rouge, vanille, coulis et sirop de passion', price: 14 },
    { id: 'tropikal', name: "Tropi'Kal", desc: 'Rhum vieux, pêche, passion, mangue, grenadine', price: 14 },
    { id: 'peachy', name: 'Peachy', desc: 'Vodka, crème de pêche, passion, violette, champagne', price: 15 },
    { id: 'piweez', name: 'PiweeZ', desc: 'Gin, pomme, kiwi, citron vert, Schweppes', price: 14 },
    { id: 'double-g', name: 'Double G', desc: 'Gin, gingembre, Triple Sec, citron', price: 14 },
    { id: 'balthazar', name: 'Balthazar ★', desc: 'Henessy, rhum vieux, bois bandé, gingembre, vanille, citron + secret', price: 15, featured: true },
    { id: 'sweety', name: 'Sweety 🌿', desc: 'Goyave, passion, vanille, coulis de framboise — sans alcool', price: 10 },
    { id: 'kiweez', name: 'Kiweez 🌿', desc: "Pomme, ananas, kiwi, citron — sans alcool", price: 10 },
    { id: 'exotik', name: "Exotik' 🌿", desc: "Ananas, passion, citron, orgeat — sans alcool", price: 10 },
  ],
  'Cocktails Classiques': [
    { id: 'mojito', name: 'Mojito / Mojitoska', desc: 'Rhum Blanc, citron, menthe fraîche, sucre, soda', price: 12 },
    { id: 'royal-mojito', name: 'Royal Mojito', desc: 'Rhum Blanc, citron, menthe fraîche, sucre, champagne', price: 15 },
    { id: 'caipirinia', name: 'Caipirinia / Caipiroska', desc: 'Cachaca ou Vodka, citron, sucre', price: 12 },
    { id: 'daiquiri', name: 'Daiquiri', desc: 'Rhum Blanc, citron, sucre', price: 12 },
    { id: 'margarita', name: 'Margarita', desc: 'Tequila, Triple Sec, citron, sucre', price: 12 },
    { id: 'tequila-sunrise', name: 'Tequila Sunrise', desc: "Tequila, jus d'orange, grenadine", price: 12 },
    { id: 'mai-tai', name: 'Maï-Taï', desc: 'Rhum Blanc, rhum vieux, Triple sec, orgeat, ananas', price: 12 },
    { id: 'aperol-spritz', name: 'Aperol Spritz', desc: "Aperol, champagne, tranche d'orange", price: 15 },
    { id: 'expresso-martini', name: 'Expresso Martini', desc: 'Vodka, expresso, liqueur de café, vanille', price: 12 },
    { id: 'moscow-mule', name: 'Moscow Mule', desc: 'Vodka, citron, sucre, Ginger Beer', price: 12 },
    { id: 'long-island', name: 'Long Island', desc: 'Rhum, Vodka, Tequila, Gin, Triple sec, citron, coca', price: 12 },
  ],
  'Apéritifs & Ti Punch': [
    { id: 'ti-punch-blanc', name: 'Ti Punch Blanc', desc: 'Rhum blanc agricole, citron, sucre de canne', price: 5 },
    { id: 'ti-punch-vieux', name: 'Ti Punch Vieux', desc: 'Rhum vieux', price: 7 },
    { id: 'martini', name: 'Martini Blanc / Rouge', desc: 'Verre 10cl', price: 9 },
    { id: 'get27', name: 'Get 27 / 31', desc: 'Liqueur de menthe', price: 9 },
    { id: 'amaretto', name: 'Amaretto', desc: 'Disaronno', price: 9 },
    { id: 'baileys', name: "Bailey's", desc: "Liqueur d'Irish Cream", price: 9 },
    { id: 'campari', name: 'Campari', desc: 'Aperitivo italiano', price: 9 },
  ],
  'Bières': [
    { id: 'heineken', name: 'Heineken', desc: '33cl', price: 6 },
    { id: 'corona', name: 'Corona', desc: '33cl', price: 6 },
    { id: 'gwada', name: 'Gwada', desc: '33cl — Bière locale', price: 6 },
    { id: 'desperados', name: 'Desperados', desc: 'Original / Lime / Mojito', price: 6 },
  ],
  'Softs': [
    { id: 'jus-fruits', name: 'Jus de fruits', desc: 'Orange / Passion / Ananas / Mangue / Goyave', price: 5 },
    { id: 'coca', name: 'Coca / Coca Zéro', desc: '33cl', price: 5 },
    { id: 'sprite', name: 'Sprite', desc: '33cl', price: 5 },
    { id: 'schweppes', name: 'Schweppes', desc: '33cl', price: 5 },
    { id: 'red-bull', name: 'Red Bull', desc: '25cl', price: 5 },
    { id: 'eau', name: 'Eau', desc: 'Perrier 50cl / Plate 50cl', price: 3 },
  ],
}

export default function BarMenu() {
  const { barQuantities, setBarQty, addBarToCart, getBarTotal } = useCart()

  const totalItems = Object.values(barQuantities).reduce((a, b) => a + b, 0)
  // Flatten all items for price lookup
  const allItems = Object.values(BOISSONS).flat()
  const total = getBarTotal(allItems)

  return (
    <div className="space-y-6">
      {Object.entries(BOISSONS).map(([category, items]) => (
        <section key={category}>
          <h3 className="text-sm font-semibold text-or uppercase tracking-wider mb-3">{category}</h3>
          <div className="space-y-2">
            {items.map(item => {
              const qty = barQuantities[item.id] ?? 0
              return (
                <div
                  key={item.id}
                  className={`bg-charbon rounded-xl p-3 border transition-all ${qty > 0 ? 'border-braise/40' : 'border-white/5'}`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="font-medium text-creme text-sm truncate">{item.name}</p>
                        {(item as any).featured && <span className="text-xs text-ambre shrink-0">✦</span>}
                      </div>
                      <p className="text-xs text-white/35 truncate">{item.desc}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-ambre font-bold text-sm w-12 text-right">{item.price.toFixed(2)} €</span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setBarQty(item.id, Math.max(0, qty - 1))}
                          disabled={qty === 0}
                          className={`w-7 h-7 rounded-full border font-bold text-sm transition-all ${qty > 0 ? 'border-braise text-braise hover:bg-braise hover:text-white' : 'border-white/10 text-white/15 cursor-not-allowed'}`}
                        >
                          −
                        </button>
                        <span className={`w-5 text-center font-bold text-sm ${qty > 0 ? 'text-creme' : 'text-white/15'}`}>{qty}</span>
                        <button
                          onClick={() => setBarQty(item.id, qty + 1)}
                          className="w-7 h-7 rounded-full border border-braise text-braise hover:bg-braise hover:text-white font-bold text-sm transition-all"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      ))}

      {totalItems > 0 && (
        <button
          onClick={() => addBarToCart(allItems)}
          className="w-full mt-2 bg-braise hover:bg-ambre text-white py-4 rounded-xl font-bold text-lg transition-colors flex items-center justify-center gap-3 sticky bottom-4"
        >
          <span>Ajouter {totalItems} boisson{totalItems > 1 ? 's' : ''}</span>
          <span className="bg-white/20 px-3 py-1 rounded-full text-base">{total.toFixed(2)} €</span>
        </button>
      )}
    </div>
  )
}
