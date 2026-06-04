import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { contractorId, amount, description, method, eventId } = body

  const db = await getDb()
  if (db) {
    const payment = await db.contractorPayment.create({
      data: {
        contractorId,
        amount,
        description,
        method: method || 'CASH',
        eventId: eventId || null,
      },
      include: { contractor: true, event: { select: { title: true } } },
    })

    // Create cash movement for cash payments
    if (method === 'CASH' || !method) {
      await db.cashMovement.create({
        data: {
          type: 'OUT',
          amount,
          reason: `Prestataire: ${payment.contractor.firstName} ${payment.contractor.lastName} — ${description}`,
        },
      })
    }

    return NextResponse.json({ success: true, payment })
  }

  return NextResponse.json({ success: true, payment: { id: crypto.randomUUID() } })
}
