import { NextResponse } from 'next/server'

export const revalidate = 3600

export interface BizoukEvent {
  id: string
  title: string
  subtitle: string
  description: string
  start_date: string
  end_date: string
  image_url: string | null
  url: string
  venue_name: string
  venue_city: string
  price_min: number | null
  price_max: number | null
  price_formatted: string | null
  event_type: string
}

interface RawBizoukItem {
  id: string
  title: string
  subtitle: string
  description: string
  url: string
  start_date: string
  end_date: string
  image_url: string | null
  event_type_label: string
  price_range?: {
    min: string
    max: string
    formatted: string
  }
  sessions?: Array<{
    location?: {
      name: string
      city: string
    }
  }>
}

function mapEvent(item: RawBizoukItem): BizoukEvent {
  const loc = item.sessions?.[0]?.location
  return {
    id: item.id,
    title: item.title,
    subtitle: item.subtitle ?? '',
    description: item.description ?? '',
    start_date: item.start_date,
    end_date: item.end_date,
    image_url: item.image_url ?? null,
    url: item.url,
    venue_name: loc?.name ?? 'L\'Infini Club',
    venue_city: loc?.city ?? 'Le Gosier',
    price_min: item.price_range?.min ? parseFloat(item.price_range.min) : null,
    price_max: item.price_range?.max ? parseFloat(item.price_range.max) : null,
    price_formatted: item.price_range?.formatted ?? null,
    event_type: item.event_type_label ?? '',
  }
}

async function fetchPeriod(baseUrl: string, period: 'upcoming' | 'past'): Promise<BizoukEvent[]> {
  const url = `${baseUrl}&period=${period}&limit=50&page=1`
  const res = await fetch(url, { next: { revalidate: 3600 }, headers: { Accept: 'application/json' } })
  if (!res.ok) return []
  const data = await res.json()
  return (data.items ?? []).map(mapEvent)
}

export async function GET(req: Request) {
  const feedUrl = process.env.BIZOUK_FEED_URL
  if (!feedUrl) {
    return NextResponse.json({ error: 'BIZOUK_FEED_URL non configuré' }, { status: 503 })
  }

  const { searchParams } = new URL(req.url)
  const period = searchParams.get('period') === 'past' ? 'past' : 'upcoming'

  try {
    const events = await fetchPeriod(feedUrl, period)
    return NextResponse.json(events)
  } catch (err) {
    console.error('[bizouk]', err)
    return NextResponse.json([])
  }
}
