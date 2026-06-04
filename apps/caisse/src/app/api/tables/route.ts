import { NextResponse } from 'next/server'
import { getDb } from '@/lib/db'

// In-memory fallback
const memTables = [
  { id: 't1', number: '1', label: 'Table 1', capacity: 4, posX: 0, posY: 0, active: true },
  { id: 't2', number: '2', label: 'Table 2', capacity: 4, posX: 1, posY: 0, active: true },
  { id: 't3', number: '3', label: 'Table 3', capacity: 6, posX: 2, posY: 0, active: true },
  { id: 't4', number: '4', label: 'Table 4', capacity: 2, posX: 0, posY: 1, active: true },
  { id: 't5', number: '5', label: 'Table VIP', capacity: 8, posX: 1, posY: 1, active: true },
  { id: 'bar', number: 'B', label: 'Bar', capacity: 6, posX: 2, posY: 1, active: true },
]

export async function GET() {
  const db = await getDb()
  if (db) {
    const tables = await db.table.findMany({
      where: { active: true },
      include: {
        orders: {
          where: { status: { in: ['NEW', 'PREP', 'READY', 'SERVED'] }, paymentStatus: 'PENDING' },
          orderBy: { sentAt: 'desc' },
          take: 1,
          include: { lines: true },
        },
      },
      orderBy: { number: 'asc' },
    })

    const result = tables.map((t: any) => {
      const activeOrder = t.orders[0] || null
      let status = 'FREE'
      if (activeOrder) {
        if (activeOrder.status === 'READY') status = 'READY'
        else if (activeOrder.status === 'SERVED') status = 'OCCUPIED'
        else status = 'PENDING'
      }
      return {
        id: t.id, number: t.number, label: t.label, capacity: t.capacity,
        posX: t.posX ?? 0, posY: t.posY ?? 0, status,
        activeOrderId: activeOrder?.id,
        activeOrderTotal: activeOrder?.total,
        activeOrderItems: activeOrder?.lines?.length,
      }
    })
    return NextResponse.json(result)
  }

  // Fallback
  return NextResponse.json(memTables.map((t) => ({ ...t, status: 'FREE' })))
}
