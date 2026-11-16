import { Link } from 'react-router-dom'
import { PageHeader } from '@/components/common/PageHeader'
import { LoadingState } from '@/components/common/LoadingState'
import { Button } from '@/components/ui/button'
import { FinanceNotice, Paise } from '@/features/finance/FinanceBits'
import { receiptKindLabel } from '@/features/finance/meta'
import { bookTotals, buyerLines, commissionLines, licenceFeeRows, securityRows, sellerLines } from '@/services/finance-rules'
import { downloadCsv } from '@/services/csv'
import { formatPaise } from '@/services/money'
import { useFinanceStore } from '@/store/finance-store'
import { useLicenceStore } from '@/store/licence-store'
import { useTradeStore } from '@/store/trade-store'

export function ReportsPage() {
  const financeReady = useFinanceStore((state) => state.ready)
  const licenceReady = useLicenceStore((state) => state.ready)
  const tradeReady = useTradeStore((state) => state.ready)
  const ready = financeReady && licenceReady && tradeReady
  const finance = useFinanceStore()
  const cases = useLicenceStore((state) => state.cases)
  const trades = useTradeStore((state) => state.trades)
  if (!ready) return <LoadingState label="Loading the simulated report" />
  const totals = bookTotals(cases, trades, finance)

  function exportBook() {
    const rows: string[][] = [
      ['section', 'reference', 'party', 'amount_rupees', 'note'],
      ['licence-fee', 'totals', '', formatPaise(totals.licenceFeePaise), 'DEMO / SIMULATED'],
      ['security-available', 'totals', '', formatPaise(totals.securityAvailablePaise), 'DEMO / SIMULATED'],
      ['commission', 'totals', '', formatPaise(totals.commissionPaise), 'DEMO / SIMULATED'],
      ['seller-outstanding', 'totals', '', formatPaise(totals.sellerOutstandingPaise), 'DEMO / SIMULATED'],
      ['buyer-outstanding', 'totals', '', formatPaise(totals.buyerOutstandingPaise), 'DEMO / SIMULATED'],
    ]
    for (const row of licenceFeeRows(cases)) rows.push(['licence-fee', row.receiptId, row.partyLabel, formatPaise(row.feePaise), 'DEMO / SIMULATED'])
    for (const row of securityRows(cases, finance.opening, finance.creditNotes)) rows.push(['security-available', row.aadathiyaId, row.label, formatPaise(row.availablePaise), 'DEMO / SIMULATED'])
    for (const row of commissionLines(trades, finance.commissionApproved)) rows.push(['commission', row.tradeNo, row.aadathiyaLabel, formatPaise(row.totalPaise), 'DEMO / SIMULATED'])
    for (const row of sellerLines(trades, finance)) rows.push(['seller-outstanding', row.tradeNo, row.sellerLabel, formatPaise(row.outstandingPaise), 'DEMO / SIMULATED'])
    for (const row of buyerLines(trades, finance)) rows.push(['buyer-outstanding', row.tradeNo, row.buyerLabel, formatPaise(row.outstandingPaise), 'DEMO / SIMULATED'])
    for (const row of finance.receipts) rows.push(['receipt', row.receiptNo, row.partyLabel, formatPaise(row.amountPaise), `${receiptKindLabel(row.kind)} · DEMO / SIMULATED`])
    downloadCsv('naga-mandi-finance-demo.csv', rows)
  }

  return (
    <div className="space-y-4">
      <PageHeader
        eyebrow="DEMO / SIMULATED"
        title="Financial reports"
        description="Paise totals for the sample book. The CSV is a demonstration export. It is not a return and it is not a bank statement."
        actions={(
          <>
            <Button type="button" variant="outline" asChild><Link to="/finance">Finance desk</Link></Button>
            <Button type="button" onClick={exportBook}>Export CSV</Button>
          </>
        )}
      />
      <FinanceNotice />
      <div className="grid gap-2 sm:grid-cols-2">
        <p className="flex justify-between gap-3 rounded-lg border px-3 py-2 text-sm"><span>Licence fees</span><Paise value={totals.licenceFeePaise} /></p>
        <p className="flex justify-between gap-3 rounded-lg border px-3 py-2 text-sm"><span>Security available</span><Paise value={totals.securityAvailablePaise} /></p>
        <p className="flex justify-between gap-3 rounded-lg border px-3 py-2 text-sm"><span>Commission</span><Paise value={totals.commissionPaise} /></p>
        <p className="flex justify-between gap-3 rounded-lg border px-3 py-2 text-sm"><span>Seller outstanding</span><Paise value={totals.sellerOutstandingPaise} /></p>
        <p className="flex justify-between gap-3 rounded-lg border px-3 py-2 text-sm"><span>Buyer outstanding</span><Paise value={totals.buyerOutstandingPaise} /></p>
        <p className="flex justify-between gap-3 rounded-lg border px-3 py-2 text-sm"><span>Receipts</span><Paise value={totals.receiptPaise} /></p>
      </div>
    </div>
  )
}
