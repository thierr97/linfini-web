'use client'
import { useState } from 'react'

export default function SettingsPage() {
  const [mode, setMode] = useState<'password' | 'apikey'>('password')
  const [odoo, setOdoo] = useState({ url: 'https://sas-les-4-as1.odoo.com', db: 'sas-les-4-as1', user: '', password: '', apiKey: '' })
  const [testing, setTesting]   = useState(false)
  const [syncing, setSyncing]   = useState(false)
  const [testResult, setTestResult] = useState<{ ok: boolean; msg: string } | null>(null)
  const [syncResult, setSyncResult] = useState<{ ok: boolean; msg: string } | null>(null)
  const [notif, setNotif] = useState({ telegramToken: '', telegramChatId: '', webhookUrl: '' })
  const [savedNotif, setSavedNotif] = useState(false)

  const testOdoo = async () => {
    setTesting(true); setTestResult(null)
    try {
      const res = await fetch('/api/odoo/test', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...odoo, mode }),
      })
      const data = await res.json()
      setTestResult({ ok: data.ok, msg: data.message })
    } catch { setTestResult({ ok: false, msg: 'Impossible de joindre Odoo' }) }
    finally { setTesting(false) }
  }

  const syncOdoo = async () => {
    setSyncing(true); setSyncResult(null)
    try {
      const res = await fetch('/api/odoo/sync', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...odoo, mode }),
      })
      const data = await res.json()
      setSyncResult({ ok: data.ok, msg: data.message })
    } catch { setSyncResult({ ok: false, msg: 'Erreur de synchronisation' }) }
    finally { setSyncing(false) }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Paramètres</h1>

      {/* Source de données */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="font-bold text-gray-800 mb-1">Source de données</h2>
        <p className="text-sm text-gray-400 mb-4">D'où viennent les données affichées sur le site</p>
        <div className="grid grid-cols-2 gap-3">
          <div className="border-2 border-blue-500 rounded-xl p-4 bg-blue-50">
            <div className="flex items-center gap-2 mb-1">
              <span>📄</span><span className="font-medium text-blue-800">JSON local</span>
              <span className="ml-auto bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full">Actif</span>
            </div>
            <p className="text-xs text-blue-600">Modifiable via l'onglet Menu ci-dessus</p>
          </div>
          <div className="border-2 border-gray-200 rounded-xl p-4 bg-gray-50">
            <div className="flex items-center gap-2 mb-1">
              <span>🔗</span><span className="font-medium text-gray-600">Odoo POS</span>
              <span className="ml-auto bg-gray-200 text-gray-500 text-xs px-2 py-0.5 rounded-full">En attente</span>
            </div>
            <p className="text-xs text-gray-400">Configurer ci-dessous puis activer</p>
          </div>
        </div>
        <p className="text-xs font-mono bg-gray-50 p-2 rounded mt-3 text-gray-500">
          Activer Odoo → <strong>DATA_SOURCE=odoo</strong> dans apps/web/.env.local
        </p>
      </div>

      {/* Connexion Odoo */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="font-bold text-gray-800 mb-1">🔗 Connexion Odoo</h2>
        <p className="text-sm text-gray-400 mb-4">
          Une fois connecté, utilisez <strong>Synchroniser</strong> pour importer le menu depuis Odoo POS.
          Les mises à jour automatiques se font via webhook.
        </p>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">URL Odoo</label>
            <input value={odoo.url} onChange={e => setOdoo({ ...odoo, url: e.target.value })}
              placeholder="https://sas-les-4-as1.odoo.com"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400" />
          </div>

          {/* Toggle mode */}
          <div className="flex gap-2">
            <button onClick={() => setMode('password')}
              className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${mode === 'password' ? 'bg-orange-500 text-white border-orange-500' : 'bg-white text-gray-500 border-gray-200 hover:border-orange-300'}`}>
              📧 Email + Mot de passe
            </button>
            <button onClick={() => setMode('apikey')}
              className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${mode === 'apikey' ? 'bg-green-500 text-white border-green-500' : 'bg-white text-gray-500 border-gray-200 hover:border-green-300'}`}>
              🔑 Clé API
            </button>
          </div>

          {mode === 'password' && (
            <>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Base de données</label>
                <input value={odoo.db} onChange={e => setOdoo({ ...odoo, db: e.target.value })}
                  placeholder="sas-les-4-as1"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Email</label>
                <input value={odoo.user} onChange={e => setOdoo({ ...odoo, user: e.target.value, apiKey: '' })}
                  placeholder="tcyrille@hotmail.fr"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Mot de passe Odoo</label>
                <input type="password" value={odoo.password} onChange={e => setOdoo({ ...odoo, password: e.target.value, apiKey: '' })}
                  placeholder="••••••••"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400" />
              </div>
            </>
          )}

          {mode === 'apikey' && (
            <>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Email (votre login Odoo)</label>
                <input value={odoo.user} onChange={e => setOdoo({ ...odoo, user: e.target.value })}
                  placeholder="tcyrille@hotmail.fr"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400" />
              </div>
              <div className="border border-green-200 rounded-xl p-3 bg-green-50">
                <label className="block text-xs font-medium text-green-700 mb-1">Clé API Odoo</label>
                <input type="password" value={odoo.apiKey} onChange={e => setOdoo({ ...odoo, apiKey: e.target.value, password: '' })}
                  placeholder="Odoo → Mon Profil → Sécurité → Clés API"
                  className="w-full border border-green-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-400 bg-white" />
              </div>
            </>
          )}
        </div>

        {testResult && (
          <div className={`mt-3 p-3 rounded-lg text-sm border ${testResult.ok ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
            {testResult.msg}
          </div>
        )}
        {syncResult && (
          <div className={`mt-3 p-3 rounded-lg text-sm border ${syncResult.ok ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
            {syncResult.msg}
          </div>
        )}

        <div className="flex gap-2 mt-4">
          <button onClick={testOdoo} disabled={testing || !odoo.url}
            className="border border-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-40 transition-colors">
            {testing ? '⏳ Test…' : '🔍 Tester'}
          </button>
          <button onClick={syncOdoo} disabled={syncing || !odoo.url}
            className="bg-orange-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-orange-600 disabled:opacity-40 transition-colors flex items-center gap-2">
            {syncing ? <><span className="animate-spin">⏳</span> Synchronisation…</> : '🔄 Synchroniser le menu'}
          </button>
        </div>
      </div>

      {/* Webhook config */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="font-bold text-gray-800 mb-1">⚡ Mise à jour automatique (Webhook)</h2>
        <p className="text-sm text-gray-400 mb-3">
          Configurez Odoo pour appeler ce webhook quand un produit change.
          Le site se met à jour en quelques secondes.
        </p>
        <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm font-mono">
          <div className="flex items-center gap-2">
            <span className="text-gray-500">URL :</span>
            <code className="text-blue-600">https://linfini.gp/api/webhooks/odoo</code>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-500">Méthode :</span>
            <code className="text-green-600">POST</code>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-500">Header :</span>
            <code className="text-orange-600">x-odoo-secret: votre-secret</code>
          </div>
        </div>
        <p className="text-xs text-gray-400 mt-3">
          Dans Odoo : <strong>Paramètres → Technique → Actions automatisées</strong><br/>
          Modèle : <code>product.template</code> · Déclencheur : À la mise à jour
        </p>
      </div>

      {/* Notifications */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="font-bold text-gray-800 mb-1">🔔 Notifications cuisine</h2>
        <div className="space-y-3">
          {[
            { key: 'telegramToken', label: 'Telegram Bot Token', type: 'password', placeholder: 'bot123456:ABC...' },
            { key: 'telegramChatId', label: 'Telegram Chat ID', type: 'text', placeholder: '-100123456789' },
            { key: 'webhookUrl', label: 'Webhook URL (n8n, Zapier…)', type: 'url', placeholder: 'https://...' },
          ].map(f => (
            <div key={f.key}>
              <label className="block text-xs font-medium text-gray-500 mb-1">{f.label}</label>
              <input type={f.type} placeholder={f.placeholder}
                value={notif[f.key as keyof typeof notif]}
                onChange={e => setNotif(p => ({ ...p, [f.key]: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400" />
            </div>
          ))}
          <button onClick={() => setSavedNotif(true)}
            className="bg-braise text-white px-4 py-2 rounded-lg text-sm hover:bg-ambre transition-colors">
            Sauvegarder
          </button>
          {savedNotif && <p className="text-green-600 text-sm">✓ Sauvegardé</p>}
        </div>
      </div>

      {/* Liens rapides */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="font-bold text-gray-800 mb-3">Liens rapides</h2>
        <div className="space-y-2 text-sm">
          {[
            { label: 'Site vitrine', url: 'http://localhost:3000' },
            { label: 'App commandes', url: 'http://localhost:3001/table/T1' },
            { label: 'Écran cuisine', url: 'http://localhost:3002' },
            { label: 'Instagram', url: 'https://www.instagram.com/infinievents.gp/' },
          ].map(l => (
            <div key={l.label} className="flex justify-between border-b border-gray-50 py-1">
              <span className="text-gray-500">{l.label}</span>
              <a href={l.url} target="_blank" rel="noopener" className="text-blue-500 hover:underline text-xs">{l.url.replace('http://', '')}</a>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
