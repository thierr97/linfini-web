'use client'
import { useCallback, useEffect, useState } from 'react'

interface Stats { total: number; sendable: number; unsubscribed: number; bounced: number }
interface Campaign {
  id: string; subject: string; status: string
  totalCount: number; sentCount: number; failedCount: number; openCount: number
  createdAt: string; sentAt: string | null
}

export default function AdminNewsletterPage() {
  const [key, setKey] = useState('')
  const [authed, setAuthed] = useState(false)
  const [keyInput, setKeyInput] = useState('')
  const [stats, setStats] = useState<Stats | null>(null)
  const [campaigns, setCampaigns] = useState<Campaign[]>([])

  const [subject, setSubject] = useState('')
  const [preheader, setPreheader] = useState('')
  const [body, setBody] = useState('')
  const [testEmail, setTestEmail] = useState('')
  const [busy, setBusy] = useState('')
  const [progress, setProgress] = useState<{ sent: number; total: number } | null>(null)

  const api = useCallback((path: string, init?: RequestInit) =>
    fetch(`/api/admin/newsletter${path}`, {
      ...init,
      headers: { 'Content-Type': 'application/json', 'x-admin-key': key, ...(init?.headers ?? {}) },
    }), [key])

  const refresh = useCallback(async () => {
    const res = await api('')
    if (res.status === 401) { setAuthed(false); return }
    const data = await res.json()
    setStats(data.stats); setCampaigns(data.campaigns)
  }, [api])

  useEffect(() => { if (authed) refresh() }, [authed, refresh])

  async function login(e: React.FormEvent) {
    e.preventDefault()
    const res = await fetch('/api/admin/newsletter', { headers: { 'x-admin-key': keyInput } })
    if (res.status === 401) { alert('Clé incorrecte'); return }
    setKey(keyInput); setAuthed(true)
  }

  async function syncContacts() {
    setBusy('sync')
    const res = await api('/contacts', { method: 'POST' })
    const data = await res.json()
    setBusy('')
    if (data.added !== undefined) { alert(`${data.added} nouveau(x) contact(s) importé(s). Total : ${data.total}.`); refresh() }
    else alert(data.error || 'Erreur')
  }

  async function sendTestEmail() {
    if (!testEmail.trim()) { alert('Entrez un email de test'); return }
    if (!subject.trim() || !body.trim()) { alert('Objet et contenu requis'); return }
    setBusy('test')
    const res = await api('', { method: 'POST', body: JSON.stringify({ subject, preheader, body, test: testEmail.trim() }) })
    const data = await res.json()
    setBusy('')
    alert(data.test ? `Test envoyé à ${data.sentTo}` : (data.error || 'Erreur'))
  }

  async function createAndSend() {
    if (!subject.trim() || !body.trim()) { alert('Objet et contenu requis'); return }
    if (!stats?.sendable) { alert('Aucun contact abonné. Importez d’abord vos clients.'); return }
    if (!confirm(`Envoyer « ${subject} » à ${stats.sendable} destinataire(s) ?\n\nRappel : uniquement des clients ayant consenti, désinscription incluse.`)) return

    setBusy('send')
    // 1. Créer la campagne
    const createRes = await api('', { method: 'POST', body: JSON.stringify({ subject, preheader, body }) })
    const campaign = await createRes.json()
    if (!campaign.id) { setBusy(''); alert(campaign.error || 'Erreur création'); return }

    // 2. Envoyer par tranches jusqu'à épuisement
    setProgress({ sent: 0, total: stats.sendable })
    let guard = 0
    while (guard++ < 1000) {
      const res = await api('', { method: 'PATCH', body: JSON.stringify({ campaignId: campaign.id }) })
      const r = await res.json()
      if (r.error) { alert(r.error); break }
      setProgress(p => ({ sent: (p?.sent ?? 0) + r.sent, total: p?.total ?? stats.sendable }))
      if (r.remaining <= 0) break
    }
    setBusy(''); setProgress(null)
    setSubject(''); setPreheader(''); setBody('')
    alert('Campagne envoyée ✓')
    refresh()
  }

  if (!authed) {
    return (
      <div className="min-h-screen bg-noir flex items-center justify-center p-4">
        <form onSubmit={login} className="bg-charbon border border-white/10 rounded-2xl p-8 w-full max-w-sm text-center">
          <h1 className="text-creme font-bold text-2xl mb-1">📧 Newsletter</h1>
          <p className="text-white/40 text-sm mb-6">Espace administrateur</p>
          <input type="password" required placeholder="Clé admin" value={keyInput}
            onChange={e => setKeyInput(e.target.value)}
            className="w-full text-center bg-noir border border-white/20 rounded-xl px-4 py-3 text-creme mb-4 focus:outline-none focus:border-braise" />
          <button className="w-full bg-braise hover:bg-ambre text-white font-bold py-3 rounded-xl transition-colors">Entrer</button>
        </form>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-noir text-creme p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="font-display text-3xl font-bold mb-2">📧 Emailing clients</h1>
        <p className="text-white/40 text-sm mb-8">Envoi aux clients L&apos;Infini ayant consenti · désinscription automatique · RGPD</p>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            { label: 'Abonnés', value: stats?.sendable ?? '—', color: 'text-green-400' },
            { label: 'Total contacts', value: stats?.total ?? '—', color: 'text-creme' },
            { label: 'Désinscrits', value: stats?.unsubscribed ?? '—', color: 'text-white/50' },
            { label: 'Bounces', value: stats?.bounced ?? '—', color: 'text-amber-400' },
          ].map(s => (
            <div key={s.label} className="bg-charbon border border-white/10 rounded-xl p-4">
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-white/40 text-xs">{s.label}</p>
            </div>
          ))}
        </div>

        <button onClick={syncContacts} disabled={busy === 'sync'}
          className="mb-8 bg-charbon border border-white/15 hover:border-braise text-sm px-4 py-2 rounded-full disabled:opacity-50">
          {busy === 'sync' ? 'Import…' : '↻ Importer les emails clients (réservations, billets, commandes, comptes)'}
        </button>

        {/* Composer */}
        <div className="bg-charbon border border-white/10 rounded-2xl p-6 mb-8">
          <h2 className="font-bold text-lg mb-4">Nouvelle campagne</h2>
          <label className="block text-sm text-white/50 mb-1">Objet de l&apos;email</label>
          <input value={subject} onChange={e => setSubject(e.target.value)} placeholder="Ex : Soirée spéciale ce samedi 🎉"
            className="w-full bg-noir border border-white/15 rounded-xl px-4 py-2.5 mb-4 focus:outline-none focus:border-braise" />

          <label className="block text-sm text-white/50 mb-1">Aperçu (preheader — texte gris dans la boîte de réception)</label>
          <input value={preheader} onChange={e => setPreheader(e.target.value)} placeholder="Une phrase d’accroche…"
            className="w-full bg-noir border border-white/15 rounded-xl px-4 py-2.5 mb-4 focus:outline-none focus:border-braise" />

          <label className="block text-sm text-white/50 mb-1">Contenu (HTML autorisé : &lt;p&gt; &lt;b&gt; &lt;a href&gt; &lt;img&gt;…)</label>
          <textarea value={body} onChange={e => setBody(e.target.value)} rows={10}
            placeholder={'<p>Bonjour,</p>\n<p>Ce samedi, DJ set et cocktails signature au Smile Bar…</p>\n<p><a href="https://infinigp.fr/club">Réservez votre table</a></p>'}
            className="w-full bg-noir border border-white/15 rounded-xl px-4 py-3 font-mono text-sm mb-4 focus:outline-none focus:border-braise" />

          <div className="flex flex-wrap items-center gap-3">
            <input value={testEmail} onChange={e => setTestEmail(e.target.value)} placeholder="mon@email.fr" type="email"
              className="bg-noir border border-white/15 rounded-full px-4 py-2 text-sm w-48 focus:outline-none focus:border-braise" />
            <button onClick={sendTestEmail} disabled={!!busy}
              className="bg-charbon border border-white/20 hover:border-white/50 px-4 py-2 rounded-full text-sm disabled:opacity-50">
              {busy === 'test' ? 'Envoi…' : '✉️ Test à moi'}
            </button>
            <button onClick={createAndSend} disabled={!!busy}
              className="ml-auto bg-braise hover:bg-ambre text-white font-bold px-6 py-2.5 rounded-full disabled:opacity-50">
              {busy === 'send' && progress
                ? `Envoi ${progress.sent}/${progress.total}…`
                : `Envoyer à ${stats?.sendable ?? 0} abonné(s)`}
            </button>
          </div>
        </div>

        {/* Historique */}
        <h2 className="font-bold text-lg mb-3">Campagnes envoyées</h2>
        <div className="space-y-2">
          {campaigns.length === 0 && <p className="text-white/30 text-sm">Aucune campagne pour l’instant.</p>}
          {campaigns.map(c => (
            <div key={c.id} className="bg-charbon border border-white/10 rounded-xl p-4 flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="font-semibold truncate">{c.subject}</p>
                <p className="text-white/40 text-xs">{new Date(c.createdAt).toLocaleString('fr-FR')} · {c.status}</p>
              </div>
              <div className="flex gap-4 text-sm shrink-0 text-right">
                <div><p className="font-bold text-green-400">{c.sentCount}</p><p className="text-white/30 text-xs">envoyés</p></div>
                <div><p className="font-bold text-or">{c.openCount}</p><p className="text-white/30 text-xs">ouverts</p></div>
                {c.failedCount > 0 && <div><p className="font-bold text-red-400">{c.failedCount}</p><p className="text-white/30 text-xs">échecs</p></div>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
