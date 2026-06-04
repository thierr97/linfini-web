export interface MenuItem {
  id: string
  name: string
  desc: string
  price: number
  img: string
  active: boolean
}

export interface MenuCategory {
  id: string
  name: string
  icon: string
  items: MenuItem[]
}

export interface MenuData {
  categories: MenuCategory[]
  settings: {
    service: string
    lastUpdated: string
  }
}

export interface DataAdapter {
  getMenu(): Promise<MenuData>
  updateMenuItem(categoryId: string, itemId: string, data: Partial<MenuItem>): Promise<void>
  addMenuItem(categoryId: string, item: Omit<MenuItem, 'id'>): Promise<MenuItem>
  deleteMenuItem(categoryId: string, itemId: string): Promise<void>
  updateSettings(settings: Partial<MenuData['settings']>): Promise<void>
}
