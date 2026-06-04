export type TableStatus = 'FREE' | 'OCCUPIED' | 'PENDING' | 'READY'

export interface TableWithStatus {
  id: string
  number: string
  label: string
  capacity: number
  posX: number
  posY: number
  status: TableStatus
  activeOrderId?: string
  activeOrderTotal?: number
  activeOrderItems?: number
}

export interface CartItem {
  id: string
  itemId: string
  name: string
  price: number
  quantity: number
  modifiers: string[]
  note?: string
}

export interface CartState {
  tableId: string | null
  tableName: string | null
  items: CartItem[]
  note: string
}
