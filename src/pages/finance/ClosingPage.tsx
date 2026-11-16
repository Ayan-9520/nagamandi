import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { PageHeader } from '@/components/common/PageHeader'
import { LoadingState } from '@/components/common/LoadingState'
import { Button } from '@/components/ui/button'
import { FinanceNotice, MoneyBadge } from '@/features/finance/FinanceBits'
import { closingLabel, reconLabel } from '@/features/finance/meta'
import { canPostFinance, FINANCE_DAY } from '@/services/finance-rules'
import { useFinanceStore } from '@/store/finance-store'
import { useSessionStore } from '@/store/session-store'
import type { ClosingStatus } from '@/types/finance'

export function ClosingPage() {
  const ready = useFinanceStore((state) => state.ready)
  const reconciliation = useFinanceStore((state) => state.reconciliation)
  const closing = useFinanceStore((state) => state.closing)
  const moveClosing = useFinanceStore((state) => state.moveClosing)
  const roleId = useSessionStore((state) => state.roleId)
  const accountId = useSessionStore((state) => state.accountId)
  if (!ready) return <LoadingState label="Loading the simulated closing" />
  const writer = roleId ? canPostFinance(roleId) : false

  function move(next: ClosingStatus) {
    if (!roleId || !accountId) return
    const result = moveClosing({ roleId, accountId }, next)
    if (!result.ok) toast.error(result.message)
    else toast.success(`Closing is ${closingLabel(next)}. No ledger was posted.`)
  }

  return (
    <div className="space-y-4">
      <PageHeader eyebrow="DEMO / SIMULATED" title="Daily closing" description={`Sample day ${FINANCE_DAY}. Submit is available after reconciliation is checked. A closed day blocks new simulated postings.`} actions={<Button type="button" variant="outline" asChild><Link to="/finance">Finance desk</Link></Button>} />
      <FinanceNotice />
      <p className="text-sm">Reconciliation is {reconLabel(reconciliation.status)}. Closing is <MoneyBadge>{closingLabel(closing.status)}</MoneyBadge></p>
      {writer ? (
        <div className="flex flex-wrap gap-2">
          {closing.status === 'open' ? <Button type="button" onClick={() => move('submitted')}>Submit closing</Button> : null}
          {closing.status === 'submitted' ? <Button type="button" onClick={() => move('approved')}>Approve closing</Button> : null}
          {closing.status === 'approved' ? <Button type="button" onClick={() => move('closed')}>Close the day</Button> : null}
        </div>
      ) : null}
      {closing.note ? <p className="text-sm text-muted-foreground">{closing.note}</p> : null}
    </div>
  )
}
