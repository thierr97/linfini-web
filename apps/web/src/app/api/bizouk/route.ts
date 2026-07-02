import { NextResponse } from 'next/server'
import { getBizoukEvents } from '@/lib/bizouk'

export { type BizoukEvent } from '@/lib/bizouk'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  if (!process.env.BIZOUK_FEED_URL) {
    return NextResponse.json({ error: 'BIZOUK_FEED_URL non configuré' }, { status: 503 })
  }

  const { searchParams } = new URL(req.url)
  const period = searchParams.get('period') === 'past' ? 'past' : 'upcoming'

  const events = await getBizoukEvents(period)
  return NextResponse.json(events)
}
