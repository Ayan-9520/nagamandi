import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { toDataURL } from 'qrcode'
import { EmptyState } from '@/components/common/EmptyState'
import { LoadingState } from '@/components/common/LoadingState'
import { Button } from '@/components/ui/button'
import { receiptKindLabel } from '@/features/finance/meta'
import { formatPaise } from '@/services/money'
import { useFinanceStore } from '@/store/finance-store'
import { formatDateTime } from '@/utils/format'

export function ReceiptPrintPage() {
  const { id = '' } = useParams()
  const ready = useFinanceStore((state) => state.ready)
  const receipt = useFinanceStore((state) => state.receipts.find((item) => item.id === id))
  if (!ready) return <LoadingState label="Loading the simulated receipt" />
  if (!receipt) return <EmptyState title="Receipt not in this browser" description="That simulated receipt number is not in the finance book." />
  const payload = `DEMO|NAGA-MANDI|${receipt.receiptNo}|not-a-bank-receipt`

  return (
    <div className="space-y-4">
      <div className="no-print flex flex-wrap gap-2">
        <Button type="button" variant="outline" asChild><Link to="/finance/receipts">Back to receipts</Link></Button>
        <Button type="button" onClick={() => window.print()}>Print receipt</Button>
      </div>
      <article className="print-sheet mx-auto max-w-3xl space-y-5 rounded-xl border-2 border-primary bg-white p-8 text-slate-900">
        <header className="flex items-start justify-between gap-4 border-b border-primary/30 pb-4">
          <div>
            <p className="text-xs tracking-[0.2em] text-primary uppercase">Naga Mandi OS · simulated accounts</p>
            <h1 className="font-display text-3xl text-primary">Payment receipt</h1>
            <p className="text-sm">DEMO / SIMULATED. This is not a bank receipt and no money was received.</p>
          </div>
          <p className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-950">DEMO / SIMULATED</p>
        </header>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <p className="font-display text-2xl">{receipt.receiptNo}</p>
          <p className="text-sm text-slate-600">{formatDateTime(receipt.at)} · {receipt.tradeNo}</p>
        </div>
        <dl className="grid gap-3 text-sm sm:grid-cols-2">
          <Item label="Kind" value={receiptKindLabel(receipt.kind)} />
          <Item label="Party" value={receipt.partyLabel} />
          <Item label="Aadathiya" value={receipt.aadathiyaLabel} />
          <Item label="Amount" value={formatPaise(receipt.amountPaise)} />
        </dl>
        <p className="text-sm">{receipt.note}</p>
        <div className="flex items-end justify-between gap-4">
          <ReceiptQr payload={payload} />
          <p className="max-w-xs text-right text-xs text-slate-600">No payment gateway. No bank transfer. No ledger posting.</p>
        </div>
      </article>
    </div>
  )
}

function Item({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-slate-500">{label}</dt>
      <dd className="font-medium">{value}</dd>
    </div>
  )
}

function ReceiptQr({ payload }: { payload: string }) {
  const [src, setSrc] = useState<string | null>(null)
  useEffect(() => {
    let current = true
    void toDataURL(payload, { margin: 1, width: 160, color: { dark: '#14532d', light: '#ffffff' } }).then((url) => {
      if (current) setSrc(url)
    })
    return () => {
      current = false
    }
  }, [payload])
  if (!src) return <p className="text-sm text-slate-500">Preparing the demonstration mark.</p>
  return <img src={src} alt="" width={160} height={160} className="rounded-md border bg-white p-2" />
}
