import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'

const MENU_PATH = path.join(process.cwd(), '..', 'web', 'src', 'data', 'menu.json')

async function odooRpc(url: string, service: string, method: string, args: any[]) {
  const res = await fetch(`${url}/jsonrpc`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0', method: 'call', id: Date.now(),
      params: { service, method, args },
    }),
  })
  const data = await res.json()
  if (data.error) throw new Error(data.error.data?.message ?? data.error.message ?? 'Erreur Odoo')
  return data.result
}

export async function POST(req: NextRequest) {
  const { url, db, user, password, apiKey, mode } = await req.json()
  if (!url) return NextResponse.json({ ok: false, message: 'URL Odoo manquante' })

  const database = db?.trim() || url.replace('https://', '').replace('.odoo.com', '')
  const pass = (mode === 'apikey' ? apiKey?.trim() : password) ?? ''
  const login = user?.trim() ?? ''

  if (!login || !pass) {
    return NextResponse.json({ ok: false, message: 'Email et clé API requis pour synchroniser' })
  }

  try {
    // 1. Authentification
    const uid = await odooRpc(url, 'common', 'authenticate', [database, login, pass, {}])
    if (!uid) throw new Error('Authentification échouée — vérifiez email et clé API')

    const callKw = (model: string, method: string, args: any[], kwargs: any) =>
      odooRpc(url, 'object', 'execute_kw', [database, uid, pass, model, method, args, kwargs])


    // 2. Découvre le bon nom du champ catégorie POS
    const allFields: Record<string, any> = await callKw('product.template', 'fields_get', [], { attributes: ['type', 'string', 'relation'] })
    // Cherche tous les champs liés à pos.category
    const posFields = Object.entries(allFields)
      .filter(([k, v]: any) => k.includes('pos') || k.includes('categ') || v.relation === 'pos.category')
      .map(([k, v]: any) => `${k}(${v.type})`)

    const catFieldName = Object.keys(allFields)
      .find(k => k.includes('pos') && (k.includes('categ') || k.includes('category'))) ?? null

    // 3. Récupère catégories POS + produits
    const productFields = ['id', 'name', 'description_sale', 'list_price', 'active']
    if (catFieldName) productFields.push(catFieldName)

    const [categories, products] = await Promise.all([
      callKw('pos.category', 'search_read', [[]], { fields: ['id', 'name', 'sequence'], limit: 50 }),
      callKw('product.template', 'search_read',
        [[['available_in_pos', '=', true], ['active', 'in', [true, false]]]],
        { fields: productFields, limit: 200 }
      ),
    ])

    // 4. Construit la structure menu
    const ICONS: Record<string, string> = {
      tapas: '🍢', snack: '🍢', box: '🍔', burger: '🍔',
      plat: '🍽️', dessert: '🍮', boisson: '🍹', bar: '🍹',
    }

    const catMap = new Map<number, any[]>()
    for (const p of products ?? []) {
      const raw = catFieldName ? p[catFieldName] : null
      const catIds: number[] = Array.isArray(raw)
        ? (typeof raw[0] === 'number' ? raw : [raw[0]]).filter(Boolean)
        : raw ? [Array.isArray(raw) ? raw[0] : raw] : []
      const catId = catIds[0] ?? null
      if (!catId) continue
      if (!catMap.has(catId)) catMap.set(catId, [])
      catMap.get(catId)!.push({
        id: String(p.id),
        name: p.name,
        desc: p.description_sale ?? '',
        price: p.list_price,
        img: `${url}/web/image/product.template/${p.id}/image_512`,
        active: p.active,
      })
    }

    const mappedCategories = (categories ?? [])
      .filter((c: any) => catMap.has(c.id))
      .sort((a: any, b: any) => (a.sequence ?? 0) - (b.sequence ?? 0))
      .map((c: any) => {
        const slug = c.name?.toLowerCase() ?? ''
        const icon = Object.entries(ICONS).find(([k]) => slug.includes(k))?.[1] ?? '🍽️'
        return { id: String(c.id), name: c.name, icon, items: catMap.get(c.id) ?? [] }
      })

    // 4. Sauvegarde
    const currentRaw = await fs.readFile(MENU_PATH, 'utf-8').catch(() => '{}')
    const current = JSON.parse(currentRaw)
    const newMenu = {
      categories: mappedCategories,
      settings: { ...(current.settings ?? {}), lastUpdated: new Date().toISOString().split('T')[0] },
    }
    await fs.writeFile(MENU_PATH, JSON.stringify(newMenu, null, 2), 'utf-8')

    // 5. Invalide le cache du site
    const webUrl = process.env.NEXT_PUBLIC_WEB_URL ?? 'http://localhost:3000'
    await fetch(`${webUrl}/api/revalidate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ secret: process.env.REVALIDATE_SECRET ?? '' }),
    }).catch(() => null)

    return NextResponse.json({
      ok: true,
      message: `✓ ${mappedCategories.length} catégories, ${products?.length ?? 0} produits importés depuis Odoo${mappedCategories.length === 0 ? ` — Champ catégorie détecté: "${catFieldName ?? 'AUCUN'}" | Champs POS dispo: ${posFields.join(', ')}` : ''}`,
      stats: { categories: mappedCategories.length, products: products?.length ?? 0, catField: catFieldName, posFields },
    })
  } catch (e: any) {
    return NextResponse.json({ ok: false, message: e.message }, { status: 500 })
  }
}
