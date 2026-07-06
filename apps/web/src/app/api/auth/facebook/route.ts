import { NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import { SITE, setStateCookie } from '@/lib/oauth'

export const dynamic = 'force-dynamic'

export async function GET() {
  const clientId = process.env.FACEBOOK_CLIENT_ID
  if (!clientId) return NextResponse.redirect(`${SITE}/connexion?error=facebook_indisponible`)

  const state = randomUUID()
  const url = new URL('https://www.facebook.com/v19.0/dialog/oauth')
  url.searchParams.set('client_id', clientId)
  url.searchParams.set('redirect_uri', `${SITE}/api/auth/facebook/callback`)
  url.searchParams.set('response_type', 'code')
  url.searchParams.set('scope', 'email,public_profile')
  url.searchParams.set('state', state)

  const res = NextResponse.redirect(url.toString())
  setStateCookie(res, state)
  return res
}
