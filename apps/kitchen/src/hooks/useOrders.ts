'use client'
import { useEffect, useState, useCallback } from 'react'

export interface KitchenOrder {
  id: string
  number: string
  table: string | null
  status: 'NEW' | 'PREP' | 'READY'
  total: number
  note: string | null
  sentAt: string
  lines: Array<{
    itemName: string
    modifiers: string[]
    note: string | null
  }>
}

export function useOrders() {
  const [orders, setOrders] = useState<KitchenOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [newOrderAlert, setNewOrderAlert] = useState(false)

  const fetchOrders = useCallback(async () => {
    const res = await fetch('/api/orders?status=NEW,PREP,READY')
    if (res.ok) {
      const data: KitchenOrder[] = await res.json()
      setOrders(prev => {
        const prevIds = new Set(prev.map(o => o.id))
        const hasNew = data.some(o => !prevIds.has(o.id) && o.status === 'NEW')
        if (hasNew) setNewOrderAlert(true)
        return data
      })
      setLoading(false)
    }
  }, [])

  const updateStatus = useCallback(async (id: string, status: string) => {
    await fetch(`/api/orders/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    await fetchOrders()
  }, [fetchOrders])

  useEffect(() => {
    fetchOrders()
    const interval = setInterval(fetchOrders, 5000)
    return () => clearInterval(interval)
  }, [fetchOrders])

  return { orders, loading, updateStatus, newOrderAlert, setNewOrderAlert }
}
