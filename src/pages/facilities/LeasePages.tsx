import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { toDataURL } from 'qrcode'
import { toast } from 'sonner'
import { EmptyState } from '@/components/common/EmptyState'
import { LoadingState } from '@/components/common/LoadingState'
import { PageHeader } from '@/components/common/PageHeader'
import { SelectField } from '@/components/forms/SelectField'
import { TextAreaField } from '@/components/forms/TextAreaField'
import { TextField } from '@/components/forms/TextField'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { SelectItem } from '@/components/ui/select'
import { FacilityBadge, FacilityNotice } from '@/features/facilities/FacilityBits'
import { agreementLabel, kindLabel } from '@/features/facilities/meta'
import { formatPaise } from '@/services/money'
import { canDecideFacility, canOperateFacility, FACILITY_TEMPLATES, isFacilityKind, liveSite, NEXT_AGREEMENT } from '@/services/facility-rules'
import { useFacilityStore } from '@/store/facility-store'
import { useRegistryStore } from '@/store/registry-store'
import { useSessionStore } from '@/store/session-store'
import type { AgreementStatus, FacilityKind } from '@/types/facility'

const officialMoves: AgreementStatus[] = ['under-verification', 'verified', 'clarification-required', 'approved', 'issued', 'rejected']

export function KindPage({ kind }: { kind: FacilityKind }) {
  const ready = useFacilityStore((state) => state.ready)
  const sites = useFacilityStore((state) => state.sites)
  const leases = useFacilityStore((state) => state.leases)
  if (!ready) return <LoadingState label="Loading the facility template" />
  const template = FACILITY_TEMPLATES[kind]
  const rows = leases.filter((row) => row.kind === kind)
  return (
    <div className="space-y-4">
      <PageHeader
        eyebrow={`${template.leaseSop} · ${template.operationsSop}`}
        title={`${template.title} lease management`}
        description={`${template.title} keeps its own sites and ${template.unitNoun.toLowerCase()} register. The contract steps are the same as the other facility templates.`}
        actions={<Button type="button" variant="outline" asChild><Link to={`/facilities/apply/${kind}`}>New application</Link></Button>}
      />
      <FacilityNotice />
      {sites.filter((site) => site.kind === kind).map((site) => (
        <p key={site.id} className="text-sm">{site.code} · {site.name}</p>
      ))}
      {rows.map((row) => (
        <article key={row.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-card px-4 py-3 text-sm ring-1 ring-foreground/10">
          <div>
            <p className="font-medium">{row.leaseNo} · {row.siteCode} · {row.operatorLabel}</p>
            <p className="mt-1">{agreementLabel(row.status)} · {row.start} to {row.end}</p>
          </div>
          <div className="flex items-center gap-2">
            {row.status === 'issued' ? <Button type="button" size="sm" variant="outline" asChild><Link to={`/facilities/leases/${row.id}/print`}>Document</Link></Button> : null}
            <Button type="button" size="sm" variant="outline" asChild><Link to={`/facilities/leases/${row.id}`}>Open</Link></Button>
          </div>
        </article>
      ))}
    </div>
  )
}

export function ApplyPage() {
  const { kind: kindParam = '' } = useParams()
  const facilityReady = useFacilityStore((state) => state.ready)
  const registryReady = useRegistryStore((state) => state.ready)
  const ready = facilityReady && registryReady
  const sites = useFacilityStore((state) => state.sites)
  const leases = useFacilityStore((state) => state.leases)
  const parties = useRegistryStore((state) => state.parties)
  const fileLease = useFacilityStore((state) => state.fileLease)
  const roleId = useSessionStore((state) => state.roleId)
  const accountId = useSessionStore((state) => state.accountId)
  const [siteId, setSiteId] = useState('')
  const [operatorId, setOperatorId] = useState('')
  const [purpose, setPurpose] = useState('')
  const [start, setStart] = useState('2026-11-16')
  const [end, setEnd] = useState('2027-11-15')
  if (!isFacilityKind(kindParam)) return <EmptyState title="Unknown facility template" description="Choose Kisan Bhavan, hotel or restaurant." />
  if (!ready) return <LoadingState label="Loading the application form" />
  const kind = kindParam
  const template = FACILITY_TEMPLATES[kind]
  const openSites = sites.filter((site) => site.kind === kind && !liveSite(leases, site.id))
  const operators = parties.filter((row) => row.kind === 'facility-operator' && row.status === 'Active')
  const site = openSites.find((row) => row.id === siteId) ?? openSites[0]
  const operator = operators.find((row) => row.id === operatorId) ?? operators[0]
  const writer = roleId ? canOperateFacility(roleId) : false

  function submit() {
    if (!roleId || !accountId || !site || !operator) return
    const result = fileLease({ roleId, accountId }, { kind, siteId: site.id, operatorId: operator.id, purpose, start, end })
    if (!result.ok) toast.error(result.message)
    else {
      toast.success(`${result.id} was filed. No application fee was taken.`)
      setPurpose('')
    }
  }

  return (
    <div className="space-y-4">
      <PageHeader eyebrow={template.leaseSop} title={`${template.title} application`} description="Apply for a site of this type that has no open lease. Verification and approval use the shared contract steps." actions={<Button type="button" variant="outline" asChild><Link to="/facilities">Facilities desk</Link></Button>} />
      <FacilityNotice />
      {writer && site && operator ? (
        <Card>
          <CardHeader><CardTitle>{kindLabel(kind)} lease application</CardTitle></CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <SelectField label="Site" value={site.id} onValueChange={setSiteId}>
              {openSites.map((row) => <SelectItem key={row.id} value={row.id}>{row.code} · {row.name}</SelectItem>)}
            </SelectField>
            <SelectField label="Operator desk code" value={operator.id} onValueChange={setOperatorId}>
              {operators.map((row) => <SelectItem key={row.id} value={row.id}>{row.label}</SelectItem>)}
            </SelectField>
            <TextField label="Start" value={start} onChange={(event) => setStart(event.target.value)} hint="YYYY-MM-DD" />
            <TextField label="End" value={end} onChange={(event) => setEnd(event.target.value)} hint="Must fall after the start" />
            <div className="md:col-span-2">
              <TextAreaField label="Proposed use" value={purpose} onChange={(event) => setPurpose(event.target.value)} hint="At least 8 characters. This is not a business record." />
            </div>
            <Button type="button" onClick={submit}>File application</Button>
          </CardContent>
        </Card>
      ) : <p className="text-sm text-muted-foreground">{writer ? 'Every site of this type already has a lease.' : 'This role can read the desk and cannot file an application.'}</p>}
    </div>
  )
}

export function LeaseDetailPage() {
  const { id = '' } = useParams()
  const ready = useFacilityStore((state) => state.ready)
  const lease = useFacilityStore((state) => state.leases.find((row) => row.id === id))
  const moveLease = useFacilityStore((state) => state.moveLease)
  const recordDeposit = useFacilityStore((state) => state.recordDeposit)
  const renewLease = useFacilityStore((state) => state.renewLease)
  const roleId = useSessionStore((state) => state.roleId)
  const accountId = useSessionStore((state) => state.accountId)
  const [deposit, setDeposit] = useState('5000')
  const [renewal, setRenewal] = useState('2027-06-01')
  if (!ready) return <LoadingState label="Loading the lease" />
  if (!lease) return <EmptyState title="Lease not in this browser" description="That demonstration number is not in the facilities book." />
  const template = FACILITY_TEMPLATES[lease.kind]
  const official = roleId ? canDecideFacility(roleId) : false
  const operator = roleId ? canOperateFacility(roleId) : false
  const next = NEXT_AGREEMENT[lease.status].filter((status) => {
    if (status === 'submitted') return operator
    if (status === 'deposit-recorded') return false
    return official && officialMoves.includes(status)
  })

  function run(action: () => { ok: boolean; message?: string }, success: string) {
    const result = action()
    if (!result.ok) toast.error(result.message ?? 'The facilities book refused that step.')
    else toast.success(success)
  }

  return (
    <div className="space-y-4">
      <PageHeader
        eyebrow={template.leaseSop}
        title={lease.leaseNo}
        description={`${kindLabel(lease.kind)} · ${lease.siteCode} · ${lease.operatorLabel} · ${lease.start} to ${lease.end}.`}
        actions={<Button type="button" variant="outline" asChild><Link to={`/facilities/${lease.kind === 'kisan-bhavan' ? 'kisan' : lease.kind}`}>Template</Link></Button>}
      />
      <FacilityNotice />
      <div className="flex flex-wrap items-center gap-2">
        <FacilityBadge tone={lease.status === 'issued' ? 'ok' : 'warn'}>{agreementLabel(lease.status)}</FacilityBadge>
        {lease.receiptId ? <span className="text-sm">{lease.receiptId} · {formatPaise(lease.depositPaise)} · DEMO / SIMULATED</span> : null}
        {lease.status === 'issued' ? <Button type="button" size="sm" variant="outline" asChild><Link to={`/facilities/leases/${lease.id}/print`}>Contract document</Link></Button> : null}
      </div>
      <p className="text-sm">{lease.purpose}</p>
      {official && lease.status === 'approved' ? (
        <div className="flex flex-wrap items-end gap-2">
          <TextField label="Simulated deposit" value={deposit} onChange={(event) => setDeposit(event.target.value)} hint="Above zero. At most two decimal places." />
          <Button type="button" onClick={() => {
            if (!roleId || !accountId) return
            run(() => recordDeposit({ roleId, accountId }, lease.id, deposit), 'The deposit was noted. No money moved.')
          }}>Record deposit</Button>
        </div>
      ) : null}
      <div className="flex flex-wrap gap-2">
        {next.map((status) => (
          <Button key={status} type="button" variant="outline" onClick={() => {
            if (!roleId || !accountId) return
            run(() => moveLease({ roleId, accountId }, lease.id, status), 'The simulated lease moved. No deed was signed.')
          }}>{agreementLabel(status)}</Button>
        ))}
      </div>
      {official && lease.status === 'issued' ? (
        <div className="flex flex-wrap items-end gap-2">
          <TextField label="Renew through" value={renewal} onChange={(event) => setRenewal(event.target.value)} hint="Must fall after the current end." />
          <Button type="button" onClick={() => {
            if (!roleId || !accountId) return
            run(() => renewLease({ roleId, accountId }, lease.id, renewal), 'The lease was renewed in this browser. No deed was signed.')
          }}>Renew lease</Button>
        </div>
      ) : null}
    </div>
  )
}

export function LeasePrintPage() {
  const { id = '' } = useParams()
  const ready = useFacilityStore((state) => state.ready)
  const lease = useFacilityStore((state) => state.leases.find((row) => row.id === id))
  if (!ready) return <LoadingState label="Loading the contract document" />
  if (!lease || lease.status !== 'issued') {
    return <EmptyState title="Lease not issued" description="The document is available after the simulated lease is issued." />
  }
  const template = FACILITY_TEMPLATES[lease.kind]
  const payload = `DEMO|NAGA-MANDI|${lease.leaseNo}|not-a-deed`

  return (
    <div className="space-y-4">
      <div className="no-print flex flex-wrap gap-2">
        <Button type="button" variant="outline" asChild><Link to={`/facilities/leases/${lease.id}`}>Back to the lease</Link></Button>
        <Button type="button" onClick={() => window.print()}>Print preview</Button>
      </div>
      <article className="print-sheet mx-auto max-w-3xl space-y-5 rounded-xl border-2 border-primary bg-white p-8 text-slate-900">
        <header className="flex items-start justify-between gap-4 border-b border-primary/30 pb-4">
          <div>
            <p className="text-xs tracking-[0.2em] text-primary uppercase">Naga Mandi OS · {template.leaseSop}</p>
            <h1 className="font-display text-3xl text-primary">{template.title} lease</h1>
            <p className="text-sm">DEMO / SIMULATED. This is not a lease deed and no deposit was banked.</p>
          </div>
          <p className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-950">DEMO / SIMULATED</p>
        </header>
        <p className="font-display text-2xl">{lease.leaseNo}</p>
        <dl className="grid gap-3 text-sm sm:grid-cols-2">
          <Item label="Site" value={lease.siteCode} />
          <Item label="Operator" value={lease.operatorLabel} />
          <Item label="Term" value={`${lease.start} to ${lease.end}`} />
          <Item label="Template" value={template.title} />
          <Item label="Simulated deposit" value={formatPaise(lease.depositPaise)} />
          <Item label="Receipt" value={lease.receiptId || 'None'} />
        </dl>
        <p className="text-sm">{lease.purpose}</p>
        <div className="flex items-end justify-between gap-4">
          <Mark payload={payload} />
          <p className="max-w-xs text-right text-xs text-slate-600">No signature binds a party. No site was handed over.</p>
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
