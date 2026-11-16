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
import { WarehouseNotice } from '@/features/warehouse/WarehouseBits'
import { formatUnits, needsAlert, occupancy } from '@/services/warehouse-rules'
import { useSessionStore } from '@/store/session-store'
import { useWarehouseStore } from '@/store/warehouse-store'
import { Boxes, CalendarClock, ClipboardCheck, Warehouse } from 'lucide-react'

const links = [
  { to: '/warehouses/directory', label: 'Warehouse directory', detail: 'Shed codes and who holds the simulated contract' },
  { to: '/warehouses/apply', label: 'Contract application', detail: 'SOP-004 application for an open shed' },
  { to: '/warehouses/contracts', label: 'Verification and approval', detail: 'Official steps through deposit and issue' },
  { to: '/warehouses/inward', label: 'Stock inward', detail: 'Bring a gate lot into an allocated shed' },
  { to: '/warehouses/outward', label: 'Stock outward', detail: 'Release stock that is still inside' },
  { to: '/warehouses/inventory', label: 'Inventory register', detail: 'On-hand lots and movement history' },
  { to: '/warehouses/occupancy', label: 'Occupancy dashboard', detail: 'Used capacity against the shed limit' },
  { to: '/warehouses/cleaning', label: 'Cleaning checklist', detail: 'SOP-005 hygiene lines' },
  { to: '/warehouses/fire', label: 'Fire safety checklist', detail: 'Extinguisher, alarm and exit' },
  { to: '/warehouses/security', label: 'Security inspection', detail: 'Gate, CCTV and access list' },
  { to: '/warehouses/insurance', label: 'Insurance record', detail: 'Simulated cover. No policy is bought' },
  { to: '/warehouses/maintenance', label: 'Maintenance log', detail: 'Open and close a shed note' },
  { to: '/warehouses/alerts', label: 'Contract expiry alerts', detail: 'Issued contracts and cover ending within 30 days' },
]

export function WarehouseDashboardPage() {
  const ready = useWarehouseStore((state) => state.ready)
  const sheds = useWarehouseStore((state) => state.sheds)
  const moves = useWarehouseStore((state) => state.moves)
  const contracts = useWarehouseStore((state) => state.contracts)
  const insurance = useWarehouseStore((state) => state.insurance)
  const resetWarehouse = useWarehouseStore((state) => state.resetWarehouse)
  const roleId = useSessionStore((state) => state.roleId)
  const [restoreOpen, setRestoreOpen] = useState(false)
  if (!ready) return <LoadingState label="Loading the warehouse book" />
  const official = roleId === 'super-admin' || roleId === 'mandi-manager'
  const operator = roleId === 'warehouse-operator'
  const used = sheds.reduce((total, shed) => total + occupancy(shed, moves).used, 0)
  const waiting = contracts.filter((row) => row.status === 'under-verification' || row.status === 'verified' || row.status === 'approved').length
  const alerts = contracts.filter((row) => row.status === 'issued' && needsAlert(row.end)).length + insurance.filter((row) => needsAlert(row.until)).length
  const title = official ? 'Mandi official warehouse desk' : operator ? 'Warehouse operator desk' : 'Warehouse inspection desk'
  const description = official
    ? 'Verify applications, approve contracts, record a simulated deposit, and watch occupancy. No deed is signed.'
    : operator
      ? 'File an application, move stock against gate lots, and complete the SOP-005 checklists for allocated sheds.'
      : 'Read the simulated sheds, contracts and stock. This role does not post a movement.'

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="SOP-004 · SOP-005"
        title={title}
        description={description}
        actions={<Button type="button" variant="outline" onClick={() => setRestoreOpen(true)}>Restore warehouse sample</Button>}
      />
      <WarehouseNotice />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Sheds" value={String(sheds.length)} hint="Dimapur sample" icon={Warehouse} />
        <StatCard label="Stock inside" value={`${formatUnits(used)} q`} hint="Across allocated sheds" icon={Boxes} />
        <StatCard label="Waiting on officials" value={String(waiting)} hint="Verification, approval or deposit" icon={ClipboardCheck} />
        <StatCard label="Expiry alerts" value={String(alerts)} hint="Within 30 days of 14 Nov 2026" icon={CalendarClock} />
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
            <DialogTitle>Restore the warehouse sample?</DialogTitle>
            <DialogDescription>This replaces sheds, contracts, stock and checklists in this browser. Gate lots stay as they are.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setRestoreOpen(false)}>Keep current book</Button>
            <Button type="button" onClick={() => { resetWarehouse(); setRestoreOpen(false); toast.success('The warehouse sample was restored in this browser.') }}>Restore sample</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
