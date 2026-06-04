'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function NewMenuItemPage() {
  const router = useRouter()
  const [form, setForm] = useState({ name: '', description: '', basePrice: '', categoryId: '' })
  const [saving, setSaving] = useState(false)

  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }))

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()} className="text-gray-400 hover:text-gray-600">← Retour</button>
        <h1 className="text-2xl font-bold text-gray-900">Nouvel article</h1>
      </div>
      <div className="bg-white rounded-xl border p-6 max-w-lg space-y-4">
        <div>
          <label className="block text-sm text-gray-600 mb-1">Nom *</label>
          <input value={form.name} onChange={e => set('name', e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-braise" />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">Description</label>
          <textarea value={form.description} onChange={e => set('description', e.target.value)} rows={3}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:border-braise" />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">Prix de base (€) *</label>
          <input type="number" step="0.01" value={form.basePrice} onChange={e => set('basePrice', e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-braise" />
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => router.back()}
            className="flex-1 border border-gray-200 text-gray-600 px-4 py-2 rounded-lg text-sm hover:bg-gray-50"
          >
            Annuler
          </button>
          <button
            disabled={saving || !form.name || !form.basePrice}
            className="flex-1 bg-braise text-white px-4 py-2 rounded-lg text-sm disabled:opacity-50 hover:bg-ambre transition-colors"
          >
            Créer l'article
          </button>
        </div>
      </div>
    </div>
  )
}
