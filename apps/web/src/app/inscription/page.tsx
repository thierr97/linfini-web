'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function InscriptionPage() {
  const router = useRouter()
  const [form, setForm] = useState({ name: '', email: '', telephone: '', password: '', confirm: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (form.password !== form.confirm) { setError('Les mots de passe ne correspondent pas'); return }
    setLoading(true)
    const res = await fetch('/api/clients/register', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ name: form.name, email: form.email, telephone: form.telephone, password: form.password }),
    })
    const data = await res.json()
    setLoading(false)
    if (!res.ok) { setError(data.error || 'Erreur'); return }
    router.push('/mon-compte')
  }

  return (
    <main className="min-h-screen bg-noir">
      <Header />
      <section className="pt-32 pb-24 px-4">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-10">
            <p className="text-or text-sm font-semibold tracking-widest uppercase mb-3">Espace client</p>
            <h1 className="font-display text-4xl font-bold text-creme mb-2">Créer un compte</h1>
            <p className="text-white/40 text-sm">Accédez à vos devis et bénéficiez d&apos;offres exclusives</p>
          </div>

          <form onSubmit={handleSubmit} className="bg-charbon border border-white/5 rounded-2xl p-8 space-y-5">
            <div>
              <label className="block text-sm text-white/50 mb-1">Nom complet *</label>
              <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="Jean Dupont"
                className="w-full bg-noir border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-or" />
            </div>
            <div>
              <label className="block text-sm text-white/50 mb-1">Email *</label>
              <input required type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                placeholder="votre@email.com"
                className="w-full bg-noir border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-or" />
            </div>
            <div>
              <label className="block text-sm text-white/50 mb-1">Téléphone</label>
              <input type="tel" value={form.telephone} onChange={e => setForm(f => ({ ...f, telephone: e.target.value }))}
                placeholder="+590 690 00 00 00"
                className="w-full bg-noir border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-or" />
            </div>
            <div>
              <label className="block text-sm text-white/50 mb-1">Mot de passe *</label>
              <input required type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                placeholder="6 caractères minimum"
                className="w-full bg-noir border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-or" />
            </div>
            <div>
              <label className="block text-sm text-white/50 mb-1">Confirmer le mot de passe *</label>
              <input required type="password" value={form.confirm} onChange={e => setForm(f => ({ ...f, confirm: e.target.value }))}
                placeholder="Répétez le mot de passe"
                className="w-full bg-noir border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-or" />
            </div>
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <button type="submit" disabled={loading}
              className="w-full bg-braise hover:bg-ambre disabled:opacity-50 text-white py-3 rounded-xl font-bold transition-colors">
              {loading ? 'Création en cours...' : 'Créer mon compte →'}
            </button>
            <p className="text-center text-white/30 text-sm">
              Déjà un compte ?{' '}
              <Link href="/connexion" className="text-or hover:underline">Se connecter</Link>
            </p>
          </form>
        </div>
      </section>
      <Footer />
    </main>
  )
}
