'use client'
import { useState } from 'react'
import { useMenuCart } from '@/stores/menuCart'
import { useClientDiscount } from '@/hooks/useClientDiscount'
import type { MenuCategory } from '@/lib/data/types'

interface DrinkItem {
  id: string
  name: string
  desc?: string
  price: number
  badge?: string
  badgeColor?: string
}

interface DrinkSection {
  emoji: string
  title: string
  items: DrinkItem[]
  cols?: 2 | 4
}

// Badges d'affichage (le prix et la carte viennent d'Odoo, le badge est cosmétique)
const SIGNATURES = ['Le Smile', 'Balthazar']

function toSections(categories: MenuCategory[]): DrinkSection[] {
  return categories.map(cat => ({
    emoji: cat.icon,
    title: cat.name,
    cols: cat.name === 'Bières' ? 4 as const : 2 as const,
    items: cat.items.map(item => ({
      id: item.id,
      name: item.name,
      desc: item.desc || undefined,
      price: item.price,
      ...(SIGNATURES.includes(item.name)
        ? { badge: '★ Signature', badgeColor: 'bg-or text-noir' }
        : cat.name === 'Sans alcool'
          ? { badge: 'Sans alcool', badgeColor: 'bg-green-600 text-white' }
          : {}),
    })),
  }))
}

function DrinkCard({ item }: { item: DrinkItem }) {
  const { lines, addLine, updateQty } = useMenuCart()
  const line = lines.find(l => l.id === item.id)
  const qty = line?.qty ?? 0

  return (
    <div className={`relative bg-charbon rounded-xl p-4 border transition-all ${qty > 0 ? 'border-braise/50' : 'border-white/5 hover:border-white/15'}`}>
      {item.badge && (
        <span className={`absolute -top-2 -right-2 text-xs font-bold px-2 py-0.5 rounded-full ${item.badgeColor || 'bg-or text-noir'}`}>
          {item.badge}
        </span>
      )}
      <div className="flex justify-between items-start gap-2">
        <div className="flex-1 min-w-0">
          <p className="font-bold text-creme text-sm leading-tight">{item.name}</p>
          {item.desc && <p className="text-xs text-white/35 mt-1 leading-relaxed">{item.desc}</p>}
        </div>
        <span className="text-ambre font-bold text-base shrink-0">{item.price} €</span>
      </div>
      <div className="mt-3 flex justify-end">
        {qty === 0 ? (
          <button onClick={() => addLine({ id: item.id, name: item.name, price: item.price })}
            className="bg-braise hover:bg-ambre text-white px-3 py-1.5 rounded-full text-xs font-bold transition-colors">
            + Ajouter
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <button onClick={() => updateQty(item.id, qty - 1)}
              className="w-7 h-7 rounded-full border border-braise text-braise hover:bg-braise hover:text-white font-bold flex items-center justify-center transition-all text-sm">−</button>
            <span className="w-4 text-center font-bold text-creme text-sm">{qty}</span>
            <button onClick={() => updateQty(item.id, qty + 1)}
              className="w-7 h-7 rounded-full bg-braise hover:bg-ambre text-white font-bold flex items-center justify-center transition-colors text-sm">+</button>
          </div>
        )}
      </div>
    </div>
  )
}

function CartBar() {
  const { lines, updateQty, removeLine, total, count, clear } = useMenuCart()
  const discount = useClientDiscount()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const n = count()
  const gross = total()
  const net = discount > 0 ? gross * (1 - discount / 100) : gross
  if (n === 0) return null

  const checkout = async () => {
    if (!name.trim()) { alert('Veuillez entrer votre nom.'); return }
    setLoading(true)
    try {
      const res = await fetch('/api/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lines, customerName: name, customerEmail: email, note: 'Commande Bar' }),
      })
      const data = await res.json()
      if (data.url) { clear(); window.location.href = data.url }
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
          <span>{net.toFixed(2)} €</span>
        </button>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex">
          <div className="flex-1 bg-noir/60 backdrop-blur" onClick={() => setOpen(false)} />
          <div className="w-full max-w-md bg-charbon flex flex-col h-full overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b border-white/10">
              <h2 className="font-bold text-lg text-creme">🍹 Mon panier Bar</h2>
              <button onClick={() => setOpen(false)} className="text-white/40 hover:text-white text-2xl leading-none">×</button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-3">
              {lines.map(line => (
                <div key={line.id} className="bg-noir/50 rounded-xl p-3 border border-white/5">
                  <div className="flex justify-between items-start gap-2 mb-2">
                    <p className="font-medium text-creme text-sm flex-1">{line.name}</p>
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
              <input value={name} onChange={e => setName(e.target.value)} placeholder="Votre nom *" required
                className="w-full bg-noir/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-braise/50" />
              <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email (pour confirmation)" type="email"
                className="w-full bg-noir/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-braise/50" />
              {discount > 0 && (
                <>
                  <div className="flex justify-between items-center text-sm text-white/50">
                    <span>Sous-total</span><span>{gross.toFixed(2)} €</span>
                  </div>
                  <div className="flex justify-between items-center text-sm text-green-400">
                    <span>Remise fidélité −{discount}%</span><span>−{(gross - net).toFixed(2)} €</span>
                  </div>
                </>
              )}
              <div className="flex justify-between items-center pt-1">
                <span className="text-white/50 text-sm">Total</span>
                <span className="text-or font-bold text-xl">{net.toFixed(2)} €</span>
              </div>
              <button onClick={checkout} disabled={loading}
                className="w-full bg-braise hover:bg-ambre disabled:opacity-50 text-white py-3.5 rounded-xl font-bold transition-colors flex items-center justify-center gap-2">
                {loading ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Redirection...</> : `Payer ${net.toFixed(2)} € →`}
              </button>
              <p className="text-center text-white/20 text-xs">Apple Pay · Google Pay · Carte — Paiement sécurisé Stripe</p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default function BarInteractive({ categories }: { categories: MenuCategory[] }) {
  const [activeSection, setActiveSection] = useState<string | null>(null)
  const SECTIONS = toSections(categories)

  return (
    <div className="pb-28">
      {/* Navigation rapide */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-8 scrollbar-hide">
        {SECTIONS.map(s => (
          <button key={s.title} onClick={() => {
            setActiveSection(s.title)
            document.getElementById(`section-${s.title}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
          }}
            className={`shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-colors border ${activeSection === s.title ? 'bg-braise border-braise text-white' : 'bg-charbon border-white/10 text-white/60 hover:text-white'}`}>
            {s.emoji} {s.title}
          </button>
        ))}
      </div>

      {/* Sections */}
      <div className="space-y-12">
        {SECTIONS.map(section => (
          <section key={section.title} id={`section-${section.title}`}>
            <div className="flex items-center gap-3 mb-5">
              <span className="text-3xl">{section.emoji}</span>
              <h2 className="font-display text-2xl font-bold text-or">{section.title}</h2>
            </div>
            <div className={`grid gap-3 ${section.cols === 4 ? 'grid-cols-2 sm:grid-cols-4' : 'grid-cols-1 sm:grid-cols-2'}`}>
              {section.items.map(item => <DrinkCard key={item.id} item={item} />)}
            </div>
          </section>
        ))}
      </div>

      <CartBar />
    </div>
  )
}
