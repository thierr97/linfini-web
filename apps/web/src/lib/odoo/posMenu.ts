// Menu public du site, lu depuis la caisse Odoo POS (source de vérité).
// Sens unique Odoo → site : aucune écriture vers Odoo ici.
//
// Résilience (spec §8) : cache mémoire 15 min ; si Odoo est injoignable on sert
// le dernier menu connu, et à froid le snapshot embarqué src/data/menu.json.

import { odooCall, imageUrl } from './client'
import { curatedImage } from './menuImages'
import type { MenuData, MenuCategory, MenuItem } from '@/lib/data/types'
import snapshot from '@/data/menu.json'

// ── Mapping catégories POS Odoo → sections du site (spec §5) ─────────────────
export interface PosSection {
  odooId: number
  name: string
  icon: string
  fallbackImg: string   // image de catégorie si /menu/{id}-cut.png absent
  clubOnly?: boolean    // ENTRER : page /club, pas /menu
  food?: boolean        // exclu de la page /bar
}

export const POS_SECTIONS: PosSection[] = [
  { odooId: 13, name: 'Tapas / Resto',        icon: '🍢', fallbackImg: '/menu/mix-tapas.jpg', food: true },
  { odooId: 5,  name: 'Créations',            icon: '🍹', fallbackImg: '/menu/cocktail-creation-cut.png' },
  { odooId: 1,  name: 'Cocktails classiques', icon: '🍸', fallbackImg: '/menu/cocktail-cut.png' },
  { odooId: 9,  name: 'Sans alcool',          icon: '🍃', fallbackImg: '/menu/mocktail-cut.png' },
  { odooId: 7,  name: 'Au verre',             icon: '🥃', fallbackImg: '/menu/glass-spirits-cut.png' },
  { odooId: 2,  name: 'Softs & Jus',          icon: '🥤', fallbackImg: '/menu/soft-drink-cut.png' },
  { odooId: 6,  name: 'Bières',               icon: '🍺', fallbackImg: '/menu/corona-cut.png' },
  { odooId: 4,  name: 'Champagnes',           icon: '🥂', fallbackImg: '/menu/champagne.jpg' },
  { odooId: 10, name: 'Vins',                 icon: '🍷', fallbackImg: '/menu/wine-cut.png' },
  { odooId: 3,  name: 'Bouteilles',           icon: '🍾', fallbackImg: '/menu/whisky-cut.png' },
  { odooId: 12, name: 'Chicha',               icon: '💨', fallbackImg: '/menu/chicha-cut.png' },
  { odooId: 8,  name: 'Entrées',              icon: '🎟️', fallbackImg: '/menu/entrance-cut.png', clubOnly: true },
]

// Catégories où l'on préfère la photo Odoo : bouteilles (marque distincte) ET
// cocktails (Odoo a de vraies belles photos ; les assets curés cocktails sont
// souvent des dessins de recette). Pour food/softs/bières, on garde le curé.
const ODOO_IMAGE_SECTIONS = new Set([
  'Champagnes', 'Bouteilles', 'Au verre',
  'Cocktails classiques', 'Créations', 'Sans alcool',
  'Tapas / Resto',   // vraies photos plats dans Odoo (mix tapas, accras, burgers…)
  'Softs & Jus',     // Thierry a uploadé les vraies canettes/jus 33cl dans Odoo
])

// Produits dont l'image Odoo est fausse/aberrante → forcer le curé.
// - ricard/pastis : photo Odoo sans rapport (lampe/sac)
// - carbonara : Odoo montre la photo de la Bolognaise → on garde la vraie carbonara curée
const BAD_ODOO_IMAGE = /ricard|pastis|carbonara/i

// ── Cache mémoire ─────────────────────────────────────────────────────────────
const TTL_MS = 15 * 60 * 1000

let cache: { data: MenuData; at: number } | null = null
let lastSync: string | null = null
let lastSource: 'odoo' | 'cache' | 'snapshot' = 'snapshot'

