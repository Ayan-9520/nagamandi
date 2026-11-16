import { useState } from 'react'
import { toast } from 'sonner'
import { LoadingState } from '@/components/common/LoadingState'
import { PageHeader } from '@/components/common/PageHeader'
import { Button } from '@/components/ui/button'
import { CommandFilters, CommandNotice, useCommandQuery } from '@/features/compliance/CommandBits'
import { useCommandBooks } from '@/features/compliance/useCommandBooks'
import { AUDIT_LABEL } from '@/services/compliance-rules'
import { reportCsv } from '@/services/command-snapshot'

function download(name: string, csv: string) {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = name
  link.click()
  URL.revokeObjectURL(url)
}

export function ReportsPage() {
  const { from, to } = useCommandQuery()
  const { ready, snapshot } = useCommandBooks(from, to)
  const [preview, setPreview] = useState('')
  if (!ready) return <LoadingState label="Loading reports" />

  const packs = [
    {
      id: 'matrix',
      label: 'SOP matrix',
      file: 'demo-sop-matrix.csv',
      csv: reportCsv('SOP matrix', ['SOP', 'Name', 'Department', 'Status', 'Pending', 'Exceptions', 'Last review'], snapshot.matrix.map((row) => [row.number, row.name, row.department, row.status, String(row.pending.length), String(row.exceptions.length), row.lastReview])),
    },
    {
      id: 'approvals',
      label: 'Pending approvals',
      file: 'demo-approvals.csv',
      csv: reportCsv('Pending approvals', ['SOP', 'Record', 'Status'], snapshot.approvals.map((row) => [row.sop, row.label, row.status])),
    },
    {
      id: 'expiry',
      label: 'Expiry',
      file: 'demo-expiry.csv',
      csv: reportCsv('Contract and lease expiry', ['SOP', 'Record', 'End', 'Days'], snapshot.expiries.map((row) => [row.sop, row.label, row.end, String(row.days)])),
    },
    {
      id: 'incidents',
      label: 'Incidents',
      file: 'demo-incidents.csv',
      csv: reportCsv('Incidents', ['Id', 'SOP', 'Title', 'Status'], snapshot.incidentsInRange.map((row) => [row.id, row.sop, row.title, row.status])),
    },
    {
      id: 'audit',
      label: 'Audit trail',
      file: 'demo-audit.csv',
      csv: reportCsv('Demo audit trail', ['Id', 'SOP', 'Title', 'Detail', 'Label'], snapshot.auditInRange.map((row) => [row.id, row.sop, row.title, row.detail, row.label])),
    },
  ]

  function prepare(pack: (typeof packs)[number]) {
    setPreview(pack.csv)
    download(pack.file, pack.csv)
    toast.success(`${pack.label} was prepared in this browser. ${AUDIT_LABEL}`)
  }

  return (
    <div className="space-y-4">
      <PageHeader eyebrow="Cross-procedure reporting" title="Exportable reports" description="Each file is a demo CSV. It is not authoritative evidence and it is not sent to an office." />
      <CommandNotice />
      <CommandFilters />
      {!snapshot.rangeOk ? <p className="text-sm">The From date must fall on or before the To date.</p> : null}
      <div className="flex flex-wrap gap-2">
        {packs.map((pack) => <Button key={pack.id} type="button" variant="outline" onClick={() => prepare(pack)}>{pack.label}</Button>)}
      </div>
      {preview ? <pre className="overflow-x-auto rounded-xl bg-card p-4 text-xs ring-1 ring-foreground/10">{preview}</pre> : null}
    </div>
  )
}
