'use client'
import { create } from 'zustand'

export type CartLine = {
  id: string
  name: string
  price: number
  qty: number
  details?: string // e.g. sauce, fromage, garnitures for pizza
}

type CartStore = {
  lines: CartLine[]
  addLine: (line: Omit<CartLine, 'qty'>) => void
  removeLine: (id: string) => void
  updateQty: (id: string, qty: number) => void
  clear: () => void
  total: () => number
  count: () => number
}

export const useMenuCart = create<CartStore>((set, get) => ({
  lines: [],

  addLine: (line) => set(state => {
    const existing = state.lines.find(l => l.id === line.id)
    if (existing) {
      return { lines: state.lines.map(l => l.id === line.id ? { ...l, qty: l.qty + 1 } : l) }
    }
    return { lines: [...state.lines, { ...line, qty: 1 }] }
  }),

  removeLine: (id) => set(state => ({ lines: state.lines.filter(l => l.id !== id) })),

  updateQty: (id, qty) => set(state => {
    if (qty <= 0) return { lines: state.lines.filter(l => l.id !== id) }
    return { lines: state.lines.map(l => l.id === id ? { ...l, qty } : l) }
  }),

  clear: () => set({ lines: [] }),

  total: () => get().lines.reduce((s, l) => s + l.price * l.qty, 0),

  count: () => get().lines.reduce((s, l) => s + l.qty, 0),
}))
