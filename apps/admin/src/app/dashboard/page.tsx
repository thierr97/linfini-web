import { Suspense } from 'react'

async function getStats() {
  try {
    const { prisma } = await import('@linfini/db')
    const [totalOrders, revenueResult, pendingReservations, activeItems] = await Promise.all([
      prisma.order.count({ where: { status: { not: 'CANCELLED' } } }),
      prisma.order.aggregate({ where: { status: { not: 'CANCELLED' } }, _sum: { total: true } }),
      prisma.reservation.count({ where: { status: 'PENDING' } }),
      prisma.item.count({ where: { active: true } }),
    ])
    return { totalOrders, totalRevenue: revenueResult._sum.total ?? 0, pendingReservations, activeItems }
  } catch {
    return { totalOrders: 0, totalRevenue: 0, pendingReservations: 0, activeItems: 0 }
  }
}

export default async function DashboardPage() {
  const stats = await getStats()
  const fmt = (v: number) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(v)

  const cards = [
    { label: 'Commandes totales', value: stats.totalOrders.toString(), icon: '🍽️', color: 'bg-blue-50 border-blue-200' },
    { label: "Chiffre d'affaires", value: fmt(stats.totalRevenue), icon: '💶', color: 'bg-green-50 border-green-200' },
    { label: 'Réservations en attente', value: stats.pendingReservations.toString(), icon: '📅', color: 'bg-orange-50 border-orange-200' },
    { label: 'Produits actifs', value: stats.activeItems.toString(), icon: '🏷️', color: 'bg-purple-50 border-purple-200' },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Tableau de bord</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map(c => (
          <div key={c.label} className={`rounded-xl border p-5 ${c.color}`}>
            <div className="text-3xl mb-2">{c.icon}</div>
            <div className="text-2xl font-bold text-gray-900">{c.value}</div>
            <div className="text-sm text-gray-500 mt-1">{c.label}</div>
          </div>
        ))}
      </div>
      <div className="bg-white rounded-xl border p-6 text-center text-gray-400">
        <p className="text-sm">Connectez la base de données pour voir les graphiques en temps réel</p>
      </div>
    </div>
  )
}
