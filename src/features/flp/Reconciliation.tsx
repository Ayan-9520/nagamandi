import { formatUnits, reconcile } from '@/services/flp-rules'
import type { GradeLine, OutputRecord, PackLine, ProcessingBatch } from '@/types/flp'

export function Reconciliation({
  batch,
  grades,
  packs,
  output,
}: {
  batch: ProcessingBatch
  grades: GradeLine[]
  packs: PackLine[]
  output: OutputRecord | undefined
}) {
  const row = reconcile(batch, grades, packs, output)
  const gaps = [
    row.ungraded > 0 ? `${formatUnits(row.ungraded)} q not graded or recorded as waste` : '',
    row.unpacked > 0 ? `${formatUnits(row.unpacked)} q graded and not packed` : '',
    row.unissued > 0 ? `${formatUnits(row.unissued)} q packed and not issued` : '',
  ].filter(Boolean)
  return (
    <div className="space-y-1 text-sm">
      <p>Intake {formatUnits(row.intake)} q · Graded {formatUnits(row.good)} q · Waste {formatUnits(row.waste)} q · Packed {formatUnits(row.packed)} q · Output {formatUnits(row.issued)} q</p>
      <p className={gaps.length ? 'text-gold-foreground' : 'text-muted-foreground'}>
        {gaps.length ? `Discrepancy: ${gaps.join('; ')}.` : 'No discrepancy. The intake, grades, packs and output agree.'}
      </p>
    </div>
  )
}
