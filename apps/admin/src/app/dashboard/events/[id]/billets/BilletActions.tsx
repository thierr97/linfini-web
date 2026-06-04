'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function BilletActions({
  ticketId,
  eventId,
  currentStatus,
}: {
  ticketId: string
  eventId: string
  currentStatus: string
}) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const markUsed = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/events/${eventId}/tickets/${ticketId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'USED' }),
      })
      if (!res.ok) throw new Error('Erreur')
      router.refresh()
    } catch {
      alert('Erreur lors de la mise à jour du statut')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={markUsed}
      disabled={loading}
      className="text-xs text-white/40 hover:text-white border border-white/10 hover:border-white/20 px-2.5 py-1 rounded-lg transition-colors disabled:opacity-50 whitespace-nowrap"
    >
      {loading ? '...' : 'Marquer utilisé'}
    </button>
  )
}
