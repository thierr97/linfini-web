'use client'
// Écran de préparation du bar — commandes web payées en ligne.
// - Rafraîchissement auto (7 s) + bip à chaque nouvelle commande
// - Impression reçu 80 mm (bouton ou auto-print pour poste kiosque)
// - Retrait : scan douchette USB (saisie clavier), scan caméra, ou saisie du code
import { useCallback, useEffect, useRef, useState } from 'react'
import Code39 from '@/components/Code39'

interface Line { id: string; name: string; price: number; qty: number }
interface Order {
  id: string; code: string; customerName: string; note: string | null
  lines: Line[]; total: number; status: string
  odooRef: string | null; odooError: string | null; createdAt: string
}

const STATUS_LABEL: Record<string, string> = { NEW: '🆕 Nouvelle', PREP: '👨‍🍳 En préparation', READY: '✅ Prête', SERVED: 'Remise', CANCELLED: 'Annulée' }
const NEXT_ACTION: Record<string, { to: string; label: string } | undefined> = {
  NEW: { to: 'PREP', label: 'Lancer la préparation' },
  PREP: { to: 'READY', label: 'Marquer prête' },
  READY: { to: 'SERVED', label: 'Remise au client ✓' },
}

function timeHM(iso: string) {
  return new Date(iso).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
}

