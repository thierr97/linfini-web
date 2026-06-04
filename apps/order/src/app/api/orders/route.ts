import { NextRequest, NextResponse } from 'next/server'
import { sendNotifications } from '@linfini/notifications'

// In-memory store for dev without DB
const memoryOrders: any[] = []
let orderCounter = 1

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { tableId, items, total, note } = body

    // Try with real DB first
    try {
      const { prisma } = await import('@linfini/db')
      const count = await prisma.order.count()
      const number = `#${String(count + 1).padStart(3, '0')}`
      const order = await prisma.order.create({
        data: { number, tableId: tableId || null, total, note: note || null, status: 'NEW' },
        include: { table: true }
      })
      const notifOrder = {
        number: order.number, table: order.table, total: order.total, note: order.note,
        lines: items.map((i: any) => ({ item: { name: i.name }, modifiers: i.modifiers, note: i.note }))
      }
      await sendNotifications(notifOrder)
      return NextResponse.json({ success: true, order })
    } catch { /* DB not available */ }

    // Fallback: in-memory
    const number = `#${String(orderCounter++).padStart(3, '0')}`
    const order = { id: crypto.randomUUID(), number, tableId, total, note, status: 'NEW', sentAt: new Date().toISOString(), table: tableId ? { label: `Table ${tableId}` } : null }
    memoryOrders.push({ ...order, lines: items })

    const notifOrder = {
      number, table: order.table, total, note,
      lines: items.map((i: any) => ({ item: { name: i.name }, modifiers: i.modifiers, note: i.note }))
    }
    await sendNotifications(notifOrder).catch(() => {})

    return NextResponse.json({ success: true, order })
  } catch (error) {
    console.error('Order error:', error)
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json(memoryOrders)
}
