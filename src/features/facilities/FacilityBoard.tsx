import { Link } from 'react-router-dom'
import { StatCard } from '@/components/common/StatCard'
import { Button } from '@/components/ui/button'
import { useFacilityStore } from '@/store/facility-store'
import { BedDouble, Building2, ClipboardCheck } from 'lucide-react'

export function FacilityBoard() {
  const ready = useFacilityStore((state) => state.ready)
  const sites = useFacilityStore((state) => state.sites)
  const stays = useFacilityStore((state) => state.stays)
  const leases = useFacilityStore((state) => state.leases)
  if (!ready) return null
  const open = stays.filter((row) => row.status === 'open').length
  const waiting = leases.filter((row) => row.status === 'under-verification' || row.status === 'verified' || row.status === 'approved').length
  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl tracking-tight">Facilities book</h2>
          <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
            SOP-012 to SOP-015 leases and checks in this browser. These rows are separate from the yard-sample arrival chart.
          </p>
        </div>
        <Button type="button" variant="outline" asChild>
          <Link to="/facilities">Open facilities</Link>
        </Button>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard label="Sites" value={String(sites.length)} hint="Kisan Bhavan, hotel and restaurant" icon={Building2} />
        <StatCard label="Open stays" value={String(open)} hint="Fictional guest codes" icon={BedDouble} />
        <StatCard label="Leases waiting" value={String(waiting)} hint="Verification or approval" icon={ClipboardCheck} />
      </div>
    </section>
  )
}