export default function BarPrepaPage() {
  const [pin, setPin] = useState<string | null>(null)
  const [pinInput, setPinInput] = useState('')
  const [pinError, setPinError] = useState(false)
  const [orders, setOrders] = useState<Order[]>([])
  const [highlight, setHighlight] = useState<string | null>(null)
  const [printOrder, setPrintOrder] = useState<Order | null>(null)
  const [autoPrint, setAutoPrint] = useState(false)
  const [scanBuffer, setScanBuffer] = useState('')
  const [cameraOpen, setCameraOpen] = useState(false)
  const knownIds = useRef<Set<string> | null>(null)
  const printedIds = useRef<Set<string>>(new Set())
  const audioCtx = useRef<AudioContext | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  // ── PIN ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    const saved = sessionStorage.getItem('staff_pin')
    if (saved) setPin(saved)
    setAutoPrint(localStorage.getItem('bar_autoprint') === '1')
    printedIds.current = new Set(JSON.parse(localStorage.getItem('bar_printed') ?? '[]'))
  }, [])

  const api = useCallback(async (init?: RequestInit & { qs?: string }) => {
    const res = await fetch(`/api/prepa${init?.qs ?? ''}`, {
      ...init,
      headers: { 'Content-Type': 'application/json', 'x-staff-pin': pin ?? '', ...(init?.headers ?? {}) },
    })
    if (res.status === 401) { sessionStorage.removeItem('staff_pin'); setPin(null); setPinError(true); throw new Error('PIN') }
    return res
  }, [pin])

  // ── Bip nouvelle commande ────────────────────────────────────────────────
  const beep = useCallback(() => {
    try {
      audioCtx.current = audioCtx.current ?? new AudioContext()
      const ctx = audioCtx.current
      const osc = ctx.createOscillator(); const gain = ctx.createGain()
      osc.connect(gain); gain.connect(ctx.destination)
      osc.frequency.value = 880; gain.gain.value = 0.25
      osc.start(); osc.stop(ctx.currentTime + 0.4)
    } catch { /* audio non dispo */ }
  }, [])

  const doPrint = useCallback((order: Order) => {
    setPrintOrder(order)
    setTimeout(() => { window.print(); setTimeout(() => setPrintOrder(null), 500) }, 150)
  }, [])

  // ── Polling ──────────────────────────────────────────────────────────────
  const refresh = useCallback(async () => {
    try {
      const res = await api()
      if (!res.ok) return
      const data: Order[] = await res.json()
      setOrders(data)
      if (knownIds.current) {
        const fresh = data.filter(o => !knownIds.current!.has(o.id) && o.status === 'NEW')
        if (fresh.length) {
          beep()
          if (autoPrint) {
            for (const o of fresh) {
              if (!printedIds.current.has(o.id)) {
                printedIds.current.add(o.id)
                localStorage.setItem('bar_printed', JSON.stringify([...printedIds.current].slice(-200)))
                doPrint(o)
                break // une impression à la fois ; la suivante partira au prochain cycle
              }
            }
          }
        }
      }
      knownIds.current = new Set(data.map(o => o.id))
    } catch { /* réseau : on retentera */ }
  }, [api, autoPrint, beep, doPrint])

  useEffect(() => {
    if (!pin) return
    refresh()
    const t = setInterval(refresh, 7000)
    return () => clearInterval(t)
  }, [pin, refresh])

  // ── Douchette USB : tape les chiffres + Entrée comme un clavier ─────────
  useEffect(() => {
    if (!pin) return
    let buffer = ''
    let last = 0
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.tagName === 'INPUT') return
      const now = Date.now()
      if (now - last > 400) buffer = ''
      last = now
      if (/^[0-9]$/.test(e.key)) { buffer += e.key; setScanBuffer(buffer) }
      else if (e.key === 'Enter' && buffer.length >= 4) { locateCode(buffer); buffer = ''; setScanBuffer('') }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pin, orders])

  const locateCode = (code: string) => {
    const order = orders.find(o => o.code === code.padStart(6, '0') || o.code === code)
    if (!order) { alert(`Code ${code} introuvable dans les commandes récentes.`); return }
    setHighlight(order.id)
    document.getElementById(`order-${order.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    setTimeout(() => setHighlight(null), 6000)
  }

  // ── Scan caméra (BarcodeDetector : QR + code39) ──────────────────────────
  useEffect(() => {
    if (!cameraOpen) return
    let stream: MediaStream | null = null
    let stop = false
    ;(async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
        if (videoRef.current) { videoRef.current.srcObject = stream; await videoRef.current.play() }
        const Detector = (window as any).BarcodeDetector
        if (!Detector) { alert('Scan caméra non supporté sur ce navigateur — utilisez la saisie ou la douchette.'); setCameraOpen(false); return }
        const detector = new Detector({ formats: ['qr_code', 'code_39', 'code_128'] })
        const loop = async () => {
          if (stop || !videoRef.current) return
          try {
            const codes = await detector.detect(videoRef.current)
            const digits = codes.map((c: any) => String(c.rawValue).replace(/[^0-9]/g, '')).find((v: string) => v.length >= 4)
            if (digits) { setCameraOpen(false); locateCode(digits); return }
          } catch { /* frame suivante */ }
          requestAnimationFrame(loop)
        }
        loop()
      } catch { alert('Caméra inaccessible.'); setCameraOpen(false) }
    })()
    return () => { stop = true; stream?.getTracks().forEach(t => t.stop()) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cameraOpen])

  const setStatus = async (o: Order, status: string) => {
    await api({ method: 'PATCH', body: JSON.stringify({ id: o.id, status }) })
    refresh()
  }
  const syncOdoo = async (o: Order) => {
    await api({ method: 'PATCH', body: JSON.stringify({ id: o.id, action: 'sync-odoo' }) })
    refresh()
  }

  // ── Écran PIN ────────────────────────────────────────────────────────────
  if (!pin) {
    return (
      <div className="min-h-screen bg-noir flex items-center justify-center p-4">
        <form
          onSubmit={e => { e.preventDefault(); sessionStorage.setItem('staff_pin', pinInput); setPin(pinInput); setPinError(false) }}
          className="bg-charbon border border-white/10 rounded-2xl p-8 w-full max-w-sm text-center"
        >
          <h1 className="text-creme font-bold text-2xl mb-1">🍹 Préparation Bar</h1>
          <p className="text-white/40 text-sm mb-6">Écran réservé au personnel</p>
          {pinError && <p className="text-red-400 text-sm mb-3">PIN incorrect</p>}
          <input
            type="password" inputMode="numeric" autoFocus value={pinInput}
            onChange={e => setPinInput(e.target.value)}
            placeholder="Code PIN"
            className="w-full text-center text-2xl tracking-widest bg-noir border border-white/20 rounded-xl px-4 py-3 text-creme mb-4 focus:outline-none focus:border-braise"
          />
          <button className="w-full bg-braise hover:bg-ambre text-white font-bold py-3 rounded-xl transition-colors">Entrer</button>
        </form>
      </div>
    )
  }

  const active = orders.filter(o => ['NEW', 'PREP', 'READY'].includes(o.status))
  const served = orders.filter(o => o.status === 'SERVED')

  return (
    {/* Pas de print:hidden ici : le reçu .receipt-print est un enfant de ce div,
        un parent display:none le rendrait ininprimable (page blanche).
        L'écran est déjà masqué à l'impression par `body * { visibility: hidden }`. */}
    <div className="min-h-screen bg-noir text-creme p-4 sm:p-6">
      {/* Barre du haut */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <h1 className="font-bold text-2xl mr-auto">🍹 Préparation — commandes web</h1>
        <span className="text-white/30 text-sm">{scanBuffer && `Scan : ${scanBuffer}`}</span>
        <button onClick={() => setCameraOpen(true)}
          className="bg-charbon border border-white/15 hover:border-braise px-4 py-2 rounded-full text-sm font-semibold">
          📷 Scanner caméra
        </button>
        <label className="flex items-center gap-2 text-sm bg-charbon border border-white/15 px-4 py-2 rounded-full cursor-pointer">
          <input type="checkbox" checked={autoPrint}
            onChange={e => { setAutoPrint(e.target.checked); localStorage.setItem('bar_autoprint', e.target.checked ? '1' : '0') }} />
          Impression auto
        </label>
        <form onSubmit={e => { e.preventDefault(); const v = (e.currentTarget.elements.namedItem('c') as HTMLInputElement); if (v.value) { locateCode(v.value); v.value = '' } }}>
          <input name="c" inputMode="numeric" placeholder="Code retrait…" className="bg-charbon border border-white/15 rounded-full px-4 py-2 text-sm w-36 focus:outline-none focus:border-braise" />
        </form>
      </div>

      {/* Commandes actives */}
      {active.length === 0 && <p className="text-white/30 text-center py-20">Aucune commande en cours. Les nouvelles commandes apparaissent automatiquement.</p>}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {active.map(o => (
          <div key={o.id} id={`order-${o.id}`}
            className={`rounded-2xl border p-5 transition-all ${highlight === o.id ? 'border-or ring-4 ring-or/40 bg-or/10' : o.status === 'NEW' ? 'border-braise/60 bg-braise/5' : o.status === 'READY' ? 'border-green-500/50 bg-green-900/10' : 'border-white/10 bg-charbon'}`}>
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="font-display font-bold text-3xl tracking-wider">#{o.code}</p>
                <p className="text-white/50 text-sm">{o.customerName} · {timeHM(o.createdAt)}</p>
              </div>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-noir border border-white/10">{STATUS_LABEL[o.status]}</span>
            </div>
            <div className="mb-3 space-y-1">
              {o.lines.map((l, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span><b className="text-ambre">{l.qty} ×</b> {l.name}</span>
                  <span className="text-white/40">{(l.price * l.qty).toFixed(2)} €</span>
                </div>
              ))}
              {o.note && <p className="text-or/80 text-sm pt-1">📝 {o.note}</p>}
            </div>
            <div className="flex items-center justify-between text-sm mb-4">
              <span className="font-bold text-or">{o.total.toFixed(2)} € — payé en ligne ✓</span>
              {o.odooRef
                ? <span className="text-green-400/80 text-xs">Caisse ✓ {o.odooRef}</span>
                : <button onClick={() => syncOdoo(o)} title={o.odooError ?? ''} className="text-amber-400 text-xs underline">⚠ Renvoyer en caisse</button>}
            </div>
            <div className="flex gap-2">
              {NEXT_ACTION[o.status] && (
                <button onClick={() => setStatus(o, NEXT_ACTION[o.status]!.to)}
                  className="flex-1 bg-braise hover:bg-ambre text-white font-bold py-2.5 rounded-xl text-sm transition-colors">
                  {NEXT_ACTION[o.status]!.label}
                </button>
              )}
              <button onClick={() => doPrint(o)} className="bg-charbon border border-white/15 hover:border-white/40 px-4 rounded-xl text-sm">🖨️</button>
            </div>
          </div>
        ))}
      </div>

      {served.length > 0 && (
        <p className="text-white/25 text-sm mt-8">Remises aujourd&apos;hui : {served.length} commande{served.length > 1 ? 's' : ''} ({served.map(o => `#${o.code}`).join(', ')})</p>
      )}

      {/* Modal caméra */}
      {cameraOpen && (
        <div className="fixed inset-0 z-50 bg-noir/90 flex flex-col items-center justify-center p-4" onClick={() => setCameraOpen(false)}>
          <video ref={videoRef} className="w-full max-w-md rounded-2xl" muted playsInline />
          <p className="text-white/60 mt-4">Visez le QR code ou le code-barres…</p>
          <button className="mt-3 text-white/40 underline">Fermer</button>
        </div>
      )}

      {/* Reçu impression 80mm */}
      {printOrder && (
        <div className="receipt-print">
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontWeight: 'bold', fontSize: 14, margin: 0 }}>L&apos;INFINI — SMILE BAR</p>
            <p style={{ fontSize: 11, margin: '2px 0 8px' }}>Commande WEB — PAYÉ PAR INTERNET</p>
            <p style={{ fontSize: 26, fontWeight: 'bold', letterSpacing: 6, margin: '4px 0' }}>#{printOrder.code}</p>
            <Code39 value={printOrder.code} height={50} />
            <p style={{ fontSize: 11, margin: '6px 0' }}>{printOrder.customerName} · {timeHM(printOrder.createdAt)}</p>
          </div>
          <hr style={{ border: 'none', borderTop: '1px dashed #000', margin: '6px 0' }} />
          {printOrder.lines.map((l, i) => (
            <p key={i} style={{ fontSize: 12, margin: '3px 0', display: 'flex', justifyContent: 'space-between' }}>
              <span>{l.qty} × {l.name}</span><span>{(l.price * l.qty).toFixed(2)}€</span>
            </p>
          ))}
          {printOrder.note && <p style={{ fontSize: 11, margin: '6px 0' }}>Note : {printOrder.note}</p>}
          <hr style={{ border: 'none', borderTop: '1px dashed #000', margin: '6px 0' }} />
          <p style={{ fontSize: 13, fontWeight: 'bold', display: 'flex', justifyContent: 'space-between' }}>
            <span>TOTAL (payé en ligne)</span><span>{printOrder.total.toFixed(2)}€</span>
          </p>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        .receipt-print { display: none; }
        @media print {
          body * { visibility: hidden; }
          .receipt-print, .receipt-print * { visibility: visible; }
          .receipt-print { display: block; position: absolute; left: 0; top: 0; width: 72mm; padding: 4mm; background: #fff; color: #000; }
          @page { size: 80mm auto; margin: 0; }
        }
      ` }} />
    </div>
  )
}
