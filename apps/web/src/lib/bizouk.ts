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
  // source: 'bizouk' = lien externe, 'local' = page interne /evenements/[slug]
  source: 'bizouk' | 'local'
  slug?: string
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
    venue_name: loc?.name ?? "L'Infini Club",
    venue_city: loc?.city ?? 'Le Gosier',
    price_min: item.price_range?.min ? parseFloat(item.price_range.min) : null,
    price_max: item.price_range?.max ? parseFloat(item.price_range.max) : null,
    price_formatted: item.price_range?.formatted ?? null,
    event_type: item.event_type_label ?? '',
    source: 'bizouk',
  }
}

export async function getBizoukEvents(period: 'upcoming' | 'past'): Promise<BizoukEvent[]> {
  const feedUrl = process.env.BIZOUK_FEED_URL
  if (!feedUrl) return []

  try {
    const url = `${feedUrl}&period=${period}&limit=50&page=1`
    const res = await fetch(url, {
      next: { revalidate: 3600 },
      headers: { Accept: 'application/json' },
    })
    if (!res.ok) return []
    const data = await res.json()
    return (data.items ?? []).map(mapEvent)
  } catch (err) {
    console.error('[bizouk]', err)
    return []
  }
}

export async function getLocalEvents(period: 'upcoming' | 'past'): Promise<BizoukEvent[]> {
  try {
    const { prisma } = await import('@linfini/db')
    const now = new Date()
    const events = await prisma.event.findMany({
      where: {
        published: true,
        date: period === 'upcoming' ? { gte: now } : { lt: now },
      },
      orderBy: { date: period === 'upcoming' ? 'asc' : 'desc' },
      take: 50,
    })

    return events.map(e => ({
      id: e.id,
      title: e.title,
      subtitle: e.shortDesc ?? '',
      description: e.description ?? '',
      start_date: e.date.toISOString(),
      end_date: (e.endDate ?? e.date).toISOString(),
      image_url: e.imageUrl ?? null,
      url: `/evenements/${e.slug}`,
      venue_name: e.venue,
      venue_city: 'Le Gosier',
      price_min: null,
      price_max: null,
      price_formatted: null,
      event_type: e.categories[0] ?? 'Événement',
      source: 'local' as const,
      slug: e.slug,
    }))
  } catch {
    return []
  }
}

export async function getAllEvents(period: 'upcoming' | 'past'): Promise<BizoukEvent[]> {
  const [bizouk, local] = await Promise.all([
    getBizoukEvents(period),
    getLocalEvents(period),
  ])

  // Fusion et tri par date
  const merged = [...local, ...bizouk]
  merged.sort((a, b) => {
    const da = new Date(a.start_date).getTime()
    const db = new Date(b.start_date).getTime()
    return period === 'upcoming' ? da - db : db - da
  })

  return merged
}
