import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { toDataURL } from 'qrcode'
import { EmptyState } from '@/components/common/EmptyState'
import { LoadingState } from '@/components/common/LoadingState'
import { Button } from '@/components/ui/button'
import { contractLabel } from '@/features/cold-storage/meta'
import { formatPaise } from '@/services/money'
import { useColdStore } from '@/store/cold-store'

export function ContractPrintPage() {
  const { id = '' } = useParams()
  const ready = useColdStore((state) => state.ready)
  const contract = useColdStore((state) => state.contracts.find((row) => row.id === id))
  if (!ready) return <LoadingState label="Loading the contract preview" />
  if (!contract || contract.status !== 'issued') {
    return <EmptyState title="Contract not issued" description="The preview is available after the simulated contract is issued." />
  }
  const payload = `DEMO|NAGA-MANDI|${contract.contractNo}|not-a-deed`

  return (
    <div className="space-y-4">
      <div className="no-print flex flex-wrap gap-2">
        <Button type="button" variant="outline" asChild><Link to={`/cold-storage/contracts/${contract.id}`}>Back to the contract</Link></Button>
        <Button type="button" onClick={() => window.print()}>Print preview</Button>
      </div>
      <article className="print-sheet mx-auto max-w-3xl space-y-5 rounded-xl border-2 border-primary bg-white p-8 text-slate-900">
        <header className="flex items-start justify-between gap-4 border-b border-primary/30 pb-4">
          <div>
            <p className="text-xs tracking-[0.2em] text-primary uppercase">Naga Mandi OS · SOP-006</p>
            <h1 className="font-display text-3xl text-primary">Cold storage contract</h1>
            <p className="text-sm">DEMO / SIMULATED. This is not a lease deed and no deposit was banked.</p>
          </div>
          <p className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-950">DEMO / SIMULATED</p>
        </header>
        <p className="font-display text-2xl">{contract.contractNo}</p>
        <dl className="grid gap-3 text-sm sm:grid-cols-2">
          <Item label="Chamber" value={contract.chamberCode} />
          <Item label="Operator" value={contract.operatorLabel} />
          <Item label="Term" value={`${contract.start} to ${contract.end}`} />
          <Item label="Status" value={contractLabel(contract.status)} />
          <Item label="Simulated deposit" value={formatPaise(contract.depositPaise)} />
          <Item label="Receipt" value={contract.receiptId || 'None'} />
          <Item label="Mandi" value={contract.mandiId} />
        </dl>
        <p className="text-sm">{contract.experience}</p>
        <div className="flex items-end justify-between gap-4">
          <Mark payload={payload} />
          <p className="max-w-xs text-right text-xs text-slate-600">No signature binds a party. No chamber was handed over. No probe is connected.</p>
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

function Mark({ payload }: { payload: string }) {
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
