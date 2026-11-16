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
import { ChamberBadge, ColdNotice } from '@/features/cold-storage/ColdBits'
import { canOperateCold } from '@/services/cold-rules'
import { useColdStore } from '@/store/cold-store'
import { useSessionStore } from '@/store/session-store'

export function InsurancePage() {
  const ready = useColdStore((state) => state.ready)
  const chambers = useColdStore((state) => state.chambers)
  const insurance = useColdStore((state) => state.insurance)
  const fileInsurance = useColdStore((state) => state.fileInsurance)
  const roleId = useSessionStore((state) => state.roleId)
  const accountId = useSessionStore((state) => state.accountId)
  const [chamberId, setChamberId] = useState('')
  const [cover, setCover] = useState('')
  const [until, setUntil] = useState('2027-03-31')
  if (!ready) return <LoadingState label="Loading insurance notes" />
  const chamber = chambers.find((row) => row.id === chamberId) ?? chambers[0]
  const writer = roleId ? canOperateCold(roleId) : false

  function submit() {
    if (!roleId || !accountId || !chamber) return
    const result = fileInsurance({ roleId, accountId }, { chamberId: chamber.id, cover, until })
    if (!result.ok) toast.error(result.message)
    else {
      toast.success(`${result.id} was noted. No policy was purchased.`)
      setCover('')
    }
  }

  return (
    <div className="space-y-4">
      <PageHeader eyebrow="SOP-007" title="Insurance register" description="Cover notes are simulated. They do not name an insurer and they do not pay a claim." actions={<Button type="button" variant="outline" asChild><Link to="/cold-storage">Cold storage desk</Link></Button>} />
      <ColdNotice />
      {insurance.map((row) => (
        <article key={row.id} className="rounded-xl bg-card px-4 py-3 text-sm ring-1 ring-foreground/10">
          <p className="font-medium">{row.policyNo} · {row.chamberCode}</p>
          <p className="mt-1">{row.cover}</p>
          <p className="mt-1 text-muted-foreground">Until {row.until} · {row.note}</p>
        </article>
      ))}
      {writer && chamber ? (
        <div className="grid gap-3 md:grid-cols-2">
          <SelectField label="Chamber" value={chamber.id} onValueChange={setChamberId}>
            {chambers.map((row) => <SelectItem key={row.id} value={row.id}>{row.code}</SelectItem>)}
          </SelectField>
          <TextField label="Cover until" value={until} onChange={(event) => setUntil(event.target.value)} hint="YYYY-MM-DD" />
          <TextField label="Simulated cover" value={cover} onChange={(event) => setCover(event.target.value)} hint="At least 8 characters." />
          <div className="flex items-end"><Button type="button" onClick={submit}>Add cover note</Button></div>
        </div>
      ) : null}
    </div>
  )
}

