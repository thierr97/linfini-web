'use client'
import { useCart } from '@/stores/cart'

interface CartProps {
  onSend: () => void
  submitting: boolean
}

export default function Cart({ onSend, submitting }: CartProps) {
  const { items, removeItem, getCartTotal } = useCart()
  const total = getCartTotal()
  const tva = total * 0.085
  const ttc = total + tva

  if (items.length === 0) {
    return (
      <div className="text-center py-16 text-white/30">
        <div className="text-6xl mb-4">🛒</div>
        <p>Votre panier est vide</p>
        <p className="text-sm mt-1">Ajoutez des plats depuis le menu</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-or">Votre commande</h2>

      {items.map(item => (
        <div key={item.id} className="bg-charbon rounded-xl p-4 border border-white/10">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <p className="font-medium text-creme">{item.name}</p>
              {item.modifiers.length > 0 && (
                <ul className="mt-1 space-y-0.5">
                  {item.modifiers.map((m, i) => (
                    <li key={i} className="text-xs text-white/40">• {m.name} (+{m.price.toFixed(2)} €)</li>
                  ))}
                </ul>
              )}
              {item.note && <p className="text-xs text-ambre/70 mt-1 italic">📝 {item.note}</p>}
            </div>
            <div className="text-right ml-4">
              <p className="font-bold text-ambre">{item.unitPrice.toFixed(2).replace('.', ',')} €</p>
              <button
                onClick={() => removeItem(item.id)}
                className="text-xs text-red-400/60 hover:text-red-400 mt-1"
              >
                Retirer
              </button>
            </div>
          </div>
        </div>
      ))}

      {/* Total */}
      <div className="bg-charbon rounded-xl p-4 border border-white/10 space-y-2">
        <div className="flex justify-between text-white/60 text-sm">
          <span>Sous-total HT</span>
          <span>{total.toFixed(2).replace('.', ',')} €</span>
        </div>
        <div className="flex justify-between text-white/60 text-sm">
          <span>TVA 8,5%</span>
          <span>{tva.toFixed(2).replace('.', ',')} €</span>
        </div>
        <div className="flex justify-between font-bold text-creme border-t border-white/10 pt-2">
          <span>Total TTC</span>
          <span className="text-ambre text-lg">{ttc.toFixed(2).replace('.', ',')} €</span>
        </div>
      </div>

      <button
        onClick={onSend}
        disabled={submitting}
        className="w-full bg-braise hover:bg-ambre disabled:bg-white/10 disabled:text-white/30 text-white py-4 rounded-xl font-bold text-lg transition-colors"
      >
        {submitting ? '⏳ Envoi en cours...' : '✅ Envoyer la commande'}
      </button>
    </div>
  )
}
