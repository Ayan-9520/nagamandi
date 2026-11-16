import { useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { LoadingState } from '@/components/common/LoadingState'
import { PageHeader } from '@/components/common/PageHeader'
import { SelectField } from '@/components/forms/SelectField'
import { TextField } from '@/components/forms/TextField'
import { Button } from '@/components/ui/button'
import { SelectItem } from '@/components/ui/select'
import { FlpNotice } from '@/features/flp/FlpBits'
import { canOperateFlp, formatUnits } from '@/services/flp-rules'
import { useArrivalStore } from '@/store/arrival-store'
import { useFlpStore } from '@/store/flp-store'
import { useSessionStore } from '@/store/session-store'

export function IntakePage() {
  const flpReady = useFlpStore((state) => state.ready)
  const arrivalReady = useArrivalStore((state) => state.ready)
  const ready = flpReady && arrivalReady
  const units = useFlpStore((state) => state.units)
  const batches = useFlpStore((state) => state.batches)
  const lots = useArrivalStore((state) => state.lots)
  const fileIntake = useFlpStore((state) => state.fileIntake)
  const roleId = useSessionStore((state) => state.roleId)
  const accountId = useSessionStore((state) => state.accountId)
  const [unitId, setUnitId] = useState('')
  const [lotId, setLotId] = useState('')
  const [quantity, setQuantity] = useState('')
  if (!ready) return <LoadingState label="Loading produce intake" />
  const unit = units.find((row) => row.id === unitId) ?? units[0]
  const openLots = lots.filter((lot) => lot.status !== 'cancelled')
  const lot = openLots.find((row) => row.id === lotId) ?? openLots[0]
  const writer = roleId ? canOperateFlp(roleId) : false

  function submit() {
    if (!roleId || !accountId || !unit || !lot) return
    const result = fileIntake({ roleId, accountId }, { unitId: unit.id, lotId: lot.id, quantity, note: '' })
    if (!result.ok) toast.error(result.message)
    else {
      toast.success(`${result.id} was opened. The gate lot status was not changed.`)
      setQuantity('')
    }
  }

  return (
    <div className="space-y-4">
      <PageHeader eyebrow="SOP-008" title="Produce intake" description="Intake opens a processing batch against a gate lot. Quantity cannot pass the produce still outside this FLP book." actions={<Button type="button" variant="outline" asChild><Link to="/post-harvest">FLP desk</Link></Button>} />
      <FlpNotice />
      {writer && unit && lot ? (
        <div className="grid gap-3 md:grid-cols-2">
          <SelectField label="Unit" value={unit.id} onValueChange={setUnitId}>
            {units.map((row) => <SelectItem key={row.id} value={row.id}>{row.code} · {row.name}</SelectItem>)}
          </SelectField>
          <SelectField label="Produce lot" value={lot.id} onValueChange={setLotId}>
            {openLots.map((row) => <SelectItem key={row.id} value={row.id}>{row.lotNo} · {row.commodityName} · {row.quantity} {row.unitSymbol}</SelectItem>)}
          </SelectField>
          <TextField label="Quantity" value={quantity} onChange={(event) => setQuantity(event.target.value)} hint="Greater than zero, at most two decimal places." />
          <div className="flex items-end"><Button type="button" onClick={submit}>Record intake</Button></div>
        </div>
      ) : <p className="text-sm text-muted-foreground">This role can read intake and cannot open a batch.</p>}
      {batches.map((batch) => (
        <article key={batch.id} className="rounded-xl bg-card px-4 py-3 text-sm ring-1 ring-foreground/10">
          <p className="font-medium">{batch.batchNo} · {batch.unitCode} · {batch.lotNo}</p>
          <p className="mt-1">{formatUnits(batch.intakeUnits)} q · {batch.commodityName} · {batch.sellerLabel}</p>
          <Button type="button" size="sm" variant="outline" className="mt-2" asChild><Link to={`/post-harvest/batches/${batch.id}`}>Open the trail</Link></Button>
        </article>
      ))}
    </div>
  )
}
