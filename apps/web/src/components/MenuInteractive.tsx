'use client'
import { useState } from 'react'
import { useMenuCart } from '@/stores/menuCart'
import type { MenuCategory } from '@/lib/data'
import { IconX } from '@/components/icons'

// ── Menu Section ──────────────────────────────────────────────────────────────

function MenuSection({ section }: { section: MenuCategory }) {
  const { lines, addLine, updateQty } = useMenuCart()

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {section.items.map(item => {
        const line = lines.find(l => l.id === item.id)
        const qty = line?.qty ?? 0
        return (
          <div key={item.id} className={`glass-card card-glow rounded-2xl p-3 flex flex-col ${qty > 0 ? '!border-braise/40' : ''}`}>
            {/* Tuile image crème : mix-blend-multiply fond les fonds blancs des photos produits */}
            <div className="relative h-40 rounded-xl overflow-hidden bg-gradient-to-b from-[#F7F3EB] to-[#E9E3D5] flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.img}
                alt={item.name}
                loading="lazy"
                className="h-full w-full object-contain p-3 mix-blend-multiply"
              />
              {qty > 0 && (
                <span className="absolute top-2 right-2 bg-braise text-white text-xs font-bold rounded-full min-w-[22px] h-[22px] px-1.5 flex items-center justify-center shadow-lg">
                  {qty}
                </span>
              )}
            </div>
            <div className="flex flex-col flex-1 px-2 pt-3 pb-1">
              <h3 className="font-semibold text-creme leading-snug">{item.name}</h3>
              {item.desc && <p className="text-white/35 text-sm mt-0.5">{item.desc}</p>}
              <div className="flex items-center justify-between mt-auto pt-3">
                <span className="text-or font-bold text-lg">{item.price.toFixed(2)} €</span>
                {qty === 0 ? (
                  <button
                    onClick={() => addLine({ id: item.id, name: item.name, price: item.price })}
                    aria-label={`Ajouter ${item.name} au panier`}
                    className="bg-braise hover:bg-ambre text-white px-4 py-2 rounded-full text-sm font-bold transition-colors duration-200 cursor-pointer"
                  >
                    + Ajouter
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQty(item.id, qty - 1)}
                      aria-label={`Retirer un ${item.name}`}
                      className="w-9 h-9 rounded-full border border-braise/60 text-braise hover:bg-braise hover:text-white font-bold flex items-center justify-center transition-colors duration-200 cursor-pointer"
                    >−</button>
                    <span className="w-5 text-center font-bold text-creme">{qty}</span>
                    <button
                      onClick={() => updateQty(item.id, qty + 1)}
                      aria-label={`Ajouter un ${item.name}`}
                      className="w-9 h-9 rounded-full bg-braise hover:bg-ambre text-white font-bold flex items-center justify-center transition-colors duration-200 cursor-pointer"
                    >+</button>
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
      <div className="fixed bottom-0 left-0 right-0 z-50 p-4 pointer-events-none">
        <button onClick={() => setOpen(true)}
          className="pointer-events-auto w-full max-w-2xl mx-auto flex items-center justify-between bg-braise hover:bg-ambre text-white px-6 py-4 rounded-full font-bold shadow-2xl shadow-braise/30 transition-colors duration-200 cursor-pointer">
          <span className="bg-white/20 rounded-full px-3 py-0.5 text-sm">{n} article{n > 1 ? 's' : ''}</span>
          <span>Voir mon panier</span>
          <span>{total().toFixed(2)} €</span>
        </button>
      </div>
      {open && (
        <div className="fixed inset-0 z-50 flex">
          <div className="flex-1 bg-noir/70 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="w-full max-w-md glass border-l border-white/10 flex flex-col h-full overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b border-white/10">
              <h2 className="font-bold text-lg text-creme">Mon panier</h2>
              <button onClick={() => setOpen(false)} aria-label="Fermer le panier"
                className="w-9 h-9 rounded-full text-white/40 hover:text-white hover:bg-white/5 flex items-center justify-center transition-colors cursor-pointer">
                <IconX className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-5 space-y-3">
              {lines.map(line => (
                <div key={line.id} className="bg-noir/50 rounded-xl p-3 border border-white/5">
                  <div className="flex justify-between items-start gap-2 mb-2">
                    <div className="flex-1">
                      <p className="font-medium text-creme text-sm">{line.name}</p>
                      {line.details && <p className="text-xs text-white/30 mt-0.5 leading-relaxed">{line.details}</p>}
                    </div>
                    <button onClick={() => removeLine(line.id)} aria-label={`Retirer ${line.name}`}
                      className="text-white/20 hover:text-red-400 shrink-0 cursor-pointer transition-colors">
                      <IconX className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button onClick={() => updateQty(line.id, line.qty - 1)} aria-label="Diminuer la quantité"
                        className="w-7 h-7 rounded-full border border-white/20 text-white/50 hover:border-braise hover:text-braise flex items-center justify-center text-sm font-bold transition-colors duration-200 cursor-pointer">−</button>
                      <span className="text-sm font-bold text-creme w-4 text-center">{line.qty}</span>
                      <button onClick={() => updateQty(line.id, line.qty + 1)} aria-label="Augmenter la quantité"
                        className="w-7 h-7 rounded-full bg-braise hover:bg-ambre text-white flex items-center justify-center text-sm font-bold transition-colors duration-200 cursor-pointer">+</button>
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
                className={`w-full py-4 rounded-xl font-bold text-white transition-colors duration-200 ${loading || !name ? 'bg-white/10 text-white/30 cursor-not-allowed' : 'bg-braise hover:bg-ambre cursor-pointer'}`}>
                {loading ? 'Redirection...' : `Payer ${total().toFixed(2)} €`}
              </button>
              <button onClick={clear} className="w-full text-xs text-white/20 hover:text-white/40 transition-colors py-1 cursor-pointer">Vider le panier</button>
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

  // Filtre les articles inactifs
  const visibleCategories = categories.map(cat => ({
    ...cat,
    items: cat.items.filter(i => i.active !== false),
  })).filter(cat => cat.items.length > 0)

  const activeVisible = visibleCategories.find(s => s.id === activeTab)

  return (
    <div className="pb-28">
      {/* Tabs — sticky sous le header flottant */}
      <div className="sticky top-[68px] md:top-[76px] z-30 -mx-4 px-4 py-3 mb-8 bg-noir/85 backdrop-blur-lg">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {visibleCategories.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-2.5 rounded-full font-semibold text-sm whitespace-nowrap transition-colors duration-200 shrink-0 cursor-pointer capitalize ${
                activeTab === tab.id
                  ? 'bg-braise text-white shadow-lg shadow-braise/25'
                  : 'glass-card text-white/60 hover:text-white hover:border-white/25'
              }`}>
              {tab.name.toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {activeVisible && <MenuSection section={activeVisible} />}

      <CartBar />
    </div>
  )
}
