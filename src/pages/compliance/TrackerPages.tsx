import { useState, type ReactNode } from 'react'
import { toast } from 'sonner'
import { PageSlice } from '@/components/common/ArticleList'
import { LoadingState } from '@/components/common/LoadingState'
import { SelectField } from '@/components/forms/SelectField'
import { TextAreaField } from '@/components/forms/TextAreaField'
import { TextField } from '@/components/forms/TextField'
import { Button } from '@/components/ui/button'
import { SelectItem } from '@/components/ui/select'
import { CommandFilters, CommandNotice, matchesQuery, useCommandQuery } from '@/features/compliance/CommandBits'
import { useCommandBooks } from '@/features/compliance/useCommandBooks'
import { PageHeader } from '@/components/common/PageHeader'
import { AUDIT_LABEL, canPostCompliance, SOP_CATALOG } from '@/services/compliance-rules'
import { useComplianceStore } from '@/store/compliance-store'
import { useSessionStore } from '@/store/session-store'

function Shell({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  return (
    <div className="space-y-4">
      <PageHeader eyebrow="SOP matrix" title={title} description={description} />
      <CommandNotice />
      <CommandFilters />
      {children}
    </div>
  )
}

export function IncidentPage() {
  const { from, to, q } = useCommandQuery()
  const { ready, snapshot } = useCommandBooks(from, to)
  const fileIncident = useComplianceStore((state) => state.fileIncident)
  const closeIncident = useComplianceStore((state) => state.closeIncident)
  const roleId = useSessionStore((state) => state.roleId)
  const accountId = useSessionStore((state) => state.accountId)
  const [sop, setSop] = useState('SOP-007')
  const [title, setTitle] = useState('')
  const [note, setNote] = useState('')
  if (!ready) return <LoadingState label="Loading incidents" />
  const writer = roleId ? canPostCompliance(roleId) : false
  const rows = snapshot.incidentsInRange.filter((row) => matchesQuery(q, [row.id, row.sop, row.title, row.status]))

  function submit() {
    if (!roleId || !accountId) return
    const result = fileIncident({ roleId, accountId }, { sop, title, note })
    if (!result.ok) toast.error(result.message)
    else {
      toast.success(`${result.id} was filed. It is a demo record.`)
      setTitle('')
      setNote('')
    }
  }

  return (
    <Shell title="Incident management" description="An incident stays in this browser. Closing it does not notify a department.">
      {writer ? (
        <div className="grid gap-4 md:grid-cols-2">
          <SelectField label="SOP" value={sop} onValueChange={setSop}>
            {SOP_CATALOG.map((row) => <SelectItem key={row.number} value={row.number}>{row.number} · {row.name}</SelectItem>)}
          </SelectField>
          <TextField label="Title" value={title} onChange={(event) => setTitle(event.target.value)} hint="At least 8 characters." />
          <TextAreaField label="Note" value={note} onChange={(event) => setNote(event.target.value)} hint="At least 8 characters." />
          <Button type="button" onClick={submit}>File incident</Button>
        </div>
      ) : <p className="text-sm text-muted-foreground">This role can read incidents and cannot file one.</p>}
      <PageSlice rows={rows} empty="No incident matches that search." render={(row) => (
        <article key={row.id} className="flex flex-wrap items-center justify-between gap-2 text-sm">
          <p>{row.id} · {row.sop} · {row.title} · {row.status} · {AUDIT_LABEL}</p>
          {writer && row.status === 'open' ? <Button type="button" size="sm" variant="outline" onClick={() => {
            if (!roleId || !accountId) return
            const result = closeIncident({ roleId, accountId }, row.id)
            if (!result.ok) toast.error(result.message)
            else toast.success('The incident was closed in this browser.')
          }}>Close incident</Button> : null}
        </article>
      )} />
    </Shell>
  )
}

export function CalendarPage() {
  const { from, to, q } = useCommandQuery()
  const { ready, snapshot } = useCommandBooks(from, to)
  const fileInspection = useComplianceStore((state) => state.fileInspection)
  const roleId = useSessionStore((state) => state.roleId)
  const accountId = useSessionStore((state) => state.accountId)
  const [sop, setSop] = useState('SOP-013')
  const [title, setTitle] = useState('')
  const [day, setDay] = useState('2026-11-18')
  const [note, setNote] = useState('')
  if (!ready) return <LoadingState label="Loading the calendar" />
  const writer = roleId ? canPostCompliance(roleId) : false
  const rows = snapshot.inspectionsInRange.filter((row) => matchesQuery(q, [row.id, row.sop, row.title, row.status]))

  function submit() {
    if (!roleId || !accountId) return
    const result = fileInspection({ roleId, accountId }, { sop, title, day, note })
    if (!result.ok) toast.error(result.message)
    else {
      toast.success(`${result.id} was planned. No inspector was appointed.`)
      setTitle('')
      setNote('')
    }
  }

  return (
    <Shell title="Inspection calendar" description="Planned and completed rows for the selected dates. A row is not an official inspection.">
      {writer ? (
        <div className="grid gap-4 md:grid-cols-2">
          <SelectField label="SOP" value={sop} onValueChange={setSop}>
            {SOP_CATALOG.map((row) => <SelectItem key={row.number} value={row.number}>{row.number}</SelectItem>)}
          </SelectField>
          <TextField label="Title" value={title} onChange={(event) => setTitle(event.target.value)} hint="At least 8 characters." />
          <TextField label="Day" value={day} onChange={(event) => setDay(event.target.value)} hint="YYYY-MM-DD" />
          <TextAreaField label="Note" value={note} onChange={(event) => setNote(event.target.value)} hint="At least 8 characters." />
          <Button type="button" onClick={submit}>Plan inspection</Button>
        </div>
      ) : <p className="text-sm text-muted-foreground">This role can read the calendar and cannot add a row.</p>}
      <PageSlice rows={rows} empty="No inspection matches that search." render={(row) => <p key={row.id} className="text-sm">{row.day} · {row.id} · {row.sop} · {row.title} · {row.status}</p>} />
    </Shell>
  )
}

export function ActionPage() {
  const { from, to, q } = useCommandQuery()
  const { ready, snapshot } = useCommandBooks(from, to)
  const incidents = useComplianceStore((state) => state.incidents)
  const fileAction = useComplianceStore((state) => state.fileAction)
  const closeAction = useComplianceStore((state) => state.closeAction)
  const roleId = useSessionStore((state) => state.roleId)
  const accountId = useSessionStore((state) => state.accountId)
  const [incidentId, setIncidentId] = useState('')
  const [title, setTitle] = useState('')
  const [due, setDue] = useState('2026-11-21')
  const [note, setNote] = useState('')
  if (!ready) return <LoadingState label="Loading actions" />
  const writer = roleId ? canPostCompliance(roleId) : false
  const incident = incidents.find((row) => row.id === incidentId) ?? incidents[0]
  const rows = snapshot.actionsInRange.filter((row) => matchesQuery(q, [row.id, row.sop, row.title, row.status]))

  function submit() {
    if (!roleId || !accountId || !incident) return
    const result = fileAction({ roleId, accountId }, { incidentId: incident.id, title, due, note })
    if (!result.ok) toast.error(result.message)
    else {
      toast.success(`${result.id} was filed. No department was assigned.`)
      setTitle('')
      setNote('')
    }
  }

  return (
    <Shell title="Corrective action tracker" description="An action follows an incident already in this browser. Closing it does not certify a fix.">
      {writer && incident ? (
        <div className="grid gap-4 md:grid-cols-2">
          <SelectField label="Incident" value={incident.id} onValueChange={setIncidentId}>
            {incidents.map((row) => <SelectItem key={row.id} value={row.id}>{row.id} · {row.sop}</SelectItem>)}
          </SelectField>
          <TextField label="Title" value={title} onChange={(event) => setTitle(event.target.value)} hint="At least 8 characters." />
          <TextField label="Due" value={due} onChange={(event) => setDue(event.target.value)} hint="On or after 14 Nov 2026." />
          <TextAreaField label="Note" value={note} onChange={(event) => setNote(event.target.value)} hint="At least 8 characters." />
          <Button type="button" onClick={submit}>File action</Button>
        </div>
      ) : null}
      <PageSlice rows={rows} empty="No action matches that search." render={(row) => (
        <article key={row.id} className="flex flex-wrap items-center justify-between gap-2 text-sm">
          <p>{row.id} · {row.sop} · {row.title} · due {row.due} · {row.status}</p>
          {writer && row.status === 'open' ? <Button type="button" size="sm" variant="outline" onClick={() => {
            if (!roleId || !accountId) return
            const result = closeAction({ roleId, accountId }, row.id)
            if (!result.ok) toast.error(result.message)
            else toast.success('The action was closed in this browser.')
          }}>Close action</Button> : null}
        </article>
      )} />
    </Shell>
  )
}

export function AuditPage() {
  const { from, to, q } = useCommandQuery()
  const { ready, snapshot } = useCommandBooks(from, to)
  if (!ready) return <LoadingState label="Loading the audit trail" />
  const rows = snapshot.auditInRange.filter((row) => matchesQuery(q, [row.id, row.sop, row.title, row.detail, row.label]))
  return (
    <Shell title="Demo audit trail" description="Every row is a demo record. It is not authoritative evidence and it cannot be sent outside this browser as a finding.">
      <PageSlice rows={rows} empty="No audit row falls inside these dates." render={(row) => (
        <article key={row.id} className="rounded-xl bg-card px-4 py-3 text-sm ring-1 ring-foreground/10">
          <p className="font-medium">{row.id} · {row.sop} · {row.title}</p>
          <p className="mt-1">{row.detail}</p>
          <p className="mt-1 text-muted-foreground">{row.label}</p>
        </article>
      )} />
    </Shell>
  )
}
