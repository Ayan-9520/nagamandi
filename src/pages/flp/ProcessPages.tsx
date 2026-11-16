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
import { Reconciliation } from '@/features/flp/Reconciliation'
import { canOperateFlp, formatUnits, linesFor } from '@/services/flp-rules'
import { useFlpStore } from '@/store/flp-store'
import { useSessionStore } from '@/store/session-store'
import type { GradeKind } from '@/types/flp'

export function SortingPage() {
  const ready = useFlpStore((state) => state.ready)
  const batches = useFlpStore((state) => state.batches)
  const grades = useFlpStore((state) => state.grades)
  const fileGrade = useFlpStore((state) => state.fileGrade)
  const roleId = useSessionStore((state) => state.roleId)
  const accountId = useSessionStore((state) => state.accountId)
  const [batchId, setBatchId] = useState('')
  const [kind, setKind] = useState<GradeKind>('grade')
  const [label, setLabel] = useState('A')
  const [quantity, setQuantity] = useState('')
  if (!ready) return <LoadingState label="Loading sorting records" />
  const batch = batches.find((row) => row.id === batchId) ?? batches[0]
  const writer = roleId ? canOperateFlp(roleId) : false

  function submit() {
    if (!roleId || !accountId || !batch) return
    const result = fileGrade({ roleId, accountId }, { batchId: batch.id, kind, label, quantity })
    if (!result.ok) toast.error(result.message)
    else {
      toast.success(`${result.id} was recorded. The gate lot was not changed.`)
      setQuantity('')
    }
  }

  return (
    <div className="space-y-4">
      <PageHeader eyebrow="SOP-008" title="Sorting and grading" description="Grade and waste quantities cannot pass the intake still ungraded. A shortfall stays visible as a discrepancy." actions={<Button type="button" variant="outline" asChild><Link to="/post-harvest">FLP desk</Link></Button>} />
      <FlpNotice />
      {writer && batch ? (
        <div className="grid gap-3 md:grid-cols-2">
          <SelectField label="Batch" value={batch.id} onValueChange={setBatchId}>
            {batches.map((row) => <SelectItem key={row.id} value={row.id}>{row.batchNo} · {row.lotNo}</SelectItem>)}
          </SelectField>
          <SelectField label="Line" value={kind} onValueChange={(value) => setKind(value as GradeKind)}>
            <SelectItem value="grade">Grade</SelectItem>
            <SelectItem value="waste">Waste</SelectItem>
          </SelectField>
          {kind === 'grade' ? <TextField label="Grade" value={label} onChange={(event) => setLabel(event.target.value)} /> : null}
          <TextField label="Quantity" value={quantity} onChange={(event) => setQuantity(event.target.value)} hint="At most two decimal places." />
          <div className="flex items-end"><Button type="button" onClick={submit}>Record line</Button></div>
        </div>
      ) : <p className="text-sm text-muted-foreground">This role can read grades and cannot post a line.</p>}
      {grades.map((row) => (
        <p key={row.id} className="text-sm">{row.id} · {row.batchId} · {row.kind === 'waste' ? 'Waste' : `Grade ${row.label}`} · {formatUnits(row.quantityUnits)} q</p>
      ))}
    </div>
  )
}

