import { Link, useParams } from 'react-router-dom'
import { EmptyState } from '@/components/common/EmptyState'
import { LoadingState } from '@/components/common/LoadingState'
import { Button } from '@/components/ui/button'
import { ParchiQr } from '@/features/trading/TradeBits'
import { kalDate } from '@/features/arrivals/meta'
import { formatRupee, methodLabel, paymentLabel } from '@/features/trading/meta'
import { mandiName } from '@/services/registry-rules'
import { useRegistryStore } from '@/store/registry-store'
import { useTradeStore } from '@/store/trade-store'
import { formatFullDay } from '@/utils/format'


export function ParchiPrintPage({ side }: { side: 'seller' | 'buyer' }) {
  const { id = '' } = useParams()
  const ready = useTradeStore((state) => state.ready)
  const row = useTradeStore((state) => state.trades.find((item) => item.id === id))
  const locations = useRegistryStore((state) => state.locations)
  if (!ready) return <LoadingState label="Loading the demonstration parchi" />
  if (!row || row.status !== 'documented') {
    return <EmptyState title="Parchi not prepared" description="Prepare the parchis after the trade is confirmed." />
  }
  const number = side === 'seller' ? row.sellerParchiNo : row.buyerParchiNo
  const sop = side === 'seller' ? 'SOP-002' : 'SOP-003'
  const title = side === 'seller' ? 'Seller parchi' : 'Buyer parchi'
  const payload = `DEMO|NAGA-MANDI|${number}|not-a-receipt`

  return (
    <div className="space-y-4">
      <div className="no-print flex flex-wrap gap-2">
        <Button type="button" variant="outline" asChild><Link to={`/trading/${row.id}`}>Back to the trade</Link></Button>
        <Button type="button" onClick={() => window.print()}>Print {title.toLowerCase()}</Button>
      </div>
      <article className="print-sheet mx-auto max-w-3xl space-y-5 rounded-xl border-2 border-primary bg-white p-8 text-slate-900">
        <header className="flex items-start justify-between gap-4 border-b border-primary/30 pb-4">
          <div>
            <p className="text-xs tracking-[0.2em] text-primary uppercase">Naga Mandi OS · {sop}</p>
            <h1 className="font-display text-3xl text-primary">{title}</h1>
            <p className="text-sm">Sale patti for the demonstration book. Not a receipt. Not a payment.</p>
          </div>
          <p className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-950">FICTIONAL RATES</p>
        </header>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <p className="font-display text-2xl">{number}</p>
          <p className="text-sm text-slate-600">{formatFullDay(kalDate(row.updatedAt))} · {row.tradeNo}</p>
        </div>
        <dl className="grid gap-3 text-sm sm:grid-cols-2">
          <Item label="Seller" value={row.sellerLabel} />
          <Item label="Buyer" value={row.buyerLabel} />
          <Item label="Aadathiya" value={row.aadathiyaLabel} />
          <Item label="Discovery" value={methodLabel(row.method)} />
          <Item label="Commodity" value={`${row.commodityName} · ${row.gradeName}`} />
          <Item label="Lot" value={row.lotNo} />
          <Item label="Quantity" value={`${row.quantity} ${row.unitSymbol}`} />
          <Item label="Agreed price" value={`${formatRupee(row.price)} per ${row.unitSymbol}`} />
          <Item label="Mandi" value={`${mandiName(locations, row.mandiId)} · ${row.mandiId}`} />
          <Item label="Payment book" value={paymentLabel(row.paymentStatus)} />
        </dl>
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-300 text-left text-slate-500">
              <th className="py-2 font-medium">Line</th>
              <th className="py-2 text-right font-medium">Amount</th>
            </tr>
          </thead>
          <tbody>
            <Line label="Sale value" amount={row.figures.saleValue} />
            {side === 'seller' ? (
              <>
                <Line label={`Aadat commission ${row.rates.sellerCommissionPercent}%`} amount={row.figures.sellerCommission} minus />
                <Line label="Net payable to the seller" amount={row.figures.sellerNet} strong />
              </>
            ) : (
              <>
                <Line label={`Aadat commission ${row.rates.buyerCommissionPercent}%`} amount={row.figures.buyerCommission} />
                <Line label="Hamali" amount={row.figures.hamali} />
                <Line label="Transport" amount={row.figures.transport} />
                <Line label="Total due from the buyer" amount={row.figures.buyerDue} strong />
              </>
            )}
          </tbody>
        </table>
        {side === 'seller' ? (
          <p className="text-sm text-slate-600">
            Hamali {formatRupee(row.figures.hamali)} and transport {formatRupee(row.figures.transport)} are listed for the record and collected on the buyer parchi. They are not deducted again from the seller.
          </p>
        ) : null}
        <div className="flex flex-wrap items-center gap-4">
          <ParchiQr payload={payload} />
          <p className="max-w-xs text-xs text-slate-600">Mark: {payload}. It identifies this demonstration parchi only.</p>
        </div>
        <div className="grid gap-6 pt-4 text-sm sm:grid-cols-3">
          <Sign label="Seller" />
          <Sign label="Buyer" />
          <Sign label="Aadathiya" />
        </div>
        <ol className="list-decimal space-y-1 pl-5 text-sm">
          <li>Commission, hamali and transport use the fictional schedule stored on this trade.</li>
          <li>The desk codes are not the names of sellers, buyers or agents.</li>
          <li>A pending, credit-note or debit-note mark does not move money.</li>
        </ol>
      </article>
    </div>
  )
}

function Item({ label, value }: { label: string; value: string }) {
  return <div><dt className="text-slate-500">{label}</dt><dd>{value}</dd></div>
}

function Line({ label, amount, minus, strong }: { label: string; amount: number; minus?: boolean; strong?: boolean }) {
  return (
    <tr className="border-b border-slate-200">
      <td className={`py-2 ${strong ? 'font-medium' : ''}`}>{label}</td>
      <td className={`py-2 text-right ${strong ? 'font-medium' : ''}`}>{minus ? `− ${formatRupee(amount)}` : formatRupee(amount)}</td>
    </tr>
  )
}

function Sign({ label }: { label: string }) {
  return (
    <div>
      <div className="h-10 border-b border-slate-400" />
      <p className="mt-1 text-xs text-slate-500">{label} signature</p>
    </div>
  )
}
