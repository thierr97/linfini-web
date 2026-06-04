'use client'
import { NavBar } from '@/components/NavBar'
import { useEffect, useState } from 'react'

interface StockItem {
  id: string
  name: string
  unit: string
  quantity: number
  minQty: number
  alert: boolean
  item?: { name: string }
}

export default function StockPage() {
  const [stocks, setStocks] = useState<StockItem[]>([])
  const [showAdd, setShowAdd] = useState(false)
  const [showMove, setShowMove] = useState<StockItem | null>(null)
  const [form, setForm] = useState({ name: '', unit: 'unité', quantity: '', minQty: '' })
  const [moveForm, setMoveForm] = useState({ type: 'OUT', quantity: '', reason: '' })

  const refresh = () => fetch('/api/stock').then(r => r.json()).then(setStocks)
  useEffect(() => { refresh() }, [])

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    await fetch('/api/stock', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: form.name, unit: form.unit, quantity: parseFloat(form.quantity), minQty: parseFloat(form.minQty) || 0 }),
    })
    setShowAdd(false)
    setForm({ name: '', unit: 'unité', quantity: '', minQty: '' })
    refresh()
  }

  const handleMove = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!showMove) return
    await fetch('/api/stock', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: showMove.id, type: moveForm.type, quantity: parseFloat(moveForm.quantity), reason: moveForm.reason }),
    })
    setShowMove(null)
    setMoveForm({ type: 'OUT', quantity: '', reason: '' })
    refresh()
  }

  const alerts = stocks.filter(s => s.alert)

  return (
    <div className="flex flex-col h-screen">
      <NavBar />
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white">État des stocks</h1>
          <button onClick={() => setShowAdd(true)} className="px-4 py-2 bg-amber-500 rounded-lg text-sm font-semibold text-black hover:bg-amber-400">
            + Ajouter article
          </button>
        </div>

        {alerts.length > 0 && (
          <div className="bg-red-950 border border-red-700 rounded-xl p-4">
            <div className="text-red-400 font-semibold mb-2">⚠️ Alertes stock ({alerts.length})</div>
            {alerts.map(s => (
              <div key={s.id} className="text-red-300 text-sm">• {s.name} — {s.quantity} {s.unit} (min: {s.minQty})</div>
            ))}
          </div>
        )}

        <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-800">
              <tr>
                <th className="text-left p-3 text-gray-400 text-sm font-medium">Article</th>
                <th className="text-right p-3 text-gray-400 text-sm font-medium">Qté</th>
                <th className="text-right p-3 text-gray-400 text-sm font-medium">Unité</th>
                <th className="text-right p-3 text-gray-400 text-sm font-medium">Seuil alerte</th>
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {stocks.map(s => (
                <tr key={s.id} className={s.alert ? 'bg-red-950/30' : ''}>
                  <td className="p-3 text-white">{s.name}</td>
                  <td className={`p-3 text-right font-bold ${s.alert ? 'text-red-400' : 'text-white'}`}>{s.quantity}</td>
                  <td className="p-3 text-right text-gray-400 text-sm">{s.unit}</td>
                  <td className="p-3 text-right text-gray-500 text-sm">{s.minQty}</td>
                  <td className="p-3 text-right">
                    <button onClick={() => { setShowMove(s); setMoveForm({ type: 'OUT', quantity: '', reason: '' }) }}
                      className="text-xs bg-gray-800 hover:bg-gray-700 px-3 py-1 rounded-lg text-gray-300">
                      Mouvement
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal ajout */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-2xl w-full max-w-md border border-gray-700 p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">Nouvel article</h2>
              <button onClick={() => setShowAdd(false)} className="text-gray-500 hover:text-white">✕</button>
            </div>
            <form onSubmit={handleAdd} className="space-y-3">
              <input required placeholder="Nom de l'article" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-amber-500 outline-none" />
              <div className="grid grid-cols-2 gap-2">
                <input placeholder="Unité (ex: bouteille)" value={form.unit} onChange={e => setForm(f => ({ ...f, unit: e.target.value }))}
                  className="bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-amber-500 outline-none" />
                <input type="number" required placeholder="Quantité initiale" value={form.quantity} onChange={e => setForm(f => ({ ...f, quantity: e.target.value }))}
                  className="bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-amber-500 outline-none" />
              </div>
              <input type="number" placeholder="Seuil d'alerte (optionnel)" value={form.minQty} onChange={e => setForm(f => ({ ...f, minQty: e.target.value }))}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-amber-500 outline-none" />
              <button type="submit" className="w-full bg-amber-500 hover:bg-amber-400 text-black font-bold py-3 rounded-xl transition-colors">Créer</button>
            </form>
          </div>
        </div>
      )}

      {/* Modal mouvement */}
      {showMove && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-2xl w-full max-w-md border border-gray-700 p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">{showMove.name}</h2>
              <button onClick={() => setShowMove(null)} className="text-gray-500 hover:text-white">✕</button>
            </div>
            <div className="text-gray-400 text-sm mb-4">Stock actuel: <span className="text-white font-bold">{showMove.quantity} {showMove.unit}</span></div>
            <form onSubmit={handleMove} className="space-y-3">
              <div className="grid grid-cols-3 gap-2">
                {['IN', 'OUT', 'ADJUSTMENT'].map(t => (
                  <button key={t} type="button" onClick={() => setMoveForm(f => ({ ...f, type: t }))}
                    className={`py-2 rounded-xl text-xs font-medium transition-colors ${moveForm.type === t ? 'bg-amber-500 text-black' : 'bg-gray-800 text-gray-300'}`}>
                    {t === 'IN' ? '📥 Entrée' : t === 'OUT' ? '📤 Sortie' : '✏️ Ajust.'}
                  </button>
                ))}
              </div>
              <input type="number" required min="0.01" step="0.01" placeholder="Quantité" value={moveForm.quantity} onChange={e => setMoveForm(f => ({ ...f, quantity: e.target.value }))}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-amber-500 outline-none" />
              <input placeholder="Motif (optionnel)" value={moveForm.reason} onChange={e => setMoveForm(f => ({ ...f, reason: e.target.value }))}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-amber-500 outline-none" />
              <button type="submit" className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-3 rounded-xl transition-colors">✅ Valider</button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
