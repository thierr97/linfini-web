export const dynamic = 'force-dynamic'

const statusColor: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  CONFIRMED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700',
  COMPLETED: 'bg-gray-100 text-gray-500',
}

async function getReservations() {
  try {
    const { prisma } = await import('@linfini/db')
    return await prisma.reservation.findMany({
      orderBy: { date: 'asc' },
      where: { status: { in: ['PENDING', 'CONFIRMED'] } },
    })
  } catch { return [] }
}

export default async function ReservationsPage() {
  const reservations = await getReservations()
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Réservations</h1>
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              {['Nom', 'Date', 'Couverts', 'Contact', 'Statut'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-gray-500 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {reservations.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">Aucune réservation</td></tr>
            )}
            {reservations.map((r: any) => (
              <tr key={r.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">{r.name}</td>
                <td className="px-4 py-3">{new Date(r.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}</td>
                <td className="px-4 py-3">{r.guests} pers.</td>
                <td className="px-4 py-3 text-gray-400">{r.phone}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor[r.status] ?? ''}`}>{r.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
