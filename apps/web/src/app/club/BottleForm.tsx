'use client'
import { useState } from 'react'

const CHAMPAGNES = [
  { name: 'Nicolas Feuillate', price: 90 },
  { name: 'Moët Impérial Brut', price: 100 },
  { name: 'Moët Nectar Impérial', price: 120 },
  { name: 'Moët Nectar Impérial Rosé', price: 120 },
  { name: 'Ruinart Blanc de Blanc', price: 190 },
  { name: 'Dom Perignon', price: 450 },
]

export default function BottleForm() {
  const [form, setForm] = useState({
    nom: '', prenom: '', email: '', telephone: '',
    date: '', personnes: '2', bouteille: '', notes: '',
  })
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    await fetch('/api/reservation-bouteille', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    }).catch(() => null)
    setLoading(false)
    setSent(true)
  }

  return (
    <section id="reservation-bouteille" className="py-16 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-10 text-center">
          <p className="text-or text-sm font-semibold tracking-widest uppercase mb-2">Service VIP</p>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-creme mb-3">
            Réservation de bouteille
          </h2>
          <p className="text-white/40 text-sm">
            Réservez votre table VIP avec service bouteille. Confirmation sous 24h.
          </p>
        </div>

        {/* Carte champagnes */}
        <div className="bg-charbon rounded-2xl border border-or/20 p-6 mb-8">
          <h3 className="text-or font-bold mb-4 uppercase tracking-wider text-sm">Carte Champagnes</h3>
          <div className="divide-y divide-white/5">
            {CHAMPAGNES.map(c => (
              <div key={c.name} className="flex justify-between items-center py-3">
                <span className="text-creme/80 text-sm">{c.name}</span>
                <span className="text-or font-bold">{c.price} €</span>
              </div>
            ))}
          </div>
        </div>

        {sent ? (
          <div className="bg-gradient-to-r from-braise/20 to-ambre/10 rounded-2xl border border-braise/30 p-10 text-center">
            <div className="text-5xl mb-4">🥂</div>
            <h3 className="font-display text-2xl font-bold text-creme mb-2">Demande envoyée !</h3>
            <p className="text-white/50 text-sm">
              Nous vous confirmons votre réservation sous 24h par email ou téléphone.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-charbon rounded-2xl border border-white/5 p-8 space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-white/40 text-xs uppercase tracking-wider mb-2">Prénom *</label>
                <input name="prenom" required value={form.prenom} onChange={handleChange}
                  className="w-full bg-noir border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-braise transition-colors"
                  placeholder="Jean" />
              </div>
              <div>
                <label className="block text-white/40 text-xs uppercase tracking-wider mb-2">Nom *</label>
                <input name="nom" required value={form.nom} onChange={handleChange}
                  className="w-full bg-noir border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-braise transition-colors"
                  placeholder="Dupont" />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-white/40 text-xs uppercase tracking-wider mb-2">Email *</label>
                <input name="email" type="email" required value={form.email} onChange={handleChange}
                  className="w-full bg-noir border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-braise transition-colors"
                  placeholder="jean@email.com" />
              </div>
              <div>
                <label className="block text-white/40 text-xs uppercase tracking-wider mb-2">Téléphone *</label>
                <input name="telephone" type="tel" required value={form.telephone} onChange={handleChange}
                  className="w-full bg-noir border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-braise transition-colors"
                  placeholder="+590 690 XX XX XX" />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-white/40 text-xs uppercase tracking-wider mb-2">Date de la soirée *</label>
                <input name="date" type="date" required value={form.date} onChange={handleChange}
                  className="w-full bg-noir border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-braise transition-colors" />
              </div>
              <div>
                <label className="block text-white/40 text-xs uppercase tracking-wider mb-2">Nombre de personnes *</label>
                <select name="personnes" value={form.personnes} onChange={handleChange}
                  className="w-full bg-noir border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-braise transition-colors">
                  {[2, 3, 4, 5, 6, 7, 8, 10, 12, 15, 20].map(n => (
                    <option key={n} value={n}>{n} personnes</option>
                  ))}
                  <option value="20+">20+ personnes</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-white/40 text-xs uppercase tracking-wider mb-2">Bouteille souhaitée *</label>
              <select name="bouteille" required value={form.bouteille} onChange={handleChange}
                className="w-full bg-noir border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-braise transition-colors">
                <option value="">Choisir une bouteille...</option>
                <optgroup label="Champagnes">
                  {CHAMPAGNES.map(c => (
                    <option key={c.name} value={c.name}>{c.name} — {c.price} €</option>
                  ))}
                </optgroup>
                <optgroup label="Autres">
                  <option value="Rhum arrangé maison">Rhum arrangé maison</option>
                  <option value="Whisky">Whisky</option>
                  <option value="Vodka">Vodka</option>
                  <option value="À définir">À définir à l&apos;arrivée</option>
                </optgroup>
              </select>
            </div>
            <div>
              <label className="block text-white/40 text-xs uppercase tracking-wider mb-2">Message / Occasion spéciale</label>
              <textarea name="notes" value={form.notes} onChange={handleChange} rows={3}
                className="w-full bg-noir border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-braise transition-colors resize-none"
                placeholder="Anniversaire, demande en mariage, soirée d'entreprise..." />
            </div>
            <button type="submit" disabled={loading}
              className="w-full bg-braise hover:bg-ambre disabled:opacity-50 text-white py-4 rounded-xl font-bold text-sm transition-colors">
              {loading ? 'Envoi en cours...' : 'Envoyer ma demande de réservation'}
            </button>
            <p className="text-white/20 text-xs text-center">
              Confirmation par email ou téléphone sous 24h · Acompte demandé à la confirmation
            </p>
          </form>
        )}
      </div>
    </section>
  )
}
