'use client'
import { useState } from 'react'
import { useMenuCart } from '@/stores/menuCart'
import type { MenuCategory } from '@/lib/data'

// ── Menu Section ──────────────────────────────────────────────────────────────

function MenuSection({ section }: { section: MenuCategory }) {
  const { lines, addLine, updateQty } = useMenuCart()

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {section.items.map(item => {
        const line = lines.find(l => l.id === item.id)
        const qty = line?.qty ?? 0
        return (
          <div key={item.id} className={`bg-charbon rounded-2xl overflow-hidden border transition-all ${qty > 0 ? 'border-braise/40' : 'border-white/5 hover:border-white/10'}`}>
            <div className="relative h-40 bg-noir flex items-center justify-center">
              <img src={item.img} alt={item.name} className="w-full h-full object-contain p-2" />
              <div className="absolute inset-0 bg-gradient-to-t from-noir/80 to-transparent" />
            </div>
            <div className="p-4">
              <h3 className="font-bold text-creme">{item.name}</h3>
              {item.desc && <p className="text-white/40 text-sm mt-0.5 mb-3">{item.desc}</p>}
              <div className={`flex items-center justify-between ${item.desc ? '' : 'mt-3'}`}>
                <span className="text-ambre font-bold text-lg">{item.price.toFixed(2)} €</span>
                {qty === 0 ? (
                  <button onClick={() => addLine({ id: item.id, name: item.name, price: item.price })}
                    className="bg-braise hover:bg-ambre text-white px-4 py-2 rounded-full text-sm font-bold transition-colors">
                    + Ajouter
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <button onClick={() => updateQty(item.id, qty - 1)}
                      className="w-8 h-8 rounded-full border border-braise text-braise hover:bg-braise hover:text-white font-bold flex items-center justify-center transition-all">−</button>
                    <span className="w-5 text-center font-bold text-creme">{qty}</span>
                    <button onClick={() => updateQty(item.id, qty + 1)}
                      className="w-8 h-8 rounded-full bg-braise hover:bg-ambre text-white font-bold flex items-center justify-center transition-colors">+</button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ── Cart ──────────────────────────────────────────────────────────────────────

function CartBar() {
  const { lines, updateQty, removeLine, total, count, clear } = useMenuCart()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const n = count()
  if (n === 0) return null

  const checkout = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lines, customerEmail: email, customerName: name }),
      })
      const data = await res.json()
      if (data.url) window.location.href = data.url
      else alert(data.error || 'Erreur lors du paiement.')
    } finally { setLoading(false) }
  }

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 z-50 p-4">
        <button onClick={() => setOpen(true)}
          className="w-full max-w-2xl mx-auto flex items-center justify-between bg-braise hover:bg-ambre text-white px-6 py-4 rounded-2xl font-bold shadow-2xl transition-colors">
          <span className="bg-white/20 rounded-full px-3 py-0.5 text-sm">{n} article{n > 1 ? 's' : ''}</span>
          <span>Voir mon panier</span>
          <span>{total().toFixed(2)} €</span>
        </button>
      </div>
      {open && (
        <div className="fixed inset-0 z-50 flex">
          <div className="flex-1 bg-noir/60 backdrop-blur" onClick={() => setOpen(false)} />
          <div className="w-full max-w-md bg-charbon flex flex-col h-full overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b border-white/10">
              <h2 className="font-bold text-lg text-creme">Mon panier</h2>
              <button onClick={() => setOpen(false)} className="text-white/40 hover:text-white text-2xl leading-none">×</button>
            </div>
            <div className="flex-1 overflow-y-auto p-5 space-y-3">
              {lines.map(line => (
                <div key={line.id} className="bg-noir/50 rounded-xl p-3 border border-white/5">
                  <div className="flex justify-between items-start gap-2 mb-2">
                    <div className="flex-1">
                      <p className="font-medium text-creme text-sm">{line.name}</p>
                      {line.details && <p className="text-xs text-white/30 mt-0.5 leading-relaxed">{line.details}</p>}
                    </div>
                    <button onClick={() => removeLine(line.id)} className="text-white/20 hover:text-red-400 text-sm shrink-0">✕</button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button onClick={() => updateQty(line.id, line.qty - 1)} className="w-7 h-7 rounded-full border border-white/20 text-white/50 hover:border-braise hover:text-braise flex items-center justify-center text-sm font-bold transition-all">−</button>
                      <span className="text-sm font-bold text-creme w-4 text-center">{line.qty}</span>
                      <button onClick={() => updateQty(line.id, line.qty + 1)} className="w-7 h-7 rounded-full bg-braise hover:bg-ambre text-white flex items-center justify-center text-sm font-bold transition-colors">+</button>
                    </div>
                    <span className="text-ambre font-bold text-sm">{(line.price * line.qty).toFixed(2)} €</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-5 border-t border-white/10 space-y-3">
              <input value={name} onChange={e => setName(e.target.value)} placeholder="Votre nom *"
                className="w-full bg-noir/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-braise/50" />
              <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email (pour confirmation)" type="email"
                className="w-full bg-noir/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-braise/50" />
              <div className="flex justify-between items-center pt-1">
                <span className="text-sm text-white/50">Total</span>
                <span className="text-or font-bold text-2xl">{total().toFixed(2)} €</span>
              </div>
              <button onClick={checkout} disabled={loading || !name}
                className={`w-full py-4 rounded-xl font-bold text-white transition-all ${loading || !name ? 'bg-white/10 text-white/30 cursor-not-allowed' : 'bg-braise hover:bg-ambre'}`}>
                {loading ? 'Redirection...' : `Payer ${total().toFixed(2)} €`}
              </button>
              <button onClick={clear} className="w-full text-xs text-white/20 hover:text-white/40 transition-colors py-1">Vider le panier</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────

export default function MenuInteractive({ categories }: { categories: MenuCategory[] }) {
  const [activeTab, setActiveTab] = useState(categories[0]?.id ?? 'tapas')
  const activeSection = categories.find(s => s.id === activeTab)

  // Filtre les articles inactifs
  const visibleCategories = categories.map(cat => ({
    ...cat,
    items: cat.items.filter(i => i.active !== false),
  })).filter(cat => cat.items.length > 0)

  const activeVisible = visibleCategories.find(s => s.id === activeTab)

  return (
    <div className="pb-28">
      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-8 scrollbar-hide">
        {visibleCategories.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-full font-semibold text-sm whitespace-nowrap transition-all shrink-0 ${activeTab === tab.id ? 'bg-braise text-white' : 'bg-charbon border border-white/10 text-white/60 hover:border-white/30'}`}>
            <span>{tab.icon}</span>
            <span>{tab.name}</span>
          </button>
        ))}
      </div>

      {activeVisible && <MenuSection section={activeVisible} />}

      <CartBar />
    </div>
  )
}
