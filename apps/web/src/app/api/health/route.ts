import { NextResponse } from 'next/server'
import { getPosMenu, menuHealth } from '@/lib/odoo/posMenu'

export const dynamic = 'force-dynamic'

// État de la synchro Odoo → site (spec §8 : log minimal du dernier sync réussi)
export async function GET() {
  const menu = await getPosMenu()
  const health = menuHealth()
  return NextResponse.json({
    ok: true,
    odoo: {
      source: health.source,          // odoo | cache | snapshot
      lastSync: health.lastSync,      // dernier appel Odoo réussi (instance serveur courante)
      cachedAt: health.cachedAt,
    },
    categories: menu.categories.length,
    products: menu.categories.reduce((n, c) => n + c.items.length, 0),
  })
}
