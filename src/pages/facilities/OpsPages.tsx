import { useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { PageSlice } from '@/components/common/ArticleList'
import { LoadingState } from '@/components/common/LoadingState'
import { PageHeader } from '@/components/common/PageHeader'
import { SelectField } from '@/components/forms/SelectField'
import { TextAreaField } from '@/components/forms/TextAreaField'
import { TextField } from '@/components/forms/TextField'
import { Button } from '@/components/ui/button'
import { SelectItem } from '@/components/ui/select'
import { FacilityNotice } from '@/features/facilities/FacilityBits'
import { chargeLabel, checkLabel } from '@/features/facilities/meta'
import { formatPaise } from '@/services/money'
import { canDecideFacility, canOperateFacility, CHECK_ITEMS, daysUntil, FACILITY_TEMPLATES, issuedSite, needsAlert, openStay } from '@/services/facility-rules'
import { useFacilityStore } from '@/store/facility-store'
import { useSessionStore } from '@/store/session-store'
import type { CheckKind } from '@/types/facility'

export function RegisterPage() {
  const ready = useFacilityStore((state) => state.ready)
  const sites = useFacilityStore((state) => state.sites)
  const units = useFacilityStore((state) => state.units)
  const stays = useFacilityStore((state) => state.stays)
  if (!ready) return <LoadingState label="Loading the register" />
  return (
    <div className="space-y-4">
      <PageHeader eyebrow="SOP-013 · SOP-015" title="Room and facility register" description="Each template lists its own units. An open stay marks the unit occupied." actions={<Button type="button" variant="outline" asChild><Link to="/facilities">Facilities desk</Link></Button>} />
      <FacilityNotice />
      {units.map((unit) => {
        const site = sites.find((row) => row.id === unit.siteId)
        const held = openStay(stays, unit.id)
        return (
          <p key={unit.id} className="text-sm">
            {unit.code} · {unit.name} · {site?.code} · {site ? FACILITY_TEMPLATES[site.kind].unitNoun : 'Unit'} · {held ? `Occupied · ${held.guestCode}` : 'Open'}
          </p>
        )
      })}
    </div>
  )
}

export function StayPage() {
  const ready = useFacilityStore((state) => state.ready)
  const units = useFacilityStore((state) => state.units)
  const sites = useFacilityStore((state) => state.sites)
  const leases = useFacilityStore((state) => state.leases)
  const stays = useFacilityStore((state) => state.stays)
  const fileStay = useFacilityStore((state) => state.fileStay)
  const closeStay = useFacilityStore((state) => state.closeStay)
  const roleId = useSessionStore((state) => state.roleId)
  const accountId = useSessionStore((state) => state.accountId)
  const choices = units.filter((unit) => {
    const site = sites.find((row) => row.id === unit.siteId)
    return site ? Boolean(issuedSite(leases, site.id)) : false
  })
  const [unitId, setUnitId] = useState('')
  const [guest, setGuest] = useState('')
  const [nights, setNights] = useState('1')
  if (!ready) return <LoadingState label="Loading stays" />
  const unit = choices.find((row) => row.id === unitId) ?? choices.find((row) => !openStay(stays, row.id)) ?? choices[0]
  const writer = roleId ? canOperateFacility(roleId) : false

  function submit() {
    if (!roleId || !accountId || !unit) return
    const result = fileStay({ roleId, accountId }, { unitId: unit.id, guest, nights })
    if (!result.ok) toast.error(result.message)
    else {
      toast.success(`${result.id} was recorded. The guest code is fictional.`)
      setGuest('')
    }
  }

  return (
    <div className="space-y-4">
      <PageHeader eyebrow="SOP-013 · SOP-015" title="Simulated stay records" description="A stay uses a fictional desk code such as GS-21. It cannot take a unit that already has an open stay." actions={<Button type="button" variant="outline" asChild><Link to="/facilities">Facilities desk</Link></Button>} />
      <FacilityNotice />
      {writer && unit ? (
        <div className="grid gap-4 rounded-xl bg-card px-4 py-3 ring-1 ring-foreground/10 md:grid-cols-2">
          <SelectField label="Unit" value={unit.id} onValueChange={setUnitId}>
            {choices.map((row) => <SelectItem key={row.id} value={row.id}>{row.code} · {openStay(stays, row.id) ? 'Occupied' : 'Open'}</SelectItem>)}
          </SelectField>
          <TextField label="Guest desk code" value={guest} onChange={(event) => setGuest(event.target.value)} hint="GS- followed by 2 to 4 digits." />
          <TextField label="Count" value={nights} onChange={(event) => setNights(event.target.value)} hint="Nights or covers, from 1 to 30." />
          <Button type="button" onClick={submit}>Record stay</Button>
        </div>
      ) : <p className="text-sm text-muted-foreground">This role can read stays and cannot record one.</p>}
      {stays.map((row) => (
        <article key={row.id} className="flex flex-wrap items-center justify-between gap-2 text-sm">
          <p>{row.stayNo} · {row.guestCode} · {row.siteCode} {row.unitCode} · {row.nights} · {row.status}</p>
          {writer && row.status === 'open' ? <Button type="button" size="sm" variant="outline" onClick={() => {
            if (!roleId || !accountId) return
            const result = closeStay({ roleId, accountId }, row.id)
            if (!result.ok) toast.error(result.message)
            else toast.success('The stay was closed in this browser.')
          }}>Close stay</Button> : null}
        </article>
      ))}
    </div>
  )
}

export function ChecklistPage({ kind }: { kind: CheckKind }) {
  const ready = useFacilityStore((state) => state.ready)
  const sites = useFacilityStore((state) => state.sites)
  const leases = useFacilityStore((state) => state.leases)
  const inspections = useFacilityStore((state) => state.inspections)
  const fileInspection = useFacilityStore((state) => state.fileInspection)
  const roleId = useSessionStore((state) => state.roleId)
  const accountId = useSessionStore((state) => state.accountId)
  const allocated = sites.filter((site) => FACILITY_TEMPLATES[site.kind].checks.includes(kind) && issuedSite(leases, site.id))
  const [siteId, setSiteId] = useState('')
  const [answers, setAnswers] = useState<Record<string, 'yes' | 'no' | ''>>({})
  const [note, setNote] = useState('')
  if (!ready) return <LoadingState label="Loading the checklist" />
  const site = allocated.find((row) => row.id === siteId) ?? allocated[0]
  const writer = roleId ? canOperateFacility(roleId) : false
  const template = CHECK_ITEMS[kind]
  const rows = inspections.filter((row) => row.kind === kind)

  function submit() {
    if (!roleId || !accountId || !site) return
    const items = template.flatMap((item) => {
      const result = answers[item.id]
      return result === 'yes' || result === 'no' ? [{ id: item.id, label: item.label, result }] : []
    })
    if (items.length !== template.length) {
      toast.error('Mark every checklist line yes or no.')
      return
    }
    const result = fileInspection({ roleId, accountId }, { kind, siteId: site.id, items, note })
    if (!result.ok) toast.error(result.message)
    else {
      toast.success(`${result.id} was filed. No inspection was sent outside this browser.`)
      setAnswers({})
      setNote('')
    }
  }

  return (
    <div className="space-y-4">
      <PageHeader eyebrow="SOP-013 · SOP-015" title={checkLabel(kind)} description="Mark every line. A failed line needs a short note. Food hygiene and restaurant operations stay on the restaurant template." actions={<Button type="button" variant="outline" asChild><Link to="/facilities">Facilities desk</Link></Button>} />
      <FacilityNotice />
      {writer && site ? (
        <div className="space-y-3 rounded-xl bg-card px-4 py-3 ring-1 ring-foreground/10">
          <SelectField label="Site" value={site.id} onValueChange={setSiteId}>
            {allocated.map((row) => <SelectItem key={row.id} value={row.id}>{row.code} · {FACILITY_TEMPLATES[row.kind].title}</SelectItem>)}
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
      ) : <p className="text-sm text-muted-foreground">{writer ? 'No issued site uses this checklist.' : 'This role can read filed checklists.'}</p>}
      <PageSlice rows={rows} empty="No checklist is filed for this template." render={(row) => (
        <article key={row.id} className="rounded-xl bg-card px-4 py-3 text-sm ring-1 ring-foreground/10">
          <p className="font-medium">{row.id} · {row.siteCode}</p>
          <p className="mt-1">{row.items.map((item) => `${item.label}: ${item.result}`).join(' · ')}</p>
        </article>
      )} />
    </div>
  )
}

export function MaintenancePage() {
  const ready = useFacilityStore((state) => state.ready)
  const sites = useFacilityStore((state) => state.sites)
  const maintenance = useFacilityStore((state) => state.maintenance)
  const fileMaintenance = useFacilityStore((state) => state.fileMaintenance)
  const closeMaintenance = useFacilityStore((state) => state.closeMaintenance)
  const roleId = useSessionStore((state) => state.roleId)
  const accountId = useSessionStore((state) => state.accountId)
  const [siteId, setSiteId] = useState('')
  const [title, setTitle] = useState('')
  const [note, setNote] = useState('')
  if (!ready) return <LoadingState label="Loading maintenance" />
  const site = sites.find((row) => row.id === siteId) ?? sites[0]
  const writer = roleId ? canOperateFacility(roleId) : false

  function submit() {
    if (!roleId || !accountId || !site) return
    const result = fileMaintenance({ roleId, accountId }, { siteId: site.id, title, note })
    if (!result.ok) toast.error(result.message)
    else {
      toast.success(`${result.id} was opened. No contractor was called.`)
      setTitle('')
      setNote('')
    }
  }

  return (
    <div className="space-y-4">
      <PageHeader eyebrow="SOP-013" title="Maintenance logs" description="Open notes stay until they are closed. Closing a log does not call a contractor." actions={<Button type="button" variant="outline" asChild><Link to="/facilities">Facilities desk</Link></Button>} />
      <FacilityNotice />
      {writer && site ? (
        <div className="grid gap-4 md:grid-cols-2">
          <SelectField label="Site" value={site.id} onValueChange={setSiteId}>
            {sites.map((row) => <SelectItem key={row.id} value={row.id}>{row.code}</SelectItem>)}
          </SelectField>
          <TextField label="Title" value={title} onChange={(event) => setTitle(event.target.value)} hint="At least 4 characters." />
          <TextAreaField label="Note" value={note} onChange={(event) => setNote(event.target.value)} hint="At least 8 characters." />
          <Button type="button" onClick={submit}>Open log</Button>
        </div>
      ) : null}
      {maintenance.map((row) => (
        <article key={row.id} className="flex flex-wrap items-center justify-between gap-2 text-sm">
          <p>{row.id} · {row.siteCode} · {row.title} · {row.status}</p>
          {writer && row.status === 'open' ? <Button type="button" size="sm" variant="outline" onClick={() => {
            if (!roleId || !accountId) return
            const result = closeMaintenance({ roleId, accountId }, row.id)
            if (!result.ok) toast.error(result.message)
            else toast.success('The log was closed in this browser.')
          }}>Close log</Button> : null}
        </article>
      ))}
    </div>
  )
}

export function InsurancePage() {
  const ready = useFacilityStore((state) => state.ready)
  const sites = useFacilityStore((state) => state.sites)
  const insurance = useFacilityStore((state) => state.insurance)
  const fileInsurance = useFacilityStore((state) => state.fileInsurance)
  const roleId = useSessionStore((state) => state.roleId)
  const accountId = useSessionStore((state) => state.accountId)
  const [siteId, setSiteId] = useState('')
  const [cover, setCover] = useState('')
  const [until, setUntil] = useState('2026-12-20')
  if (!ready) return <LoadingState label="Loading insurance" />
  const site = sites.find((row) => row.id === siteId) ?? sites[0]
  const writer = roleId ? canOperateFacility(roleId) : false

  function submit() {
    if (!roleId || !accountId || !site) return
    const result = fileInsurance({ roleId, accountId }, { siteId: site.id, cover, until })
    if (!result.ok) toast.error(result.message)
    else {
      toast.success(`${result.id} was filed. No policy was bought.`)
      setCover('')
    }
  }

  return (
    <div className="space-y-4">
      <PageHeader eyebrow="SOP-013 · SOP-015" title="Insurance records" description="Cover notes are simulated. They do not name an insurer and they do not pay a claim." actions={<Button type="button" variant="outline" asChild><Link to="/facilities">Facilities desk</Link></Button>} />
      <FacilityNotice />
      {writer && site ? (
        <div className="grid gap-4 md:grid-cols-2">
          <SelectField label="Site" value={site.id} onValueChange={setSiteId}>
            {sites.map((row) => <SelectItem key={row.id} value={row.id}>{row.code}</SelectItem>)}
          </SelectField>
          <TextField label="Cover" value={cover} onChange={(event) => setCover(event.target.value)} hint="At least 4 characters." />
          <TextField label="Until" value={until} onChange={(event) => setUntil(event.target.value)} hint="YYYY-MM-DD" />
          <Button type="button" onClick={submit}>File cover</Button>
        </div>
      ) : null}
      {insurance.map((row) => (
        <p key={row.id} className="text-sm">{row.policyNo} · {row.siteCode} · {row.cover} · until {row.until}</p>
      ))}
    </div>
  )
}

export function ChargePage({ mode }: { mode: 'deposit' | 'rent' }) {
  const ready = useFacilityStore((state) => state.ready)
  const charges = useFacilityStore((state) => state.charges)
  const leases = useFacilityStore((state) => state.leases)
  const recordRent = useFacilityStore((state) => state.recordRent)
  const roleId = useSessionStore((state) => state.roleId)
  const accountId = useSessionStore((state) => state.accountId)
  const issued = leases.filter((row) => row.status === 'issued')
  const [leaseId, setLeaseId] = useState('')
  const [rent, setRent] = useState('')
  if (!ready) return <LoadingState label="Loading the register" />
  const lease = issued.find((row) => row.id === leaseId) ?? issued[0]
  const official = roleId ? canDecideFacility(roleId) : false
  const rows = charges.filter((row) => row.kind === mode)

  function submit() {
    if (!roleId || !accountId || !lease) return
    const result = recordRent({ roleId, accountId }, lease.id, rent)
    if (!result.ok) toast.error(result.message)
    else {
      toast.success(`${result.id} was noted. Rent was not collected.`)
      setRent('')
    }
  }

  return (
    <div className="space-y-4">
      <PageHeader
        eyebrow="SOP-012 · SOP-014"
        title={mode === 'deposit' ? 'Security deposit records' : 'Rent tracking'}
        description={mode === 'deposit' ? 'A deposit is noted when a lease is approved. Nothing is banked.' : 'Rent is a later note on an issued lease. It is not posted to the finance book.'}
        actions={<Button type="button" variant="outline" asChild><Link to="/facilities">Facilities desk</Link></Button>}
      />
      <FacilityNotice />
      {mode === 'rent' && official && lease ? (
        <div className="grid gap-4 md:grid-cols-2">
          <SelectField label="Issued lease" value={lease.id} onValueChange={setLeaseId}>
            {issued.map((row) => <SelectItem key={row.id} value={row.id}>{row.leaseNo} · {row.siteCode}</SelectItem>)}
          </SelectField>
          <TextField label="Rent" value={rent} onChange={(event) => setRent(event.target.value)} hint="Above zero. At most two decimal places." />
          <Button type="button" onClick={submit}>Note rent</Button>
        </div>
      ) : null}
      {rows.map((row) => (
        <p key={row.id} className="text-sm">{row.id} · {chargeLabel(row.kind)} · {row.sourceNo} · {row.placeCode} · {formatPaise(row.paise)} · DEMO / SIMULATED</p>
      ))}
    </div>
  )
}

export function AlertsPage() {
  const ready = useFacilityStore((state) => state.ready)
  const leases = useFacilityStore((state) => state.leases)
  const insurance = useFacilityStore((state) => state.insurance)
  if (!ready) return <LoadingState label="Loading alerts" />
  const rows = [
    ...leases.filter((row) => row.status === 'issued' && needsAlert(row.end)).map((row) => ({ id: row.id, label: `${row.leaseNo} · ${row.siteCode} lease`, end: row.end })),
    ...insurance.filter((row) => needsAlert(row.until)).map((row) => ({ id: row.id, label: `${row.policyNo} · ${row.siteCode} cover`, end: row.until })),
  ]
  return (
    <div className="space-y-4">
      <PageHeader eyebrow="SOP-012 · SOP-014" title="Renewal and expiry alerts" description="Issued leases and simulated cover ending within 30 days of 14 Nov 2026, or already past. Renewal is recorded on the lease. No notice is sent." actions={<Button type="button" variant="outline" asChild><Link to="/facilities">Facilities desk</Link></Button>} />
      <FacilityNotice />
      <PageSlice rows={rows} empty="No issued term is inside the alert window." render={(row) => (
        <p key={row.id} className="text-sm">{row.label} · ends {row.end} · {daysUntil(row.end)} days from the sample day</p>
      )} />
    </div>
  )
}