export function MaintenancePage() {
  const ready = useColdStore((state) => state.ready)
  const chambers = useColdStore((state) => state.chambers)
  const maintenance = useColdStore((state) => state.maintenance)
  const fileMaintenance = useColdStore((state) => state.fileMaintenance)
  const closeMaintenance = useColdStore((state) => state.closeMaintenance)
  const roleId = useSessionStore((state) => state.roleId)
  const accountId = useSessionStore((state) => state.accountId)
  const [chamberId, setChamberId] = useState('')
  const [title, setTitle] = useState('')
  if (!ready) return <LoadingState label="Loading the maintenance register" />
  const chamber = chambers.find((row) => row.id === chamberId) ?? chambers[0]
  const writer = roleId ? canOperateCold(roleId) : false

  function submit() {
    if (!roleId || !accountId || !chamber) return
    const result = fileMaintenance({ roleId, accountId }, { chamberId: chamber.id, title, note: '' })
    if (!result.ok) toast.error(result.message)
    else {
      toast.success(`${result.id} was opened. No contractor was called.`)
      setTitle('')
    }
  }

  return (
    <div className="space-y-4">
      <PageHeader eyebrow="SOP-007" title="Maintenance register" description="Open notes stay until they are closed. Closing a log does not call a contractor." actions={<Button type="button" variant="outline" asChild><Link to="/cold-storage">Cold storage desk</Link></Button>} />
      <ColdNotice />
      {maintenance.map((row) => (
        <article key={row.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-card px-4 py-3 text-sm ring-1 ring-foreground/10">
          <div>
            <p className="font-medium">{row.id} · {row.chamberCode} · {row.title}</p>
            <p className="mt-1 text-muted-foreground">{row.note}</p>
          </div>
          <div className="flex items-center gap-2">
            <ChamberBadge tone={row.status === 'open' ? 'warn' : 'ok'}>{row.status === 'open' ? 'Open' : 'Closed'}</ChamberBadge>
            {writer && row.status === 'open' ? <Button type="button" size="sm" onClick={() => {
              if (!roleId || !accountId) return
              const result = closeMaintenance({ roleId, accountId }, row.id)
              if (!result.ok) toast.error(result.message)
              else toast.success('The log was closed in this browser.')
            }}>Close log</Button> : null}
          </div>
        </article>
      ))}
      {writer && chamber ? (
        <div className="grid gap-3 md:grid-cols-2">
          <SelectField label="Chamber" value={chamber.id} onValueChange={setChamberId}>
            {chambers.map((row) => <SelectItem key={row.id} value={row.id}>{row.code}</SelectItem>)}
          </SelectField>
          <TextField label="Title" value={title} onChange={(event) => setTitle(event.target.value)} hint="At least 4 characters." />
          <Button type="button" onClick={submit}>Open log</Button>
        </div>
      ) : null}
    </div>
  )
}

export function IncidentPage() {
  const ready = useColdStore((state) => state.ready)
  const chambers = useColdStore((state) => state.chambers)
  const incidents = useColdStore((state) => state.incidents)
  const fileIncident = useColdStore((state) => state.fileIncident)
  const closeIncident = useColdStore((state) => state.closeIncident)
  const roleId = useSessionStore((state) => state.roleId)
  const accountId = useSessionStore((state) => state.accountId)
  const [chamberId, setChamberId] = useState('')
  const [title, setTitle] = useState('')
  const [note, setNote] = useState('')
  if (!ready) return <LoadingState label="Loading incident reports" />
  const chamber = chambers.find((row) => row.id === chamberId) ?? chambers[0]
  const writer = roleId ? canOperateCold(roleId) : false

  function submit() {
    if (!roleId || !accountId || !chamber) return
    const result = fileIncident({ roleId, accountId }, { chamberId: chamber.id, title, note })
    if (!result.ok) toast.error(result.message)
    else {
      toast.success(`${result.id} was filed. No service was called.`)
      setTitle('')
      setNote('')
    }
  }

  return (
    <div className="space-y-4">
      <PageHeader eyebrow="SOP-007" title="Incident reporting" description="A report stays in this browser. It does not notify a fire service, an insurer, or a probe vendor." actions={<Button type="button" variant="outline" asChild><Link to="/cold-storage">Cold storage desk</Link></Button>} />
      <ColdNotice />
      {incidents.map((row) => (
        <article key={row.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-card px-4 py-3 text-sm ring-1 ring-foreground/10">
          <div>
            <p className="font-medium">{row.id} · {row.chamberCode} · {row.title}</p>
            <p className="mt-1 text-muted-foreground">{row.note}</p>
          </div>
          <div className="flex items-center gap-2">
            <ChamberBadge tone={row.status === 'open' ? 'warn' : 'ok'}>{row.status === 'open' ? 'Open' : 'Closed'}</ChamberBadge>
            {writer && row.status === 'open' ? <Button type="button" size="sm" onClick={() => {
              if (!roleId || !accountId) return
              const result = closeIncident({ roleId, accountId }, row.id)
              if (!result.ok) toast.error(result.message)
              else toast.success('The report was closed in this browser.')
            }}>Close report</Button> : null}
          </div>
        </article>
      ))}
      {writer && chamber ? (
        <div className="grid gap-3">
          <SelectField label="Chamber" value={chamber.id} onValueChange={setChamberId}>
            {chambers.map((row) => <SelectItem key={row.id} value={row.id}>{row.code}</SelectItem>)}
          </SelectField>
          <TextField label="Title" value={title} onChange={(event) => setTitle(event.target.value)} hint="At least 4 characters." />
          <TextAreaField label="What was noted" value={note} onChange={(event) => setNote(event.target.value)} hint="At least 8 characters." />
          <Button type="button" onClick={submit}>File report</Button>
        </div>
      ) : null}
    </div>
  )
}
