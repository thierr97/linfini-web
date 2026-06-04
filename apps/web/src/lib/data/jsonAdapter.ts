import fs from 'fs/promises'
import path from 'path'
import type { DataAdapter, MenuData, MenuItem } from './types'

const DATA_PATH = path.join(process.cwd(), 'src/data/menu.json')

async function read(): Promise<MenuData> {
  const raw = await fs.readFile(DATA_PATH, 'utf-8')
  return JSON.parse(raw)
}

async function write(data: MenuData): Promise<void> {
  data.settings.lastUpdated = new Date().toISOString().split('T')[0]
  await fs.writeFile(DATA_PATH, JSON.stringify(data, null, 2), 'utf-8')
}

export const jsonAdapter: DataAdapter = {
  async getMenu() {
    return read()
  },

  async updateMenuItem(categoryId, itemId, updates) {
    const data = await read()
    const cat = data.categories.find(c => c.id === categoryId)
    if (!cat) throw new Error(`Catégorie ${categoryId} introuvable`)
    const idx = cat.items.findIndex(i => i.id === itemId)
    if (idx === -1) throw new Error(`Article ${itemId} introuvable`)
    cat.items[idx] = { ...cat.items[idx], ...updates }
    await write(data)
  },

  async addMenuItem(categoryId, item) {
    const data = await read()
    const cat = data.categories.find(c => c.id === categoryId)
    if (!cat) throw new Error(`Catégorie ${categoryId} introuvable`)
    const newItem: MenuItem = { ...item, id: `${categoryId}-${Date.now()}` }
    cat.items.push(newItem)
    await write(data)
    return newItem
  },

  async deleteMenuItem(categoryId, itemId) {
    const data = await read()
    const cat = data.categories.find(c => c.id === categoryId)
    if (!cat) throw new Error(`Catégorie ${categoryId} introuvable`)
    cat.items = cat.items.filter(i => i.id !== itemId)
    await write(data)
  },

  async updateSettings(settings) {
    const data = await read()
    data.settings = { ...data.settings, ...settings }
    await write(data)
  },
}
