import { NextRequest, NextResponse } from 'next/server'
import { listActiveOrders, getPickupOrder, setOrderStatus, syncOrderToOdoo } from '@/lib/pickup'

export const dynamic = 'force-dynamic'

// Écran de préparation du bar — protégé par PIN staff (header x-staff-pin)
function checkPin(req: NextRequest): boolean {
  const pin = (process.env.STAFF_PIN ?? '').trim()
  return Boolean(pin) && req.headers.get('x-staff-pin') === pin
}

export async function GET(req: NextRequest) {
  if (!checkPin(req)) return NextResponse.json({ error: 'PIN invalide' }, { status: 401 })

  const code = req.nextUrl.searchParams.get('code')
  if (code) {
    const order = await getPickupOrder({ code: code.replace(/[^0-9]/g, '') })
    if (!order) return NextResponse.json({ error: 'Code inconnu' }, { status: 404 })
    return NextResponse.json(order)
  }
  return NextResponse.json(await listActiveOrders())
}

export async function PATCH(req: NextRequest) {
  if (!checkPin(req)) return NextResponse.json({ error: 'PIN invalide' }, { status: 401 })

  try {
    const { id, status, action } = await req.json()
    if (!id) return NextResponse.json({ error: 'id manquant' }, { status: 400 })

    if (action === 'sync-odoo') {
      return NextResponse.json(await syncOrderToOdoo(id))
    }
    if (status) {
      return NextResponse.json(await setOrderStatus(id, status))
    }
    return NextResponse.json({ error: 'status ou action requis' }, { status: 400 })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
