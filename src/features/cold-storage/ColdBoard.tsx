import { Link } from 'react-router-dom'
import { StatCard } from '@/components/common/StatCard'
import { Button } from '@/components/ui/button'
import { breachCount, formatUnits, occupancy } from '@/services/cold-rules'
import { useColdStore } from '@/store/cold-store'
import { ClipboardCheck, Snowflake, Thermometer } from 'lucide-react'

export function ColdBoard() {
  const ready = useColdStore((state) => state.ready)
  const chambers = useColdStore((state) => state.chambers)
  const moves = useColdStore((state) => state.moves)
  const readings = useColdStore((state) => state.readings)
  const contracts = useColdStore((state) => state.contracts)
  if (!ready) return null
  const used = chambers.reduce((total, chamber) => total + occupancy(chamber, moves).used, 0)
  const waiting = contracts.filter((row) => row.status === 'under-verification' || row.status === 'verified' || row.status === 'approved').length
  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl tracking-tight">Cold storage book</h2>
          <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
            SOP-006 contracts and SOP-007 chamber readings in this browser. These rows are separate from the yard-sample cold-room count.
          </p>
        </div>
        <Button type="button" variant="outline" asChild>
          <Link to="/cold-storage">Open cold storage</Link>
        </Button>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard label="Chambers" value={String(chambers.length)} hint="Dimapur sample rooms" icon={Snowflake} />
        <StatCard label="Stock inside" value={`${formatUnits(used)} q`} hint="Linked to gate lots" icon={ClipboardCheck} />
        <StatCard label="Threshold warnings" value={String(breachCount(chambers, readings))} hint={`${waiting} contracts waiting`} icon={Thermometer} />
      </div>
    </section>
  )
}
