import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { PageHeader } from '@/components/common/PageHeader'
import { LoadingState } from '@/components/common/LoadingState'
import { Button } from '@/components/ui/button'
import { FinanceNotice, MoneyBadge, Paise } from '@/features/finance/FinanceBits'
import { creditLabel } from '@/features/finance/meta'
import { availableSecurity, canPostFinance } from '@/services/finance-rules'
import { useFinanceStore } from '@/store/finance-store'
import { useLicenceStore } from '@/store/licence-store'
import { useSessionStore } from '@/store/session-store'

export function NotesPage({ kind }: { kind: 'credit' | 'debit' }) {
  const financeReady = useFinanceStore((state) => state.ready)
  const licenceReady = useLicenceStore((state) => state.ready)
  const ready = financeReady && licenceReady
  const finance = useFinanceStore()
  const cases = useLicenceStore((state) => state.cases)
  const moveCredit = useFinanceStore((state) => state.moveCredit)
  const redeemCredit = useFinanceStore((state) => state.redeemCredit)
  const moveDebit = useFinanceStore((state) => state.moveDebit)
  const collectDebit = useFinanceStore((state) => state.collectDebit)
  const roleId = useSessionStore((state) => state.roleId)
  const accountId = useSessionStore((state) => state.accountId)
  if (!ready) return <LoadingState label="Loading simulated notes" />
  const writer = roleId ? canPostFinance(roleId) : false
  const credit = kind === 'credit'

  function run(action: () => { ok: boolean; message?: string; id?: string }, success: string) {
    const result = action()
    if (!result.ok) toast.error(result.message ?? 'The simulated book refused that step.')
    else toast.success(success)
  }

  return (
    <div className="space-y-4">
      <PageHeader
        eyebrow="DEMO / SIMULATED"
        title={credit ? 'Credit notes' : 'Debit notes'}
        description={credit
          ? 'Draft, then approve, then redeem. Redemption is refused when it would pass the Aadathiya security balance or repeat a redemption.'
          : 'Draft, then approve, then collect. A collected note cannot be collected again.'}
        actions={<Button type="button" variant="outline" asChild><Link to="/finance">Finance desk</Link></Button>}
      />
      <FinanceNotice />
      {(credit ? finance.creditNotes : finance.debitNotes).map((row) => {
        const security = credit ? availableSecurity(cases, finance.opening, finance.creditNotes, row.aadathiyaId) : 0
        return (
          <article key={row.id} className="space-y-2 rounded-xl bg-card px-4 py-3 text-sm ring-1 ring-foreground/10">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-medium">{row.noteNo} · {row.tradeNo}</p>
              <MoneyBadge tone={row.status === 'redeemed' || row.status === 'collected' ? 'ok' : 'warn'}>{creditLabel(row.status)}</MoneyBadge>
            </div>
            <p>{'sellerLabel' in row ? row.sellerLabel : row.buyerLabel} · {row.aadathiyaLabel} · <Paise value={row.amountPaise} /></p>
            {credit ? <p className="text-muted-foreground">Security still available for {row.aadathiyaLabel}: <Paise value={security} /></p> : null}
            {writer && row.status === 'draft' ? (
              <div className="flex flex-wrap gap-2">
                <Button type="button" size="sm" onClick={() => run(() => credit ? moveCredit({ roleId: roleId!, accountId: accountId! }, row.id, 'approved') : moveDebit({ roleId: roleId!, accountId: accountId! }, row.id, 'approved'), 'The note was approved in this browser.')}>Approve</Button>
                <Button type="button" size="sm" variant="outline" onClick={() => run(() => credit ? moveCredit({ roleId: roleId!, accountId: accountId! }, row.id, 'cancelled') : moveDebit({ roleId: roleId!, accountId: accountId! }, row.id, 'cancelled'), 'The note was cancelled in this browser.')}>Cancel</Button>
              </div>
            ) : null}
            {writer && credit && row.status === 'approved' ? (
              <div className="flex flex-wrap gap-2">
                <Button type="button" size="sm" onClick={() => run(() => redeemCredit({ roleId: roleId!, accountId: accountId! }, row.id), 'The credit note was redeemed against simulated security.')}>Redeem within security</Button>
                <Button type="button" size="sm" variant="outline" onClick={() => run(() => moveCredit({ roleId: roleId!, accountId: accountId! }, row.id, 'cancelled'), 'The note was cancelled in this browser.')}>Cancel</Button>
              </div>
            ) : null}
            {writer && !credit && row.status === 'approved' ? (
              <div className="flex flex-wrap gap-2">
                <Button type="button" size="sm" onClick={() => run(() => collectDebit({ roleId: roleId!, accountId: accountId! }, row.id), 'The debit note was marked collected. No money moved.')}>Mark collected</Button>
                <Button type="button" size="sm" variant="outline" onClick={() => run(() => moveDebit({ roleId: roleId!, accountId: accountId! }, row.id, 'cancelled'), 'The note was cancelled in this browser.')}>Cancel</Button>
              </div>
            ) : null}
            <div className="flex flex-wrap gap-2">
              <Button type="button" size="sm" variant="outline" asChild><Link to={`/finance/notes/${row.id}/print`}>Print note</Link></Button>
              {row.receiptId ? <Button type="button" size="sm" variant="outline" asChild><Link to={`/finance/receipts/${row.receiptId}/print`}>Print receipt</Link></Button> : null}
            </div>
          </article>
        )
      })}
    </div>
  )
}
