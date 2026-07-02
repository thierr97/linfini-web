import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { signToken, COOKIE } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const { name, email, telephone, password } = await req.json()

  if (!name || !email || !password) {
    return NextResponse.json({ error: 'Champs obligatoires manquants' }, { status: 400 })
  }
  if (password.length < 6) {
    return NextResponse.json({ error: 'Mot de passe trop court (6 caractères min.)' }, { status: 400 })
  }

  try {
    const { prisma } = await import('@linfini/db')

    const existing = await prisma.client.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json({ error: 'Cet email est déjà utilisé' }, { status: 409 })
    }

    const hash = await bcrypt.hash(password, 12)
    const client = await prisma.client.create({
      data: { name, email, telephone: telephone || null, password: hash },
    })

    const token = await signToken({ id: client.id, email: client.email, name: client.name })
    const res = NextResponse.json({ success: true, name: client.name })
    res.cookies.set(COOKIE, token, { httpOnly: true, secure: true, sameSite: 'lax', maxAge: 60 * 60 * 24 * 30, path: '/' })
    return res
  } catch (err) {
    console.error('Register error:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
