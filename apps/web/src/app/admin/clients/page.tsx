'use client'
import { useState, useEffect, useCallback } from 'react'

interface Client {
  id: string
  name: string
  email: string
  telephone?: string
  discount: number
  notes?: string
  active: boolean
  createdAt: string
}

const ADMIN_KEY = process.env.NEXT_PUBLIC_ADMIN_KEY || ''

export default function AdminClientsPage() {
  const [adminKey, setAdminKey] = useState('')
  const [authed, setAuthed] = useState(false)
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(false)
  const [editing, setEditing] = useState<Record<string, { discount: number; notes: string }>>({})
  const [saved, setSaved] = useState<Record<string, boolean>>({})
  const [keyInput, setKeyInput] = useState('')

  const fetchClients = useCallback(async (key: string) => {
    setLoading(true)
    const res = await fetch('/api/admin/clients', { headers: { 'x-admin-key': key } })
    if (res.status === 401) { setAuthed(false); setLoading(false); return }
    const data = await res.json()
    setClients(data)
    const edits: Record<string, { discount: number; notes: string }> = {}
    data.forEach((c: Client) => { edits[c.id] = { discount: c.discount, notes: c.notes || '' } })
    setEditing(edits)
    setLoading(false)
  }, [])

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const res = await fetch('/api/admin/clients', { headers: { 'x-admin-key': keyInput } })
    setLoading(false)
    if (res.status === 401) { alert('Clé incorrecte'); return }
    setAdminKey(keyInput)
    setAuthed(true)
    const data = await res.json()
    setClients(data)
    const edits: Record<string, { discount: number; notes: string }> = {}
    data.forEach((c: Client) => { edits[c.id] = { discount: c.discount, notes: c.notes || '' } })
    setEditing(edits)
  }

  async function saveClient(client: Client) {
    const { discount, notes } = editing[client.id]
    const res = await fetch('/api/admin/clients', {
      method: 'PATCH',
      headers: { 'content-type': 'application/json', 'x-admin-key': adminKey },
      body: JSON.stringify({ id: client.id, discount, notes }),
    })
    if (res.ok) {
      setSaved(s => ({ ...s, [client.id]: true }))
      setTimeout(() => setSaved(s => ({ ...s, [client.id]: false })), 2000)
      fetchClients(adminKey)
    }
  }

  async function toggleActive(client: Client) {
    await fetch('/api/admin/clients', {
      method: 'PATCH',
      headers: { 'content-type': 'application/json', 'x-admin-key': adminKey },
      body: JSON.stringify({ id: client.id, active: !client.active }),
    })
    fetchClients(adminKey)
  }

  if (!authed) return (
    <main className="min-h-screen bg-gray-950 flex items-center justify-center">
      <form onSubmit={handleLogin} className="bg-gray-900 border border-gray-800 rounded-2xl p-8 w-full max-w-sm space-y-4">
        <h1 className="text-white font-bold text-2xl text-center mb-6">Backoffice L&apos;Infini</h1>
        <input type="password" required placeholder="Clé admin" value={keyInput} onChange={e => setKeyInput(e.target.value)}
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-yellow-500" />
        <button type="submit" className="w-full bg-yellow-600 hover:bg-yellow-500 text-white py-3 rounded-xl font-bold">Accéder</button>
      </form>
    </main>
  )

  return (
    <main className="min-h-screen bg-gray-950 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-white font-bold text-3xl">Clients <span className="text-yellow-500">({clients.length})</span></h1>
          <button onClick={() => fetchClients(adminKey)} className="text-sm text-gray-400 border border-gray-700 px-4 py-2 rounded-lg hover:text-white">
            ↻ Actualiser
          </button>
        </div>

        {loading && <p className="text-gray-500 text-center py-12">Chargement...</p>}

        {!loading && clients.length === 0 && (
          <p className="text-gray-500 text-center py-12">Aucun client inscrit pour le moment.</p>
        )}

        <div className="space-y-4">
          {clients.map(client => (
            <div key={client.id} className={`bg-gray-900 border rounded-2xl p-6 ${client.active ? 'border-gray-800' : 'border-red-900 opacity-60'}`}>
              <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="text-white font-bold text-lg">{client.name}</span>
                    {client.discount > 0 && (
                      <span className="bg-yellow-500/20 text-yellow-400 text-xs font-bold px-2 py-0.5 rounded-full">
                        -{client.discount}%
                      </span>
                    )}
                    {!client.active && <span className="bg-red-500/20 text-red-400 text-xs px-2 py-0.5 rounded-full">Désactivé</span>}
                  </div>
                  <p className="text-gray-400 text-sm">{client.email}</p>
                  {client.telephone && <p className="text-gray-500 text-sm">{client.telephone}</p>}
                  <p className="text-gray-600 text-xs mt-1">
                    Inscrit le {new Date(client.createdAt).toLocaleDateString('fr-FR')}
                  </p>
                </div>
                <button onClick={() => toggleActive(client)}
                  className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${client.active
                    ? 'border-red-800 text-red-400 hover:bg-red-900/20'
                    : 'border-green-800 text-green-400 hover:bg-green-900/20'}`}>
                  {client.active ? 'Désactiver' : 'Réactiver'}
                </button>
              </div>

              <div className="flex flex-wrap gap-4 items-end">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Réduction (%)</label>
                  <input type="number" min={0} max={100}
                    value={editing[client.id]?.discount ?? client.discount}
                    onChange={e => setEditing(prev => ({ ...prev, [client.id]: { ...prev[client.id], discount: Number(e.target.value) } }))}
                    className="w-24 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-center font-bold focus:outline-none focus:border-yellow-500" />
                </div>
                <div className="flex-1 min-w-48">
                  <label className="block text-xs text-gray-500 mb-1">Notes internes</label>
                  <input type="text"
                    value={editing[client.id]?.notes ?? client.notes ?? ''}
                    onChange={e => setEditing(prev => ({ ...prev, [client.id]: { ...prev[client.id], notes: e.target.value } }))}
                    placeholder="Note privée (client fidèle, VIP, etc.)"
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-yellow-500" />
                </div>
                <button onClick={() => saveClient(client)}
                  className={`px-5 py-2 rounded-xl font-bold text-sm transition-all ${saved[client.id]
                    ? 'bg-green-600 text-white'
                    : 'bg-yellow-600 hover:bg-yellow-500 text-white'}`}>
                  {saved[client.id] ? '✓ Enregistré' : 'Enregistrer'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
