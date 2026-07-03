import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { clearPosMenuCache } from '@/lib/odoo/posMenu'

const SECRET = (process.env.REVALIDATE_SECRET ?? '').trim()

// Rafraîchissement à la demande (spec §7).
// Appelé par la règle d'automatisation Odoo (webhook) au changement de prix :
// POST /api/revalidate?secret=REVALIDATE_SECRET
// Le secret est accepté en query param (webhook Odoo) ou dans le corps JSON.
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({} as { secret?: string; path?: string }))
  const secret = req.nextUrl.searchParams.get('secret') ?? body.secret

  if (!SECRET || secret !== SECRET) {
    return NextResponse.json({ error: 'Secret invalide' }, { status: 401 })
  }

  clearPosMenuCache()
  const paths = body.path ? [body.path] : ['/', '/menu', '/bar']
  paths.forEach(p => revalidatePath(p))

  return NextResponse.json({ ok: true, revalidated: paths })
}
