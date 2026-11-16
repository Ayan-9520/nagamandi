import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { PageSlice } from '@/components/common/ArticleList'
import { LoadingState } from '@/components/common/LoadingState'
import { PageHeader } from '@/components/common/PageHeader'
import { StatCard } from '@/components/common/StatCard'
import { Button } from '@/components/ui/button'
import { CommandCharts } from '@/features/compliance/CommandCharts'
import { CommandFilters, CommandNotice, matchesQuery, SopBadge, useCommandQuery } from '@/features/compliance/CommandBits'
import { useCommandBooks } from '@/features/compliance/useCommandBooks'
import { formatRupee } from '@/features/trading/meta'
import { getRole } from '@/mocks/permissions'
import { bookTotals } from '@/services/finance-rules'
import { formatPaise } from '@/services/money'
import { formatUnits as formatCold } from '@/services/cold-rules'
import { formatUnits as formatShed } from '@/services/warehouse-rules'
import { useFinanceStore } from '@/store/finance-store'
import { useSessionStore } from '@/store/session-store'
import { ClipboardCheck, ShieldAlert, TimerReset } from 'lucide-react'

const links = [
  { to: '/compliance/matrix', label: 'SOP compliance tracker', detail: 'Fifteen procedures, checklists and exceptions' },
  { to: '/compliance/licences', label: 'Licence status', detail: 'SOP-001 cases in this browser' },
  { to: '/compliance/trading', label: 'Daily trading summary', detail: 'Sales inside the selected dates' },
  { to: '/compliance/finance', label: 'Financial reconciliation', detail: 'Sample close. No money moved' },
  { to: '/compliance/warehouses', label: 'Warehouse occupancy', detail: 'Current shed book' },
  { to: '/compliance/cold-storage', label: 'Cold storage status', detail: 'Current chamber book' },
  { to: '/compliance/parking', label: 'Parking occupancy', detail: 'Slots occupied, reserved and open' },
  { to: '/compliance/expiry', label: 'Contract and lease expiry', detail: 'Terms within 30 days of the To date' },
  { to: '/compliance/approvals', label: 'Pending approvals', detail: 'Cases that are not yet issued' },
  { to: '/compliance/incidents', label: 'Incident management', detail: 'Simulated notes' },
  { to: '/compliance/calendar', label: 'Inspection calendar', detail: 'Planned and done rows' },
  { to: '/compliance/actions', label: 'Corrective action tracker', detail: 'Follow-up on an incident' },
  { to: '/compliance/audit', label: 'Demo audit trail', detail: 'Not authoritative evidence' },
  { to: '/reports', label: 'Exportable reports', detail: 'CSV prepared in this browser' },
]

function moduleFor(path: string) {
  const key = path.split('/')[1] ?? 'compliance'
  const map: Record<string, string> = {
    compliance: 'compliance',
    reports: 'reports',
    licences: 'licences',
    trading: 'trading',
    finance: 'finance',
    warehouses: 'warehouses',
    'cold-storage': 'cold-storage',
    'post-harvest': 'post-harvest',
    parking: 'parking',
    facilities: 'facilities',
  }
  return map[key] ?? 'compliance'
}

export function useDeskTitle() {
  const roleId = useSessionStore((state) => state.roleId)
  if (roleId === 'super-admin' || roleId === 'mandi-manager') return 'Mandi management desk'
  if (roleId === 'inspector') return 'Compliance inspection desk'
  return 'Compliance reading desk'
}

