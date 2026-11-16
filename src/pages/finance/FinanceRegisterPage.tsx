import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { ArticleList } from '@/components/common/ArticleList'
import { PageHeader } from '@/components/common/PageHeader'
import { LoadingState } from '@/components/common/LoadingState'
import { Button } from '@/components/ui/button'
import { FinanceNotice, MoneyBadge, Paise } from '@/features/finance/FinanceBits'
import { buyerLines, canPostFinance, commissionLines, licenceFeeRows, securityRows } from '@/services/finance-rules'
import { formatPaise } from '@/services/money'
import { useFinanceStore } from '@/store/finance-store'
import { useLicenceStore } from '@/store/licence-store'
import { useSessionStore } from '@/store/session-store'
import { useTradeStore } from '@/store/trade-store'

type Mode = 'fees' | 'deposits' | 'commission' | 'receipts' | 'receivables'

const copy: Record<Mode, { title: string; description: string }> = {
  fees: { title: 'Licence fee register', description: 'Fee labels from sample licence receipts. The rupee text is converted to paise for the book.' },
  deposits: { title: 'Security deposit register', description: 'Opening simulated security plus trader deposit labels. Available balance is posted minus redeemed credit notes.' },
  commission: { title: 'Aadathiya commission ledger', description: 'Seller commission and buyer commission from documented trades. Approval does not pay the commission.' },
  receipts: { title: 'Payment receipts', description: 'Every simulated receipt in this browser. Print one to see the DEMO layout.' },
  receivables: { title: 'Outstanding receivables', description: 'Buyer amounts on documented trades that are not yet covered by a debit note or a collection receipt.' },
}

export function FinanceRegisterPage({ mode }: { mode: Mode }) {
  const financeReady = useFinanceStore((state) => state.ready)
  const licenceReady = useLicenceStore((state) => state.ready)
  const tradeReady = useTradeStore((state) => state.ready)
  const ready = financeReady && licenceReady && tradeReady
  const finance = useFinanceStore()
  const cases = useLicenceStore((state) => state.cases)
  const trades = useTradeStore((state) => state.trades)
  const approveCommission = useFinanceStore((state) => state.approveCommission)
  const roleId = useSessionStore((state) => state.roleId)
  const accountId = useSessionStore((state) => state.accountId)
  if (!ready) return <LoadingState label="Loading the simulated register" />
  const writer = roleId ? canPostFinance(roleId) : false

  function approve(tradeId: string) {
    if (!roleId || !accountId) return
    const result = approveCommission({ roleId, accountId }, tradeId)
    if (!result.ok) toast.error(result.message)
    else toast.success('The commission line was approved in this browser. No commission was paid.')
  }

  return (
    <div className="space-y-4">
      <PageHeader eyebrow="DEMO / SIMULATED" title={copy[mode].title} description={copy[mode].description} actions={<Button type="button" variant="outline" asChild><Link to="/finance">Finance desk</Link></Button>} />
      <FinanceNotice />
      {mode === 'fees' ? (
        <ArticleList rows={licenceFeeRows(cases)} searchText={(row) => `${row.receiptId} ${row.partyLabel}`} empty="No licence fee matches that search." render={(row) => (
          <article key={row.id} className="rounded-xl bg-card px-4 py-3 text-sm ring-1 ring-foreground/10">
            <p className="font-medium">{row.receiptId} · {row.partyLabel}</p>
            <p className="mt-1">Fee <Paise value={row.feePaise} /> · Deposit <Paise value={row.depositPaise} /> · {row.method || 'Simulated'}</p>
          </article>
        )} />
      ) : null}
      {mode === 'deposits' ? (
        <ArticleList rows={securityRows(cases, finance.opening, finance.creditNotes)} searchText={(row) => row.label} empty="No security row matches that search." render={(row) => (
          <article key={row.aadathiyaId} className="rounded-xl bg-card px-4 py-3 text-sm ring-1 ring-foreground/10">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-medium">{row.label}</p>
              <MoneyBadge tone={row.availablePaise < 0 ? 'warn' : 'ok'}>{`Available ${formatPaise(row.availablePaise)}`}</MoneyBadge>
            </div>
            <p className="mt-1">Posted <Paise value={row.postedPaise} /> · Redeemed <Paise value={row.redeemedPaise} /></p>
            {row.sources.map((source) => <p key={source.id} className="mt-1 text-muted-foreground">{source.id} · <Paise value={source.paise} /> · {source.detail}</p>)}
          </article>
        )} />
      ) : null}
      {mode === 'commission' ? (
        <ArticleList rows={commissionLines(trades, finance.commissionApproved)} searchText={(row) => `${row.tradeNo} ${row.aadathiyaLabel}`} statusText={(row) => row.approved ? 'Approved' : 'Listed'} empty="No commission line matches that search." render={(row) => (
          <article key={row.tradeId} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-card px-4 py-3 text-sm ring-1 ring-foreground/10">
            <div>
              <p className="font-medium">{row.tradeNo} · {row.aadathiyaLabel}</p>
              <p className="mt-1">Seller <Paise value={row.sellerPaise} /> · Buyer <Paise value={row.buyerPaise} /> · Total <Paise value={row.totalPaise} /></p>
            </div>
            {row.approved ? <MoneyBadge tone="ok">Approved</MoneyBadge> : writer ? <Button type="button" size="sm" variant="outline" onClick={() => approve(row.tradeId)}>Approve line</Button> : <MoneyBadge>Listed</MoneyBadge>}
          </article>
        )} />
      ) : null}
      {mode === 'receipts' ? (
        <ArticleList rows={finance.receipts} searchText={(row) => `${row.receiptNo} ${row.partyLabel} ${row.kind} ${row.tradeNo}`} statusText={(row) => row.kind} empty="No simulated receipt matches that search." render={(row) => (
          <article key={row.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-card px-4 py-3 text-sm ring-1 ring-foreground/10">
            <div>
              <p className="font-medium">{row.receiptNo} · {row.partyLabel}</p>
              <p className="mt-1">{row.kind} · <Paise value={row.amountPaise} /> · {row.tradeNo}</p>
            </div>
            <Button type="button" size="sm" variant="outline" asChild><Link to={`/finance/receipts/${row.id}/print`}>Print</Link></Button>
          </article>
        )} />
      ) : null}
      {mode === 'receivables' ? (
        <ArticleList rows={buyerLines(trades, finance)} searchText={(row) => `${row.tradeNo} ${row.buyerLabel} ${row.aadathiyaLabel}`} empty="No receivable matches that search." render={(row) => (
          <article key={row.tradeId} className="rounded-xl bg-card px-4 py-3 text-sm ring-1 ring-foreground/10">
            <p className="font-medium">{row.tradeNo} · {row.buyerLabel} · {row.aadathiyaLabel}</p>
            <p className="mt-1">Due <Paise value={row.duePaise} /> · Reserved <Paise value={row.reservedPaise} /> · Outstanding <Paise value={row.outstandingPaise} /></p>
          </article>
        )} />
      ) : null}
    </div>
  )
}
