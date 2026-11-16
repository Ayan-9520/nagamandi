import { Link } from 'react-router-dom'
import { StatCard } from '@/components/common/StatCard'
import { Button } from '@/components/ui/button'
import { formatRupee } from '@/features/trading/meta'
import { useTradeStore } from '@/store/trade-store'
import { ClipboardList, HandCoins, Scale, ScrollText } from 'lucide-react'

export function TradeBoard() {
  const ready = useTradeStore((state) => state.ready)
  const trades = useTradeStore((state) => state.trades)
  if (!ready) return null
  const pending = trades.filter((row) => row.status === 'documented' && row.paymentStatus !== 'noted')
  const pendingDue = pending.reduce((sum, row) => sum + row.figures.buyerDue, 0)
  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl tracking-tight">Floor trades</h2>
          <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
            SOP-002 and SOP-003 records stored in this browser. These rows are separate from the yard sample trade chart.
          </p>
        </div>
        <Button type="button" variant="outline" asChild>
          <Link to="/trading">Open trading</Link>
        </Button>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Negotiating" value={String(trades.filter((row) => row.status === 'negotiating').length)} hint="Written price notes" icon={Scale} />
        <StatCard label="Confirmed" value={String(trades.filter((row) => row.status === 'confirmed').length)} hint="Rate locked, parchi not issued" icon={ClipboardList} />
        <StatCard label="Documented" value={String(trades.filter((row) => row.status === 'documented').length)} hint="Seller and buyer parchis" icon={ScrollText} />
        <StatCard label="Pending from buyers" value={formatRupee(pendingDue)} hint={`${pending.length} documented trades not marked noted`} icon={HandCoins} />
      </div>
    </section>
  )
}
