import { NextRequest, NextResponse } from 'next/server'
import { syncContacts, contactStats } from '@/lib/newsletter'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

function checkAdmin(req: NextRequest) {
  return req.headers.get('x-admin-key') === process.env.ADMIN_SECRET_KEY
}

// Liste des contacts (aperçu)
export async function GET(req: NextRequest) {
  if (!checkAdmin(req)) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  const { prisma } = await import('@linfini/db')
  const [stats, contacts] = await Promise.all([
    contactStats(),
    prisma.emailContact.findMany({
      orderBy: { createdAt: 'desc' },
      take: 500,
      select: { id: true, email: true, name: true, source: true, subscribed: true, bounced: true, createdAt: true },
    }),
  ])
  return NextResponse.json({ stats, contacts })
}

// Importer les emails clients existants (réservations, billets, commandes, comptes)
export async function POST(req: NextRequest) {
  if (!checkAdmin(req)) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  const result = await syncContacts()
  return NextResponse.json(result)
}

// Ajout / désinscription manuelle
export async function PATCH(req: NextRequest) {
  if (!checkAdmin(req)) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  const { email, name, subscribed } = await req.json()
  const clean = String(email ?? '').trim().toLowerCase()
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(clean)) {
    return NextResponse.json({ error: 'Email invalide' }, { status: 400 })
  }
  const { prisma } = await import('@linfini/db')
  const contact = await prisma.emailContact.upsert({
    where: { email: clean },
    create: { email: clean, name: name || null, source: 'import', subscribed: subscribed ?? true },
    update: {
      ...(name !== undefined ? { name } : {}),
      ...(subscribed !== undefined ? { subscribed, unsubscribedAt: subscribed ? null : new Date() } : {}),
    },
  })
  return NextResponse.json(contact)
}
