import { useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { PageSlice } from '@/components/common/ArticleList'
import { LoadingState } from '@/components/common/LoadingState'
import { PageHeader } from '@/components/common/PageHeader'
import { SelectField } from '@/components/forms/SelectField'
import { TextAreaField } from '@/components/forms/TextAreaField'
import { Button } from '@/components/ui/button'
import { SelectItem } from '@/components/ui/select'
import { WarehouseNotice } from '@/features/warehouse/WarehouseBits'
import { checkLabel } from '@/features/warehouse/meta'
import { CHECK_ITEMS, canOperateWarehouse, issuedContract } from '@/services/warehouse-rules'
import { useSessionStore } from '@/store/session-store'
import { useWarehouseStore } from '@/store/warehouse-store'
import type { CheckKind } from '@/types/warehouse'

export function ChecklistPage({ kind }: { kind: CheckKind }) {
  const ready = useWarehouseStore((state) => state.ready)
  const sheds = useWarehouseStore((state) => state.sheds)
  const contracts = useWarehouseStore((state) => state.contracts)
  const inspections = useWarehouseStore((state) => state.inspections)
  const fileInspection = useWarehouseStore((state) => state.fileInspection)
  const roleId = useSessionStore((state) => state.roleId)
  const accountId = useSessionStore((state) => state.accountId)
  const allocated = sheds.filter((shed) => issuedContract(contracts, shed.id))
  const [shedId, setShedId] = useState('')
  const [answers, setAnswers] = useState<Record<string, 'yes' | 'no' | ''>>({})
  const [note, setNote] = useState('')
  if (!ready) return <LoadingState label="Loading the checklist" />
  const shed = allocated.find((row) => row.id === shedId) ?? allocated[0]
  const writer = roleId ? canOperateWarehouse(roleId) : false
  const template = CHECK_ITEMS[kind]
  const rows = inspections.filter((row) => row.kind === kind)

  function submit() {
    if (!roleId || !accountId || !shed) return
    const items = template.flatMap((item) => {
      const result = answers[item.id]
      return result === 'yes' || result === 'no' ? [{ id: item.id, label: item.label, result }] : []
    })
    if (items.length !== template.length) {
      toast.error('Mark every checklist line yes or no.')
      return
    }
    const result = fileInspection({ roleId, accountId }, { kind, shedId: shed.id, items, note })
    if (!result.ok) toast.error(result.message)
    else {
      toast.success(`${result.id} was filed. No inspection was sent outside this browser.`)
      setAnswers({})
      setNote('')
    }
  }

  return (
    <div className="space-y-4">
      <PageHeader eyebrow="SOP-005" title={checkLabel(kind)} description="Mark every line. A failed line needs a short note. This checklist is not filed with an authority." actions={<Button type="button" variant="outline" asChild><Link to="/warehouses">Warehouse desk</Link></Button>} />
      <WarehouseNotice />
      {writer && shed ? (
        <div className="space-y-3 rounded-xl bg-card px-4 py-3 ring-1 ring-foreground/10">
          <SelectField label="Shed" value={shed.id} onValueChange={setShedId}>
            {allocated.map((row) => <SelectItem key={row.id} value={row.id}>{row.code}</SelectItem>)}
          </SelectField>
          {template.map((item) => (
            <div key={item.id} className="flex flex-wrap items-center justify-between gap-2 text-sm">
              <span>{item.label}</span>
              <span className="flex gap-2">
                <Button type="button" size="sm" variant={answers[item.id] === 'yes' ? 'default' : 'outline'} onClick={() => setAnswers((current) => ({ ...current, [item.id]: 'yes' }))}>Yes</Button>
                <Button type="button" size="sm" variant={answers[item.id] === 'no' ? 'default' : 'outline'} onClick={() => setAnswers((current) => ({ ...current, [item.id]: 'no' }))}>No</Button>
              </span>
            </div>
          ))}
          <TextAreaField label="Note" value={note} onChange={(event) => setNote(event.target.value)} hint="Required when any line is No." />
          <Button type="button" onClick={submit}>File checklist</Button>
        </div>
      ) : <p className="text-sm text-muted-foreground">This role can read filed checklists.</p>}
      <PageSlice rows={rows} empty="No checklist is filed for this template." render={(row) => (
        <article key={row.id} className="rounded-xl bg-card px-4 py-3 text-sm ring-1 ring-foreground/10">
          <p className="font-medium">{row.id} · {row.shedCode}</p>
          <p className="mt-1">{row.items.map((item) => `${item.label}: ${item.result}`).join(' · ')}</p>
          <p className="mt-1 text-muted-foreground">{row.note}</p>
        </article>
      )} />
    </div>
  )
}
