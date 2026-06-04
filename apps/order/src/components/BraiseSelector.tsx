'use client'
import { useCart } from '@/stores/cart'

const PLATEAUX = [
  {
    id: 'solo',
    label: 'Solo',
    emoji: '🥩',
    desc: '1 personne · Pièce de bœuf + frites + salade',
    price: 18,
    pieces: ['Entrecôte 200g'],
  },
  {
    id: 'duo',
    label: 'Duo',
    emoji: '🥩🥩',
    desc: '2 personnes · 2 pièces + frites + salade',
    price: 34,
    pieces: ['Entrecôte 200g × 2'],
  },
  {
    id: 'tablee',
    label: 'Tablée',
    emoji: '🥩🥩🥩',
    desc: '3-4 personnes · Sélection braisée + accompagnements',
    price: 65,
    pieces: ['Côte de bœuf', 'Brochettes × 2', 'Merguez × 4'],
    badge: 'Partagé',
  },
]

const CUISSONS = [
  { id: 'bleu', label: 'Bleu', desc: '<1 min' },
  { id: 'saignant', label: 'Saignant', desc: '2 min' },
  { id: 'a-point', label: 'À point', desc: '4 min' },
  { id: 'bien-cuit', label: 'Bien cuit', desc: '6 min' },
]

const SAUCES_BRAISE = [
  { id: 'poivre', label: 'Poivre', price: 0 },
  { id: 'bearnaise', label: 'Béarnaise', price: 0 },
  { id: 'chimichurri', label: 'Chimichurri', price: 0 },
  { id: 'creole', label: 'Sauce créole', price: 0 },
  { id: 'beurre-maison', label: 'Beurre maison', price: 0 },
  { id: 'sans', label: 'Sans sauce', price: 0 },
]

export default function BraiseSelector() {
  const { braiseSelection, setBraiseSelection, addBraiseToCart } = useCart()
  const { plateau, cuisson, sauce } = braiseSelection

  const selectedPlateau = PLATEAUX.find(p => p.id === plateau)

  return (
    <div className="space-y-6">
      {/* Plateau */}
      <section>
        <h3 className="text-sm font-semibold text-or uppercase tracking-wider mb-3">Formule</h3>
        <div className="grid gap-3">
          {PLATEAUX.map(p => (
            <button
              key={p.id}
              onClick={() => setBraiseSelection({ plateau: p.id })}
              className={`p-4 rounded-xl border-2 text-left transition-all ${
                plateau === p.id
                  ? 'border-braise bg-braise/10'
                  : 'border-white/10 hover:border-white/20'
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2">
                    <span>{p.emoji}</span>
                    <span className="font-bold text-creme">{p.label}</span>
                    {p.badge && (
                      <span className="text-xs bg-ambre/20 text-ambre px-2 py-0.5 rounded-full">{p.badge}</span>
                    )}
                  </div>
                  <p className="text-xs text-white/40 mt-1">{p.desc}</p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {p.pieces.map((piece, i) => (
                      <span key={i} className="text-xs bg-white/5 text-white/50 px-2 py-0.5 rounded">{piece}</span>
                    ))}
                  </div>
                </div>
                <span className="text-ambre font-bold ml-4 shrink-0">{p.price.toFixed(2)} €</span>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Cuisson */}
      <section>
        <h3 className="text-sm font-semibold text-or uppercase tracking-wider mb-3">Cuisson</h3>
        <div className="grid grid-cols-2 gap-2">
          {CUISSONS.map(c => (
            <button
              key={c.id}
              onClick={() => setBraiseSelection({ cuisson: c.id })}
              className={`py-3 px-4 rounded-xl border transition-all text-left ${
                cuisson === c.id
                  ? 'border-braise bg-braise/20 text-white'
                  : 'border-white/10 text-white/50 hover:border-white/25'
              }`}
            >
              <div className="font-medium">{c.label}</div>
              <div className="text-xs opacity-60">{c.desc}</div>
            </button>
          ))}
        </div>
      </section>

      {/* Sauce */}
      <section>
        <h3 className="text-sm font-semibold text-or uppercase tracking-wider mb-3">Sauce</h3>
        <div className="flex flex-wrap gap-2">
          {SAUCES_BRAISE.map(s => (
            <button
              key={s.id}
              onClick={() => setBraiseSelection({ sauce: s.id })}
              className={`px-4 py-2 rounded-full border text-sm transition-all ${
                sauce === s.id
                  ? 'border-braise bg-braise text-white'
                  : 'border-white/20 text-white/50 hover:border-white/40'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </section>

      {/* CTA */}
      {plateau && (
        <button
          onClick={() => addBraiseToCart(PLATEAUX, CUISSONS, SAUCES_BRAISE)}
          className="w-full bg-braise hover:bg-ambre text-white py-4 rounded-xl font-bold text-lg transition-colors flex items-center justify-center gap-3"
        >
          <span>Ajouter au panier</span>
          <span className="bg-white/20 px-3 py-1 rounded-full text-base">
            {selectedPlateau?.price.toFixed(2)} €
          </span>
        </button>
      )}
    </div>
  )
}
