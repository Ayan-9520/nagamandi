import { Link, useParams } from 'react-router-dom'
import { EmptyState } from '@/components/common/EmptyState'
import { LoadingState } from '@/components/common/LoadingState'
import { Button } from '@/components/ui/button'
import { LicenceQr } from '@/features/licences/LicenceBits'
import { categoryLabel, requestKindLabel } from '@/features/licences/meta'
import { mandiName } from '@/services/registry-rules'
import { useLicenceStore } from '@/store/licence-store'
import { useRegistryStore } from '@/store/registry-store'
import { formatFullDay } from '@/utils/format'

export function LicencePrintPage() {
  const { id = '' } = useParams()
  const ready = useLicenceStore((state) => state.ready)
  const row = useLicenceStore((state) => state.cases.find((item) => item.id === id))
  const locations = useRegistryStore((state) => state.locations)

  if (!ready) return <LoadingState label="Loading the demonstration licence" />
  if (!row || row.status !== 'issued' || !row.licenceNo || !row.qrPayload || !row.validFrom || !row.validUntil) {
    return <EmptyState title="Nothing to preview" description="A print layout is available after a demonstration licence is issued." />
  }

  return (
    <div className="space-y-4">
      <div className="no-print flex flex-wrap gap-2">
        <Button type="button" variant="outline" asChild><Link to={`/licences/${row.id}`}>Back to the case</Link></Button>
        <Button type="button" onClick={() => window.print()}>Print demonstration licence</Button>
      </div>
      <article className="print-sheet mx-auto max-w-3xl space-y-6 rounded-xl border-2 border-primary bg-white p-8 text-slate-900">
        <header className="flex items-start justify-between gap-4 border-b border-primary/30 pb-4">
          <div>
            <p className="text-xs tracking-[0.2em] text-primary uppercase">Naga Mandi OS · SOP-001</p>
            <h1 className="font-display text-3xl text-primary">Demonstration licence</h1>
            <p className="text-sm">Not a permit. Not filed with a mandi office.</p>
          </div>
          <p className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-950">DEMO</p>
        </header>
        <p className="font-display text-2xl">{row.licenceNo}</p>
        <dl className="grid gap-3 text-sm sm:grid-cols-2">
          <div><dt className="text-slate-500">Desk code</dt><dd>{row.applicantLabel}</dd></div>
          <div><dt className="text-slate-500">Category</dt><dd>{categoryLabel(row.category)}</dd></div>
          <div><dt className="text-slate-500">Business code</dt><dd>{row.businessName}</dd></div>
          <div><dt className="text-slate-500">Request</dt><dd>{requestKindLabel(row.kind)}</dd></div>
          <div><dt className="text-slate-500">Mandi</dt><dd>{mandiName(locations, row.mandiId)}</dd></div>
          <div><dt className="text-slate-500">Mandi id</dt><dd>{row.mandiId}</dd></div>
          <div><dt className="text-slate-500">Valid from</dt><dd>{formatFullDay(row.validFrom)}</dd></div>
          <div><dt className="text-slate-500">Valid until</dt><dd>{formatFullDay(row.validUntil)}</dd></div>
          <div><dt className="text-slate-500">Sample receipt</dt><dd>{row.fee.receiptId ?? 'None'}</dd></div>
          <div><dt className="text-slate-500">Sample fee and deposit</dt><dd>{row.fee.feeLabel} · {row.fee.depositLabel}</dd></div>
        </dl>
        <div className="flex flex-wrap items-center gap-4">
          <LicenceQr payload={row.qrPayload} />
          <p className="max-w-xs text-xs text-slate-600">QR payload: {row.qrPayload}. The code does not verify a person or a payment.</p>
        </div>
        <ol className="list-decimal space-y-1 pl-5 text-sm">
          <li>This layout is a simulation of the SOP-001 licence document.</li>
          <li>The desk code is fictional. It is not the name of a vendor or trader.</li>
          <li>The fee line is a label. No security deposit was collected.</li>
        </ol>
      </article>
    </div>
  )
}
