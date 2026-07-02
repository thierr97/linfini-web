'use client'
import { useState, useEffect, useCallback } from 'react'

interface TicketType { id: string; name: string; price: number; quantity: number; sold: number; active: boolean }
interface Event {
  id: string; title: string; slug: string; date: string; venue: string
  published: boolean; featured: boolean; soldOut: boolean; imageUrl?: string
  shortDesc?: string; dressCode?: string; ageRestriction?: number; categories: string[]
  ticketTypes: TicketType[]
}
type Tab = 'evenements' | 'billets'

const EMPTY_EVENT = { title: '', date: '', doorsOpen: '', venue: "L'Infini Club", imageUrl: '', shortDesc: '', description: '', dressCode: '', ageRestriction: '', categories: '', published: false }
const EMPTY_TT = { name: '', description: '', price: '', quantity: '', maxPerOrder: '10' }

export default function AdminEvenementsPage() {
  const [key, setKey] = useState('')
  const [keyInput, setKeyInput] = useState('')
  const [authed, setAuthed] = useState(false)
  const [tab, setTab] = useState<Tab>('evenements')
  const [events, setEvents] = useState<Event[]>([])
  const [tickets, setTickets] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [showNewEvent, setShowNewEvent] = useState(false)
  const [newEvent, setNewEvent] = useState(EMPTY_EVENT)
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [newTT, setNewTT] = useState(EMPTY_TT)
  const [msg, setMsg] = useState('')

  const h = useCallback((k: string) => ({ 'x-admin-key': k }), [])

  const fetchEvents = useCallback(async (k: string) => {
    const res = await fetch('/api/admin/evenements', { headers: h(k) })
    if (res.ok) setEvents(await res.json())
  }, [h])

  const fetchTickets = useCallback(async (k: string, eventId?: string) => {
    const url = eventId ? `/api/admin/tickets?eventId=${eventId}` : '/api/admin/tickets'
    const res = await fetch(url, { headers: h(k) })
    if (res.ok) setTickets(await res.json())
  }, [h])

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const res = await fetch('/api/admin/evenements', { headers: h(keyInput) })
    setLoading(false)
    if (!res.ok) { alert('Clé incorrecte'); return }
    setKey(keyInput); setAuthed(true); setEvents(await res.json())
  }

  async function createEvent(e: React.FormEvent) {
    e.preventDefault()
    const res = await fetch('/api/admin/evenements', {
      method: 'POST', headers: { 'content-type': 'application/json', ...h(key) },
      body: JSON.stringify({ ...newEvent, categories: newEvent.categories.split(',').map(c => c.trim()).filter(Boolean) }),
    })
    if (res.ok) { setNewEvent(EMPTY_EVENT); setShowNewEvent(false); setMsg('Événement créé ✓'); fetchEvents(key); setTimeout(() => setMsg(''), 3000) }
  }

  async function togglePublish(ev: Event) {
    await fetch(`/api/admin/evenements/${ev.id}`, {
      method: 'PATCH', headers: { 'content-type': 'application/json', ...h(key) },
      body: JSON.stringify({ published: !ev.published }),
    })
    fetchEvents(key)
  }

  async function toggleSoldOut(ev: Event) {
    await fetch(`/api/admin/evenements/${ev.id}`, {
      method: 'PATCH', headers: { 'content-type': 'application/json', ...h(key) },
      body: JSON.stringify({ soldOut: !ev.soldOut }),
    })
    fetchEvents(key)
  }

  async function deleteEvent(ev: Event) {
    if (!confirm(`Supprimer "${ev.title}" ?`)) return
    await fetch(`/api/admin/evenements/${ev.id}`, { method: 'DELETE', headers: h(key) })
    fetchEvents(key); setSelectedEvent(null)
  }

  async function addTicketType(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedEvent) return
    const res = await fetch(`/api/admin/evenements/${selectedEvent.id}`, {
      method: 'POST', headers: { 'content-type': 'application/json', ...h(key) },
      body: JSON.stringify(newTT),
    })
    if (res.ok) { setNewTT(EMPTY_TT); setMsg('Type de billet ajouté ✓'); fetchEvents(key); setTimeout(() => setMsg(''), 3000) }
  }

  if (!authed) return (
    <main className="min-h-screen bg-gray-950 flex items-center justify-center">
      <form onSubmit={handleLogin} className="bg-gray-900 border border-gray-800 rounded-2xl p-8 w-full max-w-sm space-y-4">
        <h1 className="text-white font-bold text-2xl text-center mb-2">Billetterie Admin</h1>
        <p className="text-gray-500 text-sm text-center mb-4">L&apos;Infini Guadeloupe</p>
        <input type="password" required placeholder="Clé admin" value={keyInput} onChange={e => setKeyInput(e.target.value)}
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-yellow-500" />
        <button type="submit" disabled={loading} className="w-full bg-yellow-600 hover:bg-yellow-500 disabled:opacity-50 text-white py-3 rounded-xl font-bold">
          {loading ? 'Vérification...' : 'Accéder'}
        </button>
      </form>
    </main>
  )

  return (
    <main className="min-h-screen bg-gray-950 p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-white font-bold text-2xl">Billetterie <span className="text-yellow-500">L&apos;Infini</span></h1>
          <div className="flex gap-2">
            <a href="/admin/clients" className="text-xs text-gray-400 border border-gray-700 px-3 py-1.5 rounded-lg hover:text-white">Clients</a>
            <button onClick={() => { fetchEvents(key); fetchTickets(key) }} className="text-xs text-gray-400 border border-gray-700 px-3 py-1.5 rounded-lg hover:text-white">↻</button>
          </div>
        </div>

        {msg && <div className="mb-4 bg-green-900/30 border border-green-500/30 text-green-400 px-4 py-2 rounded-lg text-sm">{msg}</div>}

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {(['evenements', 'billets'] as Tab[]).map(t => (
            <button key={t} onClick={() => { setTab(t); if (t === 'billets') fetchTickets(key) }}
              className={`px-4 py-2 rounded-lg text-sm font-semibold capitalize transition-colors ${tab === t ? 'bg-yellow-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'}`}>
              {t === 'evenements' ? `Événements (${events.length})` : `Billets vendus (${tickets.length})`}
            </button>
          ))}
        </div>

        {/* TAB ÉVÉNEMENTS */}
        {tab === 'evenements' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Liste */}
            <div className="space-y-3">
              <button onClick={() => setShowNewEvent(!showNewEvent)}
                className="w-full bg-yellow-600 hover:bg-yellow-500 text-white py-2.5 rounded-xl font-bold text-sm">
                {showNewEvent ? '✕ Annuler' : '+ Nouvel événement'}
              </button>

              {showNewEvent && (
                <form onSubmit={createEvent} className="bg-gray-900 border border-gray-700 rounded-2xl p-5 space-y-3">
                  <p className="text-white font-semibold text-sm mb-1">Créer un événement</p>
                  {[
                    { label: 'Titre *', key: 'title', type: 'text', req: true },
                    { label: 'Date & heure *', key: 'date', type: 'datetime-local', req: true },
                    { label: 'Ouverture des portes', key: 'doorsOpen', type: 'datetime-local', req: false },
                    { label: 'Lieu', key: 'venue', type: 'text', req: false },
                    { label: 'URL image (flyer)', key: 'imageUrl', type: 'url', req: false },
                    { label: 'Sous-titre court', key: 'shortDesc', type: 'text', req: false },
                    { label: 'Dress code', key: 'dressCode', type: 'text', req: false },
                    { label: 'Âge minimum', key: 'ageRestriction', type: 'number', req: false },
                    { label: 'Catégories (séparées par virgule)', key: 'categories', type: 'text', req: false },
                  ].map(f => (
                    <div key={f.key}>
                      <label className="text-xs text-gray-500 block mb-1">{f.label}</label>
                      <input type={f.type} required={f.req} value={(newEvent as any)[f.key]}
                        onChange={e => setNewEvent(p => ({ ...p, [f.key]: e.target.value }))}
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-yellow-500" />
                    </div>
                  ))}
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">Description</label>
                    <textarea rows={3} value={newEvent.description}
                      onChange={e => setNewEvent(p => ({ ...p, description: e.target.value }))}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-yellow-500" />
                  </div>
                  <label className="flex items-center gap-2 text-sm text-gray-400 cursor-pointer">
                    <input type="checkbox" checked={newEvent.published} onChange={e => setNewEvent(p => ({ ...p, published: e.target.checked }))} />
                    Publier immédiatement
                  </label>
                  <button type="submit" className="w-full bg-green-700 hover:bg-green-600 text-white py-2 rounded-xl font-bold text-sm">Créer l&apos;événement</button>
                </form>
              )}

              {events.map(ev => (
                <div key={ev.id} onClick={() => setSelectedEvent(ev === selectedEvent ? null : ev)}
                  className={`bg-gray-900 border rounded-xl p-4 cursor-pointer transition-all ${selectedEvent?.id === ev.id ? 'border-yellow-500/50' : 'border-gray-800 hover:border-gray-600'}`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-semibold text-sm truncate">{ev.title}</p>
                      <p className="text-gray-500 text-xs">{new Date(ev.date).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                      <p className="text-gray-600 text-xs">{ev.venue}</p>
                    </div>
                    <div className="flex flex-col gap-1 items-end shrink-0">
                      {ev.published ? <span className="bg-green-900/40 text-green-400 text-xs px-2 py-0.5 rounded-full">Publié</span> : <span className="bg-gray-800 text-gray-500 text-xs px-2 py-0.5 rounded-full">Brouillon</span>}
                      {ev.soldOut && <span className="bg-red-900/40 text-red-400 text-xs px-2 py-0.5 rounded-full">Complet</span>}
                    </div>
                  </div>
                  <div className="mt-2 flex gap-3 text-xs text-gray-600">
                    <span>{ev.ticketTypes.length} type{ev.ticketTypes.length !== 1 ? 's' : ''} de billet</span>
                    <span>{ev.ticketTypes.reduce((s, t) => s + t.sold, 0)} / {ev.ticketTypes.reduce((s, t) => s + t.quantity, 0)} vendus</span>
                  </div>
                </div>
              ))}
              {events.length === 0 && !showNewEvent && <p className="text-gray-600 text-center py-8 text-sm">Aucun événement. Créez-en un !</p>}
            </div>

            {/* Détail événement sélectionné */}
            {selectedEvent && (
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 space-y-4 h-fit sticky top-6">
                <div className="flex items-start justify-between">
                  <h2 className="text-white font-bold">{selectedEvent.title}</h2>
                  <button onClick={() => setSelectedEvent(null)} className="text-gray-600 hover:text-white text-lg">✕</button>
                </div>

                <p className="text-gray-500 text-xs font-mono break-all">/evenements/{selectedEvent.slug}</p>

                {selectedEvent.imageUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={selectedEvent.imageUrl} alt="" className="w-full h-32 object-cover rounded-xl" />
                )}

                {/* Actions rapides */}
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => togglePublish(selectedEvent)}
                    className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${selectedEvent.published ? 'border-orange-800 text-orange-400 hover:bg-orange-900/20' : 'border-green-800 text-green-400 hover:bg-green-900/20'}`}>
                    {selectedEvent.published ? 'Dépublier' : 'Publier'}
                  </button>
                  <button onClick={() => toggleSoldOut(selectedEvent)}
                    className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${selectedEvent.soldOut ? 'border-blue-800 text-blue-400' : 'border-red-800 text-red-400'}`}>
                    {selectedEvent.soldOut ? 'Rouvrir ventes' : 'Marquer complet'}
                  </button>
                  <a href={`/evenements/${selectedEvent.slug}`} target="_blank"
                    className="text-xs px-3 py-1.5 rounded-lg border border-gray-700 text-gray-400 hover:text-white">
                    Voir la page →
                  </a>
                  <button onClick={() => deleteEvent(selectedEvent)} className="text-xs px-3 py-1.5 rounded-lg border border-red-900 text-red-500 hover:bg-red-900/20">
                    Supprimer
                  </button>
                </div>

                {/* Types de billets */}
                <div>
                  <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">Types de billets</p>
                  {selectedEvent.ticketTypes.length === 0 && <p className="text-gray-600 text-xs mb-3">Aucun type — ajoutez-en un ci-dessous</p>}
                  <div className="space-y-2 mb-4">
                    {selectedEvent.ticketTypes.map(tt => (
                      <div key={tt.id} className="bg-gray-800 rounded-lg px-3 py-2 flex items-center justify-between">
                        <div>
                          <p className="text-white text-sm font-semibold">{tt.name}</p>
                          <p className="text-gray-500 text-xs">{tt.price} € · {tt.sold}/{tt.quantity} vendus</p>
                        </div>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${tt.sold >= tt.quantity ? 'bg-red-900/40 text-red-400' : 'bg-green-900/40 text-green-400'}`}>
                          {tt.sold >= tt.quantity ? 'Épuisé' : `${tt.quantity - tt.sold} restants`}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Formulaire nouveau type */}
                  <form onSubmit={addTicketType} className="bg-gray-800/50 rounded-xl p-4 space-y-2">
                    <p className="text-gray-400 text-xs font-semibold mb-2">+ Ajouter un type de billet</p>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { label: 'Nom *', key: 'name', type: 'text', req: true },
                        { label: 'Prix (€) *', key: 'price', type: 'number', req: true },
                        { label: 'Quantité *', key: 'quantity', type: 'number', req: true },
                        { label: 'Max/commande', key: 'maxPerOrder', type: 'number', req: false },
                      ].map(f => (
                        <div key={f.key}>
                          <label className="text-xs text-gray-500 block mb-1">{f.label}</label>
                          <input type={f.type} required={f.req} value={(newTT as any)[f.key]}
                            onChange={e => setNewTT(p => ({ ...p, [f.key]: e.target.value }))}
                            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-2 py-1.5 text-white text-sm focus:outline-none focus:border-yellow-500" />
                        </div>
                      ))}
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">Description (optionnel)</label>
                      <input type="text" value={newTT.description}
                        onChange={e => setNewTT(p => ({ ...p, description: e.target.value }))}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-2 py-1.5 text-white text-sm focus:outline-none focus:border-yellow-500" />
                    </div>
                    <button type="submit" className="w-full bg-yellow-700 hover:bg-yellow-600 text-white py-1.5 rounded-lg font-semibold text-sm">Ajouter</button>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB BILLETS */}
        {tab === 'billets' && (
          <div>
            <div className="mb-4 flex gap-3 items-center flex-wrap">
              <select onChange={e => fetchTickets(key, e.target.value || undefined)}
                className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none">
                <option value="">Tous les événements</option>
                {events.map(ev => <option key={ev.id} value={ev.id}>{ev.title}</option>)}
              </select>
              <span className="text-gray-500 text-sm">{tickets.length} billet{tickets.length !== 1 ? 's' : ''}</span>
              <span className="text-yellow-500 text-sm font-bold">{tickets.filter(t => t.status === 'CONFIRMED').reduce((s: number, t: any) => s + t.total, 0).toFixed(2)} € encaissés</span>
            </div>

            <div className="space-y-2">
              {tickets.map((t: any) => (
                <div key={t.id} className="bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 flex flex-wrap items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-semibold">{t.buyerFirstName} {t.buyerLastName}</p>
                    <p className="text-gray-500 text-xs">{t.buyerEmail} · {t.buyerPhone || '—'}</p>
                  </div>
                  <div className="text-xs text-gray-400">
                    <p>{t.event?.title}</p>
                    <p>{t.ticketType?.name} × {t.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-yellow-500 font-bold text-sm">{t.total.toFixed(2)} €</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${t.status === 'CONFIRMED' ? 'bg-green-900/40 text-green-400' : t.status === 'RESERVED' ? 'bg-yellow-900/40 text-yellow-400' : 'bg-gray-800 text-gray-500'}`}>
                      {t.status}
                    </span>
                  </div>
                  <p className="text-gray-600 text-xs w-full">{new Date(t.createdAt).toLocaleString('fr-FR')}</p>
                </div>
              ))}
              {tickets.length === 0 && <p className="text-gray-600 text-center py-12 text-sm">Aucun billet vendu pour le moment.</p>}
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
