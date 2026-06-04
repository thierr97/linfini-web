'use client'
import { useCart } from '@/stores/cart'

const TAPAS = [
  // Tapas classiques
  { id: 'acras', name: 'Acras de morue', desc: 'Beignets créoles à la morue', price: 8 },
  { id: 'boudin', name: 'Boudin créole', desc: 'Boudin antillais traditionnel', price: 7 },
  { id: 'frites-maison', name: 'Frites maison', desc: 'Frites fraîches, sel, épices', price: 5 },
  { id: 'ailes-poulet', name: 'Ailes de poulet grillées', desc: 'Marinées colombo, sauce créole', price: 9 },
  { id: 'nems-creole', name: 'Nems créoles', desc: 'Farce crevettes & légumes du pays', price: 9 },
  { id: 'plateau-charcuterie', name: 'Plateau charcuterie', desc: 'Jambon, chorizo, fromage, olives', price: 14 },
  { id: 'rillettes-crabe', name: 'Rillettes de crabe', desc: 'Crabe local, citron vert, toast', price: 11 },
  { id: 'gambas-grillee', name: 'Gambas grillées', desc: 'Ail, beurre, persil, citron', price: 14, premium: true },
  { id: 'camembert-frit', name: 'Camembert frit', desc: 'Pané, confiture figue', price: 10 },
  { id: 'croquettes-manioc', name: 'Croquettes de manioc', desc: 'Manioc, fromage, piment', price: 8 },
  { id: 'plancha-legumes', name: 'Légumes à la plancha', desc: 'Courgettes, poivrons, champignons', price: 9 },
  { id: 'poulpe-grille', name: 'Poulpe grillé', desc: 'Poulpe tendre, vinaigrette citron', price: 13, premium: true },
]

export default function TapasList() {
  const { tapasQuantities, setTapasQty, addTapasToCart, getTapasTotal } = useCart()

  const totalItems = Object.values(tapasQuantities).reduce((a, b) => a + b, 0)
  const total = getTapasTotal(TAPAS)

  return (
    <div className="space-y-3">
      <p className="text-sm text-white/40 mb-4">Sélectionnez vos tapas et ajustez les quantités</p>

      {TAPAS.map(t => {
        const qty = tapasQuantities[t.id] ?? 0
        return (
          <div key={t.id} className={`bg-charbon rounded-xl p-4 border transition-all ${qty > 0 ? 'border-braise/40' : 'border-white/5'}`}>
            <div className="flex items-center justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-creme truncate">{t.name}</p>
                  {t.premium && <span className="text-xs text-ambre shrink-0">★ Premium</span>}
                </div>
                <p className="text-xs text-white/40 truncate">{t.desc}</p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="text-ambre font-bold text-sm w-14 text-right">{t.price.toFixed(2)} €</span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setTapasQty(t.id, Math.max(0, qty - 1))}
                    className={`w-8 h-8 rounded-full border font-bold transition-all ${qty > 0 ? 'border-braise text-braise hover:bg-braise hover:text-white' : 'border-white/10 text-white/20 cursor-not-allowed'}`}
                    disabled={qty === 0}
                  >
                    −
                  </button>
                  <span className={`w-6 text-center font-bold text-sm ${qty > 0 ? 'text-creme' : 'text-white/20'}`}>{qty}</span>
                  <button
                    onClick={() => setTapasQty(t.id, qty + 1)}
                    className="w-8 h-8 rounded-full border border-braise text-braise hover:bg-braise hover:text-white font-bold transition-all"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          </div>
        )
      })}

      {totalItems > 0 && (
        <button
          onClick={() => addTapasToCart(TAPAS)}
          className="w-full mt-4 bg-braise hover:bg-ambre text-white py-4 rounded-xl font-bold text-lg transition-colors flex items-center justify-center gap-3"
        >
          <span>Ajouter {totalItems} tapas</span>
          <span className="bg-white/20 px-3 py-1 rounded-full text-base">{total.toFixed(2)} €</span>
        </button>
      )}
    </div>
  )
}
