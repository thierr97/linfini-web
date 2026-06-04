import { create } from 'zustand'
import type { CartItem, CartState } from '@/types'

interface CartStore extends CartState {
  addItem: (item: Omit<CartItem, 'id'>) => void
  removeItem: (id: string) => void
  updateQty: (id: string, qty: number) => void
  setTable: (tableId: string | null, tableName: string | null) => void
  setNote: (note: string) => void
  clear: () => void
  total: () => number
}

export const useCartStore = create<CartStore>((set, get) => ({
  tableId: null,
  tableName: null,
  items: [],
  note: '',

  addItem: (item) => {
    set((state) => {
      const existing = state.items.find(
        (i) => i.itemId === item.itemId && JSON.stringify(i.modifiers) === JSON.stringify(item.modifiers)
      )
      if (existing) {
        return {
          items: state.items.map((i) =>
            i.id === existing.id ? { ...i, quantity: i.quantity + 1 } : i
          ),
        }
      }
      return {
        items: [...state.items, { ...item, id: crypto.randomUUID() }],
      }
    })
  },

  removeItem: (id) =>
    set((state) => ({ items: state.items.filter((i) => i.id !== id) })),

  updateQty: (id, qty) =>
    set((state) => ({
      items:
        qty <= 0
          ? state.items.filter((i) => i.id !== id)
          : state.items.map((i) => (i.id === id ? { ...i, quantity: qty } : i)),
    })),

  setTable: (tableId, tableName) => set({ tableId, tableName }),
  setNote: (note) => set({ note }),
  clear: () => set({ tableId: null, tableName: null, items: [], note: '' }),

  total: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
}))
