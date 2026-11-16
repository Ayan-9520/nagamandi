import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { PageHeader } from '@/components/common/PageHeader'
import { StatCard } from '@/components/common/StatCard'
import { LoadingState } from '@/components/common/LoadingState'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ArrivalNotice, ArrivalStatusBadge } from '@/features/arrivals/ArrivalBits'
import { ARRIVAL_AS_OF, formatQty, kalDate, statusLabel } from '@/features/arrivals/meta'
import { useArrivalStore } from '@/store/arrival-store'
import { ARRIVAL_STATUSES, type ArrivalStatus } from '@/types/arrival'
import { Boxes, ClipboardList, Scale, Search } from 'lucide-react'

export function ArrivalDashboardPage() {
  const ready = useArrivalStore((state) => state.ready)
  const lots = useArrivalStore((state) => state.lots)
  const resetArrivals = useArrivalStore((state) => state.resetArrivals)
  const [restoreOpen, setRestoreOpen] = useState(false)
  const counts = useMemo(() => {
    const map = {} as Record<ArrivalStatus, number>
    for (const status of ARRIVAL_STATUSES) map[status] = lots.filter((row) => row.status === status).length
    return map
  }, [lots])
  if (!ready) return <LoadingState label="Loading the demonstration gate" />
  const today = lots.filter((row) => kalDate(row.arrivedAt) === ARRIVAL_AS_OF && row.status !== 'cancelled')
  const quintals = today.filter((row) => row.unitSymbol === 'q').reduce((sum, row) => sum + row.quantity, 0)
  const crates = lots.filter((row) => row.crateCount > 0 && row.status !== 'dispatched' && row.status !== 'cancelled').reduce((sum, row) => sum + row.crateCount, 0)

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="DEMO · gate"
        title="Daily arrivals"
        description={`Lots recorded for the demonstration day ${ARRIVAL_AS_OF}. Numbers and slips stay in this browser.`}
        actions={<Button type="button" variant="outline" onClick={() => setRestoreOpen(true)}>Restore arrival sample</Button>}
      />
      <ArrivalNotice />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="On the sample day" value={String(today.length)} hint="Lots that are not cancelled" icon={ClipboardList} />
        <StatCard label="Under inspection" value={String(counts['under-inspection'])} hint="Inspection bay" icon={Search} />
        <StatCard label="Quintals kept" value={formatQty(quintals, 'q')} hint="Sample-day quantity in quintals" icon={Scale} />
        <StatCard label="Crates on the yard" value={String(crates)} hint="Not dispatched or cancelled" icon={Boxes} />
      </div>
      <section className="space-y-3">
        <h2 className="font-display text-2xl tracking-tight">Lot status</h2>
        <ol className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
          {ARRIVAL_STATUSES.map((status, index) => (
            <li key={status} className="flex min-w-0 flex-col gap-2 rounded-xl bg-card px-3 py-3 ring-1 ring-foreground/10">
              <span className="flex items-center justify-between gap-2">
                <span className="text-xs text-muted-foreground">Step {index + 1}</span>
                <span className="font-display text-2xl leading-none">{counts[status]}</span>
              </span>
              <ArrivalStatusBadge status={status} />
            </li>
          ))}
        </ol>
      </section>
      <section className="space-y-3">
        <h2 className="font-display text-2xl tracking-tight">Open a step</h2>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {[
            { to: '/arrivals/new', label: 'New goods arrival', detail: 'Seller, aadathiya, commodity, weighment and crates' },
            { to: '/arrivals/register', label: 'Arrival register', detail: 'Every demonstration lot in this browser' },
            { to: '/arrivals/crates', label: 'Crate inventory', detail: 'Crates still on the demonstration yard' },
          ].map((item) => (
            <Link key={item.to} to={item.to} className="rounded-xl bg-card px-4 py-3 ring-1 ring-foreground/10 transition-colors hover:bg-accent">
              <span className="block text-sm font-medium">{item.label}</span>
              <span className="mt-1 block text-xs leading-5 text-muted-foreground">{item.detail}</span>
            </Link>
          ))}
        </div>
      </section>
      <Card>
        <CardHeader>
          <CardTitle>Latest on the sample day</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {today.length === 0 ? <p>No lot is dated {ARRIVAL_AS_OF}.</p> : null}
          {today.slice(0, 4).map((row) => (
            <Link key={row.id} to={`/arrivals/${row.id}`} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border px-3 py-2 hover:bg-accent">
              <span>{row.lotNo} · {row.sellerLabel} · {row.commodityName} · {formatQty(row.quantity, row.unitSymbol)}</span>
              <span className="text-xs text-muted-foreground">{statusLabel(row.status)}</span>
            </Link>
          ))}
        </CardContent>
      </Card>
      <Dialog open={restoreOpen} onOpenChange={setRestoreOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Restore the arrival sample?</DialogTitle>
            <DialogDescription>This replaces gate lots stored in this browser with the original demonstration set. Stakeholder registers and licence cases stay.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setRestoreOpen(false)}>Keep current lots</Button>
            <Button type="button" onClick={() => { resetArrivals(); setRestoreOpen(false); toast.success('The arrival sample was restored in this browser.') }}>Restore sample</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
