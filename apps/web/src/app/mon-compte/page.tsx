'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

interface ClientData {
  id: string
  name: string
  email: string
  telephone?: string
  discount: number
  createdAt: string
}

export default function MonComptePage() {
  const router = useRouter()
  const [client, setClient] = useState<ClientData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/clients/me').then(r => {
      if (r.status === 401) { router.push('/connexion'); return }
      return r.json()
    }).then(d => { if (d) setClient(d) }).finally(() => setLoading(false))
  }, [router])

  async function handleLogout() {
    await fetch('/api/clients/logout', { method: 'POST' })
    router.push('/')
  }

  if (loading) return (
    <main className="min-h-screen bg-noir flex items-center justify-center">
      <div className="text-or animate-pulse">Chargement...</div>
    </main>
  )

  if (!client) return null

  const dateInscription = new Date(client.createdAt).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })

  return (
    <main className="min-h-screen bg-noir">
      <Header />
      <section className="pt-32 pb-24 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="mb-10 flex items-start justify-between">
            <div>
              <p className="text-or text-sm font-semibold tracking-widest uppercase mb-2">Espace client</p>
              <h1 className="font-display text-4xl font-bold text-creme">Bonjour, {client.name.split(' ')[0]} 👋</h1>
            </div>
            <button onClick={handleLogout}
              className="text-sm text-white/30 hover:text-white border border-white/10 px-4 py-2 rounded-lg transition-colors">
              Déconnexion
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div className="bg-charbon border border-white/5 rounded-2xl p-6">
              <p className="text-white/40 text-xs uppercase tracking-widest mb-1">Email</p>
              <p className="text-white font-medium">{client.email}</p>
            </div>
            <div className="bg-charbon border border-white/5 rounded-2xl p-6">
              <p className="text-white/40 text-xs uppercase tracking-widest mb-1">Téléphone</p>
              <p className="text-white font-medium">{client.telephone || '—'}</p>
            </div>
            <div className="bg-charbon border border-white/5 rounded-2xl p-6">
              <p className="text-white/40 text-xs uppercase tracking-widest mb-1">Membre depuis</p>
              <p className="text-white font-medium">{dateInscription}</p>
            </div>
            <div className={`border rounded-2xl p-6 ${client.discount > 0 ? 'bg-or/10 border-or/30' : 'bg-charbon border-white/5'}`}>
              <p className="text-white/40 text-xs uppercase tracking-widest mb-1">Réduction accordée</p>
              {client.discount > 0 ? (
                <p className="text-or font-bold text-2xl">{client.discount} % de remise</p>
              ) : (
                <p className="text-white/30 font-medium">Aucune réduction</p>
              )}
            </div>
          </div>

          <div className="bg-charbon border border-white/5 rounded-2xl p-6">
            <h2 className="text-white font-bold text-lg mb-4">Vos devis</h2>
            <p className="text-white/30 text-sm mb-6">Pour demander un devis, utilisez le chat ou le formulaire de devis.</p>
            <div className="flex gap-3">
              <Link href="/devis" className="bg-braise text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-ambre transition-colors">
                Demander un devis
              </Link>
              <Link href="/" className="border border-white/10 text-white/60 px-5 py-2.5 rounded-xl text-sm hover:text-white transition-colors">
                Accueil
              </Link>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  )
}
