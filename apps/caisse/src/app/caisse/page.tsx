'use client'
import { NavBar } from '@/components/NavBar'
import { useEffect, useState } from 'react'

interface CashData {
  moves: any[]
  payments: any[]
  totalIn: number
  totalOut: number
  totalSales: number
  balance: number
}

export default function CaissePage() {
  const [data, setData] = useState<CashData | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ type: 'OUT', amount: '', reason: '' })
  const [loading, setLoading] = useState(false)

  const refresh = () => {
    fetch('/api/cash').then(r => r.json()).then(setData)
  }

  useEffect(() => { refresh() }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    await fetch('/api/cash', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: form.type, amount: parseFloat(form.amount), reason: form.reason }),
    })
    setLoading(false)
    setShowForm(false)
    setForm({ type: 'OUT', amount: '', reason: '' })
    refresh()
  }

  return (
    <div className="flex flex-col h-screen">
      <NavBar />
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white">Gestion de caisse</h1>
          <div className="flex gap-2">
            <button onClick={refresh} className="px-3 py-2 bg-gray-800 rounded-lg text-sm text-gray-300 hover:bg-gray-700">↺ Actualiser</button>
            <button onClick={() => setShowForm(true)} className="px-4 py-2 bg-amber-500 rounded-lg text-sm font-semibold text-black hover:bg-amber-400">
              + Mouvement
            </button>
          </div>
        </div>

        {/* Stats du jour */}
        {data && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <StatCard label="Ventes espèces" value={data.totalSales} color="green" />
            <StatCard label="Entrées caisse" value={data.totalIn} color="blue" />
            <StatCard label="Sorties caisse" value={data.totalOut} color="red" />
            <StatCard label="Solde du jour" value={data.balance} color="amber" />
          </div>
        )}

        {/* Mouvements */}
        <div className="bg-gray-900 rounded-xl border border-gray-800">
          <div className="p-4 border-b border-gray-800 font-semibold text-gray-300">Mouvements du jour</div>
          <div className="divide-y divide-gray-800">
            {data?.moves.length === 0 && (
              <div className="p-4 text-gray-600 text-sm">Aucun mouvement</div>
            )}
            {data?.moves.map((m: any) => (
              <div key={m.id} className="p-4 flex justify-between items-center">
                <div>
                  <div className="text-white text-sm">{m.reason}</div>
                  <div className="text-gray-500 text-xs">{new Date(m.createdAt).toLocaleTimeString('fr-FR')}</div>
                </div>
                <div className={`font-bold ${m.type === 'IN' ? 'text-green-400' : 'text-red-400'}`}>
                  {m.type === 'IN' ? '+' : '−'}{m.amount.toFixed(2)} €
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Paiements encaissés */}
        <div className="bg-gray-900 rounded-xl border border-gray-800">
          <div className="p-4 border-b border-gray-800 font-semibold text-gray-300">Ventes encaissées</div>
          <div className="divide-y divide-gray-800">
            {data?.payments.length === 0 && (
              <div className="p-4 text-gray-600 text-sm">Aucune vente</div>
            )}
            {data?.payments.map((p: any) => (
              <div key={p.id} className="p-4 flex justify-between items-center">
                <div>
                  <div className="text-white text-sm">{p.order?.table?.label || 'À emporter'} — {p.method}</div>
                  <div className="text-gray-500 text-xs">{new Date(p.createdAt).toLocaleTimeString('fr-FR')}</div>
                </div>
                <div className="text-green-400 font-bold">+{p.amount.toFixed(2)} €</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal mouvement */}
      {showForm && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-2xl w-full max-w-md border border-gray-700 p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">Mouvement de caisse</h2>
              <button onClick={() => setShowForm(false)} className="text-gray-500 hover:text-white">✕</button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                {['IN', 'OUT'].map((t) => (
                  <button key={t} type="button" onClick={() => setForm(f => ({ ...f, type: t }))}
                    className={`py-3 rounded-xl font-medium transition-colors ${form.type === t ? 'bg-amber-500 text-black' : 'bg-gray-800 text-gray-300'}`}>
                    {t === 'IN' ? '💰 Entrée' : '💸 Sortie'}
                  </button>
                ))}
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Montant (€)</label>
                <input type="number" min="0.01" step="0.01" required value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-amber-500 outline-none" placeholder="0.00" />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Motif</label>
                <input type="text" required value={form.reason} onChange={e => setForm(f => ({ ...f, reason: e.target.value }))}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-amber-500 outline-none" placeholder="Ex: Fond de caisse, Achat fournitures..." />
              </div>
              <button type="submit" disabled={loading}
                className="w-full bg-green-600 hover:bg-green-500 disabled:opacity-40 text-white font-bold py-3 rounded-xl transition-colors">
                {loading ? 'Enregistrement...' : '✅ Enregistrer'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  const colors: Record<string, string> = {
    green: 'text-green-400', blue: 'text-blue-400', red: 'text-red-400', amber: 'text-amber-400',
  }
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
      <div className="text-gray-400 text-sm">{label}</div>
      <div className={`font-bold text-2xl mt-1 ${colors[color]}`}>{value.toFixed(2)} €</div>
    </div>
  )
}
