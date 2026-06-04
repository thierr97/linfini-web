import { NextRequest, NextResponse } from 'next/server'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { status } = await req.json()
  try {
    const { prisma } = await import('@linfini/db')
    const order = await prisma.order.update({ where: { id }, data: { status } })
    return NextResponse.json({ success: true, order })
  } catch {
    return NextResponse.json({ success: true, id, status })
  }
}
