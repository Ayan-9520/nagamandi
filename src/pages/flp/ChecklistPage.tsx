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
import { FlpNotice } from '@/features/flp/FlpBits'
import { checkLabel } from '@/features/flp/meta'
import { CHECK_ITEMS, canOperateFlp } from '@/services/flp-rules'
import { useFlpStore } from '@/store/flp-store'
import { useSessionStore } from '@/store/session-store'
import type { CheckKind } from '@/types/flp'

export function ChecklistPage({ kind }: { kind: CheckKind }) {
  const ready = useFlpStore((state) => state.ready)
  const units = useFlpStore((state) => state.units)
  const inspections = useFlpStore((state) => state.inspections)
  const fileInspection = useFlpStore((state) => state.fileInspection)
  const roleId = useSessionStore((state) => state.roleId)
  const accountId = useSessionStore((state) => state.accountId)
  const [unitId, setUnitId] = useState('')
  const [answers, setAnswers] = useState<Record<string, 'yes' | 'no' | ''>>({})
  const [note, setNote] = useState('')
  if (!ready) return <LoadingState label="Loading the checklist" />
  const unit = units.find((row) => row.id === unitId) ?? units[0]
  const writer = roleId ? canOperateFlp(roleId) : false
  const template = CHECK_ITEMS[kind]
  const rows = inspections.filter((row) => row.kind === kind)

  function submit() {
    if (!roleId || !accountId || !unit) return
    const items = template.flatMap((item) => {
      const result = answers[item.id]
      return result === 'yes' || result === 'no' ? [{ id: item.id, label: item.label, result }] : []
    })
    if (items.length !== template.length) {
      toast.error('Mark every checklist line yes or no.')
      return
    }
    const result = fileInspection({ roleId, accountId }, { kind, unitId: unit.id, items, note })
    if (!result.ok) toast.error(result.message)
    else {
      toast.success(`${result.id} was filed. No inspection was sent outside this browser.`)
      setAnswers({})
      setNote('')
    }
  }

  return (
    <div className="space-y-4">
      <PageHeader eyebrow="SOP-008" title={checkLabel(kind)} description="Mark every line. A failed line needs a short note. This checklist is not filed with an authority." actions={<Button type="button" variant="outline" asChild><Link to="/post-harvest">FLP desk</Link></Button>} />
      <FlpNotice />
      {writer && unit ? (
        <div className="space-y-3 rounded-xl bg-card px-4 py-3 ring-1 ring-foreground/10">
          <SelectField label="Unit" value={unit.id} onValueChange={setUnitId}>
            {units.map((row) => <SelectItem key={row.id} value={row.id}>{row.code}</SelectItem>)}
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
          <p className="font-medium">{row.id} · {row.unitCode}</p>
          <p className="mt-1">{row.items.map((item) => `${item.label}: ${item.result}`).join(' · ')}</p>
          <p className="mt-1 text-muted-foreground">{row.note}</p>
        </article>
      )} />
    </div>
  )
}
