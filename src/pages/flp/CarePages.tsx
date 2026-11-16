import { useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { LoadingState } from '@/components/common/LoadingState'
import { PageHeader } from '@/components/common/PageHeader'
import { SelectField } from '@/components/forms/SelectField'
import { TextAreaField } from '@/components/forms/TextAreaField'
import { TextField } from '@/components/forms/TextField'
import { Button } from '@/components/ui/button'
import { SelectItem } from '@/components/ui/select'
import { FlpBadge, FlpNotice } from '@/features/flp/FlpBits'
import { canOperateFlp } from '@/services/flp-rules'
import { useFlpStore } from '@/store/flp-store'
import { useSessionStore } from '@/store/session-store'

export function MaintenancePage() {
  const ready = useFlpStore((state) => state.ready)
  const units = useFlpStore((state) => state.units)
  const maintenance = useFlpStore((state) => state.maintenance)
  const fileMaintenance = useFlpStore((state) => state.fileMaintenance)
  const closeMaintenance = useFlpStore((state) => state.closeMaintenance)
  const roleId = useSessionStore((state) => state.roleId)
  const accountId = useSessionStore((state) => state.accountId)
  const [unitId, setUnitId] = useState('')
  const [title, setTitle] = useState('')
  if (!ready) return <LoadingState label="Loading equipment maintenance" />
  const unit = units.find((row) => row.id === unitId) ?? units[0]
  const writer = roleId ? canOperateFlp(roleId) : false

  function submit() {
    if (!roleId || !accountId || !unit) return
    const result = fileMaintenance({ roleId, accountId }, { unitId: unit.id, title, note: '' })
    if (!result.ok) toast.error(result.message)
    else {
      toast.success(`${result.id} was opened. No contractor was called.`)
      setTitle('')
    }
  }

  return (
    <div className="space-y-4">
      <PageHeader eyebrow="SOP-008" title="Equipment maintenance" description="Open notes stay until they are closed. Closing a log does not call a contractor." actions={<Button type="button" variant="outline" asChild><Link to="/post-harvest">FLP desk</Link></Button>} />
      <FlpNotice />
      {maintenance.map((row) => (
        <article key={row.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-card px-4 py-3 text-sm ring-1 ring-foreground/10">
          <div>
            <p className="font-medium">{row.id} · {row.unitCode} · {row.title}</p>
            <p className="mt-1 text-muted-foreground">{row.note}</p>
          </div>
          <div className="flex items-center gap-2">
            <FlpBadge tone={row.status === 'open' ? 'warn' : 'ok'}>{row.status === 'open' ? 'Open' : 'Closed'}</FlpBadge>
            {writer && row.status === 'open' ? <Button type="button" size="sm" onClick={() => {
              if (!roleId || !accountId) return
              const result = closeMaintenance({ roleId, accountId }, row.id)
              if (!result.ok) toast.error(result.message)
              else toast.success('The log was closed in this browser.')
            }}>Close log</Button> : null}
          </div>
        </article>
      ))}
      {writer && unit ? (
        <div className="grid gap-3 md:grid-cols-2">
          <SelectField label="Unit" value={unit.id} onValueChange={setUnitId}>
            {units.map((row) => <SelectItem key={row.id} value={row.id}>{row.code}</SelectItem>)}
          </SelectField>
          <TextField label="Title" value={title} onChange={(event) => setTitle(event.target.value)} hint="At least 4 characters." />
          <Button type="button" onClick={submit}>Open log</Button>
        </div>
      ) : null}
    </div>
  )
}

export function InsurancePage() {
  const ready = useFlpStore((state) => state.ready)
  const units = useFlpStore((state) => state.units)
  const insurance = useFlpStore((state) => state.insurance)
  const fileInsurance = useFlpStore((state) => state.fileInsurance)
  const roleId = useSessionStore((state) => state.roleId)
  const accountId = useSessionStore((state) => state.accountId)
  const [unitId, setUnitId] = useState('')
  const [cover, setCover] = useState('')
  const [until, setUntil] = useState('2027-03-31')
  if (!ready) return <LoadingState label="Loading insurance notes" />
  const unit = units.find((row) => row.id === unitId) ?? units[0]
  const writer = roleId ? canOperateFlp(roleId) : false

  function submit() {
    if (!roleId || !accountId || !unit) return
    const result = fileInsurance({ roleId, accountId }, { unitId: unit.id, cover, until })
    if (!result.ok) toast.error(result.message)
    else {
      toast.success(`${result.id} was noted. No policy was purchased.`)
      setCover('')
    }
  }

  return (
    <div className="space-y-4">
      <PageHeader eyebrow="SOP-008" title="Insurance record" description="Cover notes are simulated. They do not name an insurer and they do not pay a claim." actions={<Button type="button" variant="outline" asChild><Link to="/post-harvest">FLP desk</Link></Button>} />
      <FlpNotice />
      {insurance.map((row) => (
        <article key={row.id} className="rounded-xl bg-card px-4 py-3 text-sm ring-1 ring-foreground/10">
          <p className="font-medium">{row.policyNo} · {row.unitCode}</p>
          <p className="mt-1">{row.cover}</p>
          <p className="mt-1 text-muted-foreground">Until {row.until} · {row.note}</p>
        </article>
      ))}
      {writer && unit ? (
        <div className="grid gap-3 md:grid-cols-2">
          <SelectField label="Unit" value={unit.id} onValueChange={setUnitId}>
            {units.map((row) => <SelectItem key={row.id} value={row.id}>{row.code}</SelectItem>)}
          </SelectField>
          <TextField label="Cover until" value={until} onChange={(event) => setUntil(event.target.value)} hint="YYYY-MM-DD" />
          <TextField label="Simulated cover" value={cover} onChange={(event) => setCover(event.target.value)} hint="At least 8 characters." />
          <div className="flex items-end"><Button type="button" onClick={submit}>Add cover note</Button></div>
        </div>
      ) : null}
    </div>
  )
}

export function IncidentPage() {
  const ready = useFlpStore((state) => state.ready)
  const units = useFlpStore((state) => state.units)
  const incidents = useFlpStore((state) => state.incidents)
  const fileIncident = useFlpStore((state) => state.fileIncident)
  const closeIncident = useFlpStore((state) => state.closeIncident)
  const roleId = useSessionStore((state) => state.roleId)
  const accountId = useSessionStore((state) => state.accountId)
  const [unitId, setUnitId] = useState('')
  const [title, setTitle] = useState('')
  const [note, setNote] = useState('')
  if (!ready) return <LoadingState label="Loading the incident register" />
  const unit = units.find((row) => row.id === unitId) ?? units[0]
  const writer = roleId ? canOperateFlp(roleId) : false

  function submit() {
    if (!roleId || !accountId || !unit) return
    const result = fileIncident({ roleId, accountId }, { unitId: unit.id, title, note })
    if (!result.ok) toast.error(result.message)
    else {
      toast.success(`${result.id} was filed. No service was called.`)
      setTitle('')
      setNote('')
    }
  }

  return (
    <div className="space-y-4">
      <PageHeader eyebrow="SOP-008" title="Incident register" description="A report stays in this browser. It does not notify a fire service, an insurer, or a contractor." actions={<Button type="button" variant="outline" asChild><Link to="/post-harvest">FLP desk</Link></Button>} />
      <FlpNotice />
      {incidents.map((row) => (
        <article key={row.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-card px-4 py-3 text-sm ring-1 ring-foreground/10">
          <div>
            <p className="font-medium">{row.id} · {row.unitCode} · {row.title}</p>
            <p className="mt-1 text-muted-foreground">{row.note}</p>
          </div>
          <div className="flex items-center gap-2">
            <FlpBadge tone={row.status === 'open' ? 'warn' : 'ok'}>{row.status === 'open' ? 'Open' : 'Closed'}</FlpBadge>
            {writer && row.status === 'open' ? <Button type="button" size="sm" onClick={() => {
              if (!roleId || !accountId) return
              const result = closeIncident({ roleId, accountId }, row.id)
              if (!result.ok) toast.error(result.message)
              else toast.success('The report was closed in this browser.')
            }}>Close report</Button> : null}
          </div>
        </article>
      ))}
      {writer && unit ? (
        <div className="grid gap-3">
          <SelectField label="Unit" value={unit.id} onValueChange={setUnitId}>
            {units.map((row) => <SelectItem key={row.id} value={row.id}>{row.code}</SelectItem>)}
          </SelectField>
          <TextField label="Title" value={title} onChange={(event) => setTitle(event.target.value)} hint="At least 4 characters." />
          <TextAreaField label="What was noted" value={note} onChange={(event) => setNote(event.target.value)} hint="At least 8 characters." />
          <Button type="button" onClick={submit}>File report</Button>
        </div>
      ) : null}
    </div>
  )
}
