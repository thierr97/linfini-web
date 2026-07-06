import { NextRequest, NextResponse } from 'next/server'
import { SITE, finishOAuthLogin } from '@/lib/oauth'

export const dynamic = 'force-dynamic'

// Retour Google : échange le code, récupère l'email/nom, connecte le client.
export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code')
  const state = req.nextUrl.searchParams.get('state')
  const saved = req.cookies.get('oauth_state')?.value
  if (!code || !state || state !== saved) {
    return NextResponse.redirect(`${SITE}/connexion?error=oauth`)
  }

  try {
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        redirect_uri: `${SITE}/api/auth/google/callback`,
        grant_type: 'authorization_code',
      }),
    })
    const token = await tokenRes.json()
    if (!token.access_token) return NextResponse.redirect(`${SITE}/connexion?error=oauth`)

    const userRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${token.access_token}` },
    })
    const profile = await userRes.json()
    if (!profile.email) return NextResponse.redirect(`${SITE}/connexion?error=oauth`)

    return finishOAuthLogin(profile.email, profile.name || profile.given_name || '')
  } catch (e) {
    console.error('[google callback]', e)
    return NextResponse.redirect(`${SITE}/connexion?error=oauth`)
  }
}
