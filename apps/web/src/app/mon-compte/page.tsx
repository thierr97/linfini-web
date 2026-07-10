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
  const [form, setForm] = useState({ name: '', telephone: '', currentPassword: '', newPassword: '' })
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)

  useEffect(() => {
    fetch('/api/clients/me').then(r => {
      if (r.status === 401) { router.push('/connexion'); return }
      return r.json()
    }).then(d => {
      if (d) {
        setClient(d)
        setForm(f => ({ ...f, name: d.name ?? '', telephone: d.telephone ?? '' }))
      }
    }).finally(() => setLoading(false))
  }, [router])

  async function handleLogout() {
    await fetch('/api/clients/logout', { method: 'POST' })
    router.push('/')
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true); setMsg(null)
    const body: Record<string, string> = { name: form.name, telephone: form.telephone }
    if (form.newPassword) {
      body.newPassword = form.newPassword
      body.currentPassword = form.currentPassword
    }
    try {
      const res = await fetch('/api/clients/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const d = await res.json()
      if (res.ok) {
        setClient(c => (c ? { ...c, name: d.name, telephone: d.telephone } : c))
        setForm(f => ({ ...f, currentPassword: '', newPassword: '' }))
        setMsg({ ok: true, text: 'Vos informations ont été mises à jour ✓' })
      } else {
        setMsg({ ok: false, text: d.error || 'Erreur lors de la mise à jour.' })
      }
    } catch {
      setMsg({ ok: false, text: 'Erreur réseau — réessayez.' })
    } finally {
      setSaving(false)
    }
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

          {/* Modifier mes informations */}
          <form onSubmit={handleSave} className="bg-charbon border border-white/5 rounded-2xl p-6 mb-8 space-y-4">
            <h2 className="text-white font-bold text-lg">Modifier mes informations</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-white/50 mb-1">Nom complet</label>
                <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  className="w-full bg-noir border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-or" />
              </div>
              <div>
                <label className="block text-sm text-white/50 mb-1">Téléphone</label>
                <input value={form.telephone} onChange={e => setForm(f => ({ ...f, telephone: e.target.value }))}
                  placeholder="0690 12 34 56"
                  className="w-full bg-noir border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-or" />
              </div>
            </div>
            <details className="group">
              <summary className="text-white/50 text-sm cursor-pointer hover:text-white transition-colors">
                Changer mon mot de passe
              </summary>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                <div>
                  <label className="block text-sm text-white/50 mb-1">Mot de passe actuel</label>
                  <input type="password" value={form.currentPassword}
                    onChange={e => setForm(f => ({ ...f, currentPassword: e.target.value }))}
                    className="w-full bg-noir border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-or" />
                </div>
                <div>
                  <label className="block text-sm text-white/50 mb-1">Nouveau mot de passe (6 car. min.)</label>
                  <input type="password" value={form.newPassword}
                    onChange={e => setForm(f => ({ ...f, newPassword: e.target.value }))}
                    className="w-full bg-noir border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-or" />
                </div>
              </div>
            </details>
            {msg && <p className={`text-sm ${msg.ok ? 'text-green-400' : 'text-red-400'}`}>{msg.text}</p>}
            <button disabled={saving}
              className="bg-braise hover:bg-ambre disabled:opacity-50 text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition-colors">
              {saving ? 'Enregistrement…' : 'Enregistrer'}
            </button>
            <p className="text-white/25 text-xs">L&apos;adresse email sert d&apos;identifiant de connexion et ne peut pas être modifiée ici.</p>
          </form>

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
