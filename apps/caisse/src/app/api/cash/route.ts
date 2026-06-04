import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'

const memMoves: any[] = []

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const date = searchParams.get('date') || new Date().toISOString().split('T')[0]
  const start = new Date(date + 'T00:00:00')
  const end = new Date(date + 'T23:59:59')

  const db = await getDb()
  if (db) {
    const [moves, payments] = await Promise.all([
      db.cashMovement.findMany({
        where: { createdAt: { gte: start, lte: end } },
        orderBy: { createdAt: 'desc' },
      }),
      db.payment.findMany({
        where: {
          method: { in: ['CASH', 'MIXED'] },
          createdAt: { gte: start, lte: end },
        },
        include: { order: { include: { table: true } } },
      }),
    ])

    const totalIn = moves.filter((m: any) => m.type === 'IN').reduce((s: number, m: any) => s + m.amount, 0)
    const totalOut = moves.filter((m: any) => m.type === 'OUT').reduce((s: number, m: any) => s + m.amount, 0)
    const totalSales = payments.reduce((s: number, p: any) => s + p.amount, 0)

    return NextResponse.json({ moves, payments, totalIn, totalOut, totalSales, balance: totalIn + totalSales - totalOut })
  }

  return NextResponse.json({ moves: memMoves, payments: [], totalIn: 0, totalOut: 0, totalSales: 0, balance: 0 })
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { type, amount, reason } = body

  const db = await getDb()
  if (db) {
    const move = await db.cashMovement.create({ data: { type, amount, reason } })
    return NextResponse.json({ success: true, move })
  }

  const move = { id: crypto.randomUUID(), type, amount, reason, createdAt: new Date().toISOString() }
  memMoves.push(move)
  return NextResponse.json({ success: true, move })
}
