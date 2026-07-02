'use client'
import { useState } from 'react'
import { IconCheck, IconAlert } from '@/components/icons'

const TYPES_EVENEMENT = [
  'Mariage', 'Anniversaire', 'Soirée d\'entreprise', 'Baptême / Communion',
  'Soirée privée', 'Cocktail / Gala', 'Baby shower', 'Autre',
]

const SERVICES = [
  { id: 'salle', label: 'Location salle' },
  { id: 'restauration', label: 'Restauration (buffet / menu)' },
  { id: 'bar', label: 'Bar & cocktails' },
  { id: 'dj', label: 'DJ / Animation musicale' },
  { id: 'decoration', label: 'Décoration' },
  { id: 'securite', label: 'Sécurité' },
]

const BUDGETS = [
  'Moins de 1 000 €', '1 000 – 3 000 €', '3 000 – 5 000 €',
  '5 000 – 10 000 €', 'Plus de 10 000 €', 'À définir ensemble',
]

export default function DevisForm() {
  const [form, setForm] = useState({
    nom: '', email: '', telephone: '',
    type_evenement: '', date: '', nb_invites: '',
    services: [] as string[], budget: '', message: '',
  })
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }))

  const toggleService = (id: string) => {
    setForm(p => ({
      ...p,
      services: p.services.includes(id)
        ? p.services.filter(s => s !== id)
        : [...p.services, id],
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')
    try {
      const res = await fetch('/api/devis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (res.ok) setStatus('success')
      else setStatus('error')
    } catch { setStatus('error') }
  }

  if (status === 'success') {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-or/10 border border-or/30 flex items-center justify-center">
          <IconCheck className="w-8 h-8 text-or" />
        </div>
        <h3 className="text-2xl font-bold text-or mb-3">Demande envoyée !</h3>
        <p className="text-white/50 max-w-sm mx-auto">
          Notre équipe vous contacte sous 24h pour affiner votre projet et établir un devis personnalisé.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Coordonnées */}
      <div>
        <h4 className="text-sm font-semibold text-white/40 uppercase tracking-wider mb-3">Vos coordonnées</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm text-white/50 mb-1">Nom complet *</label>
            <input required value={form.nom} onChange={e => set('nom', e.target.value)}
              className="w-full bg-noir border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-braise" />
          </div>
          <div>
            <label className="block text-sm text-white/50 mb-1">Email *</label>
            <input required type="email" value={form.email} onChange={e => set('email', e.target.value)}
              className="w-full bg-noir border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-braise" />
          </div>
          <div>
            <label className="block text-sm text-white/50 mb-1">Téléphone <span className="text-white/25">(facultatif)</span></label>
            <input type="tel" value={form.telephone} onChange={e => set('telephone', e.target.value)}
              placeholder="+590 6XX XX XX XX"
              className="w-full bg-noir border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-braise" />
          </div>
        </div>
      </div>

      {/* Événement */}
      <div>
        <h4 className="text-sm font-semibold text-white/40 uppercase tracking-wider mb-3">Votre événement</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm text-white/50 mb-1">Type d'événement *</label>
            <select required value={form.type_evenement} onChange={e => set('type_evenement', e.target.value)}
              className="w-full bg-noir border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-braise">
              <option value="">Choisir...</option>
              {TYPES_EVENEMENT.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm text-white/50 mb-1">Date souhaitée *</label>
            <input required type="date" value={form.date} onChange={e => set('date', e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="w-full bg-noir border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-braise" />
          </div>
          <div>
            <label className="block text-sm text-white/50 mb-1">Nombre d'invités <span className="text-white/25">(estimation)</span></label>
            <input type="number" min="10" max="600" value={form.nb_invites}
              onChange={e => set('nb_invites', e.target.value)}
              placeholder="Ex : 80"
              className="w-full bg-noir border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-braise" />
          </div>
        </div>
      </div>

      {/* Services */}
      <div>
        <h4 className="text-sm font-semibold text-white/40 uppercase tracking-wider mb-3">Services souhaités</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {SERVICES.map(s => (
            <button key={s.id} type="button" onClick={() => toggleService(s.id)}
              className={`px-4 py-3 rounded-lg border text-sm font-medium transition-all text-left ${
                form.services.includes(s.id)
                  ? 'border-braise bg-braise/20 text-white'
                  : 'border-white/10 bg-noir text-white/50 hover:border-white/30'
              }`}>
              <span className="inline-flex items-center gap-2">
                {form.services.includes(s.id) && <IconCheck className="w-3.5 h-3.5 shrink-0" />}
                {s.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Budget */}
      <div>
        <h4 className="text-sm font-semibold text-white/40 uppercase tracking-wider mb-3">Budget estimé</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {BUDGETS.map(b => (
            <button key={b} type="button" onClick={() => set('budget', b)}
              className={`px-4 py-3 rounded-lg border text-sm font-medium transition-all ${
                form.budget === b
                  ? 'border-or bg-or/20 text-or'
                  : 'border-white/10 bg-noir text-white/50 hover:border-white/30'
              }`}>
              {b}
            </button>
          ))}
        </div>
      </div>

      {/* Message */}
      <div>
        <label className="block text-sm text-white/50 mb-1">Détails supplémentaires</label>
        <textarea value={form.message} onChange={e => set('message', e.target.value)} rows={4}
          placeholder="Thème souhaité, demandes particulières, questions..."
          className="w-full bg-noir border border-white/10 rounded-lg px-4 py-3 text-white resize-none focus:outline-none focus:border-braise" />
      </div>

      {/* Notice personnel */}
      <div className="bg-ambre/5 border border-ambre/20 rounded-xl p-4">
        <p className="text-ambre text-xs font-semibold uppercase tracking-wider mb-1 inline-flex items-center gap-1.5">
          <IconAlert className="w-3.5 h-3.5" /> Personnel de service
        </p>
        <p className="text-white/50 text-sm leading-relaxed">
          Le personnel de service (serveurs, sécurité, hôtesses) est <strong className="text-white/70">obligatoirement fourni par L&apos;Infini</strong>.
          Si vous souhaitez faire intervenir votre propre personnel, vous devrez fournir pour chaque intervenant :
          DPAE, contrat de travail, pièce d&apos;identité et carte vitale.
        </p>
      </div>

      {status === 'error' && (
        <p className="text-red-400 text-sm">Une erreur est survenue. Écrivez-nous directement à direction.infini971@gmail.com</p>
      )}

      <button type="submit" disabled={status === 'loading'}
        className="w-full bg-braise hover:bg-ambre disabled:opacity-50 text-white py-4 rounded-xl font-bold text-lg transition-colors">
        {status === 'loading' ? 'Envoi en cours...' : 'Envoyer ma demande de devis →'}
      </button>
      <p className="text-center text-white/30 text-sm">Réponse sous 24h · Sans engagement</p>
    </form>
  )
}
