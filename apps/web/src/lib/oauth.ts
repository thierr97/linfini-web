import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { randomBytes } from 'crypto'
import { signToken, COOKIE } from '@/lib/auth'

// URL canonique (doit correspondre aux redirect URIs déclarés chez les providers)
export const SITE = 'https://www.infinigp.fr'

/** Crée (ou retrouve) le client par email et pose le cookie de session → /mon-compte. */
export async function finishOAuthLogin(rawEmail: string, name: string) {
  const email = rawEmail.trim().toLowerCase()
  if (!email) return NextResponse.redirect(`${SITE}/connexion?error=oauth`)

  const { prisma } = await import('@linfini/db')
  let client = await prisma.client.findUnique({ where: { email } })

  if (client && !client.active) {
    return NextResponse.redirect(`${SITE}/connexion?error=compte_desactive`)
  }
  if (!client) {
    // Compte social : mot de passe aléatoire inutilisable (connexion via le provider)
    const hash = await bcrypt.hash(randomBytes(24).toString('hex'), 12)
    const { launchOffer } = await import('@/lib/promo')
    const offer = await launchOffer(prisma)
    client = await prisma.client.create({
      data: { name: name || email.split('@')[0], email, password: hash, ...(offer ?? {}) },
    })
  }

  const token = await signToken({ id: client.id, email: client.email, name: client.name })
  const res = NextResponse.redirect(`${SITE}/mon-compte`)
  res.cookies.set(COOKIE, token, { httpOnly: true, secure: true, sameSite: 'lax', maxAge: 60 * 60 * 24 * 30, path: '/' })
  return res
}

/** Cookie d'état anti-CSRF pour le flux OAuth. */
export function setStateCookie(res: NextResponse, state: string) {
  res.cookies.set('oauth_state', state, { httpOnly: true, secure: true, sameSite: 'lax', maxAge: 600, path: '/' })
}
