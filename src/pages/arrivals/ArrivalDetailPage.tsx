import { useState, type ReactNode } from 'react'
import { Link, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { EmptyState } from '@/components/common/EmptyState'
import { LoadingState } from '@/components/common/LoadingState'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { ArrivalNotice, ArrivalStatusBadge, LotQr } from '@/features/arrivals/ArrivalBits'
import { NEXT_STATUS, bayLabel, formatQty, statusLabel } from '@/features/arrivals/meta'
import { DocumentList } from '@/features/registry/RegistryBits'
import { useArrivalStore } from '@/store/arrival-store'
import { useSessionStore } from '@/store/session-store'
import type { ArrivalStatus } from '@/types/arrival'
import { formatDateTime } from '@/utils/format'

export function ArrivalDetailPage() {
  const { id = '' } = useParams()
  const ready = useArrivalStore((state) => state.ready)
  const row = useArrivalStore((state) => state.lots.find((item) => item.id === id))
  const moveStatus = useArrivalStore((state) => state.moveStatus)
  const roleId = useSessionStore((state) => state.roleId)
  const accountId = useSessionStore((state) => state.accountId)
  const [note, setNote] = useState('')
  if (!ready) return <LoadingState label="Loading the demonstration lot" />
  if (!row) return <EmptyState title="Lot not in this browser" description="The arrival register does not have this demonstration id." />
  const lot = row
  const next = NEXT_STATUS[lot.status]
  const history = [...row.movements].reverse()

  function move(status: ArrivalStatus) {
    if (!roleId || !accountId) return
    const result = moveStatus({ roleId, accountId }, lot.id, status, note)
    if (!result.ok) {
      toast.error(result.message)
      return
    }
    setNote('')
    toast.success(`${lot.lotNo} is now ${statusLabel(status)}.`)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl tracking-tight">{row.lotNo}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{row.arrivalNo} · {row.sellerLabel} · {row.commodityName}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" asChild><Link to="/arrivals/register">Register</Link></Button>
          <Button type="button" asChild><Link to={`/arrivals/${row.id}/print`}>Print slip</Link></Button>
        </div>
      </div>
      <ArrivalNotice />
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(16rem,0.8fr)]">
        <Card>
          <CardHeader><CardTitle>Lot registration</CardTitle></CardHeader>
          <CardContent>
            <dl className="grid gap-3 text-sm sm:grid-cols-2">
              <Field label="Status" value={<ArrivalStatusBadge status={row.status} />} />
              <Field label="Mandi id" value={row.mandiId} />
              <Field label="Seller" value={row.sellerLabel} />
              <Field label="Aadathiya" value={row.aadathiyaLabel} />
              <Field label="Commodity" value={row.commodityName} />
              <Field label="Grade" value={row.gradeName} />
              <Field label="Quantity" value={formatQty(row.quantity, row.unitSymbol)} />
              <Field label="Unit" value={`${row.unitName} (${row.unitSymbol})`} />
              <Field label="Vehicle" value={row.vehicleNo} />
              <Field label="Arrived" value={formatDateTime(row.arrivedAt)} />
            </dl>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Lot identification</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <LotQr payload={row.qrPayload} />
            <p className="text-xs leading-5 text-muted-foreground">QR payload: {row.qrPayload}. Scanning it does not open an office record.</p>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader><CardTitle>Weighment record</CardTitle></CardHeader>
        <CardContent>
          <dl className="grid gap-3 text-sm sm:grid-cols-4">
            <Field label="Gross" value={formatQty(row.gross, row.unitSymbol)} />
            <Field label="Tare" value={formatQty(row.tare, row.unitSymbol)} />
            <Field label="Net" value={formatQty(row.net, row.unitSymbol)} />
            <Field label="Bay" value={bayLabel(row.bay)} />
          </dl>
          {row.note ? <p className="mt-3 text-sm text-muted-foreground">{row.note}</p> : null}
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Crates and photos</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm">{row.crateCount > 0 ? `${row.crateCount} crates · ${row.crateCode}` : 'No crates were recorded.'}</p>
          <DocumentList documents={row.photos} />
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Lot movement history</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {history.map((item) => (
            <article key={item.id} className="rounded-lg border px-3 py-2 text-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <ArrivalStatusBadge status={item.status} />
                <span className="text-xs text-muted-foreground">{formatDateTime(item.at)}</span>
              </div>
              <p className="mt-1">{item.place}</p>
              <p className="text-muted-foreground">{item.note}</p>
            </article>
          ))}
        </CardContent>
      </Card>
      {next.length > 0 ? (
        <Card>
          <CardHeader><CardTitle>Change status</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <Textarea value={note} onChange={(event) => setNote(event.target.value)} placeholder="Note for this movement. Cancellation needs at least 8 characters." />
            <div className="flex flex-wrap gap-2">
              {next.map((status) => (
                <Button key={status} type="button" variant={status === 'cancelled' ? 'outline' : 'default'} onClick={() => move(status)}>
                  Mark {statusLabel(status)}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <p className="text-sm text-muted-foreground">This lot is closed. Its status stays {statusLabel(row.status)}.</p>
      )}
    </div>
  )
}

function Field({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-1">{value}</dd>
    </div>
  )
}
