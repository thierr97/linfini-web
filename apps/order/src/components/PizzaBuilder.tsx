'use client'
import { useCart } from '@/stores/cart'

const SIZES = [
  { label: '26cm', price: 8, desc: '1 personne', img: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=120&q=70&fit=crop' },
  { label: '33cm', price: 12, desc: '1-2 personnes', img: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=120&q=70&fit=crop' },
]

const SAUCES = [
  { label: 'Sauce Tomate', img: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=80&q=70&fit=crop' },
  { label: 'Crème fraîche', img: 'https://images.unsplash.com/photo-1587404914024-1b0ddd8c5d61?w=80&q=70&fit=crop' },
  { label: 'Pesto', img: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=80&q=70&fit=crop' },
  { label: 'BBQ', img: 'https://images.unsplash.com/photo-1558030006-450675393462?w=80&q=70&fit=crop' },
  { label: 'Sauce Créole', img: 'https://images.unsplash.com/photo-1607301405390-d831c242f59b?w=80&q=70&fit=crop' },
  { label: 'Base Blanche (ail)', img: 'https://images.unsplash.com/photo-1591808216268-ce0b42b34e77?w=80&q=70&fit=crop' },
]

const FROMAGES = [
  { label: 'Mozzarella', extra: 0, img: 'https://images.unsplash.com/photo-1618164435735-413d3b066c9a?w=80&q=70&fit=crop' },
  { label: 'Emmental', extra: 0, img: 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=80&q=70&fit=crop' },
  { label: 'Chèvre frais', extra: 1.5, img: 'https://images.unsplash.com/photo-1452195100486-9cc805987862?w=80&q=70&fit=crop' },
  { label: 'Roquefort', extra: 2, img: 'https://images.unsplash.com/photo-1518791841217-8f162f1912da?w=80&q=70&fit=crop' },
  { label: 'Double Mozzarella', extra: 3, img: 'https://images.unsplash.com/photo-1548369937-47519962c11a?w=80&q=70&fit=crop' },
  { label: 'Sans fromage', extra: 0, img: null },
]

const TOPPINGS = [
  // Viandes
  { key: 'poulet-fume', name: 'Poulet fumé', price: 2.5, premium: false, img: 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=80&q=70&fit=crop' },
  { key: 'poulet-curry', name: 'Poulet curry & pomme de terre', price: 2.5, premium: false, img: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=80&q=70&fit=crop' },
  { key: 'boeuf', name: 'Viande hachée', price: 2.5, premium: false, img: 'https://images.unsplash.com/photo-1551782450-a2132b4ba21d?w=80&q=70&fit=crop' },
  { key: 'chorizo', name: 'Chorizo', price: 2.5, premium: false, img: 'https://images.unsplash.com/photo-1601388352547-2802c6a42cb0?w=80&q=70&fit=crop' },
  { key: 'jambon', name: 'Jambon', price: 2.5, premium: false, img: 'https://images.unsplash.com/photo-1628294895950-9805252327bc?w=80&q=70&fit=crop' },
  { key: 'lardons', name: 'Lardons', price: 2.5, premium: false, img: 'https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=80&q=70&fit=crop' },
  { key: 'merguez', name: 'Merguez', price: 2.5, premium: false, img: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=80&q=70&fit=crop' },
  { key: 'kebab', name: 'Kebab', price: 2.5, premium: false, img: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=80&q=70&fit=crop' },
  { key: 'bacon', name: 'Bacon fumé', price: 2.5, premium: false, img: 'https://images.unsplash.com/photo-1528607929212-2636ec44253e?w=80&q=70&fit=crop' },
  // Poissons
  { key: 'thon', name: 'Thon', price: 2.5, premium: false, img: 'https://images.unsplash.com/photo-1534482421-64566f976cfa?w=80&q=70&fit=crop' },
  { key: 'anchois', name: 'Anchois', price: 2.5, premium: false, img: 'https://images.unsplash.com/photo-1510130387422-82bed34b37e9?w=80&q=70&fit=crop' },
  { key: 'crevettes', name: 'Crevettes', price: 3.5, premium: true, img: 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=80&q=70&fit=crop' },
  { key: 'saumon', name: 'Saumon', price: 3.5, premium: true, img: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=80&q=70&fit=crop' },
  { key: 'stjacques', name: 'St Jacques', price: 4, premium: true, img: 'https://images.unsplash.com/photo-1565980828960-ac3e2fa4f564?w=80&q=70&fit=crop' },
  // Légumes
  { key: 'poivrons', name: 'Poivrons mixtes', price: 2, premium: false, img: 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=80&q=70&fit=crop' },
  { key: 'champignons', name: 'Champignons', price: 2, premium: false, img: 'https://images.unsplash.com/photo-1506484381205-f7945653044d?w=80&q=70&fit=crop' },
  { key: 'oignons', name: 'Oignons caramélisés', price: 2, premium: false, img: 'https://images.unsplash.com/photo-1508747703725-719777637510?w=80&q=70&fit=crop' },
  { key: 'ananas', name: 'Ananas', price: 2, premium: false, img: 'https://images.unsplash.com/photo-1490885578174-acda8905c2c6?w=80&q=70&fit=crop' },
  { key: 'oeuf', name: 'Œuf', price: 2, premium: false, img: 'https://images.unsplash.com/photo-1569288052389-dac9b01ac4b4?w=80&q=70&fit=crop' },
  { key: 'tomates-cerises', name: 'Tomates cerises', price: 2, premium: false, img: 'https://images.unsplash.com/photo-1546094096-0df4bcaaa337?w=80&q=70&fit=crop' },
  { key: 'avocat', name: 'Avocat frais', price: 2.5, premium: false, img: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=80&q=70&fit=crop' },
  { key: 'roquette', name: 'Roquette', price: 2, premium: false, img: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=80&q=70&fit=crop' },
]

export default function PizzaBuilder() {
  const {
    pizzaSize, setPizzaSize,
    pizzaSauce, setPizzaSauce,
    pizzaFromage, setPizzaFromage,
    toppings, toggleTopping,
    note, setNote,
  } = useCart()

  const isSelected = (key: string) => toppings.some(t => t.key === key)

  return (
    <div className="space-y-6">
      {/* Taille */}
      <section>
        <h3 className="text-sm font-semibold text-or uppercase tracking-wider mb-3">Taille</h3>
        <div className="grid grid-cols-2 gap-3">
          {SIZES.map(s => (
            <button
              key={s.label}
              onClick={() => setPizzaSize(s.label, s.price)}
              className={`relative overflow-hidden rounded-xl border-2 font-medium transition-all ${
                pizzaSize === s.label
                  ? 'border-braise bg-braise/20 text-white'
                  : 'border-white/10 text-white/60 hover:border-white/30'
              }`}
            >
              {s.img && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={s.img} alt={s.label} className="w-full h-20 object-cover opacity-40" />
              )}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="text-xl font-bold">{s.label}</div>
                <div className="text-xs text-white/60">{s.desc}</div>
                <div className="text-sm text-ambre font-bold">{s.price.toFixed(2)} €</div>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Sauce */}
      <section>
        <h3 className="text-sm font-semibold text-or uppercase tracking-wider mb-3">Sauce</h3>
        <div className="grid grid-cols-3 gap-2">
          {SAUCES.map(s => (
            <button
              key={s.label}
              onClick={() => setPizzaSauce(s.label)}
              className={`rounded-xl border overflow-hidden transition-all ${
                pizzaSauce === s.label
                  ? 'border-braise ring-1 ring-braise'
                  : 'border-white/10 hover:border-white/30'
              }`}
            >
              {s.img && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={s.img} alt={s.label} className="w-full h-12 object-cover opacity-60" />
              )}
              <div className={`py-1.5 px-2 text-xs text-center font-medium ${pizzaSauce === s.label ? 'text-braise' : 'text-white/60'}`}>
                {s.label}
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Fromage */}
      <section>
        <h3 className="text-sm font-semibold text-or uppercase tracking-wider mb-3">Fromage</h3>
        <div className="grid grid-cols-3 gap-2">
          {FROMAGES.map(f => (
            <button
              key={f.label}
              onClick={() => setPizzaFromage(f.label, f.extra)}
              className={`rounded-xl border overflow-hidden transition-all ${
                pizzaFromage === f.label
                  ? 'border-braise ring-1 ring-braise'
                  : 'border-white/10 hover:border-white/30'
              }`}
            >
              {f.img ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={f.img} alt={f.label} className="w-full h-12 object-cover opacity-60" />
              ) : (
                <div className="w-full h-12 bg-charbon flex items-center justify-center text-2xl">🚫</div>
              )}
              <div className={`py-1.5 px-1 text-xs text-center font-medium ${pizzaFromage === f.label ? 'text-braise' : 'text-white/60'}`}>
                {f.label}
                {f.extra > 0 && <span className="block text-ambre text-xs">+{f.extra.toFixed(2)} €</span>}
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Toppings avec photos */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-or uppercase tracking-wider">Garnitures</h3>
          <span className="text-xs text-white/40">{toppings.length}/5 max</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {TOPPINGS.map(t => {
            const selected = isSelected(t.key)
            const disabled = !selected && toppings.length >= 5
            return (
              <button
                key={t.key}
                onClick={() => !disabled && toggleTopping(t)}
                disabled={disabled}
                className={`rounded-xl border overflow-hidden transition-all ${
                  selected
                    ? 'border-ambre ring-1 ring-ambre'
                    : disabled
                    ? 'border-white/5 opacity-30 cursor-not-allowed'
                    : 'border-white/10 hover:border-white/30'
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={t.img} alt={t.name} className={`w-full h-14 object-cover transition-opacity ${selected ? 'opacity-80' : 'opacity-50'}`} />
                <div className={`py-1.5 px-1 text-center ${selected ? 'bg-ambre/20' : 'bg-charbon'}`}>
                  <div className={`text-xs font-medium leading-tight ${selected ? 'text-ambre' : 'text-white/60'}`}>{t.name}</div>
                  <div className={`text-xs ${t.premium ? 'text-ambre' : selected ? 'text-ambre/70' : 'text-white/30'}`}>
                    {t.premium && '⭐ '}+{t.price.toFixed(2)} €
                  </div>
                </div>
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
          placeholder="Sans oignons, bien cuit..."
          rows={2}
          className="w-full bg-charbon border border-white/10 rounded-xl px-4 py-3 text-white/80 placeholder-white/20 resize-none focus:outline-none focus:border-braise"
        />
      </section>
    </div>
  )
}
