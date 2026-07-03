import { NextRequest, NextResponse } from 'next/server'
import { dataService } from '@/lib/data'
import { getPosMenu } from '@/lib/odoo/posMenu'

// Lecture : menu live depuis la caisse Odoo (cache 15 min, fallback dernier menu connu)
export async function GET() {
  const menu = await getPosMenu()
  return NextResponse.json(menu, {
    headers: { 'Cache-Control': 's-maxage=900, stale-while-revalidate=86400' },
  })
}

export async function PATCH(req: NextRequest) {
  try {
    const { categoryId, itemId, updates } = await req.json()
    await dataService.updateMenuItem(categoryId, itemId, updates)
    const menu = await dataService.getMenu()
    return NextResponse.json({ success: true, menu })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { categoryId, item } = await req.json()
    const created = await dataService.addMenuItem(categoryId, item)
    return NextResponse.json({ success: true, item: created })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { categoryId, itemId } = await req.json()
    await dataService.deleteMenuItem(categoryId, itemId)
    return NextResponse.json({ success: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
