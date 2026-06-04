'use client'
import { NavBar } from '@/components/NavBar'
import { useEffect, useState } from 'react'
import { TVA } from '@/lib/db'
import { PaymentModal } from '@/components/PaymentModal'
import type { CartItem } from '@/types'

interface TicketType {
  id: string
  name: string
  price: number
  quantity: number
  sold: number
  event: { id: string; title: string; date: string }
}

export default function EntreesPage() {
  const [ticketTypes, setTicketTypes] = useState<TicketType[]>([])
  const [cart, setCart] = useState<CartItem[]>([])
  const [showPayment, setShowPayment] = useState(false)

  useEffect(() => {
    // Fetch upcoming events with ticket types
    fetch('/api/entrees').then((r) => r.json()).then(setTicketTypes).catch(() => setTicketTypes([]))
  }, [])

  const addToCart = (tt: TicketType) => {
    setCart((prev) => {
      const ex = prev.find((i) => i.itemId === tt.id)
      if (ex) return prev.map((i) => i.itemId === tt.id ? { ...i, quantity: i.quantity + 1 } : i)
      return [...prev, { id: crypto.randomUUID(), itemId: tt.id, name: `${tt.name} — ${tt.event.title}`, price: tt.price, quantity: 1, modifiers: [] }]
    })
  }

  const total = cart.reduce((s, i) => s + i.price * i.quantity, 0)

  return (
    <div className="flex flex-col h-screen">
      <NavBar />
      <div className="flex-1 overflow-hidden flex">
        {/* Tickets dispo */}
        <div className="flex-1 p-6 overflow-y-auto">
          <h1 className="text-2xl font-bold text-white mb-4">Vente d'entrées</h1>
          {ticketTypes.length === 0 ? (
            <div className="text-gray-500">Aucun événement en vente actuellement.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {ticketTypes.map((tt) => (
                <div key={tt.id} className="bg-gray-800 rounded-xl p-4 border border-gray-700">
                  <div className="text-xs text-amber-400 mb-1">{tt.event.title}</div>
                  <div className="text-sm text-gray-400 mb-2">{new Date(tt.event.date).toLocaleDateString('fr-FR')}</div>
                  <div className="font-semibold text-white">{tt.name}</div>
                  <div className="text-amber-400 font-bold text-xl mt-1">{tt.price.toFixed(2)} €</div>
                  <div className="text-xs text-gray-500 mt-1">Restants: {tt.quantity - tt.sold}</div>
                  <button
                    onClick={() => addToCart(tt)}
                    disabled={tt.quantity - tt.sold <= 0}
                    className="mt-3 w-full bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-black font-semibold py-2 rounded-lg text-sm transition-colors"
                  >
                    + Ajouter
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Panier */}
        <div className="w-72 bg-gray-900 border-l border-gray-800 flex flex-col">
          <div className="p-3 border-b border-gray-800 font-semibold text-gray-300">🎟️ Panier entrées</div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {cart.length === 0 && <div className="text-gray-600 text-sm text-center py-8">Aucune entrée sélectionnée</div>}
            {cart.map((i) => (
              <div key={i.id} className="bg-gray-800 rounded-lg p-2 flex justify-between items-center">
                <div>
                  <div className="text-sm text-white">{i.name}</div>
                  <div className="text-amber-400 text-sm font-bold">{(i.price * i.quantity).toFixed(2)} €</div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => setCart(c => c.map(x => x.id === i.id ? { ...x, quantity: Math.max(0, x.quantity - 1) } : x).filter(x => x.quantity > 0))} className="w-6 h-6 rounded bg-gray-700 text-white text-sm flex items-center justify-center">−</button>
                  <span className="text-sm text-white">{i.quantity}</span>
                  <button onClick={() => setCart(c => c.map(x => x.id === i.id ? { ...x, quantity: x.quantity + 1 } : x))} className="w-6 h-6 rounded bg-gray-700 text-white text-sm flex items-center justify-center">+</button>
                </div>
              </div>
            ))}
          </div>
          <div className="p-3 border-t border-gray-800 space-y-3">
            <div className="flex justify-between text-white font-bold text-lg">
              <span>Total</span>
              <span className="text-amber-400">{total.toFixed(2)} €</span>
            </div>
            <button
              onClick={() => setShowPayment(true)}
              disabled={cart.length === 0}
              className="w-full bg-green-600 hover:bg-green-500 disabled:opacity-40 text-white font-bold py-3 rounded-xl transition-colors"
            >
              💳 Encaisser
            </button>
          </div>
        </div>
      </div>

      {showPayment && (
        <PaymentModal
          total={total}
          tableId={null}
          items={cart}
          note=""
          onClose={() => setShowPayment(false)}
          onSuccess={() => { setShowPayment(false); setCart([]) }}
        />
      )}
    </div>
  )
}
