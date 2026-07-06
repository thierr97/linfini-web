import { NextRequest, NextResponse } from 'next/server'
import { SITE, finishOAuthLogin } from '@/lib/oauth'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code')
  const state = req.nextUrl.searchParams.get('state')
  const saved = req.cookies.get('oauth_state')?.value
  if (!code || !state || state !== saved) {
    return NextResponse.redirect(`${SITE}/connexion?error=oauth`)
  }

  try {
    const tokenUrl = new URL('https://graph.facebook.com/v19.0/oauth/access_token')
    tokenUrl.searchParams.set('client_id', process.env.FACEBOOK_CLIENT_ID!)
    tokenUrl.searchParams.set('client_secret', process.env.FACEBOOK_CLIENT_SECRET!)
    tokenUrl.searchParams.set('redirect_uri', `${SITE}/api/auth/facebook/callback`)
    tokenUrl.searchParams.set('code', code)
    const token = await fetch(tokenUrl.toString()).then(r => r.json())
    if (!token.access_token) return NextResponse.redirect(`${SITE}/connexion?error=oauth`)

    const profile = await fetch(
      `https://graph.facebook.com/me?fields=name,email&access_token=${token.access_token}`,
    ).then(r => r.json())
    if (!profile.email) return NextResponse.redirect(`${SITE}/connexion?error=email_manquant`)

    return finishOAuthLogin(profile.email, profile.name || '')
  } catch (e) {
    console.error('[facebook callback]', e)
    return NextResponse.redirect(`${SITE}/connexion?error=oauth`)
  }
}
