import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { toDataURL } from 'qrcode'
import { toast } from 'sonner'
import { ArticleList } from '@/components/common/ArticleList'
import { PageSlice } from '@/components/common/ArticleList'
import { EmptyState } from '@/components/common/EmptyState'
import { LoadingState } from '@/components/common/LoadingState'
import { PageHeader } from '@/components/common/PageHeader'
import { SelectField } from '@/components/forms/SelectField'
import { TextAreaField } from '@/components/forms/TextAreaField'
import { TextField } from '@/components/forms/TextField'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { SelectItem } from '@/components/ui/select'
import { ParkingBadge, ParkingNotice } from '@/features/parking/ParkingBits'
import { agreementLabel, chargeLabel } from '@/features/parking/meta'
import { formatPaise } from '@/services/money'
import { canDecideParking, canOperateParking, daysUntil, liveOffice, needsAlert, NEXT_AGREEMENT } from '@/services/parking-rules'
import { useParkingStore } from '@/store/parking-store'
import { useRegistryStore } from '@/store/registry-store'
import { useSessionStore } from '@/store/session-store'
import type { AgreementStatus } from '@/types/parking'

const officialMoves: AgreementStatus[] = ['under-verification', 'verified', 'clarification-required', 'approved', 'issued', 'rejected']

export function LeaseApplyPage() {
  const parkingReady = useParkingStore((state) => state.ready)
  const registryReady = useRegistryStore((state) => state.ready)
  const ready = parkingReady && registryReady
  const offices = useParkingStore((state) => state.offices)
  const leases = useParkingStore((state) => state.leases)
  const parties = useRegistryStore((state) => state.parties)
  const fileOfficeLease = useParkingStore((state) => state.fileOfficeLease)
  const roleId = useSessionStore((state) => state.roleId)
  const accountId = useSessionStore((state) => state.accountId)
  const openOffices = offices.filter((office) => !liveOffice(leases, office.id))
  const lessees = parties.filter((row) => row.kind === 'transporter' && row.status === 'Active')
  const [officeId, setOfficeId] = useState('')
  const [lesseeId, setLesseeId] = useState('')
  const [purpose, setPurpose] = useState('')
  const [start, setStart] = useState('2026-11-16')
  const [end, setEnd] = useState('2027-11-15')
  if (!ready) return <LoadingState label="Loading the lease form" />
  const office = openOffices.find((row) => row.id === officeId) ?? openOffices[0]
  const lessee = lessees.find((row) => row.id === lesseeId) ?? lessees[0]
  const writer = roleId ? canOperateParking(roleId) : false

  function submit() {
    if (!roleId || !accountId || !office || !lessee) return
    const result = fileOfficeLease({ roleId, accountId }, { lesseeId: lessee.id, officeId: office.id, purpose, start, end })
    if (!result.ok) toast.error(result.message)
    else {
      toast.success(`${result.id} was filed. No application fee was taken.`)
      setPurpose('')
    }
  }

  return (
    <div className="space-y-4">
      <PageHeader eyebrow="SOP-011" title="Transport office lease application" description="Apply for an office that has no open lease. The application is a simulation and does not collect a fee." actions={<Button type="button" variant="outline" asChild><Link to="/parking">Transport desk</Link></Button>} />
      <ParkingNotice />
      {writer && office && lessee ? (
        <Card>
          <CardHeader><CardTitle>Office lease application</CardTitle></CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <SelectField label="Office" value={office.id} onValueChange={setOfficeId}>
              {openOffices.map((row) => <SelectItem key={row.id} value={row.id}>{row.code} · {row.name}</SelectItem>)}
            </SelectField>
            <SelectField label="Transporter desk code" value={lessee.id} onValueChange={setLesseeId}>
              {lessees.map((row) => <SelectItem key={row.id} value={row.id}>{row.label}</SelectItem>)}
            </SelectField>
            <TextField label="Start" value={start} onChange={(event) => setStart(event.target.value)} hint="YYYY-MM-DD" />
            <TextField label="End" value={end} onChange={(event) => setEnd(event.target.value)} hint="Must fall after the start" />
            <div className="md:col-span-2">
              <TextAreaField label="Proposed use" value={purpose} onChange={(event) => setPurpose(event.target.value)} hint="At least 8 characters. This is not a business record." />
            </div>
            <Button type="button" onClick={submit}>File application</Button>
          </CardContent>
        </Card>
      ) : <p className="text-sm text-muted-foreground">{writer ? 'Every sample office already has a lease.' : 'This role can read the desk and cannot file an application.'}</p>}
    </div>
  )
}

