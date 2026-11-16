import { Link } from 'react-router-dom'
import { StatCard } from '@/components/common/StatCard'
import { Button } from '@/components/ui/button'
import { slotCounts } from '@/services/parking-rules'
import { useParkingStore } from '@/store/parking-store'
import { CarFront, CircleParking, Ticket } from 'lucide-react'

export function ParkingBoard() {
  const ready = useParkingStore((state) => state.ready)
  const slots = useParkingStore((state) => state.slots)
  const visits = useParkingStore((state) => state.visits)
  const contracts = useParkingStore((state) => state.contracts)
  if (!ready) return null
  const counts = slotCounts(slots, visits)
  const waiting = contracts.filter((row) => row.status === 'under-verification' || row.status === 'verified' || row.status === 'approved').length
  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl tracking-tight">Parking book</h2>
          <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
            SOP-009 contracts, SOP-010 visits and SOP-011 office leases in this browser. These rows are separate from the yard-sample arrival chart.
          </p>
        </div>
        <Button type="button" variant="outline" asChild>
          <Link to="/parking">Open parking</Link>
        </Button>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard label="Occupied slots" value={String(counts.occupied)} hint="Active visits inside" icon={CarFront} />
        <StatCard label="Reserved slots" value={String(counts.reserved)} hint="Held and not yet entered" icon={CircleParking} />
        <StatCard label="Contracts waiting" value={String(waiting)} hint="Verification or approval" icon={Ticket} />
      </div>
    </section>
  )
}
