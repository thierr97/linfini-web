import { NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import { SITE, setStateCookie } from '@/lib/oauth'

export const dynamic = 'force-dynamic'

// Démarre le login Google : redirige vers l'écran de consentement.
export async function GET() {
  const clientId = process.env.GOOGLE_CLIENT_ID
  if (!clientId) return NextResponse.redirect(`${SITE}/connexion?error=google_indisponible`)

  const state = randomUUID()
  const url = new URL('https://accounts.google.com/o/oauth2/v2/auth')
  url.searchParams.set('client_id', clientId)
  url.searchParams.set('redirect_uri', `${SITE}/api/auth/google/callback`)
  url.searchParams.set('response_type', 'code')
  url.searchParams.set('scope', 'openid email profile')
  url.searchParams.set('state', state)
  url.searchParams.set('prompt', 'select_account')

  const res = NextResponse.redirect(url.toString())
  setStateCookie(res, state)
  return res
}
