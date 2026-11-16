import { useEffect, useState, type ReactNode } from 'react'
import { toDataURL } from 'qrcode'
import { Link, useNavigate } from 'react-router-dom'
import { EmptyState } from '@/components/common/EmptyState'
import { Button } from '@/components/ui/button'
import type { LicenceDesk } from '@/features/licences/meta'
import { categoryLabel, requestKindLabel, slotLabel, statusLabel } from '@/features/licences/meta'
import type { LicenceCase, LicenceDocument, LicenceStatus } from '@/types/licence'
import { cn } from '@/utils/cn'

const tone: Record<LicenceStatus, string> = {
  submitted: 'bg-muted text-foreground',
  'under-verification': 'bg-sky-100 text-sky-950 dark:bg-sky-950 dark:text-sky-100',
  'clarification-required': 'bg-gold/25 text-gold-foreground',
  'pending-approval': 'bg-amber-100 text-amber-950 dark:bg-amber-950 dark:text-amber-100',
  rejected: 'bg-destructive/15 text-destructive',
  approved: 'bg-emerald-100 text-emerald-950 dark:bg-emerald-950 dark:text-emerald-100',
  'fee-recorded': 'bg-emerald-100 text-emerald-950 dark:bg-emerald-950 dark:text-emerald-100',
  issued: 'bg-primary/15 text-primary',
}

export function LicenceStatusBadge({ status }: { status: LicenceStatus }) {
  return <span className={cn('inline-flex max-w-full rounded-full px-2 py-0.5 text-xs leading-4 font-medium whitespace-normal', tone[status])}>{statusLabel(status)}</span>
}

export function LicenceNotice() {
  return (
    <p className="rounded-lg border border-gold/40 bg-gold/10 px-3 py-2 text-sm text-gold-foreground">
      SOP-001 simulation. A DEMO number is not a mandi permit, and a receipt does not collect a fee or a security deposit.
    </p>
  )
}

export function LicenceSummary({ row }: { row: LicenceCase }) {
  return (
    <p className="text-sm text-muted-foreground">
      {row.applicantLabel} · {categoryLabel(row.category)} · {requestKindLabel(row.kind)}
      {row.licenceNo ? ` · ${row.licenceNo}` : ''}
    </p>
  )
}

export function LicenceDocuments({ documents }: { documents: LicenceDocument[] }) {
  if (documents.length === 0) return <p className="text-sm text-muted-foreground">No demonstration file is attached.</p>
  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {documents.map((document) => (
        <li key={document.id} className="rounded-lg border p-3">
          {document.previewDataUrl ? (
            <img src={document.previewDataUrl} alt="" className="mb-2 max-h-36 w-full rounded-md bg-muted object-contain" />
          ) : (
            <p className="mb-2 text-xs text-muted-foreground">No image preview. The file name and size stay in this browser.</p>
          )}
          <p className="text-sm font-medium">{slotLabel(document.slot)}</p>
          <p className="text-xs break-all text-muted-foreground">
            {document.name} · {document.mimeType || 'file'} · {document.size < 1024 ? `${document.size} B` : `${(document.size / 1024).toFixed(1)} KB`}
          </p>
        </li>
      ))}
    </ul>
  )
}

export function LicenceQr({ payload }: { payload: string }) {
  const [src, setSrc] = useState<string | null>(null)
  useEffect(() => {
    let current = true
    void toDataURL(payload, { margin: 1, width: 180, color: { dark: '#14532d', light: '#ffffff' } }).then((url) => {
      if (current) setSrc(url)
    })
    return () => {
      current = false
    }
  }, [payload])
  if (!src) return <p className="text-sm text-muted-foreground">Preparing the demonstration QR code.</p>
  return <img src={src} alt="" width={180} height={180} className="rounded-md border bg-white p-2" />
}

const stepCopy: Record<string, string> = {
  verify: 'Document verification is the Licence Officer step.',
  approvals: 'The approval queue is the Mandi Manager step.',
  fees: 'The fee and deposit screen is the Accounts Officer step.',
  issue: 'Licence issuance is the Licence Officer step, after a sample receipt is on file.',
  apply: 'New applications are filed from an applicant desk, or by the Licence Officer.',
}

export function StepGate({
  allow,
  step,
  children,
}: {
  allow: boolean
  step: keyof typeof stepCopy
  children: ReactNode
}) {
  const navigate = useNavigate()
  if (allow) return <>{children}</>
  return (
    <EmptyState
      title="Another desk handles this step"
      description={stepCopy[step]}
      actionLabel="Back to the licence desk"
      onAction={() => navigate('/licences')}
    />
  )
}

export function CaseLink({ row }: { row: LicenceCase }) {
  return (
    <Button type="button" variant="outline" size="sm" asChild>
      <Link to={`/licences/${row.id}`}>Open</Link>
    </Button>
  )
}

export function canUseStep(desk: LicenceDesk, step: 'verify' | 'approvals' | 'fees' | 'issue' | 'apply' | 'register' | 'alerts') {
  if (desk === 'oversight' || desk === 'reader') return step !== 'apply' || desk === 'oversight'
  if (step === 'register' || step === 'alerts') return true
  if (step === 'apply') return desk === 'applicant' || desk === 'officer'
  if (step === 'verify' || step === 'issue') return desk === 'officer'
  if (step === 'approvals') return desk === 'manager'
  return desk === 'accounts'
}
