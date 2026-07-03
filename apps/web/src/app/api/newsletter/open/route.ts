import { NextRequest, NextResponse } from 'next/server'
import { recordOpen } from '@/lib/newsletter'

export const dynamic = 'force-dynamic'

// Pixel de tracking d'ouverture (1x1 GIF transparent)
const PIXEL = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64')

export async function GET(req: NextRequest) {
  const campaignId = req.nextUrl.searchParams.get('c')
  const email = req.nextUrl.searchParams.get('e')
  if (campaignId && email) {
    recordOpen(campaignId, email.toLowerCase()).catch(() => {})
  }
  return new NextResponse(PIXEL, {
    headers: {
      'Content-Type': 'image/gif',
      'Cache-Control': 'no-store, no-cache, must-revalidate, private',
      'Content-Length': String(PIXEL.length),
    },
  })
}
