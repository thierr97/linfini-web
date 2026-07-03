import { NextRequest, NextResponse } from 'next/server'
import { unsubscribeByToken } from '@/lib/newsletter'

export const dynamic = 'force-dynamic'

// Désinscription RGPD — accessible sans authentification via token unique.
// GET : lien classique dans l'email. POST : one-click (List-Unsubscribe-Post).
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token') ?? ''
  const res = await unsubscribeByToken(token).catch(() => null)
  const ok = Boolean(res)
  return NextResponse.redirect(new URL(`/desabonnement?ok=${ok ? '1' : '0'}`, req.url))
}

export async function POST(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token') ?? ''
  await unsubscribeByToken(token).catch(() => null)
  return NextResponse.json({ ok: true })
}
