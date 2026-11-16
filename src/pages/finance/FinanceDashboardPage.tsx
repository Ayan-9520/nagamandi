import { useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { PageHeader } from '@/components/common/PageHeader'
import { StatCard } from '@/components/common/StatCard'
import { LoadingState } from '@/components/common/LoadingState'
import { Button } from '@/components/ui/button'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import { FinanceNotice } from '@/features/finance/FinanceBits'
import { bookTotals } from '@/services/finance-rules'
import { formatPaise } from '@/services/money'
import { useFinanceStore } from '@/store/finance-store'
import { useLicenceStore } from '@/store/licence-store'
import { useTradeStore } from '@/store/trade-store'
import { HandCoins, Landmark, Scale, ShieldCheck } from 'lucide-react'

const links = [
  { to: '/finance/fees', label: 'Licence fee register', detail: 'Sample fee labels already on licence receipts' },
  { to: '/finance/deposits', label: 'Security deposit register', detail: 'Simulated Aadathiya security still available' },
  { to: '/finance/commission', label: 'Aadathiya commission ledger', detail: 'Seller and buyer commission on documented trades' },
  { to: '/finance/collections', label: 'Buyer collections', detail: 'Outstanding buyer dues and debit notes' },
  { to: '/finance/seller-payments', label: 'Seller payments', detail: 'Outstanding seller nets and credit notes' },
  { to: '/finance/credit-notes', label: 'Credit notes', detail: 'Approve, then redeem only within security' },
  { to: '/finance/debit-notes', label: 'Debit notes', detail: 'Approve, then mark a simulated collection' },
  { to: '/finance/receipts', label: 'Payment receipts', detail: 'Printable DEMO receipts' },
  { to: '/finance/receivables', label: 'Outstanding receivables', detail: 'Buyer amounts not yet noted' },
  { to: '/finance/reconciliation', label: 'Daily reconciliation', detail: 'Open, checked, then closed' },
  { to: '/finance/closing', label: 'Daily closing', detail: 'Submit only after reconciliation is checked' },
  { to: '/finance/reports', label: 'Financial reports', detail: 'Paise totals and CSV export' },
]

export function FinanceDashboardPage() {
  const financeReady = useFinanceStore((state) => state.ready)
  const licenceReady = useLicenceStore((state) => state.ready)
  const tradeReady = useTradeStore((state) => state.ready)
  const finance = useFinanceStore()
  const cases = useLicenceStore((state) => state.cases)
  const trades = useTradeStore((state) => state.trades)
  const resetFinance = useFinanceStore((state) => state.resetFinance)
  const [restoreOpen, setRestoreOpen] = useState(false)
  if (!financeReady || !licenceReady || !tradeReady) return <LoadingState label="Loading the simulated finance book" />
  const totals = bookTotals(cases, trades, finance)

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="DEMO / SIMULATED"
        title="Finance"
        description="Licence fees, security, commission, collections and the sample-day close. No gateway and no bank posting."
        actions={<Button type="button" variant="outline" onClick={() => setRestoreOpen(true)}>Restore finance sample</Button>}
      />
      <FinanceNotice />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Licence fees" value={formatPaise(totals.licenceFeePaise)} hint="Noted sample receipts" icon={Landmark} />
        <StatCard label="Security available" value={formatPaise(totals.securityAvailablePaise)} hint="Redemption cannot pass this" icon={ShieldCheck} />
        <StatCard label="Commission" value={formatPaise(totals.commissionPaise)} hint="Documented trades" icon={Scale} />
        <StatCard label="Receivables" value={formatPaise(totals.buyerOutstandingPaise)} hint="Buyer amounts still open" icon={HandCoins} />
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {links.map((item) => (
          <Link key={item.to} to={item.to} className="rounded-xl bg-card px-4 py-3 ring-1 ring-foreground/10 hover:bg-accent">
            <span className="block text-sm font-medium">{item.label}</span>
            <span className="mt-1 block text-xs leading-5 text-muted-foreground">{item.detail}</span>
          </Link>
        ))}
      </div>
      <Dialog open={restoreOpen} onOpenChange={setRestoreOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Restore the finance sample?</DialogTitle>
            <DialogDescription>This replaces simulated notes, receipts, reconciliation and closing in this browser. Licence cases and trades stay.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setRestoreOpen(false)}>Keep current book</Button>
            <Button type="button" onClick={() => { resetFinance(); setRestoreOpen(false); toast.success('The finance sample was restored in this browser.') }}>Restore sample</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
