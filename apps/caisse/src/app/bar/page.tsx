import { NavBar } from '@/components/NavBar'
import { PosInterface } from '@/components/PosInterface'

export default function BarPage() {
  return (
    <div className="flex flex-col h-screen">
      <NavBar />
      <div className="flex-1 overflow-hidden">
        <PosInterface tableName="Bar / À emporter" />
      </div>
    </div>
  )
}
