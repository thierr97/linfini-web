import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Non connecté' }, { status: 401 })

  const { prisma } = await import('@linfini/db')
  const client = await prisma.client.findUnique({
    where: { id: session.id },
    select: { id: true, name: true, email: true, telephone: true, discount: true, createdAt: true },
  })

  if (!client) return NextResponse.json({ error: 'Client introuvable' }, { status: 404 })
  return NextResponse.json(client)
}
