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
import { FacilityNotice } from '@/features/facilities/FacilityBits'
import { useFacilityStore } from '@/store/facility-store'
import { useSessionStore } from '@/store/session-store'
import { BedDouble, Building2, UtensilsCrossed } from 'lucide-react'

const links = [
  { to: '/facilities/kisan', label: 'Kisan Bhavan lease', detail: 'SOP-012 halls. Separate from the hotel register' },
  { to: '/facilities/hotel', label: 'Hotel lease', detail: 'SOP-012 rooms and SOP-013 stays' },
  { to: '/facilities/restaurant', label: 'Restaurant lease', detail: 'SOP-014 lease and SOP-015 checks' },
  { to: '/facilities/deposits', label: 'Security deposit records', detail: 'Noted after approval. No money moved' },
  { to: '/facilities/rent', label: 'Rent tracking', detail: 'A note on an issued lease. Not a collection' },
  { to: '/facilities/register', label: 'Room and facility register', detail: 'Halls, rooms and service areas' },
  { to: '/facilities/stays', label: 'Simulated stay records', detail: 'Fictional guest desk codes only' },
  { to: '/facilities/cleaning', label: 'Cleaning checklists', detail: 'Floor, waste and linen' },
  { to: '/facilities/fire', label: 'Fire safety inspections', detail: 'Extinguisher, exit and alarm' },
  { to: '/facilities/hygiene', label: 'Food hygiene inspections', detail: 'Restaurant template only' },
  { to: '/facilities/operations', label: 'Restaurant operational checklists', detail: 'Service list, roster and waste' },
  { to: '/facilities/maintenance', label: 'Maintenance logs', detail: 'Open and close a site note' },
  { to: '/facilities/insurance', label: 'Insurance records', detail: 'Simulated cover. No policy is bought' },
  { to: '/facilities/alerts', label: 'Renewal and expiry alerts', detail: 'Issued terms within 30 days' },
]

export function FacilityDashboardPage() {
  const ready = useFacilityStore((state) => state.ready)
  const sites = useFacilityStore((state) => state.sites)
  const stays = useFacilityStore((state) => state.stays)
  const leases = useFacilityStore((state) => state.leases)
  const resetFacilities = useFacilityStore((state) => state.resetFacilities)
  const roleId = useSessionStore((state) => state.roleId)
  const [restoreOpen, setRestoreOpen] = useState(false)
  if (!ready) return <LoadingState label="Loading the facilities book" />
  const official = roleId === 'super-admin' || roleId === 'mandi-manager'
  const operator = roleId === 'facility-operator'
  const issued = leases.filter((row) => row.status === 'issued').length
  const open = stays.filter((row) => row.status === 'open').length
  const title = official ? 'Mandi official facilities desk' : operator ? 'Facility operator desk' : 'Facilities inspection desk'
  const description = official
    ? 'Read leases, stays and checks. A deposit note is not a collection.'
    : operator
      ? 'File an application, record a fictional stay, and complete the checklist for that facility type.'
      : 'Read the simulated sites. This role does not post a record.'

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="SOP-012 · SOP-013 · SOP-014 · SOP-015"
        title={title}
        description={description}
        actions={<Button type="button" variant="outline" onClick={() => setRestoreOpen(true)}>Restore facilities sample</Button>}
      />
      <FacilityNotice />
      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard label="Sites" value={String(sites.length)} hint="Three facility templates" icon={Building2} />
        <StatCard label="Issued leases" value={String(issued)} hint="Not deeds" icon={UtensilsCrossed} />
        <StatCard label="Open stays" value={String(open)} hint="Fictional guest codes" icon={BedDouble} />
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
            <DialogTitle>Restore the facilities sample?</DialogTitle>
            <DialogDescription>This replaces sites, leases, stays and checklists in this browser. Gate lots, the warehouse book, the cold storage book, the FLP book and the parking book stay as they are.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setRestoreOpen(false)}>Keep current book</Button>
            <Button type="button" onClick={() => { resetFacilities(); setRestoreOpen(false); toast.success('The facilities sample was restored in this browser.') }}>Restore sample</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
