import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { getSession, signToken, COOKIE } from '@/lib/auth'

const SELECT = { id: true, name: true, email: true, telephone: true, discount: true, createdAt: true }

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Non connecté' }, { status: 401 })

  const { prisma } = await import('@linfini/db')
  const client = await prisma.client.findUnique({ where: { id: session.id }, select: SELECT })

  if (!client) return NextResponse.json({ error: 'Client introuvable' }, { status: 404 })
  return NextResponse.json(client)
}

/** Mise à jour de la fiche par le client lui-même : nom, téléphone,
 *  mot de passe (ancien mot de passe requis). L'email reste l'identifiant. */
export async function PATCH(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Non connecté' }, { status: 401 })

  const { name, telephone, currentPassword, newPassword } = await req.json()
  const { prisma } = await import('@linfini/db')

  const data: { name?: string; telephone?: string | null; password?: string } = {}

  if (typeof name === 'string') {
    const clean = name.trim().slice(0, 80)
    if (!clean) return NextResponse.json({ error: 'Le nom ne peut pas être vide' }, { status: 400 })
    data.name = clean
  }
  if (typeof telephone === 'string') {
    data.telephone = telephone.trim().slice(0, 30) || null
  }
  if (newPassword) {
    if (String(newPassword).length < 6) {
      return NextResponse.json({ error: 'Nouveau mot de passe trop court (6 caractères min.)' }, { status: 400 })
    }
    const client = await prisma.client.findUnique({ where: { id: session.id } })
    if (!client || !(await bcrypt.compare(String(currentPassword ?? ''), client.password))) {
      return NextResponse.json({ error: 'Mot de passe actuel incorrect' }, { status: 400 })
    }
    data.password = await bcrypt.hash(String(newPassword), 12)
  }

  if (!Object.keys(data).length) {
    return NextResponse.json({ error: 'Rien à mettre à jour' }, { status: 400 })
  }

  const updated = await prisma.client.update({ where: { id: session.id }, data, select: SELECT })

  // Le nom figure dans le jeton de session : on le re-signe pour rester cohérent
  const token = await signToken({ id: updated.id, email: updated.email, name: updated.name })
  const res = NextResponse.json(updated)
  res.cookies.set(COOKIE, token, { httpOnly: true, secure: true, sameSite: 'lax', maxAge: 60 * 60 * 24 * 30, path: '/' })
  return res
}
