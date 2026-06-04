'use client'
import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import type { TableWithStatus } from '@/types'

const STATUS_COLORS: Record<string, string> = {
  FREE: 'bg-gray-800 border-gray-700 hover:border-amber-500',
  PENDING: 'bg-orange-950 border-orange-600 hover:border-orange-400',
  READY: 'bg-green-950 border-green-500 hover:border-green-400',
  OCCUPIED: 'bg-blue-950 border-blue-600 hover:border-blue-400',
}

const STATUS_LABELS: Record<string, string> = {
  FREE: 'Libre',
  PENDING: 'En cours',
  READY: 'Prêt',
  OCCUPIED: 'Servi',
}

export function TableMap() {
  const router = useRouter()
  const [tables, setTables] = useState<TableWithStatus[]>([])
  const [loading, setLoading] = useState(true)

  const fetchTables = useCallback(async () => {
    const res = await fetch('/api/tables')
    if (res.ok) {
      const data = await res.json()
      setTables(data)
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchTables()
    const interval = setInterval(fetchTables, 5000)
    return () => clearInterval(interval)
  }, [fetchTables])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-500">Chargement du plan...</div>
      </div>
    )
  }

  return (
    <div className="p-6 h-full overflow-auto">
      <div className="flex gap-4 mb-6 flex-wrap">
        {Object.entries(STATUS_LABELS).map(([k, v]) => (
          <div key={k} className="flex items-center gap-2 text-sm text-gray-400">
            <div className={`w-3 h-3 rounded-sm border ${STATUS_COLORS[k]}`} />
            {v}
          </div>
        ))}
      </div>

      <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))' }}>
        {tables.map((table) => (
          <button
            key={table.id}
            onClick={() => router.push(`/table/${table.id}`)}
            className={`border-2 rounded-xl p-4 text-left transition-all ${STATUS_COLORS[table.status]}`}
          >
            <div className="text-2xl font-bold text-white">{table.label}</div>
            <div className="text-xs text-gray-400 mt-1">{table.capacity} pers.</div>
            <div className={`text-xs font-medium mt-2 ${
              table.status === 'READY' ? 'text-green-400' :
              table.status === 'PENDING' ? 'text-orange-400' :
              table.status === 'OCCUPIED' ? 'text-blue-400' : 'text-gray-500'
            }`}>
              {STATUS_LABELS[table.status]}
            </div>
            {table.activeOrderTotal != null && (
              <div className="text-amber-400 font-bold text-sm mt-1">
                {table.activeOrderTotal.toFixed(2)} €
              </div>
            )}
          </button>
        ))}

        {/* Bouton Emporter */}
        <button
          onClick={() => router.push('/bar')}
          className="border-2 border-dashed border-gray-700 rounded-xl p-4 text-left hover:border-amber-500 transition-all"
        >
          <div className="text-2xl font-bold text-gray-400">🥡</div>
          <div className="text-sm text-gray-400 mt-1">À emporter</div>
          <div className="text-xs text-gray-600 mt-2">Sans table</div>
        </button>
      </div>
    </div>
  )
}
