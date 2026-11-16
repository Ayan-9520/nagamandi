import { useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { PageHeader } from '@/components/common/PageHeader'
import { LoadingState } from '@/components/common/LoadingState'
import { SelectField } from '@/components/forms/SelectField'
import { TextField } from '@/components/forms/TextField'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { SelectItem } from '@/components/ui/select'
import { FinanceNotice, Paise } from '@/features/finance/FinanceBits'
import { buyerLines, canPostFinance, sellerLines } from '@/services/finance-rules'
import { formatPaise, rupeeTextToPaise } from '@/services/money'
import { useFinanceStore } from '@/store/finance-store'
import { useSessionStore } from '@/store/session-store'
import { useTradeStore } from '@/store/trade-store'

export function SettlementPage({ side }: { side: 'seller' | 'buyer' }) {
  const financeReady = useFinanceStore((state) => state.ready)
  const tradeReady = useTradeStore((state) => state.ready)
  const ready = financeReady && tradeReady
  const finance = useFinanceStore()
  const trades = useTradeStore((state) => state.trades)
  const issueCredit = useFinanceStore((state) => state.issueCredit)
  const issueDebit = useFinanceStore((state) => state.issueDebit)
  const recordSellerReceipt = useFinanceStore((state) => state.recordSellerReceipt)
  const recordBuyerReceipt = useFinanceStore((state) => state.recordBuyerReceipt)
  const roleId = useSessionStore((state) => state.roleId)
  const accountId = useSessionStore((state) => state.accountId)
  const [tradeId, setTradeId] = useState('')
  const [amount, setAmount] = useState('')
  if (!ready) return <LoadingState label="Loading the simulated settlement" />
  const lines = side === 'seller' ? sellerLines(trades, finance) : buyerLines(trades, finance)
  const selected = lines.find((row) => row.tradeId === tradeId) ?? lines[0]
  const writer = roleId ? canPostFinance(roleId) : false
  const title = side === 'seller' ? 'Seller payments' : 'Buyer collections'
  const outstanding = selected && 'outstandingPaise' in selected ? selected.outstandingPaise : 0

  function act(kind: 'note' | 'receipt') {
    if (!roleId || !accountId || !selected) return
    const paise = rupeeTextToPaise(amount)
    const result = side === 'seller'
      ? kind === 'note'
        ? issueCredit({ roleId, accountId }, selected.tradeId, paise)
        : recordSellerReceipt({ roleId, accountId }, selected.tradeId, paise)
      : kind === 'note'
        ? issueDebit({ roleId, accountId }, selected.tradeId, paise)
        : recordBuyerReceipt({ roleId, accountId }, selected.tradeId, paise)
    if (!result.ok) toast.error(result.message)
    else {
      toast.success(`${result.id} was written in the simulated book.`)
      setAmount('')
    }
  }

  return (
    <div className="space-y-4">
      <PageHeader
        eyebrow="DEMO / SIMULATED"
        title={title}
        description={side === 'seller'
          ? 'A credit note records what the seller is still owed. Redeeming it later cannot pass the Aadathiya security balance.'
          : 'A debit note records what the buyer still owes. A collection receipt does not take a payment.'}
        actions={<Button type="button" variant="outline" asChild><Link to="/finance">Finance desk</Link></Button>}
      />
      <FinanceNotice />
      {lines.map((row) => (
        <article key={row.tradeId} className="rounded-xl bg-card px-4 py-3 text-sm ring-1 ring-foreground/10">
          <p className="font-medium">{row.tradeNo} · {'sellerLabel' in row ? row.sellerLabel : row.buyerLabel} · {row.aadathiyaLabel}</p>
          <p className="mt-1">Outstanding <Paise value={row.outstandingPaise} /></p>
        </article>
      ))}
      {writer && selected ? (
        <Card>
          <CardHeader><CardTitle>Write a simulated entry</CardTitle></CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <SelectField label="Trade" value={selected.tradeId} onValueChange={setTradeId}>
              {lines.map((row) => <SelectItem key={row.tradeId} value={row.tradeId}>{row.tradeNo} · open {formatPaise(row.outstandingPaise)}</SelectItem>)}
            </SelectField>
            <TextField label="Amount in rupees" value={amount} hint={`Outstanding ${formatPaise(outstanding)}. Use digits and at most two decimal places.`} onChange={(event) => setAmount(event.target.value)} />
            <div className="flex flex-wrap gap-2 md:col-span-2">
              <Button type="button" onClick={() => act('note')}>{side === 'seller' ? 'Issue credit note' : 'Issue debit note'}</Button>
              <Button type="button" variant="outline" onClick={() => act('receipt')}>{side === 'seller' ? 'Record seller receipt' : 'Record buyer receipt'}</Button>
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  )
}
