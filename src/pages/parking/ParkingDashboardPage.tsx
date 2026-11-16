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
import { ParkingNotice } from '@/features/parking/ParkingBits'
import { slotCounts } from '@/services/parking-rules'
import { useParkingStore } from '@/store/parking-store'
import { useSessionStore } from '@/store/session-store'
import { CarFront, CircleParking, Building2 } from 'lucide-react'

const links = [
  { to: '/parking/apply', label: 'Parking contract application', detail: 'SOP-009 application. No fee is taken' },
  { to: '/parking/contracts', label: 'Parking contract approval', detail: 'Verify, approve, deposit and issue' },
  { to: '/parking/vehicles', label: 'Vehicle registration', detail: 'Desk plate linked to a transporter' },
  { to: '/parking/entry', label: 'Vehicle entry', detail: 'Opens a visit and a demonstration pass' },
  { to: '/parking/exit', label: 'Vehicle exit', detail: 'Closes the visit and notes a simulated fee' },
  { to: '/parking/allocation', label: 'Parking allocation', detail: 'Reserve an available slot' },
  { to: '/parking/occupancy', label: 'Parking occupancy', detail: 'Available, occupied and reserved' },
  { to: '/parking/fees', label: 'Parking fee simulation', detail: '₹20 an hour. Nothing is collected' },
  { to: '/parking/movements', label: 'Vehicle movement register', detail: 'Entry and exit notes for each visit' },
  { to: '/parking/offices/apply', label: 'Transport office lease application', detail: 'SOP-011 application' },
  { to: '/parking/offices', label: 'Office allotment', detail: 'Verify, approve and allot' },
  { to: '/parking/charges', label: 'Deposit and rent register', detail: 'Simulated notes. No money moved' },
  { to: '/parking/alerts', label: 'Expiry alerts', detail: 'Issued terms ending within 30 days' },
]

export function ParkingDashboardPage() {
  const ready = useParkingStore((state) => state.ready)
  const slots = useParkingStore((state) => state.slots)
  const visits = useParkingStore((state) => state.visits)
  const leases = useParkingStore((state) => state.leases)
  const resetParking = useParkingStore((state) => state.resetParking)
  const roleId = useSessionStore((state) => state.roleId)
  const [restoreOpen, setRestoreOpen] = useState(false)
  if (!ready) return <LoadingState label="Loading the parking book" />
  const official = roleId === 'super-admin' || roleId === 'mandi-manager'
  const operator = roleId === 'parking-operator'
  const counts = slotCounts(slots, visits)
  const allotted = leases.filter((row) => row.status === 'issued').length
  const title = official ? 'Mandi official transport desk' : operator ? 'Parking operator desk' : 'Parking inspection desk'
  const description = official
    ? 'Read contracts, the slot grid and office leases. A fee note is not a collection.'
    : operator
      ? 'Register a vehicle, reserve a free slot, and write the simulated entry and exit.'
      : 'Read the simulated yard and office book. This role does not post a record.'

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="SOP-009 · SOP-010 · SOP-011"
        title={title}
        description={description}
        actions={<Button type="button" variant="outline" onClick={() => setRestoreOpen(true)}>Restore parking sample</Button>}
      />
      <ParkingNotice />
      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard label="Occupied" value={String(counts.occupied)} hint={`${counts.available} available`} icon={CarFront} />
        <StatCard label="Reserved" value={String(counts.reserved)} hint="Not yet entered" icon={CircleParking} />
        <StatCard label="Offices allotted" value={String(allotted)} hint="Issued leases" icon={Building2} />
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
            <DialogTitle>Restore the parking sample?</DialogTitle>
            <DialogDescription>This replaces yards, visits, contracts and office leases in this browser. Gate lots, the warehouse book, the cold storage book and the FLP book stay as they are.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setRestoreOpen(false)}>Keep current book</Button>
            <Button type="button" onClick={() => { resetParking(); setRestoreOpen(false); toast.success('The parking sample was restored in this browser.') }}>Restore sample</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
