import { NextRequest, NextResponse } from 'next/server'

const MOCK_TABLES: Record<string, { id: string; number: string; label: string; capacity: number }> = {
  'table-1': { id: 'table-1', number: '1', label: 'Table 1', capacity: 4 },
  'table-2': { id: 'table-2', number: '2', label: 'Table 2', capacity: 4 },
  'table-3': { id: 'table-3', number: '3', label: 'Table 3', capacity: 6 },
  'table-4': { id: 'table-4', number: '4', label: 'Table 4', capacity: 2 },
  'table-5': { id: 'table-5', number: '5', label: 'Table Salon VIP', capacity: 8 },
  'table-bar': { id: 'table-bar', number: 'B1', label: 'Bar Comptoir', capacity: 6 },
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ tableId: string }> }) {
  const { tableId } = await params
  try {
    const { prisma } = await import('@linfini/db')
    const table = await prisma.table.findUnique({ where: { id: tableId } })
    if (table) return NextResponse.json({ table })
  } catch { /* DB not available */ }

  // Fallback mock
  const table = MOCK_TABLES[tableId] ?? { id: tableId, number: tableId, label: `Table ${tableId}`, capacity: 4 }
  return NextResponse.json({ table })
}
