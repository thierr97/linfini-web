import { NextRequest, NextResponse } from 'next/server'
import { contactStats, listCampaigns, sendCampaign, sendTest } from '@/lib/newsletter'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

function checkAdmin(req: NextRequest) {
  return req.headers.get('x-admin-key') === process.env.ADMIN_SECRET_KEY
}

export async function GET(req: NextRequest) {
  if (!checkAdmin(req)) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  const [stats, campaigns] = await Promise.all([contactStats(), listCampaigns()])
  return NextResponse.json({ stats, campaigns })
}

// Créer une campagne (brouillon) — ou envoyer un test si { test: email }
export async function POST(req: NextRequest) {
  if (!checkAdmin(req)) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  const { subject, preheader, body, test } = await req.json()
  if (!subject?.trim() || !body?.trim()) {
    return NextResponse.json({ error: 'Objet et contenu requis' }, { status: 400 })
  }
  if (test) {
    try {
      await sendTest(subject.trim(), preheader?.trim() || null, body, String(test).trim())
      return NextResponse.json({ test: true, sentTo: test })
    } catch (e: any) {
      return NextResponse.json({ error: e.message }, { status: 500 })
    }
  }
  const { prisma } = await import('@linfini/db')
  const campaign = await prisma.emailCampaign.create({
    data: { subject: subject.trim(), preheader: preheader?.trim() || null, body },
  })
  return NextResponse.json(campaign)
}

// Envoyer une tranche (l'UI rappelle tant que remaining > 0)
export async function PATCH(req: NextRequest) {
  if (!checkAdmin(req)) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  try {
    const { campaignId } = await req.json()
    if (!campaignId) return NextResponse.json({ error: 'campaignId requis' }, { status: 400 })
    const result = await sendCampaign(campaignId)
    return NextResponse.json(result)
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
