import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'

const memOrders: any[] = []
let counter = 1

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { tableId, items, total, note, posId } = body

  const db = await getDb()
  if (db) {
    const count = await db.order.count()
    const number = `#${String(count + 1).padStart(3, '0')}`
    const order = await db.order.create({
      data: {
        number, tableId: tableId || null, total, note: note || null,
        posId: posId || null, status: 'NEW', paymentStatus: 'PENDING',
        lines: {
          create: items.map((i: any) => ({
            itemId: i.itemId,
            quantity: i.quantity,
            unitPrice: i.price,
            modifiers: i.modifiers || [],
            note: i.note || null,
          })),
        },
      },
      include: { table: true, lines: { include: { item: true } } },
    })
    return NextResponse.json({ success: true, order })
  }

  // Fallback
  const number = `#${String(counter++).padStart(3, '0')}`
  const order = {
    id: crypto.randomUUID(), number, tableId, total, note, posId,
    status: 'NEW', paymentStatus: 'PENDING', sentAt: new Date().toISOString(),
    table: tableId ? { label: `Table ${tableId}` } : null,
    lines: items,
  }
  memOrders.push(order)
  return NextResponse.json({ success: true, order })
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const tableId = searchParams.get('tableId')
  const status = searchParams.get('status')

  const db = await getDb()
  if (db) {
    const where: any = {}
    if (tableId) where.tableId = tableId
    if (status) where.paymentStatus = status
    const orders = await db.order.findMany({
      where,
      include: { table: true, lines: { include: { item: true } }, payment: true },
      orderBy: { sentAt: 'desc' },
      take: 50,
    })
    return NextResponse.json(orders)
  }
  return NextResponse.json(memOrders)
}
