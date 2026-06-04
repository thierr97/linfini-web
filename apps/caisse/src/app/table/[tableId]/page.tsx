import { NavBar } from '@/components/NavBar'
import { PosInterface } from '@/components/PosInterface'

interface Props {
  params: Promise<{ tableId: string }>
}

export default async function TablePage({ params }: Props) {
  const { tableId } = await params
  const res = await fetch(`${process.env.NEXT_PUBLIC_URL || 'http://localhost:3003'}/api/tables`, { cache: 'no-store' })
  const tables = res.ok ? await res.json() : []
  const table = tables.find((t: any) => t.id === tableId)

  return (
    <div className="flex flex-col h-screen">
      <NavBar />
      <div className="flex-1 overflow-hidden">
        <PosInterface tableId={tableId} tableName={table?.label || tableId} />
      </div>
    </div>
  )
}
