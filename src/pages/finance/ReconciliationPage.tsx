import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { PageHeader } from '@/components/common/PageHeader'
import { LoadingState } from '@/components/common/LoadingState'
import { Button } from '@/components/ui/button'
import { FinanceNotice, MoneyBadge, Paise } from '@/features/finance/FinanceBits'
import { reconLabel } from '@/features/finance/meta'
import { bookTotals, canPostFinance, FINANCE_DAY } from '@/services/finance-rules'
import { useFinanceStore } from '@/store/finance-store'
import { useLicenceStore } from '@/store/licence-store'
import { useSessionStore } from '@/store/session-store'
import { useTradeStore } from '@/store/trade-store'
import type { ReconStatus } from '@/types/finance'

const rows: { key: keyof ReturnType<typeof bookTotals>; label: string }[] = [
  { key: 'licenceFeePaise', label: 'Licence fees noted' },
  { key: 'securityPostedPaise', label: 'Security posted' },
  { key: 'securityAvailablePaise', label: 'Security available' },
  { key: 'commissionPaise', label: 'Commission listed' },
  { key: 'sellerOutstandingPaise', label: 'Seller outstanding' },
  { key: 'buyerOutstandingPaise', label: 'Buyer outstanding' },
  { key: 'openCreditPaise', label: 'Credit notes still open' },
  { key: 'redeemedCreditPaise', label: 'Credit notes redeemed' },
  { key: 'openDebitPaise', label: 'Debit notes still open' },
  { key: 'receiptPaise', label: 'Receipts written' },
]

export function ReconciliationPage() {
  const financeReady = useFinanceStore((state) => state.ready)
  const licenceReady = useLicenceStore((state) => state.ready)
  const tradeReady = useTradeStore((state) => state.ready)
  const ready = financeReady && licenceReady && tradeReady
  const finance = useFinanceStore()
  const cases = useLicenceStore((state) => state.cases)
  const trades = useTradeStore((state) => state.trades)
  const moveReconciliation = useFinanceStore((state) => state.moveReconciliation)
  const roleId = useSessionStore((state) => state.roleId)
  const accountId = useSessionStore((state) => state.accountId)
  if (!ready) return <LoadingState label="Loading the simulated reconciliation" />
  const live = bookTotals(cases, trades, finance)
  const shown = finance.reconciliation.snapshot ?? live
  const writer = roleId ? canPostFinance(roleId) : false

  function move(next: ReconStatus) {
    if (!roleId || !accountId) return
    const result = moveReconciliation({ roleId, accountId }, next)
    if (!result.ok) toast.error(result.message)
    else toast.success(`Reconciliation is ${reconLabel(next)}. No bank file was sent.`)
  }

  return (
    <div className="space-y-4">
      <PageHeader eyebrow="DEMO / SIMULATED" title="Daily reconciliation" description={`Sample day ${FINANCE_DAY}. Checked totals stay as they were at the check. Later notes do not rewrite that snapshot.`} actions={<Button type="button" variant="outline" asChild><Link to="/finance">Finance desk</Link></Button>} />
      <FinanceNotice />
      <div className="flex flex-wrap items-center gap-2">
        <MoneyBadge tone="warn">{reconLabel(finance.reconciliation.status)}</MoneyBadge>
        {writer && finance.reconciliation.status === 'open' ? <Button type="button" onClick={() => move('checked')}>Mark checked</Button> : null}
        {writer && finance.reconciliation.status === 'checked' ? <Button type="button" onClick={() => move('closed')}>Close reconciliation</Button> : null}
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        {rows.map((row) => (
          <p key={row.key} className="flex items-center justify-between gap-3 rounded-lg border px-3 py-2 text-sm">
            <span>{row.label}</span>
            <Paise value={shown[row.key]} />
          </p>
        ))}
      </div>
    </div>
  )
}
