import { Link } from 'react-router-dom'
import { StatCard } from '@/components/common/StatCard'
import { Button } from '@/components/ui/button'
import { discrepancyUnits, formatUnits } from '@/services/flp-rules'
import { useFlpStore } from '@/store/flp-store'
import { Factory, Scale, Sprout } from 'lucide-react'

export function FlpBoard() {
  const ready = useFlpStore((state) => state.ready)
  const units = useFlpStore((state) => state.units)
  const batches = useFlpStore((state) => state.batches)
  const grades = useFlpStore((state) => state.grades)
  const packs = useFlpStore((state) => state.packs)
  const outputs = useFlpStore((state) => state.outputs)
  if (!ready) return null
  const intake = batches.reduce((total, batch) => total + batch.intakeUnits, 0)
  const gaps = batches.filter((batch) => discrepancyUnits(batch, grades.filter((row) => row.batchId === batch.id), packs.filter((row) => row.batchId === batch.id), outputs.find((row) => row.batchId === batch.id)) > 0).length
  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl tracking-tight">FLP book</h2>
          <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
            SOP-008 intake, grading and output in this browser. These rows are separate from the yard-sample arrival chart.
          </p>
        </div>
        <Button type="button" variant="outline" asChild>
          <Link to="/post-harvest">Open post-harvest</Link>
        </Button>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard label="Units" value={String(units.length)} hint="Dimapur sample lines" icon={Factory} />
        <StatCard label="Intake" value={`${formatUnits(intake)} q`} hint="Linked to gate lots" icon={Sprout} />
        <StatCard label="Discrepancies" value={String(gaps)} hint="Batches that do not reconcile" icon={Scale} />
      </div>
    </section>
  )
}
