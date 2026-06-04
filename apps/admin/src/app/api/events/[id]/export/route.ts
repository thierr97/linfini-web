import { NextRequest, NextResponse } from 'next/server'

function escapeCsv(val: string | number | null | undefined): string {
  if (val === null || val === undefined) return ''
  const s = String(val)
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return `"${s.replace(/"/g, '""')}"`
  }
  return s
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: eventId } = await params

  try {
    const { prisma } = await import('@linfini/db')

    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: { title: true, date: true },
    })

    if (!event) {
      return NextResponse.json({ error: 'Événement introuvable.' }, { status: 404 })
    }

    const tickets = await prisma.ticket.findMany({
      where: { eventId },
      include: { ticketType: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
    })

    const headers = [
      'Prénom',
      'Nom',
      'Email',
      'Téléphone',
      'Type de billet',
      'Quantité',
      'Prix unitaire (€)',
      'Total (€)',
      'Statut',
      'Code billet',
      'Date achat',
      'Scanné le',
    ]

    const rows = tickets.map((t) => [
      escapeCsv(t.buyerFirstName),
      escapeCsv(t.buyerLastName),
      escapeCsv(t.buyerEmail),
      escapeCsv(t.buyerPhone),
      escapeCsv(t.ticketType?.name),
      escapeCsv(t.quantity),
      escapeCsv(t.unitPrice.toFixed(2)),
      escapeCsv(t.total.toFixed(2)),
      escapeCsv(t.status),
      escapeCsv(t.code),
      escapeCsv(new Date(t.createdAt).toLocaleString('fr-FR')),
      escapeCsv(t.scannedAt ? new Date(t.scannedAt).toLocaleString('fr-FR') : ''),
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map((r) => r.join(',')),
    ].join('\n')

    const dateStr = new Date(event.date).toISOString().split('T')[0]
    const filename = `billets_${event.title.toLowerCase().replace(/\s+/g, '-')}_${dateStr}.csv`

    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
  } catch (err) {
    console.error('[export] Erreur:', err)
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 })
  }
}
