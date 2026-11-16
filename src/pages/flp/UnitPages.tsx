import { Link } from 'react-router-dom'
import { LoadingState } from '@/components/common/LoadingState'
import { PageHeader } from '@/components/common/PageHeader'
import { Button } from '@/components/ui/button'
import { FlpNotice } from '@/features/flp/FlpBits'
import { formatUnits } from '@/services/flp-rules'
import { useFlpStore } from '@/store/flp-store'

export function DirectoryPage() {
  const ready = useFlpStore((state) => state.ready)
  const units = useFlpStore((state) => state.units)
  const batches = useFlpStore((state) => state.batches)
  if (!ready) return <LoadingState label="Loading the unit directory" />
  return (
    <div className="space-y-4">
      <PageHeader eyebrow="SOP-008" title="Unit directory" description="Sample post-harvest lines at Dimapur Central. A batch names the unit that took the lot in." actions={<Button type="button" variant="outline" asChild><Link to="/post-harvest">FLP desk</Link></Button>} />
      <FlpNotice />
      {units.map((unit) => {
        const count = batches.filter((batch) => batch.unitId === unit.id).length
        return (
          <article key={unit.id} className="rounded-xl bg-card px-4 py-3 text-sm ring-1 ring-foreground/10">
            <p className="font-medium">{unit.code} · {unit.name}</p>
            <p className="mt-1 text-muted-foreground">Capacity {formatUnits(unit.capacityUnits)} q · {count} simulated {count === 1 ? 'batch' : 'batches'}</p>
          </article>
        )
      })}
    </div>
  )
}