function Frame({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  const heading = useDeskTitle()
  return (
    <div className="space-y-4">
      <PageHeader eyebrow={heading} title={title} description={description} actions={<Button type="button" variant="outline" asChild><Link to="/compliance">Command centre</Link></Button>} />
      <CommandNotice />
      <CommandFilters />
      {children}
    </div>
  )
}

export function CommandDashboardPage() {
  const { from, to, q } = useCommandQuery()
  const { ready, snapshot } = useCommandBooks(from, to)
  const roleId = useSessionStore((state) => state.roleId)
  const heading = useDeskTitle()
  const allowed = new Set(roleId ? getRole(roleId).modules : [])
  if (!ready) return <LoadingState label="Loading the command centre" />
  const visible = links.filter((item) => allowed.has(moduleFor(item.to)))
  const matrix = snapshot.matrix.filter((row) => matchesQuery(q, [row.number, row.name, row.department, row.status]))
  const onTrack = snapshot.matrix.filter((row) => row.status === 'on-track').length
  const attention = snapshot.matrix.filter((row) => row.status === 'attention').length
  const exception = snapshot.matrix.filter((row) => row.status === 'exception').length
  return (
    <div className="space-y-4">
      <PageHeader eyebrow={heading} title="Mandi management" description="Operational figures from the books in this browser. They stay separate from the yard-sample charts." />
      <CommandNotice />
      <CommandFilters />
      {!snapshot.rangeOk ? <p className="text-sm">The From date must fall on or before the To date.</p> : null}
      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard label="SOP matrix" value={`${onTrack} / ${attention} / ${exception}`} hint="On track, attention, exception" icon={ClipboardCheck} />
        <StatCard label="Open incidents" value={String(snapshot.openIncidents)} hint={`${snapshot.openActions} corrective actions open`} icon={ShieldAlert} />
        <StatCard label="Pending approvals" value={String(snapshot.approvals.length)} hint={`${snapshot.expiries.length} terms inside 30 days`} icon={TimerReset} />
      </div>
      <CommandCharts snapshot={snapshot} />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {visible.map((item) => (
          <Link key={item.to} to={item.to} className="rounded-xl bg-card px-4 py-3 ring-1 ring-foreground/10 hover:bg-accent">
            <span className="block text-sm font-medium">{item.label}</span>
            <span className="mt-1 block text-xs leading-5 text-muted-foreground">{item.detail}</span>
          </Link>
        ))}
      </div>
      <PageSlice rows={matrix} empty="No procedure is in this view." render={(row) => (
        <p key={row.number} className="flex flex-wrap items-center gap-2 text-sm">
          <Link to={`/compliance/matrix/${row.number}`} className="font-medium underline-offset-2 hover:underline">{row.number}</Link>
          <span>{row.name}</span>
          <SopBadge status={row.status} />
        </p>
      )} />
    </div>
  )
}

export function MatrixPage() {
  const { from, to, q } = useCommandQuery()
  const { ready, snapshot } = useCommandBooks(from, to)
  if (!ready) return <LoadingState label="Loading the matrix" />
  const rows = snapshot.matrix.filter((row) => matchesQuery(q, [row.number, row.name, row.department, ...row.pending]))
  return (
    <Frame title="SOP compliance tracker" description="Each of the 15 procedures shows its desk, screens, pending tasks, checklist, exceptions, last review and demo status.">
      <PageSlice rows={rows} empty="No procedure matches that search." render={(row) => (
        <article key={row.number} className="rounded-xl bg-card px-4 py-3 text-sm ring-1 ring-foreground/10">
          <p className="flex flex-wrap items-center gap-2 font-medium">
            <Link to={`/compliance/matrix/${row.number}`} className="underline-offset-2 hover:underline">{row.number}</Link>
            {row.name}
            <SopBadge status={row.status} />
          </p>
          <p className="mt-1 text-muted-foreground">{row.department} · Last review {row.lastReview} · {row.pending.length} pending · {row.exceptions.length} exceptions</p>
        </article>
      )} />
    </Frame>
  )
}

export function SopDetailPage({ number }: { number: string }) {
  const { from, to } = useCommandQuery()
  const { ready, snapshot } = useCommandBooks(from, to)
  const roleId = useSessionStore((state) => state.roleId)
  const allowed = new Set(roleId ? getRole(roleId).modules : [])
  if (!ready) return <LoadingState label="Loading the procedure" />
  const row = snapshot.matrix.find((item) => item.number === number)
  if (!row) return <Frame title="Procedure" description="That SOP number is not in the 15-procedure matrix.">{null}</Frame>
  return (
    <Frame title={`${row.number} · ${row.name}`} description={`${row.department}. Status follows the books in this browser for the selected dates.`}>
      <SopBadge status={row.status} />
      <p className="text-sm">Last review {row.lastReview}</p>
      <section className="space-y-1">
        <h2 className="text-sm font-medium">Relevant screens</h2>
        {row.screens.map((screen) => (
          allowed.has(moduleFor(screen.to))
            ? <Button key={screen.to} type="button" variant="outline" size="sm" asChild><Link to={screen.to}>{screen.label}</Link></Button>
            : <p key={screen.to} className="text-sm">{screen.label}</p>
        ))}
      </section>
      <section className="space-y-1">
        <h2 className="text-sm font-medium">Pending tasks</h2>
        {row.pending.length === 0 ? <p className="text-sm">No pending task in this view.</p> : row.pending.map((item) => <p key={item} className="text-sm">{item}</p>)}
      </section>
      <section className="space-y-1">
        <h2 className="text-sm font-medium">Compliance checklist</h2>
        {row.checklist.map((item) => <p key={item.label} className="text-sm">{item.label}: {item.result}</p>)}
      </section>
      <section className="space-y-1">
        <h2 className="text-sm font-medium">Exceptions</h2>
        {row.exceptions.length === 0 ? <p className="text-sm">No exception in this view.</p> : row.exceptions.map((item) => <p key={item} className="text-sm">{item}</p>)}
      </section>
    </Frame>
  )
}

export function LicenceStatusPage() {
  const { from, to, q } = useCommandQuery()
  const { ready, licences } = useCommandBooks(from, to)
  if (!ready) return <LoadingState label="Loading licence status" />
  const counts = new Map<string, number>()
  for (const row of licences) counts.set(row.status, (counts.get(row.status) ?? 0) + 1)
  const rows = licences.filter((row) => matchesQuery(q, [row.id, row.applicantLabel, row.status]))
  return (
    <Frame title="Licence status" description="SOP-001 cases stored in this browser. This list is separate from the yard-sample licence chart.">
      <div className="flex flex-wrap gap-3 text-sm">
        {[...counts.entries()].map(([status, count]) => <span key={status}>{status}: {count}</span>)}
      </div>
      <PageSlice rows={rows} empty="No licence matches that search." render={(row) => <p key={row.id} className="text-sm">{row.id} · {row.applicantLabel} · {row.status}</p>} />
    </Frame>
  )
}

export function TradingSummaryPage() {
  const { from, to, q } = useCommandQuery()
  const { ready, snapshot } = useCommandBooks(from, to)
  if (!ready) return <LoadingState label="Loading the trading summary" />
  const rows = snapshot.tradesInRange.filter((row) => matchesQuery(q, [row.tradeNo, row.commodityName, row.status]))
  const documented = rows.filter((row) => row.status === 'documented')
  const value = documented.reduce((total, row) => total + row.figures.saleValue, 0)
  return (
    <Frame title="Daily trading summary" description="Sales whose record date falls inside the selected window. Figures stay in the trading book.">
      <p className="text-sm">{rows.length} sales in the window · {documented.length} documented · {formatRupee(value)} documented sale value</p>
      <PageSlice rows={rows} empty="No sale falls inside these dates." render={(row) => <p key={row.id} className="text-sm">{row.tradeNo} · {row.commodityName} · {row.status} · {formatRupee(row.figures.saleValue)}</p>} />
    </Frame>
  )
}

export function FinanceStatusPage() {
  const { from, to } = useCommandQuery()
  const { ready, licences, trades, reconciliation, closing } = useCommandBooks(from, to)
  const finance = useFinanceStore()
  if (!ready) return <LoadingState label="Loading reconciliation" />
  const totals = bookTotals(licences, trades, finance)
  const inWindow = from <= reconciliation.day && reconciliation.day <= to
  return (
    <Frame title="Financial reconciliation status" description="The sample-day close stays in the finance book. Nothing here collects a payment.">
      <p className="text-sm">Reconciliation {reconciliation.status} · day close {closing.status} · sample day {reconciliation.day}</p>
      <p className="text-sm">Licence fees noted {formatPaise(totals.licenceFeePaise)}. Buyer outstanding {formatPaise(totals.buyerOutstandingPaise)}. {inWindow ? 'The sample day sits inside the selected dates.' : 'The sample day sits outside the selected dates.'}</p>
    </Frame>
  )
}

export function WarehouseStatusPage() {
  const { from, to } = useCommandQuery()
  const { ready, snapshot } = useCommandBooks(from, to)
  if (!ready) return <LoadingState label="Loading warehouse occupancy" />
  return (
    <Frame title="Warehouse occupancy" description="Current stock in the warehouse book. The date window does not rewrite stock.">
      <p className="text-sm">{formatShed(snapshot.warehouseUsed)} q inside · {snapshot.warehousePercent}% of sample capacity</p>
    </Frame>
  )
}

export function ColdStatusPage() {
  const { from, to } = useCommandQuery()
  const { ready, snapshot } = useCommandBooks(from, to)
  if (!ready) return <LoadingState label="Loading cold storage status" />
  return (
    <Frame title="Cold storage status" description="Current stock and sample readings. No probe is connected.">
      <p className="text-sm">{formatCold(snapshot.coldUsed)} q inside · {snapshot.coldPercent}% of sample capacity · {snapshot.coldBreaches} band {snapshot.coldBreaches === 1 ? 'exception' : 'exceptions'}</p>
    </Frame>
  )
}

export function ParkingStatusPage() {
  const { from, to } = useCommandQuery()
  const { ready, snapshot } = useCommandBooks(from, to)
  if (!ready) return <LoadingState label="Loading parking occupancy" />
  return (
    <Frame title="Parking occupancy" description="Current slots in the parking book. A visit is not a gate pass.">
      <p className="text-sm">{snapshot.parking.occupied} occupied · {snapshot.parking.reserved} reserved · {snapshot.parking.available} available · {snapshot.parkingPercent}% occupied</p>
    </Frame>
  )
}

export function ExpiryPage() {
  const { from, to, q } = useCommandQuery()
  const { ready, snapshot } = useCommandBooks(from, to)
  if (!ready) return <LoadingState label="Loading expiry" />
  const rows = snapshot.expiries.filter((row) => matchesQuery(q, [row.sop, row.label, row.end]))
  return (
    <Frame title="Contract and lease expiry" description="Issued terms and open actions ending within 30 days of the To date. No notice is sent.">
      <PageSlice rows={rows} empty="No term is inside that window." render={(row) => <p key={row.id} className="text-sm">{row.sop} · {row.label} · ends {row.end} · {row.days} days</p>} />
    </Frame>
  )
}

export function ApprovalsPage() {
  const { from, to, q } = useCommandQuery()
  const { ready, snapshot } = useCommandBooks(from, to)
  const roleId = useSessionStore((state) => state.roleId)
  const allowed = new Set(roleId ? getRole(roleId).modules : [])
  if (!ready) return <LoadingState label="Loading approvals" />
  const rows = snapshot.approvals.filter((row) => matchesQuery(q, [row.sop, row.label, row.status]))
  return (
    <Frame title="Pending approvals" description="Records that are not issued and not rejected. Opening one uses the desk that owns it.">
      <PageSlice rows={rows} empty="Nothing is waiting in the books." render={(row) => (
        <p key={row.id} className="flex flex-wrap items-center gap-2 text-sm">
          <span>{row.sop} · {row.label} · {row.status}</span>
          {allowed.has(moduleFor(row.to)) ? <Button type="button" size="sm" variant="outline" asChild><Link to={row.to}>Open</Link></Button> : null}
        </p>
      )} />
    </Frame>
  )
}
