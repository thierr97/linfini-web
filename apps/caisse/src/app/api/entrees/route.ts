import { NextResponse } from 'next/server'
import { getDb } from '@/lib/db'

export async function GET() {
  const db = await getDb()
  if (db) {
    const now = new Date()
    const types = await db.ticketType.findMany({
      where: { active: true, event: { published: true, date: { gte: now } } },
      include: { event: { select: { id: true, title: true, date: true } } },
      orderBy: { event: { date: 'asc' } },
    })
    return NextResponse.json(types)
  }
  return NextResponse.json([])
}
