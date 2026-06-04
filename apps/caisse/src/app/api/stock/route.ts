import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'

const memStock: any[] = [
  { id: 's1', name: 'Rhum agricole', unit: 'bouteille', quantity: 12, minQty: 3, alert: false },
  { id: 's2', name: 'Planteur maison', unit: 'L', quantity: 5, minQty: 2, alert: false },
  { id: 's3', name: 'Eau minérale', unit: 'caisse', quantity: 8, minQty: 2, alert: false },
  { id: 's4', name: 'Farine T55', unit: 'kg', quantity: 10, minQty: 2, alert: false },
]

export async function GET() {
  const db = await getDb()
  if (db) {
    const stocks = await db.stock.findMany({
      include: { item: { select: { name: true } } },
      orderBy: { name: 'asc' },
    })
    return NextResponse.json(stocks.map((s: any) => ({ ...s, alert: s.quantity <= s.minQty })))
  }
  return NextResponse.json(memStock)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { name, unit, quantity, minQty, itemId } = body

  const db = await getDb()
  if (db) {
    const stock = await db.stock.create({ data: { name, unit, quantity, minQty: minQty || 0, itemId: itemId || null } })
    return NextResponse.json({ success: true, stock })
  }

  const stock = { id: crypto.randomUUID(), name, unit, quantity, minQty: minQty || 0, alert: quantity <= (minQty || 0) }
  memStock.push(stock)
  return NextResponse.json({ success: true, stock })
}

export async function PATCH(req: NextRequest) {
  const body = await req.json()
  const { id, type, quantity, reason } = body

  const db = await getDb()
  if (db) {
    const stock = await db.stock.findUnique({ where: { id } })
    if (!stock) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const newQty = type === 'IN' ? stock.quantity + quantity : Math.max(0, stock.quantity - quantity)

    await Promise.all([
      db.stock.update({ where: { id }, data: { quantity: newQty } }),
      db.stockMovement.create({ data: { stockId: id, type, quantity, reason: reason || null } }),
    ])
    return NextResponse.json({ success: true, newQty })
  }

  const s = memStock.find((s) => s.id === id)
  if (s) {
    s.quantity = type === 'IN' ? s.quantity + quantity : Math.max(0, s.quantity - quantity)
    s.alert = s.quantity <= s.minQty
  }
  return NextResponse.json({ success: true })
}
