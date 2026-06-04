import { create } from 'zustand'

interface Topping {
  key: string
  name: string
  price: number
  premium: boolean
}

export interface CartItem {
  id: string
  type: 'salade' | 'tapas' | 'braise' | 'bar'
  name: string
  unitPrice: number
  quantity: number
  modifiers: { name: string; price: number }[]
  note?: string
}

interface BraiseSelection {
  plateau: string
  cuisson: string
  sauce: string
}

interface CartState {
  items: CartItem[]
  tableId: string
  tableLabel: string
  activeCategory: 'salade' | 'tapas' | 'braise' | 'bar'
  pizzaSize: string
  pizzaSizePrice: number
  pizzaSauce: string
  pizzaFromage: string
  pizzaFromageExtra: number
  saladeBase: string
  saladeBasePrice: number
  saladeSauce: string
  toppings: Topping[]
  note: string
  tapasQuantities: Record<string, number>
  braiseSelection: BraiseSelection
  barQuantities: Record<string, number>
  setTable: (id: string, label: string) => void
  setActiveCategory: (cat: CartState['activeCategory']) => void
  setPizzaSize: (val: string, price: number) => void
  setPizzaSauce: (val: string) => void
  setPizzaFromage: (val: string, extra: number) => void
  setSaladeBase: (val: string, price: number) => void
  setSaladeSauce: (val: string) => void
  toggleTopping: (t: Topping) => boolean
  setNote: (n: string) => void
  addToCart: () => void
  setTapasQty: (id: string, qty: number) => void
  addTapasToCart: (items: { id: string; name: string; price: number }[]) => void
  getTapasTotal: (items: { id: string; price: number }[]) => number
  setBraiseSelection: (update: Partial<BraiseSelection>) => void
  addBraiseToCart: (
    plateaux: { id: string; label: string; price: number }[],
    cuissons: { id: string; label: string }[],
    sauces: { id: string; label: string }[]
  ) => void
  setBarQty: (id: string, qty: number) => void
  addBarToCart: (items: { id: string; name: string; price: number }[]) => void
  getBarTotal: (items: { id: string; price: number }[]) => number
  removeItem: (id: string) => void
  clearCart: () => void
  getBuilderTotal: () => number
  getCartTotal: () => number
}

const defaultPizzaBuilder = {
  pizzaSize: '26cm',
  pizzaSizePrice: 8,
  pizzaSauce: 'Sauce Tomate',
  pizzaFromage: 'Mozzarella',
  pizzaFromageExtra: 0,
  toppings: [] as Topping[],
  note: '',
}

const defaultBraiseSelection: BraiseSelection = {
  plateau: '',
  cuisson: 'a-point',
  sauce: 'poivre',
}

