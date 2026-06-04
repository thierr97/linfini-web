import { odooCall } from '@/lib/odoo/client'
import { buildMenuData } from '@/lib/odoo/mappers'
import type { DataAdapter, MenuData, MenuItem } from './types'

export const odooAdapter: DataAdapter = {

  // ── Lecture complète du menu depuis Odoo POS ────────────────────────────────
  async getMenu(): Promise<MenuData> {
    const [categories, products] = await Promise.all([
      // Catégories POS
      odooCall('pos.category', 'search_read',
        [[]], // pas de filtre → toutes les catégories
        { fields: ['id', 'name', 'sequence', 'parent_id'], limit: 50 }
      ),
      // Produits disponibles au POS
      odooCall('product.template', 'search_read',
        [[['available_in_pos', '=', true], ['active', 'in', [true, false]]]],
        {
          fields: ['id', 'name', 'description_sale', 'list_price', 'pos_category_ids', 'active'],
          limit: 200,
        }
      ),
    ])

    return buildMenuData(categories, products)
  },

  // ── Mise à jour d'un article dans Odoo ─────────────────────────────────────
  async updateMenuItem(_categoryId: string, itemId: string, data: Partial<MenuItem>) {
    const vals: Record<string, any> = {}
    if (data.name  !== undefined) vals.name      = data.name
    if (data.desc  !== undefined) vals.description_sale = data.desc
    if (data.price !== undefined) vals.list_price  = data.price
    if (data.active !== undefined) vals.active    = data.active

    if (Object.keys(vals).length > 0) {
      await odooCall('product.template', 'write', [[Number(itemId)], vals])
    }
  },

  // ── Ajout d'un article dans Odoo ───────────────────────────────────────────
  async addMenuItem(categoryId: string, item: Omit<MenuItem, 'id'>) {
    const id = await odooCall('product.template', 'create', [{
      name: item.name,
      description_sale: item.desc,
      list_price: item.price,
      available_in_pos: true,
      pos_category_ids: Number(categoryId),
      type: 'service',  // produit de type service pour restauration
    }])
    return { ...item, id: String(id) }
  },

  // ── Suppression (archivage) dans Odoo ──────────────────────────────────────
  async deleteMenuItem(_categoryId: string, itemId: string) {
    await odooCall('product.template', 'write', [[Number(itemId)], { active: false }])
  },

  // ── Paramètres (non géré côté Odoo — reste dans JSON local) ────────────────
  async updateSettings() {
    // Les paramètres généraux (horaires, etc.) restent dans menu.json
    // même en mode Odoo
  },
}

// ── Envoi d'une commande vers Odoo (sale.order) ───────────────────────────────
export async function pushOrderToOdoo(order: {
  tableLabel: string
  lines: { name: string; price: number; qty: number; odooProductId?: string }[]
  total: number
  note?: string
}) {
  // 1. Trouver ou créer le client "Table / Walk-in"
  let partnerId = 1  // Partenaire par défaut Odoo

  try {
    const partners = await odooCall('res.partner', 'search_read',
      [[['name', '=', 'Le District — Walk-in']]],
      { fields: ['id'], limit: 1 }
    )
    if (partners.length) {
      partnerId = partners[0].id
    } else {
      partnerId = await odooCall('res.partner', 'create', [{
        name: 'Le District — Walk-in',
        customer_rank: 1,
      }])
    }
  } catch { /* utilise le partenaire par défaut */ }

  // 2. Créer le bon de commande
  const saleOrderId = await odooCall('sale.order', 'create', [{
    partner_id: partnerId,
    note: `Table: ${order.tableLabel}${order.note ? ' | ' + order.note : ''}`,
    order_line: order.lines.map(line => [0, 0, {
      name: line.name,
      product_qty: line.qty,
      price_unit: line.price,
      ...(line.odooProductId ? { product_id: Number(line.odooProductId) } : {}),
    }]),
  }])

  // 3. Confirmer la commande automatiquement
  await odooCall('sale.order', 'action_confirm', [[saleOrderId]])

  return saleOrderId
}
