import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { orderId, method, amount, cashGiven, cashChange, cardRef } = body

  const db = await getDb()
  if (db) {
    const [payment] = await Promise.all([
      db.payment.create({
        data: {
          orderId,
          method,
          amount,
          cashGiven: cashGiven ?? null,
          cashChange: cashChange ?? null,
          cardRef: cardRef ?? null,
        },
      }),
      db.order.update({
        where: { id: orderId },
        data: { paymentStatus: 'PAID', status: 'SERVED' },
      }),
    ])
    return NextResponse.json({ success: true, payment })
  }

  return NextResponse.json({ success: true, payment: { id: crypto.randomUUID() } })
}
