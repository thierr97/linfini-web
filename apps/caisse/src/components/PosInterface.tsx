'use client'
import { useEffect, useState, useCallback } from 'react'
import { useCartStore } from '@/stores/cart'
import { PaymentModal } from './PaymentModal'

interface Props {
  tableId?: string
  tableName?: string
}

interface Category {
  id: string
  name: string
  icon: string
  items: Item[]
}

interface Item {
  id: string
  name: string
  basePrice: number
  modifiers: Modifier[]
}

interface Modifier {
  id: string
  name: string
  price: number
}

export function PosInterface({ tableId, tableName }: Props) {
  const [categories, setCategories] = useState<Category[]>([])
  const [activeCategory, setActiveCategory] = useState<string>('')
  const [showPayment, setShowPayment] = useState(false)
  const { items, addItem, removeItem, updateQty, setTable, total, clear, note, setNote } = useCartStore()

  useEffect(() => {
    setTable(tableId || null, tableName || null)
    fetch('/api/menu').then((r) => r.json()).then((data) => {
      setCategories(data)
      if (data[0]) setActiveCategory(data[0].id)
    })
  }, [tableId, tableName, setTable])

  const currentItems = categories.find((c) => c.id === activeCategory)?.items || []
  const orderTotal = total()

  const handleSendOrder = useCallback(async () => {
    if (items.length === 0) return
    await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tableId: tableId || null,
        items: items.map((i) => ({ itemId: i.itemId, name: i.name, price: i.price, quantity: i.quantity, modifiers: i.modifiers, note: i.note })),
        total: orderTotal,
        note,
        posId: typeof window !== 'undefined' ? window.location.hostname : null,
      }),
    })
    alert(`Commande envoyée en cuisine ! Total: ${orderTotal.toFixed(2)} €`)
    clear()
  }, [items, tableId, orderTotal, note, clear])

  return (
    <div className="flex h-full overflow-hidden">
      {/* Catalogue */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Catégories */}
        <div className="flex gap-2 p-3 bg-gray-900 overflow-x-auto shrink-0 border-b border-gray-800">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg whitespace-nowrap text-sm font-medium transition-colors ${
                activeCategory === cat.id ? 'bg-amber-500 text-black' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              <span>{cat.icon}</span>
              {cat.name}
            </button>
          ))}
        </div>

        {/* Articles */}
        <div className="flex-1 overflow-y-auto p-3 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 content-start">
          {currentItems.map((item) => (
            <button
              key={item.id}
              onClick={() => addItem({ itemId: item.id, name: item.name, price: item.basePrice, quantity: 1, modifiers: [] })}
              className="bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-amber-500 rounded-xl p-3 text-left transition-all active:scale-95"
            >
              <div className="font-medium text-white text-sm leading-tight">{item.name}</div>
              <div className="text-amber-400 font-bold mt-2">{item.basePrice.toFixed(2)} €</div>
            </button>
          ))}
        </div>
      </div>

      {/* Panier */}
      <div className="w-72 bg-gray-900 border-l border-gray-800 flex flex-col">
        <div className="p-3 border-b border-gray-800 font-semibold text-gray-300">
          {tableName ? `🍽️ ${tableName}` : '🥡 À emporter'}
          {items.length > 0 && <span className="ml-2 text-xs text-gray-500">({items.length} lignes)</span>}
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-2">
          {items.length === 0 && (
            <div className="text-gray-600 text-sm text-center py-8">Panier vide</div>
          )}
          {items.map((item) => (
            <div key={item.id} className="bg-gray-800 rounded-lg p-2">
              <div className="flex justify-between items-start gap-2">
                <span className="text-sm text-white leading-tight">{item.name}</span>
                <button onClick={() => removeItem(item.id)} className="text-gray-600 hover:text-red-400 text-xs shrink-0">✕</button>
              </div>
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center gap-2">
                  <button onClick={() => updateQty(item.id, item.quantity - 1)} className="w-6 h-6 rounded bg-gray-700 text-white text-sm flex items-center justify-center">−</button>
                  <span className="text-sm text-white w-4 text-center">{item.quantity}</span>
                  <button onClick={() => updateQty(item.id, item.quantity + 1)} className="w-6 h-6 rounded bg-gray-700 text-white text-sm flex items-center justify-center">+</button>
                </div>
                <span className="text-amber-400 text-sm font-bold">{(item.price * item.quantity).toFixed(2)} €</span>
              </div>
            </div>
          ))}
        </div>

        <div className="p-3 border-t border-gray-800 space-y-3">
          <textarea
            placeholder="Note pour la cuisine..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={2}
            className="w-full bg-gray-800 rounded-lg p-2 text-sm text-white placeholder-gray-600 resize-none border border-gray-700 focus:border-amber-500 outline-none"
          />

          <div className="flex justify-between items-center text-white font-bold text-lg">
            <span>Total</span>
            <span className="text-amber-400">{orderTotal.toFixed(2)} €</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleSendOrder}
              disabled={items.length === 0}
              className="bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl text-sm transition-colors"
            >
              📤 Envoyer
            </button>
            <button
              onClick={() => setShowPayment(true)}
              disabled={items.length === 0}
              className="bg-green-600 hover:bg-green-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl text-sm transition-colors"
            >
              💳 Payer
            </button>
          </div>

          {items.length > 0 && (
            <button onClick={clear} className="w-full text-xs text-gray-600 hover:text-red-400 transition-colors">
              Vider le panier
            </button>
          )}
        </div>
      </div>

      {showPayment && (
        <PaymentModal
          total={orderTotal}
          tableId={tableId || null}
          items={items}
          note={note}
          onClose={() => setShowPayment(false)}
          onSuccess={() => { setShowPayment(false); clear() }}
        />
      )}
    </div>
  )
}