export function PackagingPage() {
  const ready = useFlpStore((state) => state.ready)
  const batches = useFlpStore((state) => state.batches)
  const packs = useFlpStore((state) => state.packs)
  const filePack = useFlpStore((state) => state.filePack)
  const roleId = useSessionStore((state) => state.roleId)
  const accountId = useSessionStore((state) => state.accountId)
  const [batchId, setBatchId] = useState('')
  const [gradeLabel, setGradeLabel] = useState('A')
  const [packCount, setPackCount] = useState('')
  const [quantity, setQuantity] = useState('')
  if (!ready) return <LoadingState label="Loading packaging records" />
  const batch = batches.find((row) => row.id === batchId) ?? batches[0]
  const writer = roleId ? canOperateFlp(roleId) : false

  function submit() {
    if (!roleId || !accountId || !batch) return
    const result = filePack({ roleId, accountId }, { batchId: batch.id, gradeLabel, packs: packCount, quantity })
    if (!result.ok) toast.error(result.message)
    else {
      toast.success(`${result.id} was recorded.`)
      setPackCount('')
      setQuantity('')
    }
  }

  return (
    <div className="space-y-4">
      <PageHeader eyebrow="SOP-008" title="Packaging records" description="Packed quantity cannot pass the graded produce still unpacked. Waste is not packed." actions={<Button type="button" variant="outline" asChild><Link to="/post-harvest">FLP desk</Link></Button>} />
      <FlpNotice />
      {writer && batch ? (
        <div className="grid gap-3 md:grid-cols-2">
          <SelectField label="Batch" value={batch.id} onValueChange={setBatchId}>
            {batches.map((row) => <SelectItem key={row.id} value={row.id}>{row.batchNo} · {row.lotNo}</SelectItem>)}
          </SelectField>
          <TextField label="Grade label" value={gradeLabel} onChange={(event) => setGradeLabel(event.target.value)} />
          <TextField label="Pack count" value={packCount} onChange={(event) => setPackCount(event.target.value)} hint="A whole number of at least 1." />
          <TextField label="Quantity" value={quantity} onChange={(event) => setQuantity(event.target.value)} />
          <div className="flex items-end"><Button type="button" onClick={submit}>Record packs</Button></div>
        </div>
      ) : <p className="text-sm text-muted-foreground">This role can read packs and cannot post a record.</p>}
      {packs.map((row) => (
        <p key={row.id} className="text-sm">{row.id} · {row.batchId} · {row.gradeLabel} · {row.packCount} packs · {formatUnits(row.quantityUnits)} q</p>
      ))}
    </div>
  )
}

export function OutputPage() {
  const ready = useFlpStore((state) => state.ready)
  const batches = useFlpStore((state) => state.batches)
  const grades = useFlpStore((state) => state.grades)
  const packs = useFlpStore((state) => state.packs)
  const outputs = useFlpStore((state) => state.outputs)
  const fileOutput = useFlpStore((state) => state.fileOutput)
  const roleId = useSessionStore((state) => state.roleId)
  const accountId = useSessionStore((state) => state.accountId)
  const [batchId, setBatchId] = useState('')
  const [quantity, setQuantity] = useState('')
  if (!ready) return <LoadingState label="Loading batch output" />
  const open = batches.filter((batch) => !outputs.some((row) => row.batchId === batch.id))
  const batch = open.find((row) => row.id === batchId) ?? open[0]
  const writer = roleId ? canOperateFlp(roleId) : false
  const trail = batch ? linesFor(grades, packs, outputs, batch.id) : null

  function submit() {
    if (!roleId || !accountId || !batch) return
    const result = fileOutput({ roleId, accountId }, { batchId: batch.id, quantity, note: '' })
    if (!result.ok) toast.error(result.message)
    else {
      toast.success(`${result.id} was recorded. A shortfall stays on the batch as a discrepancy.`)
      setQuantity('')
    }
  }

  return (
    <div className="space-y-4">
      <PageHeader eyebrow="SOP-008" title="Batch output" description="One output record closes the packed quantity for a batch. Output cannot pass the packs. A smaller output is saved and shown as a discrepancy." actions={<Button type="button" variant="outline" asChild><Link to="/post-harvest">FLP desk</Link></Button>} />
      <FlpNotice />
      {writer && batch && trail ? (
        <div className="space-y-3">
          <div className="grid gap-3 md:grid-cols-2">
            <SelectField label="Batch" value={batch.id} onValueChange={setBatchId}>
              {open.map((row) => <SelectItem key={row.id} value={row.id}>{row.batchNo} · {row.lotNo}</SelectItem>)}
            </SelectField>
            <TextField label="Quantity" value={quantity} onChange={(event) => setQuantity(event.target.value)} />
            <div className="flex items-end"><Button type="button" onClick={submit}>Record output</Button></div>
          </div>
          <Reconciliation batch={batch} grades={trail.grades} packs={trail.packs} output={trail.output} />
        </div>
      ) : <p className="text-sm text-muted-foreground">{writer ? 'Every batch already has an output.' : 'This role can read output and cannot post a record.'}</p>}
      {outputs.map((row) => (
        <p key={row.id} className="text-sm">{row.outputNo} · {row.batchId} · {formatUnits(row.quantityUnits)} q · {row.note}</p>
      ))}
    </div>
  )
}
