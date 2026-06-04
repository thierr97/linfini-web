import { jsonAdapter } from './jsonAdapter'
import { odooAdapter } from './odooAdapter'
import type { DataAdapter } from './types'

// Changer DATA_SOURCE=odoo dans .env.local pour basculer sur Odoo
const source = process.env.DATA_SOURCE ?? 'json'

export const dataService: DataAdapter = source === 'odoo' ? odooAdapter : jsonAdapter

export type { DataAdapter, MenuData, MenuCategory, MenuItem } from './types'
