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
import { useFlpStore } from '@/store/flp-store'
import { useSessionStore } from '@/store/session-store'
import type { MoveKind } from '@/types/flp'

export function MovementPage() {
  const ready = useFlpStore((state) => state.ready)
  const units = useFlpStore((state) => state.units)
  const batches = useFlpStore((state) => state.batches)
  const moves = useFlpStore((state) => state.moves)
  const fileMovement = useFlpStore((state) => state.fileMovement)
  const roleId = useSessionStore((state) => state.roleId)
  const accountId = useSessionStore((state) => state.accountId)
  const [unitId, setUnitId] = useState('')
  const [batchId, setBatchId] = useState('')
  const [kind, setKind] = useState<MoveKind>('inward')
  const [item, setItem] = useState('')
  const [quantity, setQuantity] = useState('')
  if (!ready) return <LoadingState label="Loading material movement" />
  const unit = units.find((row) => row.id === unitId) ?? units[0]
  const batch = batches.find((row) => row.id === batchId) ?? batches[0]
  const writer = roleId ? canOperateFlp(roleId) : false

  function submit() {
    if (!roleId || !accountId || !unit || !batch) return
    const result = fileMovement({ roleId, accountId }, { unitId: unit.id, batchId: batch.id, kind, item, quantity, note: '' })
    if (!result.ok) toast.error(result.message)
    else {
      toast.success(`${result.id} was written. Batch reconciliation was not changed.`)
      setItem('')
      setQuantity('')
    }
  }

  return (
    <div className="space-y-4">
      <PageHeader eyebrow="SOP-008" title="Material movement" description="Record crates, film or cartons against a batch. Produce quantity stays on the intake, grading and output records." actions={<Button type="button" variant="outline" asChild><Link to="/post-harvest">FLP desk</Link></Button>} />
      <FlpNotice />
      {writer && unit && batch ? (
        <div className="grid gap-3 md:grid-cols-2">
          <SelectField label="Unit" value={unit.id} onValueChange={setUnitId}>
            {units.map((row) => <SelectItem key={row.id} value={row.id}>{row.code}</SelectItem>)}
          </SelectField>
          <SelectField label="Batch" value={batch.id} onValueChange={setBatchId}>
            {batches.map((row) => <SelectItem key={row.id} value={row.id}>{row.batchNo}</SelectItem>)}
          </SelectField>
          <SelectField label="Direction" value={kind} onValueChange={(value) => setKind(value as MoveKind)}>
            <SelectItem value="inward">Inward</SelectItem>
            <SelectItem value="outward">Outward</SelectItem>
          </SelectField>
          <TextField label="Material" value={item} onChange={(event) => setItem(event.target.value)} hint="At least 3 characters." />
          <TextField label="Quantity" value={quantity} onChange={(event) => setQuantity(event.target.value)} />
          <div className="flex items-end"><Button type="button" onClick={submit}>Record movement</Button></div>
        </div>
      ) : <p className="text-sm text-muted-foreground">This role can read movements and cannot post one.</p>}
      {moves.map((row) => (
        <article key={row.id} className="rounded-xl bg-card px-4 py-3 text-sm ring-1 ring-foreground/10">
          <p className="font-medium">{row.moveNo} · {row.kind} · {row.unitCode} · {row.item}</p>
          <p className="mt-1">{formatUnits(row.quantityUnits)} q · {row.batchId || 'No batch'} · {row.note}</p>
        </article>
      ))}
    </div>
  )
}
