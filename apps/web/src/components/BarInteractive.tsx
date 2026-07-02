'use client'
import { useState } from 'react'
import { useMenuCart } from '@/stores/menuCart'

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
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const n = count()
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
          <span>{total().toFixed(2)} €</span>
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
              <div className="flex justify-between items-center pt-1">
                <span className="text-white/50 text-sm">Total</span>
                <span className="text-or font-bold text-xl">{total().toFixed(2)} €</span>
              </div>
              <button onClick={checkout} disabled={loading}
                className="w-full bg-braise hover:bg-ambre disabled:opacity-50 text-white py-3.5 rounded-xl font-bold transition-colors flex items-center justify-center gap-2">
                {loading ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Redirection...</> : 'Payer →'}
              </button>
              <p className="text-center text-white/20 text-xs">Apple Pay · Google Pay · Carte — Paiement sécurisé Stripe</p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

// ── Données bar ────────────────────────────────────────────────────────────────

const SECTIONS: DrinkSection[] = [
  {
    emoji: '🍹', title: 'Cocktails Créations',
    cols: 2,
    items: [
      { id: 'smile', name: 'Le Smile', desc: 'Hennessy, Crème de framboise, citron, coulis de framboise, sirop de vanille et Miel', price: 15, badge: '★ Signature', badgeColor: 'bg-or text-noir' },
      { id: 'maya', name: "Maya L'abeille", desc: "Rhum vieux, Amaretto, Sirop de vanille, Jus d'ananas, passion, cannelle et miel", price: 14 },
      { id: 'popstar', name: 'PopStar', desc: 'Vodka Ciroc rouge, Sirop de vanille, sirop et coulis de passion', price: 14 },
      { id: 'tropikal', name: "Tropi'Kal", desc: 'Rhum vieux, sirop pêche, coulis passion, mangue et grenadine', price: 14 },
      { id: 'peachy', name: 'Peachy', desc: 'Vodka, crème de pêche, Jus de passion, sirop de violette et champagne', price: 15 },
      { id: 'piveez', name: 'PiweeZ', desc: 'Gin, Jus de pomme, Coulis et Sirop de kiwi, citron vert, Schweppes', price: 14 },
      { id: 'doubleg', name: 'Double G', desc: 'Gin, Sirop de Gingembre, Triple Sec, Citron', price: 14 },
      { id: 'balthazar', name: 'Balthazar', desc: 'Henessy, Rhum vieux, Sirop de bois bandé, Gingembre, Vanille, Citron', price: 15, badge: '★ Signature', badgeColor: 'bg-or text-noir' },
      { id: 'sweety', name: 'Sweety', desc: 'Jus de goyave, Passion, Sirop de vanille et Coulis de framboise', price: 10, badge: 'Sans alcool', badgeColor: 'bg-green-600 text-white' },
      { id: 'kiweez', name: 'Kiweez', desc: "Jus de pomme, jus d'ananas, sirop, coulis de kiwi et citron", price: 10, badge: 'Sans alcool', badgeColor: 'bg-green-600 text-white' },
      { id: 'exotik', name: "Exotik'", desc: "Jus d'ananas, coulis passion, citron et Sirop d'orgeat", price: 10, badge: 'Sans alcool', badgeColor: 'bg-green-600 text-white' },
    ],
  },
  {
    emoji: '🍸', title: 'Cocktails Classiques',
    cols: 2,
    items: [
      { id: 'mojito', name: 'Mojito / Mojitoska / Mojitosky', desc: 'Rhum Blanc, Citron, Menthe fraîche, Sucre et Soda', price: 12 },
      { id: 'royalmojito', name: 'Royal Mojito', desc: 'Rhum Blanc, Citron, Menthe fraîche, Sucre et Champagne', price: 15 },
      { id: 'caipi', name: 'Caipirinia / Caipiroska', desc: 'Cachaca, Citron, Sucre', price: 12 },
      { id: 'daiquiri', name: 'Daiquiri', desc: 'Rhum Blanc, Citron, Sucre', price: 12 },
      { id: 'margarita', name: 'Margarita', desc: 'Tequila, Triple Sec, citron, sucre', price: 12 },
      { id: 'tequilasunrise', name: 'Tequila Sunrise', desc: "Téquila, Jus D'orange, grenadine", price: 12 },
      { id: 'maitai', name: 'Maï-Taï', desc: 'Rhum Blanc, Rhum vieux, Triple sec, orgeat, ananas', price: 12 },
      { id: 'aperolspritz', name: 'Aperol Spritz', desc: "Aperol, Champagne, tranche d'Orange", price: 15 },
      { id: 'espressomartini', name: 'Expresso Martini', desc: 'Vodka, Expresso, liqueur de café, vanille et sucre', price: 12 },
      { id: 'moscowmule', name: 'Moscow Mule', desc: 'Vodka, Citron, sucre, Ginger Beer', price: 12 },
      { id: 'amarettosour', name: 'Amaretto Sour', desc: "Liqueur d'Amaretto, citron, sucre", price: 12 },
      { id: 'longisland', name: 'Long Island', desc: 'Rhum blanc, Vodka, Tequila, Gin, Triple sec, citron, sucre et coca', price: 12 },
    ],
  },
  {
    emoji: '🥃', title: 'Apéritifs',
    cols: 2,
    items: [
      { id: 'tipunchblanc', name: 'Ti Punch Blanc', desc: 'Rhum blanc agricole', price: 5 },
      { id: 'tipunchvieux', name: 'Ti Punch Vieux', desc: 'Rhum vieux', price: 7 },
      { id: 'martini', name: 'Martini Blanc / Rouge', desc: 'Verre 10cl', price: 9 },
      { id: 'ricard', name: 'Ricard / Pastis', price: 9 },
      { id: 'get27', name: 'Get 27 / 31', desc: 'Liqueur de menthe', price: 9 },
      { id: 'amaretto', name: 'Amaretto', desc: 'Disaronno', price: 9 },
      { id: 'campari', name: 'Campari', price: 9 },
      { id: 'baileys', name: "Bailey's", desc: "Liqueur d'Irish Cream", price: 9 },
    ],
  },
  {
    emoji: '🥤', title: 'Softs',
    cols: 2,
    items: [
      { id: 'jus', name: 'Jus de fruits', desc: 'Orange / Passion / Ananas · Pomme / Mangue / Goyave', price: 5 },
      { id: 'coca', name: 'Coca / Coca Zéro', desc: '33cl', price: 5 },
      { id: 'sprite', name: 'Sprite', desc: '33cl', price: 5 },
      { id: 'schweppes', name: 'Schweppes', desc: '33cl', price: 5 },
      { id: 'fuzzetea', name: 'Fuze Tea', desc: '33cl', price: 5 },
      { id: 'redbull', name: 'Red Bull', desc: '25cl', price: 5 },
      { id: 'longhorn', name: 'Long Horn', desc: '33cl', price: 5 },
      { id: 'eaux', name: 'Eaux', desc: 'Perrier 50cl / Plate 50cl / 1,5l', price: 3 },
    ],
  },
  {
    emoji: '🍺', title: 'Bières',
    cols: 4,
    items: [
      { id: 'heineken', name: 'Heineken', desc: '33cl', price: 6 },
      { id: 'corona', name: 'Corona', desc: '33cl', price: 6 },
      { id: 'gwada', name: 'Gwada', desc: '33cl — Bière locale', price: 6 },
      { id: 'desperados', name: 'Desperados', desc: 'Original / Lime / Mojito', price: 6 },
    ],
  },
  {
    emoji: '🥂', title: 'Champagnes',
    cols: 2,
    items: [
      { id: 'nicolasfeuillate', name: 'Nicolas Feuillate', price: 90 },
      { id: 'moet', name: 'Moët Impérial Brut', price: 100 },
      { id: 'moetnectar', name: 'Moët Nectar Impérial', price: 120 },
      { id: 'moetrose', name: 'Moët Nectar Impérial Rosé', price: 120 },
      { id: 'ruinart', name: 'Ruinart Blanc de Blanc', price: 190 },
      { id: 'domperignon', name: 'Dom Perignon', price: 450 },
    ],
  },
  {
    emoji: '🍾', title: 'Vodkas',
    cols: 2,
    items: [
      { id: 'smirnoff', name: 'Smirnoff', price: 80 },
      { id: 'absolut', name: 'Absolut', price: 90 },
      { id: 'belvedere', name: 'Belvedere', price: 110 },
      { id: 'ciroc', name: 'Ciroc', price: 120 },
    ],
  },
  {
    emoji: '🥃', title: 'Whiskys',
    cols: 2,
    items: [
      { id: 'jackdaniels', name: "Jack Daniel's", price: 110 },
      { id: 'jackhoney', name: "Jack Daniel's Honey", price: 110 },
      { id: 'williamlawson', name: 'William Lawson', price: 80 },
    ],
  },
  {
    emoji: '🥃', title: 'Cognacs',
    cols: 2,
    items: [
      { id: 'gauthier', name: 'Gauthier', price: 110 },
      { id: 'hennessy', name: 'Henessy', price: 130 },
    ],
  },
]

export default function BarInteractive() {
  const [activeSection, setActiveSection] = useState<string | null>(null)

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