export function LeaseListPage() {
  const ready = useParkingStore((state) => state.ready)
  const leases = useParkingStore((state) => state.leases)
  if (!ready) return <LoadingState label="Loading office leases" />
  return (
    <div className="space-y-4">
      <PageHeader eyebrow="SOP-011" title="Office allotment" description="An issued lease allots the office. Mandi officials verify, approve, record a simulated deposit, and allot." actions={<Button type="button" variant="outline" asChild><Link to="/parking">Transport desk</Link></Button>} />
      <ParkingNotice />
      <ArticleList
        rows={leases}
        searchText={(row) => `${row.leaseNo} ${row.officeCode} ${row.lesseeLabel}`}
        statusText={(row) => agreementLabel(row.status)}
        empty="No office lease matches that search."
        render={(row) => (
          <article key={row.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-card px-4 py-3 text-sm ring-1 ring-foreground/10">
            <div>
              <p className="font-medium">{row.leaseNo} · {row.officeCode} · {row.lesseeLabel}</p>
              <p className="mt-1">{agreementLabel(row.status)} · {row.start} to {row.end}</p>
            </div>
            <div className="flex items-center gap-2">
              {row.status === 'issued' ? <Button type="button" size="sm" variant="outline" asChild><Link to={`/parking/offices/${row.id}/print`}>Preview</Link></Button> : null}
              <Button type="button" size="sm" variant="outline" asChild><Link to={`/parking/offices/${row.id}`}>Open</Link></Button>
            </div>
          </article>
        )}
      />
    </div>
  )
}

export function LeaseDetailPage() {
  const { id = '' } = useParams()
  const ready = useParkingStore((state) => state.ready)
  const lease = useParkingStore((state) => state.leases.find((row) => row.id === id))
  const moveOfficeLease = useParkingStore((state) => state.moveOfficeLease)
  const recordOfficeDeposit = useParkingStore((state) => state.recordOfficeDeposit)
  const roleId = useSessionStore((state) => state.roleId)
  const accountId = useSessionStore((state) => state.accountId)
  const [deposit, setDeposit] = useState('5000')
  if (!ready) return <LoadingState label="Loading the lease" />
  if (!lease) return <EmptyState title="Lease not in this browser" description="That demonstration number is not in the parking book." />
  const official = roleId ? canDecideParking(roleId) : false
  const operator = roleId ? canOperateParking(roleId) : false
  const next = NEXT_AGREEMENT[lease.status].filter((status) => {
    if (status === 'submitted') return operator
    if (status === 'deposit-recorded') return false
    return official && officialMoves.includes(status)
  })

  function run(action: () => { ok: boolean; message?: string }) {
    const result = action()
    if (!result.ok) toast.error(result.message ?? 'The parking book refused that step.')
    else toast.success('The simulated lease moved. No deed was signed.')
  }

  return (
    <div className="space-y-4">
      <PageHeader
        eyebrow="SOP-011"
        title={lease.leaseNo}
        description={`${lease.officeCode} · ${lease.lesseeLabel} · ${lease.start} to ${lease.end}. Allotment stays in this browser.`}
        actions={<Button type="button" variant="outline" asChild><Link to="/parking/offices">All offices</Link></Button>}
      />
      <ParkingNotice />
      <div className="flex flex-wrap items-center gap-2">
        <ParkingBadge tone={lease.status === 'issued' ? 'ok' : 'warn'}>{agreementLabel(lease.status)}</ParkingBadge>
        {lease.receiptId ? <span className="text-sm">{lease.receiptId} · {formatPaise(lease.depositPaise)} · DEMO / SIMULATED</span> : null}
        {lease.status === 'issued' ? <Button type="button" size="sm" variant="outline" asChild><Link to={`/parking/offices/${lease.id}/print`}>Lease preview</Link></Button> : null}
      </div>
      <p className="text-sm">{lease.purpose}</p>
      {official && lease.status === 'approved' ? (
        <div className="flex flex-wrap items-end gap-2">
          <TextField label="Simulated deposit" value={deposit} onChange={(event) => setDeposit(event.target.value)} hint="Above zero. At most two decimal places." />
          <Button type="button" onClick={() => {
            if (!roleId || !accountId) return
            const result = recordOfficeDeposit({ roleId, accountId }, lease.id, deposit)
            if (!result.ok) toast.error(result.message)
            else toast.success(`${result.id} was noted. No money moved.`)
          }}>Record deposit</Button>
        </div>
      ) : null}
      <div className="flex flex-wrap gap-2">
        {next.map((status) => (
          <Button key={status} type="button" variant="outline" onClick={() => {
            if (!roleId || !accountId) return
            run(() => moveOfficeLease({ roleId, accountId }, lease.id, status))
          }}>{status === 'issued' ? 'Allot office' : agreementLabel(status)}</Button>
        ))}
      </div>
    </div>
  )
}

export function LeasePrintPage() {
  const { id = '' } = useParams()
  const ready = useParkingStore((state) => state.ready)
  const lease = useParkingStore((state) => state.leases.find((row) => row.id === id))
  if (!ready) return <LoadingState label="Loading the lease preview" />
  if (!lease || lease.status !== 'issued') {
    return <EmptyState title="Office not allotted" description="The preview is available after the simulated lease is issued." />
  }
  const payload = `DEMO|NAGA-MANDI|${lease.leaseNo}|not-a-deed`

  return (
    <div className="space-y-4">
      <div className="no-print flex flex-wrap gap-2">
        <Button type="button" variant="outline" asChild><Link to={`/parking/offices/${lease.id}`}>Back to the lease</Link></Button>
        <Button type="button" onClick={() => window.print()}>Print preview</Button>
      </div>
      <article className="print-sheet mx-auto max-w-3xl space-y-5 rounded-xl border-2 border-primary bg-white p-8 text-slate-900">
        <header className="flex items-start justify-between gap-4 border-b border-primary/30 pb-4">
          <div>
            <p className="text-xs tracking-[0.2em] text-primary uppercase">Naga Mandi OS · SOP-011</p>
            <h1 className="font-display text-3xl text-primary">Transport office lease</h1>
            <p className="text-sm">DEMO / SIMULATED. This is not a lease deed and no deposit was banked.</p>
          </div>
          <p className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-950">DEMO / SIMULATED</p>
        </header>
        <p className="font-display text-2xl">{lease.leaseNo}</p>
        <dl className="grid gap-3 text-sm sm:grid-cols-2">
          <Item label="Office" value={lease.officeCode} />
          <Item label="Lessee" value={lease.lesseeLabel} />
          <Item label="Term" value={`${lease.start} to ${lease.end}`} />
          <Item label="Status" value={agreementLabel(lease.status)} />
          <Item label="Simulated deposit" value={formatPaise(lease.depositPaise)} />
          <Item label="Receipt" value={lease.receiptId || 'None'} />
        </dl>
        <p className="text-sm">{lease.purpose}</p>
        <div className="flex items-end justify-between gap-4">
          <Mark payload={payload} />
          <p className="max-w-xs text-right text-xs text-slate-600">No signature binds a party. No office was handed over.</p>
        </div>
      </article>
    </div>
  )
}

export function ChargePage() {
  const ready = useParkingStore((state) => state.ready)
  const charges = useParkingStore((state) => state.charges)
  const leases = useParkingStore((state) => state.leases)
  const recordRent = useParkingStore((state) => state.recordRent)
  const roleId = useSessionStore((state) => state.roleId)
  const accountId = useSessionStore((state) => state.accountId)
  const issued = leases.filter((row) => row.status === 'issued')
  const [leaseId, setLeaseId] = useState('')
  const [rent, setRent] = useState('')
  if (!ready) return <LoadingState label="Loading the register" />
  const lease = issued.find((row) => row.id === leaseId) ?? issued[0]
  const official = roleId ? canDecideParking(roleId) : false

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
      <PageHeader eyebrow="SOP-009 · SOP-011" title="Deposit and rent register" description="Deposits are noted when a contract or lease is approved. Rent is a later note on an allotted office. Nothing is collected." actions={<Button type="button" variant="outline" asChild><Link to="/parking">Transport desk</Link></Button>} />
      <ParkingNotice />
      {official && lease ? (
        <Card>
          <CardHeader><CardTitle>Note simulated rent</CardTitle></CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <SelectField label="Allotted office" value={lease.id} onValueChange={setLeaseId}>
              {issued.map((row) => <SelectItem key={row.id} value={row.id}>{row.leaseNo} · {row.officeCode}</SelectItem>)}
            </SelectField>
            <TextField label="Rent" value={rent} onChange={(event) => setRent(event.target.value)} hint="Above zero. At most two decimal places." />
            <Button type="button" onClick={submit}>Note rent</Button>
          </CardContent>
        </Card>
      ) : null}
      {charges.map((row) => (
        <p key={row.id} className="text-sm">{row.id} · {chargeLabel(row.kind)} · {row.sourceNo} · {row.placeCode} · {formatPaise(row.paise)} · DEMO / SIMULATED</p>
      ))}
    </div>
  )
}

