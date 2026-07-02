import { NextRequest, NextResponse } from 'next/server'

function checkAdmin(req: NextRequest) {
  const key = req.headers.get('x-admin-key')
  return key === process.env.ADMIN_SECRET_KEY
}

export async function GET(req: NextRequest) {
  if (!checkAdmin(req)) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const { prisma } = await import('@linfini/db')
  const clients = await prisma.client.findMany({
    select: { id: true, name: true, email: true, telephone: true, discount: true, notes: true, active: true, createdAt: true },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(clients)
}

export async function PATCH(req: NextRequest) {
  if (!checkAdmin(req)) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const { id, discount, notes, active } = await req.json()
  const { prisma } = await import('@linfini/db')

  const client = await prisma.client.update({
    where: { id },
    data: {
      ...(discount !== undefined && { discount: Math.min(100, Math.max(0, discount)) }),
      ...(notes !== undefined && { notes }),
      ...(active !== undefined && { active }),
    },
    select: { id: true, name: true, email: true, discount: true, notes: true, active: true },
  })
  return NextResponse.json(client)
}
