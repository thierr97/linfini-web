'use client'
import { NavBar } from '@/components/NavBar'
import { useEffect, useRef, useState } from 'react'
import { TVA } from '@/lib/db'

interface Contractor {
  id: string
  firstName: string
  lastName: string
  phone: string
  email: string
  role: string
  payments: Payment[]
}

interface Payment {
  id: string
  amount: number
  description: string
  method: string
  createdAt: string
  event?: { title: string }
}

export default function PrestatairesPage() {
  const [contractors, setContractors] = useState<Contractor[]>([])
  const [selected, setSelected] = useState<Contractor | null>(null)
  const [showAdd, setShowAdd] = useState(false)
  const [showPay, setShowPay] = useState(false)
  const [form, setForm] = useState({ firstName: '', lastName: '', phone: '', email: '', role: '' })
  const [payForm, setPayForm] = useState({ amount: '', description: '', method: 'CASH', eventId: '' })
  const printRef = useRef<HTMLDivElement>(null)

  const refresh = () => fetch('/api/contractors').then(r => r.json()).then(setContractors)
  useEffect(() => { refresh() }, [])

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    await fetch('/api/contractors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    setShowAdd(false)
    setForm({ firstName: '', lastName: '', phone: '', email: '', role: '' })
    refresh()
  }

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selected) return
    const res = await fetch('/api/contractors/pay', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contractorId: selected.id,
        amount: parseFloat(payForm.amount),
        description: payForm.description,
        method: payForm.method,
        eventId: payForm.eventId || null,
      }),
    })
    const { payment } = await res.json()
    setShowPay(false)
    printPaymentReceipt(selected, payment)
    refresh()
    // Refresh selected
    const updated = contractors.find(c => c.id === selected.id)
    if (updated) setSelected({ ...updated, payments: [payment, ...(updated.payments || [])] })
  }

  const printPaymentReceipt = (c: Contractor, p: any) => {
    const w = window.open('', '_blank', 'width=300,height=500')
    if (!w) return
    w.document.write(`
      <html><head><title>Reçu prestataire</title><style>
        body { font-family: monospace; font-size: 12px; width: 280px; margin: 0 auto; padding: 10px; }
        h2, .center { text-align: center; }
        .line { display: flex; justify-content: space-between; margin: 4px 0; }
        .bold { font-weight: bold; }
        hr { border-top: 1px dashed #000; margin: 8px 0; }
      </style></head><body>
      <h2>L'INFINI</h2>
      <div class="center">REÇU DE PAIEMENT PRESTATAIRE</div>
      <hr/>
      <div class="line"><span>Prestataire:</span><span class="bold">${c.firstName} ${c.lastName}</span></div>
      ${c.role ? `<div class="line"><span>Rôle:</span><span>${c.role}</span></div>` : ''}
      ${c.phone ? `<div class="line"><span>Tél:</span><span>${c.phone}</span></div>` : ''}
      <hr/>
      <div class="line"><span>Prestation:</span><span>${p.description}</span></div>
      <div class="line"><span>Mode:</span><span>${p.method === 'CASH' ? 'Espèces' : p.method === 'CARD' ? 'Carte' : 'Mixte'}</span></div>
      <hr/>
      <div class="line bold"><span>MONTANT PAYÉ:</span><span>${parseFloat(p.amount).toFixed(2)} €</span></div>
      <hr/>
      <div class="center">Date: ${new Date().toLocaleString('fr-FR')}</div>
      <br/>
      <div class="line"><span>Signature prestataire:</span><span></span></div>
      <br/><br/>
      <div style="border-bottom: 1px solid #000; width: 100%;"></div>
      <br/>
      <div class="line"><span>Signature employeur:</span><span></span></div>
      <br/><br/>
      <div style="border-bottom: 1px solid #000; width: 100%;"></div>
      <div class="center" style="margin-top: 16px; font-size: 10px;">Document à conserver — L'Infini Club, Le Gosier, Guadeloupe</div>
      </body></html>
    `)
    w.document.close()
    setTimeout(() => w.print(), 300)
  }

  return (
    <div className="flex flex-col h-screen">
      <NavBar />
      <div className="flex-1 overflow-hidden flex">
        {/* Liste prestataires */}
        <div className="w-72 bg-gray-900 border-r border-gray-800 flex flex-col">
          <div className="p-3 border-b border-gray-800 flex justify-between items-center">
            <span className="font-semibold text-gray-300">Prestataires</span>
            <button onClick={() => setShowAdd(true)} className="text-xs bg-amber-500 hover:bg-amber-400 text-black px-2 py-1 rounded-lg font-semibold">+ Nouveau</button>
          </div>
          <div className="flex-1 overflow-y-auto divide-y divide-gray-800">
            {contractors.length === 0 && <div className="p-4 text-gray-600 text-sm">Aucun prestataire</div>}
            {contractors.map(c => (
              <button key={c.id} onClick={() => setSelected(c)}
                className={`w-full text-left p-3 hover:bg-gray-800 transition-colors ${selected?.id === c.id ? 'bg-gray-800 border-l-2 border-amber-500' : ''}`}>
                <div className="font-medium text-white text-sm">{c.firstName} {c.lastName}</div>
                {c.role && <div className="text-xs text-gray-500">{c.role}</div>}
                <div className="text-xs text-gray-600 mt-1">{c.payments?.length || 0} paiements</div>
              </button>
            ))}
          </div>
        </div>

        {/* Détail prestataire */}
        <div className="flex-1 p-6 overflow-y-auto">
          {!selected ? (
            <div className="flex items-center justify-center h-full text-gray-600">
              Sélectionner un prestataire
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold text-white">{selected.firstName} {selected.lastName}</h2>
                  {selected.role && <div className="text-amber-400">{selected.role}</div>}
                  <div className="text-gray-400 text-sm mt-1 space-y-0.5">
                    {selected.phone && <div>📞 {selected.phone}</div>}
                    {selected.email && <div>✉️ {selected.email}</div>}
                  </div>
                </div>
                <button onClick={() => { setShowPay(true); setPayForm({ amount: '', description: '', method: 'CASH', eventId: '' }) }}
                  className="bg-green-600 hover:bg-green-500 text-white font-semibold px-4 py-2 rounded-xl transition-colors">
                  💰 Payer
                </button>
              </div>

              {/* Total payé */}
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                <div className="text-gray-400 text-sm">Total payé</div>
                <div className="text-2xl font-bold text-amber-400 mt-1">
                  {(selected.payments?.reduce((s, p) => s + p.amount, 0) || 0).toFixed(2)} €
                </div>
              </div>

              {/* Historique paiements */}
              <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
                <div className="p-3 border-b border-gray-800 font-semibold text-gray-300 text-sm">Historique des paiements</div>
                <div className="divide-y divide-gray-800">
                  {(!selected.payments || selected.payments.length === 0) && (
                    <div className="p-4 text-gray-600 text-sm">Aucun paiement</div>
                  )}
                  {selected.payments?.map((p) => (
                    <div key={p.id} className="p-4 flex justify-between items-start">
                      <div>
                        <div className="text-white text-sm">{p.description}</div>
                        <div className="text-gray-500 text-xs">{new Date(p.createdAt).toLocaleString('fr-FR')} — {p.method === 'CASH' ? 'Espèces' : 'Carte'}</div>
                        {p.event && <div className="text-xs text-amber-400 mt-0.5">Événement: {p.event.title}</div>}
                      </div>
                      <div className="text-red-400 font-bold shrink-0">{p.amount.toFixed(2)} €</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal ajout prestataire */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-2xl w-full max-w-md border border-gray-700 p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">Nouveau prestataire</h2>
              <button onClick={() => setShowAdd(false)} className="text-gray-500 hover:text-white">✕</button>
            </div>
            <form onSubmit={handleAdd} className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <input required placeholder="Prénom" value={form.firstName} onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))}
                  className="bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-amber-500 outline-none" />
                <input required placeholder="Nom" value={form.lastName} onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))}
                  className="bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-amber-500 outline-none" />
              </div>
              <input placeholder="Rôle (ex: DJ, Sécurité...)" value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-amber-500 outline-none" />
              <input placeholder="Téléphone" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-amber-500 outline-none" />
              <input placeholder="Email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-amber-500 outline-none" />
              <button type="submit" className="w-full bg-amber-500 hover:bg-amber-400 text-black font-bold py-3 rounded-xl">Créer</button>
            </form>
          </div>
        </div>
      )}

      {/* Modal paiement prestataire */}
      {showPay && selected && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-2xl w-full max-w-md border border-gray-700 p-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-xl font-bold text-white">Payer {selected.firstName} {selected.lastName}</h2>
                {selected.role && <div className="text-gray-400 text-sm">{selected.role}</div>}
              </div>
              <button onClick={() => setShowPay(false)} className="text-gray-500 hover:text-white">✕</button>
            </div>
            <form onSubmit={handlePay} className="space-y-3">
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Montant (€)</label>
                <input type="number" required min="0.01" step="0.01" value={payForm.amount} onChange={e => setPayForm(f => ({ ...f, amount: e.target.value }))}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white text-xl text-center focus:border-amber-500 outline-none" placeholder="0.00" />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Description de la prestation</label>
                <input required placeholder="Ex: DJ set soirée 29/03, Agent de sécurité..." value={payForm.description} onChange={e => setPayForm(f => ({ ...f, description: e.target.value }))}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-amber-500 outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                {['CASH', 'CARD'].map(m => (
                  <button key={m} type="button" onClick={() => setPayForm(f => ({ ...f, method: m }))}
                    className={`py-2 rounded-xl text-sm font-medium transition-colors ${payForm.method === m ? 'bg-amber-500 text-black' : 'bg-gray-800 text-gray-300'}`}>
                    {m === 'CASH' ? '💵 Espèces' : '💳 Carte'}
                  </button>
                ))}
              </div>
              <button type="submit"
                className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-3 rounded-xl transition-colors">
                ✅ Payer & Imprimer reçu
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
