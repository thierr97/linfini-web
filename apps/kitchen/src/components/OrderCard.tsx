'use client'
import { useState, useEffect } from 'react'
import { KitchenOrder } from '@/hooks/useOrders'

interface Props {
  order: KitchenOrder
  onUpdateStatus: (id: string, status: string) => Promise<void>
}

function useElapsed(sentAt: string) {
  const [elapsed, setElapsed] = useState(0)
  useEffect(() => {
    const update = () => setElapsed(Math.floor((Date.now() - new Date(sentAt).getTime()) / 1000))
    update()
    const i = setInterval(update, 1000)
    return () => clearInterval(i)
  }, [sentAt])
  return elapsed
}

const NEXT_STATUS: Record<string, { label: string; status: string; color: string }> = {
  NEW:  { label: '→ En préparation', status: 'PREP',    color: 'bg-ambre hover:bg-ambre/80' },
  PREP: { label: '→ Prête',          status: 'READY',   color: 'bg-green-600 hover:bg-green-500' },
  READY:{ label: '→ Servie',         status: 'SERVED',  color: 'bg-blue-600 hover:bg-blue-500' },
}

export default function OrderCard({ order, onUpdateStatus }: Props) {
  const elapsed = useElapsed(order.sentAt)
  const mins = Math.floor(elapsed / 60)
  const secs = elapsed % 60
  const isUrgent = elapsed > 600 // 10 min
  const next = NEXT_STATUS[order.status]

  return (
    <div className={`bg-charbon rounded-xl border p-4 space-y-3 ${
      isUrgent ? 'border-red-500/60 shadow-[0_0_15px_rgba(200,75,31,0.3)]' : 'border-white/10'
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="font-bold text-or text-lg">{order.number}</span>
        <div className={`text-sm font-mono px-2 py-0.5 rounded-lg ${
          isUrgent ? 'bg-red-500/20 text-red-400' : 'bg-white/5 text-white/40'
        }`}>
          {mins > 0 ? `${mins}m ` : ''}{String(secs).padStart(2, '0')}s
        </div>
      </div>

      {order.table && (
        <div className="text-sm text-white/50">📋 {order.table}</div>
      )}

      {/* Lines */}
      <div className="space-y-2 border-t border-white/5 pt-3">
        {order.lines.map((line, i) => (
          <div key={i}>
            <p className="text-creme font-medium text-sm">{line.itemName}</p>
            {line.modifiers.length > 0 && (
              <ul className="mt-0.5 space-y-0.5">
                {line.modifiers.map((m, j) => (
                  <li key={j} className="text-xs text-white/40 pl-2">• {m}</li>
                ))}
              </ul>
            )}
            {line.note && <p className="text-xs text-ambre/60 italic pl-2">📝 {line.note}</p>}
          </div>
        ))}
      </div>

      {order.note && (
        <div className="bg-ambre/10 border border-ambre/20 rounded-lg p-2 text-sm text-ambre/80">
          📝 {order.note}
        </div>
      )}

      {/* Total */}
      <div className="flex justify-between items-center border-t border-white/5 pt-2 text-sm">
        <span className="text-white/40">Total</span>
        <span className="text-ambre font-bold">{order.total.toFixed(2).replace('.', ',')} €</span>
      </div>

      {/* Action */}
      {next && (
        <button
          onClick={() => onUpdateStatus(order.id, next.status)}
          className={`w-full py-2 rounded-lg text-white text-sm font-medium transition-colors ${next.color}`}
        >
          {next.label}
        </button>
      )}
    </div>
  )
}
