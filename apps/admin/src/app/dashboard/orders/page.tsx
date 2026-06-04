export const dynamic = 'force-dynamic'

const statusColor: Record<string, string> = {
  NEW: 'bg-red-100 text-red-700',
  PREP: 'bg-orange-100 text-orange-700',
  READY: 'bg-green-100 text-green-700',
  SERVED: 'bg-blue-100 text-blue-700',
  CANCELLED: 'bg-gray-100 text-gray-500',
}

async function getOrders() {
  try {
    const { prisma } = await import('@linfini/db')
    return await prisma.order.findMany({
      include: { table: true, lines: { include: { item: true } } },
      orderBy: { sentAt: 'desc' },
      take: 100,
    })
  } catch { return [] }
}

export default async function OrdersPage() {
  const orders = await getOrders()
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Commandes</h1>
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              {['#', 'Table', 'Statut', 'Total', 'Heure'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-gray-500 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {orders.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">Aucune commande</td></tr>
            )}
            {orders.map((o: any) => (
              <tr key={o.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-bold text-gray-900">{o.number}</td>
                <td className="px-4 py-3 text-gray-600">{o.table?.label ?? '—'}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor[o.status] ?? ''}`}>{o.status}</span>
                </td>
                <td className="px-4 py-3 font-medium">{o.total.toFixed(2)} €</td>
                <td className="px-4 py-3 text-gray-400">
                  {new Date(o.sentAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
