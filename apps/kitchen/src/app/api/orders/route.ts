import { NextRequest, NextResponse } from 'next/server'

const MOCK_ORDERS = [
  {
    id: 'mock-1', number: '#001', table: 'Table 1', status: 'NEW', total: 18.5, note: null,
    sentAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    lines: [
      { itemName: 'Pizza 26cm — Sauce Tomate / Mozzarella', modifiers: ['Chorizo', 'Champignons', 'Lardons'], note: null },
    ]
  },
  {
    id: 'mock-2', number: '#002', table: 'Table 3', status: 'PREP', total: 24.0, note: 'Sans oignons',
    sentAt: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
    lines: [
      { itemName: 'Pizza 33cm — Crème fraîche / 4 Fromages', modifiers: ['Saumon 🌟', 'Poivrons'], note: null },
      { itemName: 'Salade Jeunes Pousses — César', modifiers: ['Poulet grillé', 'Parmesan', 'Croûtons'], note: 'Sans gluten' },
    ]
  },
]

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const statusParam = searchParams.get('status') || 'NEW,PREP,READY'
  const statuses = statusParam.split(',')

  try {
    const { prisma } = await import('@linfini/db')
    const orders = await prisma.order.findMany({
      where: { status: { in: statuses as any[] } },
      include: { table: true, lines: { include: { item: true } } },
      orderBy: { sentAt: 'asc' },
    })
    const formatted = orders.map((o: any) => ({
      id: o.id, number: o.number, table: o.table?.label ?? null, status: o.status,
      total: o.total, note: o.note, sentAt: o.sentAt.toISOString(),
      lines: o.lines.map((l: any) => ({
        itemName: l.item.name,
        modifiers: Array.isArray(l.modifiers) ? l.modifiers.map((m: any) => m.name) : [],
        note: l.note,
      })),
    }))
    return NextResponse.json(formatted)
  } catch { /* DB not available, return mock */ }

  return NextResponse.json(MOCK_ORDERS.filter(o => statuses.includes(o.status)))
}
