import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'

// Chemin vers le menu.json partagé dans l'app web
const MENU_PATH = path.join(process.cwd(), '..', 'web', 'src', 'data', 'menu.json')

async function readMenu() {
  const raw = await fs.readFile(MENU_PATH, 'utf-8')
  return JSON.parse(raw)
}

async function writeMenu(data: object) {
  await fs.writeFile(MENU_PATH, JSON.stringify(data, null, 2), 'utf-8')
}

export async function GET() {
  try {
    const menu = await readMenu()
    return NextResponse.json(menu)
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { categoryId, itemId, updates } = await req.json()
    const data = await readMenu()
    const cat = data.categories.find((c: any) => c.id === categoryId)
    if (!cat) return NextResponse.json({ error: 'Catégorie introuvable' }, { status: 404 })
    const idx = cat.items.findIndex((i: any) => i.id === itemId)
    if (idx === -1) return NextResponse.json({ error: 'Article introuvable' }, { status: 404 })
    cat.items[idx] = { ...cat.items[idx], ...updates }
    data.settings.lastUpdated = new Date().toISOString().split('T')[0]
    await writeMenu(data)
    return NextResponse.json({ success: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { categoryId, item } = await req.json()
    const data = await readMenu()
    const cat = data.categories.find((c: any) => c.id === categoryId)
    if (!cat) return NextResponse.json({ error: 'Catégorie introuvable' }, { status: 404 })
    const newItem = { ...item, id: `${categoryId}-${Date.now()}` }
    cat.items.push(newItem)
    data.settings.lastUpdated = new Date().toISOString().split('T')[0]
    await writeMenu(data)
    return NextResponse.json({ success: true, item: newItem })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { categoryId, itemId } = await req.json()
    const data = await readMenu()
    const cat = data.categories.find((c: any) => c.id === categoryId)
    if (!cat) return NextResponse.json({ error: 'Catégorie introuvable' }, { status: 404 })
    cat.items = cat.items.filter((i: any) => i.id !== itemId)
    data.settings.lastUpdated = new Date().toISOString().split('T')[0]
    await writeMenu(data)
    return NextResponse.json({ success: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
