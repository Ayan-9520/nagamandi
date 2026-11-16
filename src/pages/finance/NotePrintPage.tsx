import { Link, useParams } from 'react-router-dom'
import { EmptyState } from '@/components/common/EmptyState'
import { LoadingState } from '@/components/common/LoadingState'
import { Button } from '@/components/ui/button'
import { creditLabel } from '@/features/finance/meta'
import { formatPaise } from '@/services/money'
import { useFinanceStore } from '@/store/finance-store'
import { formatDateTime } from '@/utils/format'

export function NotePrintPage() {
  const { id = '' } = useParams()
  const ready = useFinanceStore((state) => state.ready)
  const credit = useFinanceStore((state) => state.creditNotes.find((row) => row.id === id))
  const debit = useFinanceStore((state) => state.debitNotes.find((row) => row.id === id))
  if (!ready) return <LoadingState label="Loading the simulated note" />
  const note = credit ?? debit
  if (!note) return <EmptyState title="Note not in this browser" description="That simulated note number is not in the finance book." />
  const party = credit ? credit.sellerLabel : debit?.buyerLabel
  const back = credit ? '/finance/credit-notes' : '/finance/debit-notes'
  const title = credit ? 'Credit note' : 'Debit note'

  return (
    <div className="space-y-4">
      <div className="no-print flex flex-wrap gap-2">
        <Button type="button" variant="outline" asChild><Link to={back}>Back to notes</Link></Button>
        <Button type="button" onClick={() => window.print()}>Print {title.toLowerCase()}</Button>
      </div>
      <article className="print-sheet mx-auto max-w-3xl space-y-5 rounded-xl border-2 border-primary bg-white p-8 text-slate-900">
        <header className="border-b border-primary/30 pb-4">
          <p className="text-xs tracking-[0.2em] text-primary uppercase">Naga Mandi OS · simulated accounts</p>
          <h1 className="font-display text-3xl text-primary">{title}</h1>
          <p className="text-sm">DEMO / SIMULATED. This note does not move money.</p>
        </header>
        <p className="font-display text-2xl">{note.noteNo}</p>
        <dl className="grid gap-3 text-sm sm:grid-cols-2">
          <div><dt className="text-slate-500">Trade</dt><dd>{note.tradeNo}</dd></div>
          <div><dt className="text-slate-500">Party</dt><dd>{party}</dd></div>
          <div><dt className="text-slate-500">Aadathiya</dt><dd>{note.aadathiyaLabel}</dd></div>
          <div><dt className="text-slate-500">Amount</dt><dd>{formatPaise(note.amountPaise)}</dd></div>
          <div><dt className="text-slate-500">Status</dt><dd>{creditLabel(note.status)}</dd></div>
          <div><dt className="text-slate-500">Updated</dt><dd>{formatDateTime(note.updatedAt)}</dd></div>
        </dl>
        <p className="text-sm">Mark: DEMO|NAGA-MANDI|{note.noteNo}|not-a-payment</p>
      </article>
    </div>
  )
}
