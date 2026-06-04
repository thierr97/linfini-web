'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useCart } from '@/stores/cart'
import SaladeBuilder from '@/components/SaladeBuilder'
import TapasList from '@/components/TapasList'
import BraiseSelector from '@/components/BraiseSelector'
import BarMenu from '@/components/BarMenu'
import Cart from '@/components/Cart'

type Category = 'salade' | 'tapas' | 'braise' | 'bar'

const CATEGORIES: { id: Category; label: string; emoji: string }[] = [
  { id: 'tapas', label: 'Tapas', emoji: '🍢' },
  { id: 'salade', label: 'Salade', emoji: '🥗' },
  { id: 'braise', label: 'Braise', emoji: '🥩' },
  { id: 'bar', label: 'Boissons', emoji: '🍹' },
]

export default function TablePage() {
  const params = useParams()
  const router = useRouter()
  const tableId = params.tableId as string
  const { setTable, tableLabel, activeCategory, setActiveCategory, items, addToCart, getBuilderTotal } = useCart()
  const [submitting, setSubmitting] = useState(false)
  const [activeView, setActiveView] = useState<'menu' | 'cart'>('menu')

  useEffect(() => {
    fetch(`/api/tables/${tableId}`)
      .then(r => r.json())
      .then(d => { if (d.table) setTable(tableId, d.table.label) })
      .catch(() => setTable(tableId, `Table ${tableId}`))
  }, [tableId, setTable])

  const handleSendOrder = async () => {
    if (items.length === 0) return
    setSubmitting(true)
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tableId,
          items: items.map(i => ({
            itemId: null,
            name: i.name,
            unitPrice: i.unitPrice,
            quantity: i.quantity,
            modifiers: i.modifiers,
            note: i.note,
          })),
          total: items.reduce((a, i) => a + i.unitPrice, 0),
          note: '',
        }),
      })
      const data = await res.json()
      if (data.success) {
        router.push(`/table/${tableId}/confirmation?order=${data.order.number}`)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setSubmitting(false)
    }
  }

  const isBuilderCategory = activeCategory === 'salade'

  return (
    <div className="min-h-screen bg-noir text-creme pb-28">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-charbon/95 backdrop-blur border-b border-white/10 px-4 py-3">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-or">L&apos;Infini</h1>
            <p className="text-xs text-white/50">{tableLabel || 'Chargement...'}</p>
          </div>
          <button
            onClick={() => setActiveView(activeView === 'menu' ? 'cart' : 'menu')}
            className="relative bg-braise text-white px-4 py-2 rounded-full text-sm font-medium"
          >
            {activeView === 'menu' ? '🛒 Panier' : '← Menu'}
            {items.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-or text-noir text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                {items.length}
              </span>
            )}
          </button>
        </div>
      </header>

      {activeView === 'menu' ? (
        <div className="max-w-lg mx-auto px-4 py-4">
          {/* Category tabs — scrollable horizontally */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-1 scrollbar-hide">
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex-none flex items-center gap-1.5 px-4 py-2.5 rounded-full font-medium text-sm transition-all whitespace-nowrap ${
                  activeCategory === cat.id
                    ? 'bg-braise text-white shadow-lg shadow-braise/20'
                    : 'bg-charbon text-white/50 hover:text-white/80 border border-white/10'
                }`}
              >
                <span>{cat.emoji}</span>
                <span>{cat.label}</span>
              </button>
            ))}
          </div>

          {/* Active builder/list */}
          {activeCategory === 'salade' && <SaladeBuilder />}
          {activeCategory === 'tapas' && <TapasList />}
          {activeCategory === 'braise' && <BraiseSelector />}
          {activeCategory === 'bar' && <BarMenu />}

          {/* Add to cart CTA — only for pizza/salade */}
          {isBuilderCategory && (
            <div className="mt-6">
              <button
                onClick={addToCart}
                className="w-full bg-braise hover:bg-ambre text-white py-4 rounded-xl font-bold text-lg transition-colors flex items-center justify-center gap-3"
              >
                <span>Ajouter au panier</span>
                <span className="bg-white/20 px-3 py-1 rounded-full text-base">
                  {getBuilderTotal().toFixed(2).replace('.', ',')} €
                </span>
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="max-w-lg mx-auto px-4 py-6">
          <Cart onSend={handleSendOrder} submitting={submitting} />
        </div>
      )}

      {/* Floating cart bar when items exist and on menu view */}
      {activeView === 'menu' && items.length > 0 && (
        <div className="fixed bottom-4 left-0 right-0 px-4 z-40">
          <button
            onClick={() => setActiveView('cart')}
            className="w-full max-w-lg mx-auto flex items-center justify-between bg-braise text-white px-5 py-3 rounded-2xl shadow-xl shadow-braise/30"
          >
            <span className="bg-white/20 text-white text-sm font-bold w-7 h-7 rounded-full flex items-center justify-center">
              {items.length}
            </span>
            <span className="font-bold">Voir mon panier</span>
            <span className="font-bold">
              {items.reduce((a, i) => a + i.unitPrice, 0).toFixed(2)} €
            </span>
          </button>
        </div>
      )}
    </div>
  )
}
