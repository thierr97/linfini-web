import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'

const memContractors: any[] = []
const memPayments: any[] = []

export async function GET() {
  const db = await getDb()
  if (db) {
    const contractors = await db.contractor.findMany({
      include: {
        payments: { orderBy: { createdAt: 'desc' }, take: 5 },
      },
      orderBy: { lastName: 'asc' },
    })
    return NextResponse.json(contractors)
  }
  return NextResponse.json(memContractors)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { firstName, lastName, phone, email, role } = body

  const db = await getDb()
  if (db) {
    const contractor = await db.contractor.create({ data: { firstName, lastName, phone, email, role } })
    return NextResponse.json({ success: true, contractor })
  }

  const contractor = { id: crypto.randomUUID(), firstName, lastName, phone, email, role, payments: [] }
  memContractors.push(contractor)
  return NextResponse.json({ success: true, contractor })
}