// ── Lecture Odoo ──────────────────────────────────────────────────────────────
async function fetchFromOdoo(): Promise<MenuData> {
  const [products, withImageIds] = await Promise.all([
    odooCall<any[]>('product.template', 'search_read',
      [[
        ['available_in_pos', '=', true],
        ['active', '=', true],
        ['list_price', '>', 0],
      ]],
      { fields: ['id', 'name', 'description_sale', 'list_price', 'pos_categ_ids', 'write_date'], limit: 500 }
    ),
    // IDs des produits qui ont réellement une image dans Odoo (sans télécharger l'image)
    odooCall<number[]>('product.template', 'search',
      [[['available_in_pos', '=', true], ['active', '=', true], ['image_512', '!=', false]]],
      { limit: 500 }
    ),
  ])
  const hasImage = new Set<number>(withImageIds)

  const categories: MenuCategory[] = POS_SECTIONS.map(sec => ({
    id: String(sec.odooId),
    name: sec.name,
    icon: sec.icon,
    items: products
      // catégorie principale = première catégorie POS du produit
      .filter(p => (p.pos_categ_ids ?? [])[0] === sec.odooId)
      // bouteilles de service internes : jamais sur le site (spec §5)
      .filter(p => !String(p.name).toUpperCase().includes('SERVICE'))
      .sort((a, b) => String(a.name).localeCompare(String(b.name), 'fr'))
      .map((p): MenuItem => {
        const odoo = hasImage.has(p.id) && !BAD_ODOO_IMAGE.test(p.name) ? imageUrl(p.id) : null
        const curated = curatedImage(p.name, sec.name)
        // Bouteilles/spiritueux : la MARQUE compte et Odoo a de vraies photos
        // distinctes → on préfère Odoo. Ailleurs (cocktails, food, softs, bières)
        // les images Odoo sont réutilisées/fausses → on préfère le mapping curé.
        const odooFirst = ODOO_IMAGE_SECTIONS.has(sec.name)
        const img = odooFirst
          ? (odoo ?? curated ?? sec.fallbackImg)
          : (curated ?? odoo ?? sec.fallbackImg)
        return {
          id: String(p.id),
          name: p.name,
          desc: p.description_sale || '',
          price: p.list_price,
          img,
          fallbackImg: sec.fallbackImg,
          active: true,
        }
      }),
  })).filter(c => c.items.length > 0)

  return {
    categories,
    settings: {
      service: snapshot.settings?.service ?? '18H — 23H',
      lastUpdated: new Date().toISOString().split('T')[0],
    },
  }
}

// ── Snapshot embarqué (dernier recours, jamais d'erreur visible) ─────────────
function snapshotMenu(): MenuData {
  return {
    categories: POS_SECTIONS
      .map((sec): MenuCategory | null => {
        const cat = (snapshot.categories as MenuCategory[]).find(c => c.id === String(sec.odooId))
        if (!cat) return null
        return {
          ...cat,
          name: sec.name,
          icon: sec.icon,
          items: cat.items
            .filter(i => i.active !== false && i.price > 0 && !i.name.toUpperCase().includes('SERVICE'))
            .map(i => ({ ...i, fallbackImg: sec.fallbackImg })),
        }
      })
      .filter((cat): cat is MenuCategory => Boolean(cat && cat.items.length > 0)),
    settings: snapshot.settings,
  }
}

// ── API publique ──────────────────────────────────────────────────────────────
export async function getPosMenu(): Promise<MenuData> {
  if (cache && Date.now() - cache.at < TTL_MS) return cache.data
  try {
    const data = await fetchFromOdoo()
    cache = { data, at: Date.now() }
    lastSync = new Date().toISOString()
    lastSource = 'odoo'
    return data
  } catch {
    if (cache) {
      lastSource = 'cache'
      return cache.data
    }
    lastSource = 'snapshot'
    return snapshotMenu()
  }
}

/** Sections pour la page /menu (tout sauf clubOnly). */
export function menuSections(menu: MenuData): MenuCategory[] {
  const club = new Set(POS_SECTIONS.filter(s => s.clubOnly).map(s => String(s.odooId)))
  return menu.categories.filter(c => !club.has(c.id))
}

/** Sections pour la page /bar (boissons + chicha, sans resto ni club). */
export function barSections(menu: MenuData): MenuCategory[] {
  const excluded = new Set(POS_SECTIONS.filter(s => s.clubOnly || s.food).map(s => String(s.odooId)))
  return menu.categories.filter(c => !excluded.has(c.id))
}

/** Retrouve des produits par ID Odoo, dans l'ordre demandé (teasers homepage). */
export function pickItems(menu: MenuData, ids: number[]): MenuItem[] {
  const all = new Map(menu.categories.flatMap(c => c.items.map(i => [i.id, i] as const)))
  return ids.map(id => all.get(String(id))).filter((i): i is MenuItem => Boolean(i))
}

/** Vide le cache mémoire (webhook /api/revalidate) pour resynchroniser immédiatement. */
export function clearPosMenuCache() {
  cache = null
}

/** État de la synchro pour /api/health. */
export function menuHealth() {
  return { lastSync, source: lastSource, cachedAt: cache ? new Date(cache.at).toISOString() : null }
}
