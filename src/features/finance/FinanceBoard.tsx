import { Link } from 'react-router-dom'
import { StatCard } from '@/components/common/StatCard'
import { Button } from '@/components/ui/button'
import { bookTotals } from '@/services/finance-rules'
import { formatPaise } from '@/services/money'
import { useFinanceStore } from '@/store/finance-store'
import { useLicenceStore } from '@/store/licence-store'
import { useTradeStore } from '@/store/trade-store'
import { HandCoins, Landmark, Scale, ShieldCheck } from 'lucide-react'

export function FinanceBoard() {
  const financeReady = useFinanceStore((state) => state.ready)
  const licenceReady = useLicenceStore((state) => state.ready)
  const tradeReady = useTradeStore((state) => state.ready)
  const finance = useFinanceStore()
  const cases = useLicenceStore((state) => state.cases)
  const trades = useTradeStore((state) => state.trades)
  if (!financeReady || !licenceReady || !tradeReady) return null
  const totals = bookTotals(cases, trades, finance)
  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl tracking-tight">Simulated finance</h2>
          <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
            DEMO / SIMULATED book for the sample day. These rows are separate from the yard-sample fee chart.
          </p>
        </div>
        <Button type="button" variant="outline" asChild>
          <Link to="/finance">Open finance</Link>
        </Button>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Licence fees noted" value={formatPaise(totals.licenceFeePaise)} hint="Sample receipts already on file" icon={Landmark} />
        <StatCard label="Security still available" value={formatPaise(totals.securityAvailablePaise)} hint="After simulated credit redemptions" icon={ShieldCheck} />
        <StatCard label="Commission listed" value={formatPaise(totals.commissionPaise)} hint="Documented trades only" icon={Scale} />
        <StatCard label="Buyer outstanding" value={formatPaise(totals.buyerOutstandingPaise)} hint="Not a collection" icon={HandCoins} />
      </div>
    </section>
  )
}
