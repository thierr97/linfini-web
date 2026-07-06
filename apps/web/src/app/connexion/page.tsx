'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import SocialAuth from '@/components/SocialAuth'

export default function ConnexionPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Déjà connecté ? → on va directement à l'espace client (pas de re-login)
  useEffect(() => {
    fetch('/api/clients/me').then(r => { if (r.ok) router.replace('/mon-compte') }).catch(() => {})
  }, [router])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const res = await fetch('/api/clients/login', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email, password }),
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
            <h1 className="font-display text-4xl font-bold text-creme mb-2">Se connecter</h1>
            <p className="text-white/40 text-sm">Accédez à votre espace personnel</p>
          </div>

          <form onSubmit={handleSubmit} className="bg-charbon border border-white/5 rounded-2xl p-8 space-y-5">
            <div>
              <label className="block text-sm text-white/50 mb-1">Email</label>
              <input required type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="votre@email.com"
                className="w-full bg-noir border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-or" />
            </div>
            <div>
              <label className="block text-sm text-white/50 mb-1">Mot de passe</label>
              <input required type="password" value={password} onChange={e => setPassword(e.target.value)}
                placeholder="Votre mot de passe"
                className="w-full bg-noir border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-or" />
            </div>
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <button type="submit" disabled={loading}
              className="w-full bg-braise hover:bg-ambre disabled:opacity-50 text-white py-3 rounded-xl font-bold transition-colors">
              {loading ? 'Connexion...' : 'Se connecter →'}
            </button>
            <SocialAuth />
            <p className="text-center text-white/30 text-sm">
              Pas encore de compte ?{' '}
              <Link href="/inscription" className="text-or hover:underline">S&apos;inscrire gratuitement</Link>
            </p>
          </form>
        </div>
      </section>
      <Footer />
    </main>
  )
}
