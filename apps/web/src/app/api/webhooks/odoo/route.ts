// Webhook appelé par Odoo quand un produit change
// Configurer dans Odoo : Paramètres > Technique > Actions > Automatisations
// Modèle : product.template | Déclencheur : À la mise à jour
// Action : Appel HTTP POST → https://votresite.com/api/webhooks/odoo
// Headers : x-odoo-secret: <ODOO_WEBHOOK_SECRET>

import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'

const SECRET = process.env.ODOO_WEBHOOK_SECRET ?? ''

export async function POST(req: NextRequest) {
  // Vérifie le secret pour éviter les appels non autorisés
  const secret = req.headers.get('x-odoo-secret')
  if (SECRET && secret !== SECRET) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  const body = await req.json().catch(() => ({}))

  // Invalide le cache des pages qui affichent le menu
  revalidatePath('/menu')
  revalidatePath('/')

  console.log('[Odoo Webhook] Cache invalidé — produit mis à jour:', body)

  return NextResponse.json({
    ok: true,
    message: 'Cache invalidé',
    revalidated: ['/menu', '/'],
    timestamp: new Date().toISOString(),
  })
}

// Odoo peut aussi faire un GET pour vérifier que le webhook est actif
export async function GET() {
  return NextResponse.json({ ok: true, service: 'L\'Infini Odoo Webhook' })
}
