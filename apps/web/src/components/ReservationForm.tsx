'use client'
import { useState } from 'react'

export default function ReservationForm() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', date: '', guests: '2', note: '' })
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')
    try {
      const res = await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, guests: parseInt(form.guests) }),
      })
      if (res.ok) setStatus('success')
      else setStatus('error')
    } catch { setStatus('error') }
  }

  if (status === 'success') {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🎉</div>
        <h3 className="text-2xl font-bold text-or mb-2">Demande envoyée !</h3>
        <p className="text-white/50">Nous vous confirmons votre réservation par email sous 24h.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-white/50 mb-1">Nom complet</label>
          <input required value={form.name} onChange={e => set('name', e.target.value)}
            className="w-full bg-noir border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-braise" />
        </div>
        <div>
          <label className="block text-sm text-white/50 mb-1">Téléphone</label>
          <input required type="tel" value={form.phone} onChange={e => set('phone', e.target.value)}
            className="w-full bg-noir border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-braise" />
        </div>
      </div>
      <div>
        <label className="block text-sm text-white/50 mb-1">Email</label>
        <input required type="email" value={form.email} onChange={e => set('email', e.target.value)}
          className="w-full bg-noir border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-braise" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-white/50 mb-1">Date & heure</label>
          <input required type="datetime-local" value={form.date} onChange={e => set('date', e.target.value)}
            className="w-full bg-noir border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-braise" />
        </div>
        <div>
          <label className="block text-sm text-white/50 mb-1">Nombre de couverts</label>
          <select value={form.guests} onChange={e => set('guests', e.target.value)}
            className="w-full bg-noir border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-braise">
            {[1,2,3,4,5,6,7,8,10,12,15,20].map(n => <option key={n} value={n}>{n} personne{n>1?'s':''}</option>)}
          </select>
        </div>
      </div>
      <div>
        <label className="block text-sm text-white/50 mb-1">Note (optionnel)</label>
        <textarea value={form.note} onChange={e => set('note', e.target.value)} rows={3}
          placeholder="Occasion spéciale, allergie, demande particulière..."
          className="w-full bg-noir border border-white/10 rounded-lg px-4 py-3 text-white resize-none focus:outline-none focus:border-braise" />
      </div>
      {status === 'error' && <p className="text-red-400 text-sm">Une erreur est survenue. Veuillez réessayer.</p>}
      <button type="submit" disabled={status === 'loading'}
        className="w-full bg-braise hover:bg-ambre disabled:opacity-50 text-white py-4 rounded-xl font-bold text-lg transition-colors">
        {status === 'loading' ? 'Envoi en cours...' : 'Confirmer la réservation'}
      </button>
    </form>
  )
}