export function AlertsPage() {
  const ready = useParkingStore((state) => state.ready)
  const contracts = useParkingStore((state) => state.contracts)
  const leases = useParkingStore((state) => state.leases)
  if (!ready) return <LoadingState label="Loading alerts" />
  const rows = [
    ...contracts.filter((row) => row.status === 'issued' && needsAlert(row.end)).map((row) => ({ id: row.id, label: `${row.contractNo} · ${row.yardCode}`, end: row.end })),
    ...leases.filter((row) => row.status === 'issued' && needsAlert(row.end)).map((row) => ({ id: row.id, label: `${row.leaseNo} · ${row.officeCode}`, end: row.end })),
  ]
  return (
    <div className="space-y-4">
      <PageHeader eyebrow="SOP-009 · SOP-011" title="Expiry alerts" description="Issued contracts and leases that end within 30 days of 14 Nov 2026, or are already past. No notice is sent." actions={<Button type="button" variant="outline" asChild><Link to="/parking">Transport desk</Link></Button>} />
      <ParkingNotice />
      <PageSlice rows={rows} empty="No issued term is inside the alert window." render={(row) => (
        <p key={row.id} className="text-sm">{row.label} · ends {row.end} · {daysUntil(row.end)} days from the sample day</p>
      )} />
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
