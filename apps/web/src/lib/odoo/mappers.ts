import { imageUrl } from './client'
import type { MenuCategory, MenuItem, MenuData } from '@/lib/data/types'

// Catégorie POS Odoo → MenuCategory
export function mapCategory(cat: any, items: MenuItem[]): MenuCategory {
  const ICONS: Record<string, string> = {
    tapas: '🍢', snack: '🍢',
    box: '🍔', burger: '🍔', plat: '🍽️',
    dessert: '🍮', boisson: '🍹', bar: '🍹',
  }
  const slug = cat.name?.toLowerCase() ?? ''
  const icon = Object.entries(ICONS).find(([k]) => slug.includes(k))?.[1] ?? '🍽️'

  return {
    id: String(cat.id),
    name: cat.name,
    icon,
    items,
  }
}

// Produit Odoo (product.template) → MenuItem
export function mapProduct(p: any): MenuItem {
  return {
    id: String(p.id),
    name: p.name,
    desc: p.description_sale ?? '',
    price: p.list_price,
    img: imageUrl(p.id),
    active: p.active,
  }
}

// Groupe les produits par catégorie POS → MenuData
export function buildMenuData(
  categories: any[],
  products: any[]
): MenuData {
  const catMap = new Map<number, any[]>()

  for (const p of products) {
    const catId = Array.isArray(p.pos_category_ids) ? p.pos_category_ids[0] : null
    if (!catId) continue
    if (!catMap.has(catId)) catMap.set(catId, [])
    catMap.get(catId)!.push(mapProduct(p))
  }

  const mappedCats = categories
    .filter(c => catMap.has(c.id))
    .sort((a, b) => (a.sequence ?? 0) - (b.sequence ?? 0))
    .map(c => mapCategory(c, catMap.get(c.id) ?? []))

  return {
    categories: mappedCats,
    settings: {
      service: '18H — 23H',
      lastUpdated: new Date().toISOString().split('T')[0],
    },
  }
}
