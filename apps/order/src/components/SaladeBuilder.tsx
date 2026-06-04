'use client'
import { useCart } from '@/stores/cart'

const BASES = [
  { label: 'Jeunes pousses', price: 12 },
  { label: 'Roquette', price: 12 },
  { label: 'Laitue mixte', price: 11 },
  { label: 'Épinards baby', price: 13 },
]

const SAUCES_SALADE = [
  'Vinaigrette maison',
  'César',
  "Citron & huile d'olive",
  'Miel & moutarde',
]

const TOPPINGS_SALADE = [
  { key: 'poulet-grill', name: 'Poulet grillé', price: 3, premium: false },
  { key: 'thon-s', name: 'Thon', price: 2.5, premium: false },
  { key: 'crevettes-s', name: 'Crevettes 🌟', price: 4, premium: true },
  { key: 'saumon-s', name: 'Saumon fumé 🌟', price: 4, premium: true },
  { key: 'oeuf-s', name: 'Œuf dur', price: 1.5, premium: false },
  { key: 'avocat', name: 'Avocat', price: 2, premium: false },
  { key: 'tomates', name: 'Tomates cerises', price: 1.5, premium: false },
  { key: 'parmesan', name: 'Parmesan', price: 2, premium: false },
  { key: 'croutons', name: 'Croûtons', price: 1, premium: false },
  { key: 'olives', name: 'Olives', price: 1.5, premium: false },
]

export default function SaladeBuilder() {
  const {
    saladeBase, setSaladeBase,
    saladeSauce, setSaladeSauce,
    toppings, toggleTopping,
    note, setNote,
  } = useCart()

  const isSelected = (key: string) => toppings.some(t => t.key === key)

  return (
    <div className="space-y-6">
      {/* Base */}
      <section>
        <h3 className="text-sm font-semibold text-or uppercase tracking-wider mb-3">Base</h3>
        <div className="grid grid-cols-2 gap-2">
          {BASES.map(b => (
            <button
              key={b.label}
              onClick={() => setSaladeBase(b.label, b.price)}
              className={`py-3 px-3 rounded-xl border-2 text-sm font-medium transition-all text-left ${
                saladeBase === b.label
                  ? 'border-braise bg-braise/20 text-white'
                  : 'border-white/10 text-white/60 hover:border-white/30'
              }`}
            >
              <div>{b.label}</div>
              <div className="text-ambre">{b.price.toFixed(2)} €</div>
            </button>
          ))}
        </div>
      </section>

      {/* Sauce */}
      <section>
        <h3 className="text-sm font-semibold text-or uppercase tracking-wider mb-3">Sauce</h3>
        <div className="flex flex-wrap gap-2">
          {SAUCES_SALADE.map(s => (
            <button
              key={s}
              onClick={() => setSaladeSauce(s)}
              className={`px-4 py-2 rounded-full border text-sm transition-all ${
                saladeSauce === s
                  ? 'border-braise bg-braise text-white'
                  : 'border-white/20 text-white/60 hover:border-white/40'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </section>

      {/* Toppings */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-or uppercase tracking-wider">Garnitures</h3>
          <span className="text-xs text-white/40">{toppings.length}/5 max</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {TOPPINGS_SALADE.map(t => {
            const selected = isSelected(t.key)
            const disabled = !selected && toppings.length >= 5
            return (
              <button
                key={t.key}
                onClick={() => !disabled && toggleTopping(t)}
                disabled={disabled}
                className={`py-2 px-3 rounded-lg border text-sm transition-all text-left ${
                  selected ? 'border-ambre bg-ambre/20 text-white'
                    : disabled ? 'border-white/5 text-white/20 cursor-not-allowed'
                    : 'border-white/10 text-white/60 hover:border-white/30'
                }`}
              >
                <div>{t.name}</div>
                <div className={selected ? 'text-ambre' : 'text-white/40'}>+{t.price.toFixed(2)} €</div>
              </button>
            )
          })}
        </div>
      </section>

      {/* Note */}
      <section>
        <h3 className="text-sm font-semibold text-or uppercase tracking-wider mb-3">Note (optionnel)</h3>
        <textarea
          value={note}
          onChange={e => setNote(e.target.value)}
          placeholder="Sans gluten, allergie..."
          rows={2}
          className="w-full bg-charbon border border-white/10 rounded-xl px-4 py-3 text-white/80 placeholder-white/20 resize-none focus:outline-none focus:border-braise"
        />
      </section>
    </div>
  )
}