export const useCart = create<CartState>((set, get) => ({
  items: [],
  tableId: '',
  tableLabel: '',
  activeCategory: 'tapas',
  ...defaultPizzaBuilder,
  saladeBase: 'Jeunes pousses',
  saladeBasePrice: 12,
  saladeSauce: 'Vinaigrette maison',
  tapasQuantities: {},
  braiseSelection: defaultBraiseSelection,
  barQuantities: {},

  setTable: (tableId, tableLabel) => set({ tableId, tableLabel }),
  setActiveCategory: (activeCategory) => set({ activeCategory, toppings: [], note: '' }),
  setPizzaSize: (pizzaSize, pizzaSizePrice) => set({ pizzaSize, pizzaSizePrice }),
  setPizzaSauce: (pizzaSauce) => set({ pizzaSauce }),
  setPizzaFromage: (pizzaFromage, pizzaFromageExtra) => set({ pizzaFromage, pizzaFromageExtra }),
  setSaladeBase: (saladeBase, saladeBasePrice) => set({ saladeBase, saladeBasePrice }),
  setSaladeSauce: (saladeSauce) => set({ saladeSauce }),

  toggleTopping: (topping) => {
    const { toppings } = get()
    const idx = toppings.findIndex(t => t.key === topping.key)
    if (idx > -1) {
      set({ toppings: toppings.filter(t => t.key !== topping.key) })
      return false
    }
    if (toppings.length >= 5) return false
    set({ toppings: [...toppings, topping] })
    return true
  },

  setNote: (note) => set({ note }),

  addToCart: () => {
    const s = get()
    const mods = s.toppings.map(t => ({ name: t.name, price: t.price }))
    const total = s.getBuilderTotal()
    const name = `Salade ${s.saladeBase} — ${s.saladeSauce}`
    const type: CartItem['type'] = 'salade'
    const item: CartItem = {
      id: crypto.randomUUID(),
      type,
      name,
      unitPrice: total,
      quantity: 1,
      modifiers: mods,
      note: s.note || undefined,
    }
    set({ items: [...s.items, item], ...defaultPizzaBuilder })
  },

  setTapasQty: (id, qty) =>
    set(s => ({ tapasQuantities: { ...s.tapasQuantities, [id]: qty } })),

  getTapasTotal: (tapasData) => {
    const { tapasQuantities } = get()
    return tapasData.reduce((sum, t) => sum + (tapasQuantities[t.id] ?? 0) * t.price, 0)
  },

  addTapasToCart: (tapasData) => {
    const { tapasQuantities, items } = get()
    const newItems: CartItem[] = []
    for (const [id, qty] of Object.entries(tapasQuantities)) {
      if (qty <= 0) continue
      const tapas = tapasData.find(t => t.id === id)
      if (!tapas) continue
      newItems.push({
        id: crypto.randomUUID(),
        type: 'tapas',
        name: tapas.name,
        unitPrice: tapas.price * qty,
        quantity: qty,
        modifiers: [],
      })
    }
    if (newItems.length > 0) set({ items: [...items, ...newItems], tapasQuantities: {} })
  },

  setBraiseSelection: (update) =>
    set(s => ({ braiseSelection: { ...s.braiseSelection, ...update } })),

  addBraiseToCart: (plateaux, cuissons, sauces) => {
    const { braiseSelection, items } = get()
    const plateau = plateaux.find(p => p.id === braiseSelection.plateau)
    if (!plateau) return
    const cuisson = cuissons.find(c => c.id === braiseSelection.cuisson)
    const sauce = sauces.find(s => s.id === braiseSelection.sauce)
    const item: CartItem = {
      id: crypto.randomUUID(),
      type: 'braise',
      name: `Plateau Braise ${plateau.label}`,
      unitPrice: plateau.price,
      quantity: 1,
      modifiers: [
        ...(cuisson ? [{ name: `Cuisson: ${cuisson.label}`, price: 0 }] : []),
        ...(sauce && sauce.id !== 'sans' ? [{ name: `Sauce: ${sauce.label}`, price: 0 }] : []),
      ],
    }
    set({ items: [...items, item], braiseSelection: defaultBraiseSelection })
  },

  setBarQty: (id, qty) =>
    set(s => ({ barQuantities: { ...s.barQuantities, [id]: qty } })),

  getBarTotal: (boissonsData) => {
    const { barQuantities } = get()
    return boissonsData.reduce((sum, b) => sum + (barQuantities[b.id] ?? 0) * b.price, 0)
  },

  addBarToCart: (boissonsData) => {
    const { barQuantities, items } = get()
    const newItems: CartItem[] = []
    for (const [id, qty] of Object.entries(barQuantities)) {
      if (qty <= 0) continue
      const boisson = boissonsData.find(b => b.id === id)
      if (!boisson) continue
      newItems.push({
        id: crypto.randomUUID(),
        type: 'bar',
        name: boisson.name,
        unitPrice: boisson.price * qty,
        quantity: qty,
        modifiers: [],
      })
    }
    if (newItems.length > 0) set({ items: [...items, ...newItems], barQuantities: {} })
  },

  removeItem: (id) => set(s => ({ items: s.items.filter(i => i.id !== id) })),
  clearCart: () => set({ items: [] }),

  getBuilderTotal: () => {
    const s = get()
    return s.saladeBasePrice + s.toppings.reduce((a, t) => a + t.price, 0)
  },

  getCartTotal: () => {
    const { items } = get()
    return items.reduce((a, i) => a + i.unitPrice, 0)
  },
}))
