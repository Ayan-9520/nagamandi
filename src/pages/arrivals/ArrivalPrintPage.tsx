import { Link, useParams } from 'react-router-dom'
import { EmptyState } from '@/components/common/EmptyState'
import { LoadingState } from '@/components/common/LoadingState'
import { Button } from '@/components/ui/button'
import { LotQr } from '@/features/arrivals/ArrivalBits'
import { bayLabel, formatQty, kalDate, statusLabel } from '@/features/arrivals/meta'
import { mandiName } from '@/services/registry-rules'
import { useArrivalStore } from '@/store/arrival-store'
import { useRegistryStore } from '@/store/registry-store'
import { formatDateTime, formatFullDay } from '@/utils/format'

export function ArrivalPrintPage() {
  const { id = '' } = useParams()
  const ready = useArrivalStore((state) => state.ready)
  const row = useArrivalStore((state) => state.lots.find((item) => item.id === id))
  const locations = useRegistryStore((state) => state.locations)
  if (!ready) return <LoadingState label="Loading the demonstration slip" />
  if (!row) return <EmptyState title="Nothing to print" description="Register a demonstration lot before opening a slip." />

  return (
    <div className="space-y-4">
      <div className="no-print flex flex-wrap gap-2">
        <Button type="button" variant="outline" asChild><Link to={`/arrivals/${row.id}`}>Back to the lot</Link></Button>
        <Button type="button" onClick={() => window.print()}>Print arrival slip</Button>
      </div>
      <article className="print-sheet mx-auto max-w-3xl space-y-6 rounded-xl border-2 border-primary bg-white p-8 text-slate-900">
        <header className="flex items-start justify-between gap-4 border-b border-primary/30 pb-4">
          <div>
            <p className="text-xs tracking-[0.2em] text-primary uppercase">Naga Mandi OS · gate</p>
            <h1 className="font-display text-3xl text-primary">Arrival slip</h1>
            <p className="text-sm">Not a gate pass. Not a receipt.</p>
          </div>
          <p className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-950">DEMO</p>
        </header>
        <p className="font-display text-2xl">{row.lotNo}</p>
        <dl className="grid gap-3 text-sm sm:grid-cols-2">
          <div><dt className="text-slate-500">Arrival</dt><dd>{row.arrivalNo}</dd></div>
          <div><dt className="text-slate-500">Status</dt><dd>{statusLabel(row.status)}</dd></div>
          <div><dt className="text-slate-500">Seller</dt><dd>{row.sellerLabel}</dd></div>
          <div><dt className="text-slate-500">Aadathiya</dt><dd>{row.aadathiyaLabel}</dd></div>
          <div><dt className="text-slate-500">Commodity</dt><dd>{row.commodityName}</dd></div>
          <div><dt className="text-slate-500">Grade</dt><dd>{row.gradeName}</dd></div>
          <div><dt className="text-slate-500">Quantity</dt><dd>{formatQty(row.quantity, row.unitSymbol)}</dd></div>
          <div><dt className="text-slate-500">Weighment</dt><dd>{formatQty(row.gross, row.unitSymbol)} gross · {formatQty(row.tare, row.unitSymbol)} tare · {formatQty(row.net, row.unitSymbol)} net</dd></div>
          <div><dt className="text-slate-500">Bay</dt><dd>{bayLabel(row.bay)}</dd></div>
          <div><dt className="text-slate-500">Vehicle</dt><dd>{row.vehicleNo}</dd></div>
          <div><dt className="text-slate-500">Crates</dt><dd>{row.crateCount > 0 ? `${row.crateCount} · ${row.crateCode}` : 'None'}</dd></div>
          <div><dt className="text-slate-500">Mandi</dt><dd>{mandiName(locations, row.mandiId)} · {row.mandiId}</dd></div>
          <div><dt className="text-slate-500">Arrived</dt><dd>{formatFullDay(kalDate(row.arrivedAt))} · {formatDateTime(row.arrivedAt)}</dd></div>
        </dl>
        <div className="flex flex-wrap items-center gap-4">
          <LotQr payload={row.qrPayload} />
          <p className="max-w-xs text-xs text-slate-600">QR payload: {row.qrPayload}. The code identifies this demonstration lot only.</p>
        </div>
        <ol className="list-decimal space-y-1 pl-5 text-sm">
          <li>This slip is a simulation of a gate arrival document.</li>
          <li>The desk codes are fictional. They are not the names of sellers.</li>
          <li>A sold or dispatched mark does not record a payment or a dispatch order.</li>
        </ol>
      </article>
    </div>
  )
}
