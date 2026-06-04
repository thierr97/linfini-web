import { NavBar } from '@/components/NavBar'
import { TableMap } from '@/components/TableMap'

export default function HomePage() {
  return (
    <div className="flex flex-col h-screen">
      <NavBar />
      <div className="flex-1 overflow-hidden">
        <TableMap />
      </div>
    </div>
  )
}
