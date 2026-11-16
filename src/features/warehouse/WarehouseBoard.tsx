import { Link } from 'react-router-dom'
import { StatCard } from '@/components/common/StatCard'
import { Button } from '@/components/ui/button'
import { formatUnits, occupancy } from '@/services/warehouse-rules'
import { useWarehouseStore } from '@/store/warehouse-store'
import { Boxes, ClipboardCheck, Warehouse } from 'lucide-react'

export function WarehouseBoard() {
  const ready = useWarehouseStore((state) => state.ready)
  const sheds = useWarehouseStore((state) => state.sheds)
  const moves = useWarehouseStore((state) => state.moves)
  const contracts = useWarehouseStore((state) => state.contracts)
  if (!ready) return null
  const used = sheds.reduce((total, shed) => total + occupancy(shed, moves).used, 0)
  const waiting = contracts.filter((row) => row.status === 'under-verification' || row.status === 'verified' || row.status === 'approved').length
  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl tracking-tight">Warehouse book</h2>
          <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
            SOP-004 contracts and SOP-005 stock in this browser. These rows are separate from the yard-sample occupancy chart.
          </p>
        </div>
        <Button type="button" variant="outline" asChild>
          <Link to="/warehouses">Open warehouses</Link>
        </Button>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard label="Sheds" value={String(sheds.length)} hint="Dimapur sample sheds" icon={Warehouse} />
        <StatCard label="Stock inside" value={`${formatUnits(used)} q`} hint="Linked to gate lots" icon={Boxes} />
        <StatCard label="Contracts waiting" value={String(waiting)} hint="Verification or approval" icon={ClipboardCheck} />
      </div>
    </section>
  )
}
