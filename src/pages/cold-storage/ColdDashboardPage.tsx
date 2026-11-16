import { useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { LoadingState } from '@/components/common/LoadingState'
import { PageHeader } from '@/components/common/PageHeader'
import { StatCard } from '@/components/common/StatCard'
import { Button } from '@/components/ui/button'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import { ColdNotice } from '@/features/cold-storage/ColdBits'
import { alertRows, breachCount, formatUnits, occupancy } from '@/services/cold-rules'
import { useColdStore } from '@/store/cold-store'
import { useSessionStore } from '@/store/session-store'
import { ClipboardCheck, Snowflake, Thermometer } from 'lucide-react'

const links = [
  { to: '/cold-storage/directory', label: 'Facility directory', detail: 'Chamber codes, bands and who holds the simulated contract' },
  { to: '/cold-storage/apply', label: 'Contract application', detail: 'SOP-006 application for an open chamber' },
  { to: '/cold-storage/contracts', label: 'Approval and deposit', detail: 'Official steps through deposit and issue' },
  { to: '/cold-storage/allocation', label: 'Storage allocation', detail: 'Issued contracts, occupancy and movement history' },
  { to: '/cold-storage/inward', label: 'Stock inward', detail: 'Bring a gate lot into an allocated chamber' },
  { to: '/cold-storage/outward', label: 'Stock outward', detail: 'Release stock that is still inside' },
  { to: '/cold-storage/temperature', label: 'Temperature monitoring', detail: 'Latest sample readings against the demo band' },
  { to: '/cold-storage/temperature/entry', label: 'Manual temperature entry', detail: 'Type a reading. No probe is connected' },
  { to: '/cold-storage/temperature/history', label: 'Temperature history chart', detail: 'Sample line with the configured band' },
  { to: '/cold-storage/gas', label: 'Gas safety inspection', detail: 'SOP-007 gas store lines' },
  { to: '/cold-storage/fire', label: 'Fire safety inspection', detail: 'Extinguisher, alarm and exit' },
  { to: '/cold-storage/hygiene', label: 'Hygiene checklist', detail: 'Floor, waste and drains' },
  { to: '/cold-storage/security', label: 'Security checklist', detail: 'Gate, CCTV and access list' },
  { to: '/cold-storage/insurance', label: 'Insurance register', detail: 'Simulated cover. No policy is bought' },
  { to: '/cold-storage/maintenance', label: 'Maintenance register', detail: 'Open and close a chamber note' },
  { to: '/cold-storage/incidents', label: 'Incident reporting', detail: 'A browser note. No service is called' },
  { to: '/cold-storage/alerts', label: 'Compliance alerts', detail: 'Band warnings, expiry and open incidents' },
]

export function ColdDashboardPage() {
  const ready = useColdStore((state) => state.ready)
  const chambers = useColdStore((state) => state.chambers)
  const moves = useColdStore((state) => state.moves)
  const contracts = useColdStore((state) => state.contracts)
  const readings = useColdStore((state) => state.readings)
  const insurance = useColdStore((state) => state.insurance)
  const incidents = useColdStore((state) => state.incidents)
  const resetCold = useColdStore((state) => state.resetCold)
  const roleId = useSessionStore((state) => state.roleId)
  const [restoreOpen, setRestoreOpen] = useState(false)
  if (!ready) return <LoadingState label="Loading the cold storage book" />
  const official = roleId === 'super-admin' || roleId === 'mandi-manager'
  const operator = roleId === 'cold-storage-operator'
  const used = chambers.reduce((total, chamber) => total + occupancy(chamber, moves).used, 0)
  const waiting = contracts.filter((row) => row.status === 'under-verification' || row.status === 'verified' || row.status === 'approved').length
  const alerts = alertRows({ chambers, contracts, insurance, readings, incidents }).length
  const title = official ? 'Mandi official cold storage desk' : operator ? 'Cold storage operator desk' : 'Cold storage inspection desk'
  const description = official
    ? 'Verify applications, approve contracts, record a simulated deposit, and watch the demo temperature band. No deed is signed and no probe is connected.'
    : operator
      ? 'File an application, move stock against gate lots, and record simulated chamber readings.'
      : 'Read the simulated chambers, contracts and readings. This role does not post a movement.'

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="SOP-006 · SOP-007"
        title={title}
        description={description}
        actions={<Button type="button" variant="outline" onClick={() => setRestoreOpen(true)}>Restore cold storage sample</Button>}
      />
      <ColdNotice />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Chambers" value={String(chambers.length)} hint="Dimapur sample" icon={Snowflake} />
        <StatCard label="Stock inside" value={`${formatUnits(used)} q`} hint="Across allocated chambers" icon={ClipboardCheck} />
        <StatCard label="Waiting on officials" value={String(waiting)} hint="Verification, approval or deposit" icon={ClipboardCheck} />
        <StatCard label="Compliance alerts" value={String(alerts)} hint={`${breachCount(chambers, readings)} ${breachCount(chambers, readings) === 1 ? 'chamber' : 'chambers'} outside the band`} icon={Thermometer} />
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {links.map((item) => (
          <Link key={item.to} to={item.to} className="rounded-xl bg-card px-4 py-3 ring-1 ring-foreground/10 hover:bg-accent">
            <span className="block text-sm font-medium">{item.label}</span>
            <span className="mt-1 block text-xs leading-5 text-muted-foreground">{item.detail}</span>
          </Link>
        ))}
      </div>
      <Dialog open={restoreOpen} onOpenChange={setRestoreOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Restore the cold storage sample?</DialogTitle>
            <DialogDescription>This replaces chambers, contracts, stock and readings in this browser. Gate lots and the warehouse book stay as they are.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setRestoreOpen(false)}>Keep current book</Button>
            <Button type="button" onClick={() => { resetCold(); setRestoreOpen(false); toast.success('The cold storage sample was restored in this browser.') }}>Restore sample</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
