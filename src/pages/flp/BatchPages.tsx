import { Link, useParams } from 'react-router-dom'
import { ArticleList } from '@/components/common/ArticleList'
import { EmptyState } from '@/components/common/EmptyState'
import { LoadingState } from '@/components/common/LoadingState'
import { PageHeader } from '@/components/common/PageHeader'
import { Button } from '@/components/ui/button'
import { FlpBadge, FlpNotice } from '@/features/flp/FlpBits'
import { Reconciliation } from '@/features/flp/Reconciliation'
import { discrepancyUnits, formatUnits, linesFor } from '@/services/flp-rules'
import { useFlpStore } from '@/store/flp-store'

export function BatchListPage() {
  const ready = useFlpStore((state) => state.ready)
  const batches = useFlpStore((state) => state.batches)
  const grades = useFlpStore((state) => state.grades)
  const packs = useFlpStore((state) => state.packs)
  const outputs = useFlpStore((state) => state.outputs)
  if (!ready) return <LoadingState label="Loading the batch register" />
  return (
    <div className="space-y-4">
      <PageHeader eyebrow="SOP-008" title="Processing batch register" description="Each batch keeps the gate lot, the grades, the packs and the output. A gap between those quantities is shown as a discrepancy." actions={<Button type="button" variant="outline" asChild><Link to="/post-harvest">FLP desk</Link></Button>} />
      <FlpNotice />
      <ArticleList
        rows={batches}
        searchText={(batch) => `${batch.batchNo} ${batch.lotNo} ${batch.unitCode} ${batch.commodityName} ${batch.sellerLabel}`}
        statusText={(batch) => discrepancyUnits(batch, grades.filter((row) => row.batchId === batch.id), packs.filter((row) => row.batchId === batch.id), outputs.find((row) => row.batchId === batch.id)) > 0 ? 'Discrepancy' : 'Reconciled'}
        empty="No batch matches that search."
        render={(batch) => {
          const gap = discrepancyUnits(batch, grades.filter((row) => row.batchId === batch.id), packs.filter((row) => row.batchId === batch.id), outputs.find((row) => row.batchId === batch.id))
          return (
            <article key={batch.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-card px-4 py-3 text-sm ring-1 ring-foreground/10">
              <div>
                <p className="font-medium">{batch.batchNo} · {batch.lotNo} · {batch.unitCode}</p>
                <p className="mt-1">{batch.commodityName} · intake {formatUnits(batch.intakeUnits)} q · {batch.sellerLabel}</p>
              </div>
              <div className="flex items-center gap-2">
                <FlpBadge tone={gap > 0 ? 'warn' : 'ok'}>{gap > 0 ? 'Discrepancy' : 'Reconciled'}</FlpBadge>
                <Button type="button" size="sm" variant="outline" asChild><Link to={`/post-harvest/batches/${batch.id}`}>Open</Link></Button>
              </div>
            </article>
          )
        }}
      />
    </div>
  )
}

export function BatchDetailPage() {
  const { id = '' } = useParams()
  const ready = useFlpStore((state) => state.ready)
  const batch = useFlpStore((state) => state.batches.find((row) => row.id === id))
  const grades = useFlpStore((state) => state.grades)
  const packs = useFlpStore((state) => state.packs)
  const outputs = useFlpStore((state) => state.outputs)
  const moves = useFlpStore((state) => state.moves)
  if (!ready) return <LoadingState label="Loading the batch trail" />
  if (!batch) return <EmptyState title="Batch not in this browser" description="That demonstration number is not in the FLP book." />
  const trail = linesFor(grades, packs, outputs, batch.id)
  const linked = moves.filter((row) => row.batchId === batch.id)
  return (
    <div className="space-y-4">
      <PageHeader
        eyebrow="SOP-008"
        title={batch.batchNo}
        description={`${batch.lotNo} · ${batch.commodityName} ${batch.gradeName} · ${batch.sellerLabel} · ${batch.unitCode}. This trail is a simulation.`}
        actions={<Button type="button" variant="outline" asChild><Link to="/post-harvest/batches">All batches</Link></Button>}
      />
      <FlpNotice />
      <Reconciliation batch={batch} grades={trail.grades} packs={trail.packs} output={trail.output} />
      <h2 className="font-display text-xl">Input lot</h2>
      <p className="text-sm">{batch.lotNo} · intake {formatUnits(batch.intakeUnits)} q · {batch.note}</p>
      <h2 className="font-display text-xl">Sorting and grading</h2>
      {trail.grades.length === 0 ? <p className="text-sm text-muted-foreground">No grade is recorded.</p> : null}
      {trail.grades.map((row) => (
        <p key={row.id} className="text-sm">{row.id} · {row.kind === 'waste' ? 'Waste' : `Grade ${row.label}`} · {formatUnits(row.quantityUnits)} q</p>
      ))}
      <h2 className="font-display text-xl">Packaging</h2>
      {trail.packs.length === 0 ? <p className="text-sm text-muted-foreground">No pack is recorded.</p> : null}
      {trail.packs.map((row) => (
        <p key={row.id} className="text-sm">{row.id} · {row.gradeLabel} · {row.packCount} packs · {formatUnits(row.quantityUnits)} q</p>
      ))}
      <h2 className="font-display text-xl">Output</h2>
      <p className="text-sm">{trail.output ? `${trail.output.outputNo} · ${formatUnits(trail.output.quantityUnits)} q · ${trail.output.note}` : 'No output is recorded.'}</p>
      <h2 className="font-display text-xl">Linked movements</h2>
      {linked.map((row) => (
        <p key={row.id} className="text-sm">{row.moveNo} · {row.kind} · {row.item} · {formatUnits(row.quantityUnits)} q</p>
      ))}
    </div>
  )
}
