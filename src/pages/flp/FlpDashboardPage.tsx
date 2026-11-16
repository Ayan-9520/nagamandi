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
import { FlpNotice } from '@/features/flp/FlpBits'
import { discrepancyUnits, formatUnits } from '@/services/flp-rules'
import { useFlpStore } from '@/store/flp-store'
import { useSessionStore } from '@/store/session-store'
import { Factory, Scale, Sprout } from 'lucide-react'

const links = [
  { to: '/post-harvest/directory', label: 'Unit directory', detail: 'Sample FLP lines at Dimapur Central' },
  { to: '/post-harvest/intake', label: 'Produce intake', detail: 'Open a batch from a gate lot' },
  { to: '/post-harvest/batches', label: 'Processing batch register', detail: 'Lot, grades, packs and output on one trail' },
  { to: '/post-harvest/sorting', label: 'Sorting and grading', detail: 'Grade and waste cannot pass the intake' },
  { to: '/post-harvest/packaging', label: 'Packaging records', detail: 'Packs cannot pass the graded quantity' },
  { to: '/post-harvest/output', label: 'Batch output', detail: 'Output cannot pass the packed quantity' },
  { to: '/post-harvest/movement', label: 'Material movement', detail: 'Crates and cartons. Reconciliation stays on the batch' },
  { to: '/post-harvest/cleaning', label: 'Cleaning and hygiene', detail: 'SOP-008 floor, waste and equipment' },
  { to: '/post-harvest/maintenance', label: 'Equipment maintenance', detail: 'Open and close a unit note' },
  { to: '/post-harvest/safety', label: 'Fire and workplace safety', detail: 'Extinguisher, exit and work area' },
  { to: '/post-harvest/insurance', label: 'Insurance record', detail: 'Simulated cover. No policy is bought' },
  { to: '/post-harvest/incidents', label: 'Incident register', detail: 'A browser note. No service is called' },
  { to: '/post-harvest/reports', label: 'Daily operational reports', detail: 'Sample-day totals and discrepancies' },
]

export function FlpDashboardPage() {
  const ready = useFlpStore((state) => state.ready)
  const units = useFlpStore((state) => state.units)
  const batches = useFlpStore((state) => state.batches)
  const grades = useFlpStore((state) => state.grades)
  const packs = useFlpStore((state) => state.packs)
  const outputs = useFlpStore((state) => state.outputs)
  const resetFlp = useFlpStore((state) => state.resetFlp)
  const roleId = useSessionStore((state) => state.roleId)
  const [restoreOpen, setRestoreOpen] = useState(false)
  if (!ready) return <LoadingState label="Loading the FLP book" />
  const official = roleId === 'super-admin' || roleId === 'mandi-manager'
  const operator = roleId === 'flp-operator'
  const intake = batches.reduce((total, batch) => total + batch.intakeUnits, 0)
  const gaps = batches.filter((batch) => discrepancyUnits(batch, grades.filter((row) => row.batchId === batch.id), packs.filter((row) => row.batchId === batch.id), outputs.find((row) => row.batchId === batch.id)) > 0).length
  const title = official ? 'Mandi official FLP desk' : operator ? 'FLP operator desk' : 'FLP inspection desk'
  const description = official
    ? 'Read intake, grading and the daily report. A discrepancy stays visible. No process is certified.'
    : operator
      ? 'Take in a gate lot, grade it, pack it, and file the simulated daily report.'
      : 'Read the simulated units and batches. This role does not post a record.'

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="SOP-008"
        title={title}
        description={description}
        actions={<Button type="button" variant="outline" onClick={() => setRestoreOpen(true)}>Restore FLP sample</Button>}
      />
      <FlpNotice />
      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard label="Units" value={String(units.length)} hint="Dimapur sample" icon={Factory} />
        <StatCard label="Intake" value={`${formatUnits(intake)} q`} hint="Across batches" icon={Sprout} />
        <StatCard label="Discrepancies" value={String(gaps)} hint="Batches that do not reconcile" icon={Scale} />
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
            <DialogTitle>Restore the FLP sample?</DialogTitle>
            <DialogDescription>This replaces units, batches and checklists in this browser. Gate lots, the warehouse book and the cold storage book stay as they are.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setRestoreOpen(false)}>Keep current book</Button>
            <Button type="button" onClick={() => { resetFlp(); setRestoreOpen(false); toast.success('The FLP sample was restored in this browser.') }}>Restore sample</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
