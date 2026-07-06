import { NextRequest, NextResponse } from 'next/server'
import { SignJWT, importPKCS8, decodeJwt } from 'jose'
import { SITE, finishOAuthLogin } from '@/lib/oauth'

export const dynamic = 'force-dynamic'

// Apple renvoie en POST (form_post) : code + éventuellement le nom (1re fois).
export async function POST(req: NextRequest) {
  const form = await req.formData()
  const code = form.get('code') as string | null
  const state = form.get('state') as string | null
  const saved = req.cookies.get('oauth_state')?.value
  if (!code || !state || state !== saved) {
    return NextResponse.redirect(`${SITE}/connexion?error=oauth`)
  }

  try {
    // client_secret = JWT ES256 signé avec la clé privée Apple (.p8)
    const key = await importPKCS8((process.env.APPLE_PRIVATE_KEY || '').replace(/\\n/g, '\n'), 'ES256')
    const clientSecret = await new SignJWT({})
      .setProtectedHeader({ alg: 'ES256', kid: process.env.APPLE_KEY_ID! })
      .setIssuer(process.env.APPLE_TEAM_ID!)
      .setIssuedAt()
      .setExpirationTime('30m')
      .setAudience('https://appleid.apple.com')
      .setSubject(process.env.APPLE_SERVICE_ID!)
      .sign(key)

    const tokenRes = await fetch('https://appleid.apple.com/auth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: process.env.APPLE_SERVICE_ID!,
        client_secret: clientSecret,
        redirect_uri: `${SITE}/api/auth/apple/callback`,
        grant_type: 'authorization_code',
      }),
    })
    const token = await tokenRes.json()
    if (!token.id_token) return NextResponse.redirect(`${SITE}/connexion?error=oauth`)

    const claims = decodeJwt(token.id_token) as { email?: string }
    if (!claims.email) return NextResponse.redirect(`${SITE}/connexion?error=email_manquant`)

    // Le nom n'est fourni que la 1re fois, dans le champ "user"
    let name = ''
    try {
      const user = form.get('user') as string | null
      if (user) { const u = JSON.parse(user); name = [u?.name?.firstName, u?.name?.lastName].filter(Boolean).join(' ') }
    } catch { /* pas de nom */ }

    return finishOAuthLogin(claims.email, name)
  } catch (e) {
    console.error('[apple callback]', e)
    return NextResponse.redirect(`${SITE}/connexion?error=oauth`)
  }
}
