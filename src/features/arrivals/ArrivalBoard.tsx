import { Link } from 'react-router-dom'
import { StatCard } from '@/components/common/StatCard'
import { Button } from '@/components/ui/button'
import { ARRIVAL_AS_OF, formatQty, kalDate } from '@/features/arrivals/meta'
import { useArrivalStore } from '@/store/arrival-store'
import { Boxes, ClipboardList, Scale, Search } from 'lucide-react'

export function ArrivalBoard() {
  const ready = useArrivalStore((state) => state.ready)
  const lots = useArrivalStore((state) => state.lots)
  if (!ready) return null
  const today = lots.filter((row) => kalDate(row.arrivedAt) === ARRIVAL_AS_OF)
  const quintals = today.filter((row) => row.unitSymbol === 'q' && row.status !== 'cancelled').reduce((sum, row) => sum + row.quantity, 0)
  const crates = lots.filter((row) => row.crateCount > 0 && row.status !== 'dispatched' && row.status !== 'cancelled').reduce((sum, row) => sum + row.crateCount, 0)
  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl tracking-tight">Gate lots</h2>
          <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
            Arrivals stored in this browser for {ARRIVAL_AS_OF}. These rows are separate from the yard sample chart.
          </p>
        </div>
        <Button type="button" variant="outline" asChild>
          <Link to="/arrivals">Open arrivals</Link>
        </Button>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Arrived on the sample day" value={String(today.length)} hint="Includes every status recorded that day" icon={ClipboardList} />
        <StatCard label="Under inspection" value={String(lots.filter((row) => row.status === 'under-inspection').length)} hint="Waiting on the bay" icon={Search} />
        <StatCard label="Quintals kept" value={formatQty(quintals, 'q')} hint="Sample-day lots that are not cancelled" icon={Scale} />
        <StatCard label="Crates on the yard" value={String(crates)} hint="Excludes dispatched and cancelled lots" icon={Boxes} />
      </div>
    </section>
  )
}
