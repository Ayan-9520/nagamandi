import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { LoadingState } from '@/components/common/LoadingState'
import { PageHeader } from '@/components/common/PageHeader'
import { Button } from '@/components/ui/button'
import { FlpBadge, FlpNotice } from '@/features/flp/FlpBits'
import { Reconciliation } from '@/features/flp/Reconciliation'
import { canNoteReport, canOperateFlp, formatUnits, linesFor } from '@/services/flp-rules'
import { useFlpStore } from '@/store/flp-store'
import { useSessionStore } from '@/store/session-store'

export function ReportPage() {
  const ready = useFlpStore((state) => state.ready)
  const batches = useFlpStore((state) => state.batches)
  const grades = useFlpStore((state) => state.grades)
  const packs = useFlpStore((state) => state.packs)
  const outputs = useFlpStore((state) => state.outputs)
  const reports = useFlpStore((state) => state.reports)
  const fileReport = useFlpStore((state) => state.fileReport)
  const noteReport = useFlpStore((state) => state.noteReport)
  const roleId = useSessionStore((state) => state.roleId)
  const accountId = useSessionStore((state) => state.accountId)
  if (!ready) return <LoadingState label="Loading daily reports" />
  const writer = roleId ? canOperateFlp(roleId) : false
  const official = roleId ? canNoteReport(roleId) : false

  function file() {
    if (!roleId || !accountId) return
    const result = fileReport({ roleId, accountId })
    if (!result.ok) toast.error(result.message)
    else toast.success(`${result.id} was filed. Discrepancies are shown. Nothing was audited.`)
  }

  return (
    <div className="space-y-4">
      <PageHeader eyebrow="SOP-008" title="Daily operational reports" description="The sample day is 14 Nov 2026. Filing copies the current intake, output and discrepancy totals into this browser." actions={<Button type="button" variant="outline" asChild><Link to="/post-harvest">FLP desk</Link></Button>} />
      <FlpNotice />
      <h2 className="font-display text-xl">Live book</h2>
      {batches.map((batch) => {
        const trail = linesFor(grades, packs, outputs, batch.id)
        return (
          <article key={batch.id} className="rounded-xl bg-card px-4 py-3 ring-1 ring-foreground/10">
            <p className="text-sm font-medium">{batch.batchNo} · {batch.lotNo}</p>
            <Reconciliation batch={batch} grades={trail.grades} packs={trail.packs} output={trail.output} />
          </article>
        )
      })}
      {writer ? <Button type="button" onClick={file}>File the daily report</Button> : null}
      <h2 className="font-display text-xl">Filed reports</h2>
      {reports.length === 0 ? <p className="text-sm text-muted-foreground">No daily report is filed yet.</p> : null}
      {reports.map((row) => (
        <article key={row.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-card px-4 py-3 text-sm ring-1 ring-foreground/10">
          <div>
            <p className="font-medium">{row.reportNo} · {row.day}</p>
            <p className="mt-1">{row.batchCount} batches · intake {formatUnits(row.intakeUnits)} q · output {formatUnits(row.outputUnits)} q · discrepancy {formatUnits(row.discrepancyUnits)} q</p>
            <p className="mt-1 text-muted-foreground">{row.note}</p>
          </div>
          <div className="flex items-center gap-2">
            <FlpBadge tone={row.status === 'noted' ? 'ok' : 'warn'}>{row.status === 'noted' ? 'Noted' : 'Filed'}</FlpBadge>
            {official && row.status === 'filed' ? <Button type="button" size="sm" onClick={() => {
              if (!roleId || !accountId) return
              const result = noteReport({ roleId, accountId }, row.id)
              if (!result.ok) toast.error(result.message)
              else toast.success('The report was noted. No audit was signed.')
            }}>Note report</Button> : null}
          </div>
        </article>
      ))}
    </div>
  )
}
