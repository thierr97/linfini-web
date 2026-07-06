import { NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import { SITE } from '@/lib/oauth'

export const dynamic = 'force-dynamic'

export async function GET() {
  const serviceId = process.env.APPLE_SERVICE_ID
  if (!serviceId) return NextResponse.redirect(`${SITE}/connexion?error=apple_indisponible`)

  const state = randomUUID()
  const url = new URL('https://appleid.apple.com/auth/authorize')
  url.searchParams.set('client_id', serviceId)
  url.searchParams.set('redirect_uri', `${SITE}/api/auth/apple/callback`)
  url.searchParams.set('response_type', 'code')
  url.searchParams.set('scope', 'name email')
  url.searchParams.set('response_mode', 'form_post') // Apple renvoie en POST
  url.searchParams.set('state', state)

  const res = NextResponse.redirect(url.toString())
  // sameSite=none car le retour Apple est un POST cross-site
  res.cookies.set('oauth_state', state, { httpOnly: true, secure: true, sameSite: 'none', maxAge: 600, path: '/' })
  return res
}
