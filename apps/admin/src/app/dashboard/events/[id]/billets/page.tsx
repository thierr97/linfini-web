export const dynamic = 'force-dynamic'

import { notFound } from 'next/navigation'
import Link from 'next/link'
import BilletActions from './BilletActions'

async function getEventWithTickets(id: string) {
  try {
    const { prisma } = await import('@linfini/db')
    return await prisma.event.findUnique({
      where: { id },
      include: {
        ticketTypes: true,
        tickets: {
          include: { ticketType: true },
          orderBy: { createdAt: 'desc' },
        },
      },
    })
  } catch {
    return null
  }
}

const STATUS_LABELS: Record<string, string> = {
  RESERVED: 'Réservé',
  PAID: 'Payé',
  CONFIRMED: 'Confirmé',
  USED: 'Utilisé',
  CANCELLED: 'Annulé',
  REFUNDED: 'Remboursé',
}

const STATUS_CLASSES: Record<string, string> = {
  RESERVED: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  PAID: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  CONFIRMED: 'bg-green-500/20 text-green-400 border-green-500/30',
  USED: 'bg-white/10 text-white/50 border-white/10',
  CANCELLED: 'bg-red-500/20 text-red-400 border-red-500/30',
  REFUNDED: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
}

export default async function BilletsPage({ params }: { params: Promise<{ id: string }> }) {
  const event = await getEventWithTickets((await params).id)
  if (!event) notFound()

  const validStatuses = ['PAID', 'CONFIRMED', 'USED']
  const paidTickets = event.tickets.filter((t: any) => validStatuses.includes(t.status))
  const totalRevenue = paidTickets.reduce((sum: number, t: any) => sum + t.total, 0)
  const totalSold = paidTickets.reduce((sum: number, t: any) => sum + t.quantity, 0)

  const byType = event.ticketTypes.map((tt: any) => {
    const typeTickets = paidTickets.filter((t: any) => t.ticketTypeId === tt.id)
    const qtySold = typeTickets.reduce((sum: number, t: any) => sum + t.quantity, 0)
    return { name: tt.name, sold: qtySold, total: tt.quantity, revenue: typeTickets.reduce((sum: number, t: any) => sum + t.total, 0) }
  })

  return (
    <div className="min-h-screen bg-noir text-white">
      <div className="flex items-center gap-4 mb-6">
        <Link href={`/dashboard/events/${event.id}`} className="text-white/40 hover:text-white transition-colors text-sm">
          ← Retour à l'événement
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">{event.title}</h1>
        <p className="text-white/40 text-sm mt-1">
          {new Date(event.date).toLocaleDateString('fr-FR', {
            weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
            hour: '2-digit', minute: '2-digit',
          })}
        </p>
      </div>

      {/* Stats globales */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-charbon rounded-xl border border-white/10 p-4">
          <div className="text-2xl font-bold text-white">{event.tickets.length}</div>
          <div className="text-sm text-white/40 mt-1">Commandes totales</div>
        </div>
        <div className="bg-charbon rounded-xl border border-white/10 p-4">
          <div className="text-2xl font-bold text-white">{totalSold}</div>
          <div className="text-sm text-white/40 mt-1">Billets vendus</div>
        </div>
        <div className="bg-charbon rounded-xl border border-white/10 p-4">
          <div className="text-2xl font-bold text-or">{totalRevenue.toFixed(2)} €</div>
          <div className="text-sm text-white/40 mt-1">Chiffre d'affaires</div>
        </div>
        <div className="bg-charbon rounded-xl border border-white/10 p-4">
          <div className="text-2xl font-bold text-white">
            {event.tickets.filter((t: any) => t.status === 'USED').length}
          </div>
          <div className="text-sm text-white/40 mt-1">Billets scannés</div>
        </div>
      </div>

      {/* Stats par type */}
      {byType.length > 0 && (
        <div className="bg-charbon rounded-xl border border-white/10 p-5 mb-6">
          <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-4">Ventes par type de billet</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {byType.map((tt: any) => (
              <div key={tt.name} className="bg-noir/50 rounded-lg border border-white/5 p-3">
                <div className="font-medium text-white text-sm">{tt.name}</div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-white/40 text-xs">{tt.sold} / {tt.total} vendus</span>
                  <span className="text-or text-sm font-medium">{tt.revenue.toFixed(2)} €</span>
                </div>
                <div className="mt-2 h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-braise rounded-full"
                    style={{ width: `${tt.total > 0 ? (tt.sold / tt.total) * 100 : 0}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tableau des billets */}
      {event.tickets.length === 0 ? (
        <div className="bg-charbon rounded-xl border border-white/10 p-16 text-center">
          <div className="text-4xl mb-4">🎫</div>
          <p className="text-white/40">Aucun billet vendu pour cet événement</p>
        </div>
      ) : (
        <div className="bg-charbon rounded-xl border border-white/10 overflow-hidden">
          <div className="p-5 border-b border-white/10">
            <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider">Liste des billets</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left px-5 py-3 text-xs text-white/40 font-medium">Acheteur</th>
                  <th className="text-left px-5 py-3 text-xs text-white/40 font-medium">Email</th>
                  <th className="text-left px-5 py-3 text-xs text-white/40 font-medium">Type</th>
                  <th className="text-center px-5 py-3 text-xs text-white/40 font-medium">Qté</th>
                  <th className="text-right px-5 py-3 text-xs text-white/40 font-medium">Total</th>
                  <th className="text-center px-5 py-3 text-xs text-white/40 font-medium">Statut</th>
                  <th className="text-left px-5 py-3 text-xs text-white/40 font-medium">Date</th>
                  <th className="px-5 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {event.tickets.map((ticket: any) => (
                  <tr key={ticket.id} className="border-b border-white/5 hover:bg-white/2 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="text-sm font-medium text-white">
                        {ticket.buyerFirstName} {ticket.buyerLastName}
                      </div>
                      {ticket.buyerPhone && (
                        <div className="text-xs text-white/30">{ticket.buyerPhone}</div>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-sm text-white/60">{ticket.buyerEmail}</td>
                    <td className="px-5 py-3.5 text-sm text-white/70">{ticket.ticketType?.name ?? '—'}</td>
                    <td className="px-5 py-3.5 text-sm text-white text-center">{ticket.quantity}</td>
                    <td className="px-5 py-3.5 text-sm text-or font-medium text-right">{ticket.total.toFixed(2)} €</td>
                    <td className="px-5 py-3.5 text-center">
                      <span className={`inline-block text-xs border px-2 py-0.5 rounded-full font-medium ${STATUS_CLASSES[ticket.status] ?? 'bg-white/5 text-white/40 border-white/10'}`}>
                        {STATUS_LABELS[ticket.status] ?? ticket.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-white/30 whitespace-nowrap">
                      {new Date(ticket.createdAt).toLocaleDateString('fr-FR', {
                        day: 'numeric', month: 'short', year: 'numeric',
                      })}
                    </td>
                    <td className="px-5 py-3.5">
                      {ticket.status !== 'USED' && ticket.status !== 'CANCELLED' && ticket.status !== 'REFUNDED' && (
                        <BilletActions ticketId={ticket.id} eventId={event.id} currentStatus={ticket.status} />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
