import { NextResponse } from 'next/server'
import { getDb } from '@/lib/db'

const fallbackMenu = [
  {
    id: 'cat-tapas', name: 'Tapas & Snacks', slug: 'tapas', icon: '🍢',
    items: [
      { id: 'i1', name: 'Acras de morue', description: '', basePrice: 8, modifiers: [] },
      { id: 'i2', name: 'Boudins créoles', description: '', basePrice: 7, modifiers: [] },
    ],
  },
  {
    id: 'cat-boisson', name: 'Boissons', slug: 'boisson', icon: '🍹',
    items: [
      { id: 'b1', name: 'Rhum arrangé', description: '', basePrice: 6, modifiers: [] },
      { id: 'b2', name: 'Planteur', description: '', basePrice: 7, modifiers: [] },
      { id: 'b3', name: 'Eau minérale', description: '', basePrice: 2.5, modifiers: [] },
    ],
  },
]

export async function GET() {
  const db = await getDb()
  if (db) {
    const categories = await db.category.findMany({
      where: { active: true },
      include: {
        items: {
          where: { active: true },
          include: { modifiers: { where: { available: true } } },
          orderBy: { name: 'asc' },
        },
      },
      orderBy: { position: 'asc' },
    })
    return NextResponse.json(categories)
  }
  return NextResponse.json(fallbackMenu)
}
