import type { ReactNode } from 'react'
import { Link, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { EmptyState } from '@/components/common/EmptyState'
import { LoadingState } from '@/components/common/LoadingState'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatQty } from '@/features/arrivals/meta'
import { FigureList, MethodBadge, PaymentBadge, TradeNotice, TradeStatusBadge } from '@/features/trading/TradeBits'
import { formatRupee, paymentLabel, tradeStatusLabel } from '@/features/trading/meta'
import { canNotePayment, canOpenTrade, nextPayment, NEXT_TRADE } from '@/services/trade-rules'
import { useSessionStore } from '@/store/session-store'
import { useTradeStore } from '@/store/trade-store'
import type { PaymentStatus, TradeStatus } from '@/types/trade'
import { formatDateTime } from '@/utils/format'

const moveLabel: Record<TradeStatus, string> = {
  negotiating: 'Return to negotiation',
  confirmed: 'Confirm trade',
  documented: 'Prepare parchis',
  cancelled: 'Cancel trade',
}

const payMoveLabel: Record<PaymentStatus, string> = {
  pending: 'Mark pending',
  'credit-note': 'Record a credit note',
  'debit-note': 'Record a debit note',
  noted: 'Mark noted in the book',
}

export function TradeDetailPage() {
  const { id = '' } = useParams()
  const ready = useTradeStore((state) => state.ready)
  const row = useTradeStore((state) => state.trades.find((item) => item.id === id))
  const moveTrade = useTradeStore((state) => state.moveTrade)
  const setPayment = useTradeStore((state) => state.setPayment)
  const roleId = useSessionStore((state) => state.roleId)
  const accountId = useSessionStore((state) => state.accountId)
  if (!ready) return <LoadingState label="Loading the demonstration trade" />
  if (!row) return <EmptyState title="Trade not in this browser" description="The trade register does not have this demonstration id." />
  const trade = row
  const writer = roleId ? canOpenTrade(roleId) : false
  const cashier = roleId ? canNotePayment(roleId) : false
  const next = NEXT_TRADE[trade.status]
  const payments = trade.status === 'documented' ? nextPayment(trade.paymentStatus) : []

  function move(status: TradeStatus) {
    if (!roleId || !accountId) return
    const result = moveTrade({ roleId, accountId }, trade.id, status)
    if (!result.ok) toast.error(result.message)
    else toast.success(`${trade.tradeNo} is now ${tradeStatusLabel(status)}.`)
  }

  function pay(status: PaymentStatus) {
    if (!roleId || !accountId) return
    const result = setPayment({ roleId, accountId }, trade.id, status)
    if (!result.ok) toast.error(result.message)
    else toast.success(`${trade.tradeNo} payment is ${paymentLabel(status)}. No money moved.`)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl tracking-tight">{trade.tradeNo}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{trade.lotNo} · {trade.sellerLabel} · {trade.buyerLabel} · {trade.aadathiyaLabel}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" asChild><Link to="/trading/register">Register</Link></Button>
          {trade.status === 'documented' ? (
            <>
              <Button type="button" asChild><Link to={`/trading/${trade.id}/seller-parchi`}>Seller parchi</Link></Button>
              <Button type="button" variant="outline" asChild><Link to={`/trading/${trade.id}/buyer-parchi`}>Buyer parchi</Link></Button>
            </>
          ) : null}
        </div>
      </div>
      <TradeNotice />
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.3fr)_minmax(16rem,0.7fr)]">
        <Card>
          <CardHeader><CardTitle>Trade confirmation</CardTitle></CardHeader>
          <CardContent>
            <dl className="grid gap-3 text-sm sm:grid-cols-2">
              <Field label="Status" value={<TradeStatusBadge status={trade.status} />} />
              <Field label="Payment" value={<PaymentBadge status={trade.paymentStatus} />} />
              <Field label="Discovery" value={<MethodBadge method={trade.method} />} />
              <Field label="Seller" value={trade.sellerLabel} />
              <Field label="Buyer" value={trade.buyerLabel} />
              <Field label="Aadathiya" value={trade.aadathiyaLabel} />
              <Field label="Commodity" value={`${trade.commodityName} · ${trade.gradeName}`} />
              <Field label="Lot" value={trade.lotNo} />
              <Field label="Quantity" value={formatQty(trade.quantity, trade.unitSymbol)} />
              <Field label="Price" value={`${formatRupee(trade.price)} per ${trade.unitSymbol}`} />
              <Field label="Mandi id" value={trade.mandiId} />
              <Field label="Updated" value={formatDateTime(trade.updatedAt)} />
            </dl>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Charges and commission</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <FigureList figures={trade.figures} rates={trade.rates} unit={trade.unitSymbol} />
            <p className="text-xs leading-5 text-muted-foreground">These rates were copied onto the trade when it was confirmed. Later rate edits do not rewrite this row.</p>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader><CardTitle>Negotiation record</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {[...trade.notes].reverse().map((item) => (
            <article key={item.id} className="rounded-lg border px-3 py-2 text-sm">
              <p className="text-xs text-muted-foreground">{formatDateTime(item.at)} · {item.kind}</p>
              <p className="mt-1">{item.text}</p>
            </article>
          ))}
        </CardContent>
      </Card>
      {writer && next.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {next.map((status) => (
            <Button key={status} type="button" variant={status === 'cancelled' ? 'outline' : 'default'} onClick={() => move(status)}>
              {moveLabel[status]}
            </Button>
          ))}
        </div>
      ) : null}
      {cashier && payments.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {payments.map((status) => (
            <Button key={status} type="button" variant="outline" onClick={() => pay(status)}>{payMoveLabel[status]}</Button>
          ))}
        </div>
      ) : null}
      {trade.status === 'cancelled' || (trade.status === 'documented' && payments.length === 0) ? (
        <p className="text-sm text-muted-foreground">{trade.status === 'cancelled' ? 'This trade is closed.' : 'The payment note is closed in the demonstration book.'}</p>
      ) : null}
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
