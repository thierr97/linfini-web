'use client'
import { useOrders } from '@/hooks/useOrders'
import OrderCard from './OrderCard'
import { useEffect } from 'react'

const COLUMNS: { status: 'NEW' | 'PREP' | 'READY'; label: string; color: string; emoji: string }[] = [
  { status: 'NEW',  label: 'Nouvelles',    color: 'border-red-500',    emoji: '🔴' },
  { status: 'PREP', label: 'En préparation', color: 'border-ambre',   emoji: '🟠' },
  { status: 'READY', label: 'Prêtes',      color: 'border-green-500', emoji: '🟢' },
]

export default function KitchenBoard() {
  const { orders, loading, updateStatus, newOrderAlert, setNewOrderAlert } = useOrders()

  useEffect(() => {
    if (newOrderAlert) {
      try {
        const audio = new Audio('data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAA...')
        audio.play().catch(() => {})
      } catch {}
      setTimeout(() => setNewOrderAlert(false), 3000)
    }
  }, [newOrderAlert, setNewOrderAlert])

  if (loading) {
    return (
      <div className="min-h-screen bg-noir flex items-center justify-center">
        <div className="text-white/40 text-xl animate-pulse">Chargement des commandes...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-noir p-4">
      {/* Header */}
      <header className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
        <div>
          <h1 className="text-2xl font-bold text-or">L'Infini — Cuisine</h1>
          <p className="text-white/40 text-sm">
            {orders.length} commande{orders.length !== 1 ? 's' : ''} active{orders.length !== 1 ? 's' : ''}
          </p>
        </div>
        {newOrderAlert && (
          <div className="bg-red-500 text-white px-4 py-2 rounded-xl font-bold animate-pulse">
            🔔 Nouvelle commande !
          </div>
        )}
        <div className="text-white/30 text-sm">
          {new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
        </div>
      </header>

      {/* Kanban */}
      <div className="grid grid-cols-3 gap-4">
        {COLUMNS.map(col => {
          const colOrders = orders.filter(o => o.status === col.status)
          return (
            <div key={col.status} className="space-y-3">
              <div className={`flex items-center gap-2 pb-2 border-b-2 ${col.color}`}>
                <span>{col.emoji}</span>
                <span className="font-bold text-creme">{col.label}</span>
                <span className="ml-auto bg-white/10 text-white/60 text-xs px-2 py-0.5 rounded-full">
                  {colOrders.length}
                </span>
              </div>
              {colOrders.length === 0 && (
                <div className="text-center py-8 text-white/20 text-sm border-2 border-dashed border-white/10 rounded-xl">
                  Aucune commande
                </div>
              )}
              {colOrders.map(order => (
                <OrderCard key={order.id} order={order} onUpdateStatus={updateStatus} />
              ))}
            </div>
          )
        })}
      </div>
    </div>
  )
}
