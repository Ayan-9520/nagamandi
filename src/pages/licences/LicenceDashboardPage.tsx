import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { PageHeader } from '@/components/common/PageHeader'
import { StatCard } from '@/components/common/StatCard'
import { LoadingState } from '@/components/common/LoadingState'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { LicenceNotice, LicenceStatusBadge, canUseStep } from '@/features/licences/LicenceBits'
import { deskIntro, licenceDesk, statusLabel } from '@/features/licences/meta'
import { expiryBand } from '@/services/licence-rules'
import { useLicenceStore } from '@/store/licence-store'
import { useSessionStore } from '@/store/session-store'
import type { LicenceStatus } from '@/types/licence'
import { BadgeCheck, Bell, ClipboardList, FileCheck, Stamp, WalletCards } from 'lucide-react'

const pipeline: LicenceStatus[] = [
  'submitted',
  'under-verification',
  'clarification-required',
  'pending-approval',
  'approved',
  'fee-recorded',
  'issued',
  'rejected',
]

export function LicenceDashboardPage() {
  const roleId = useSessionStore((state) => state.roleId)
  const accountId = useSessionStore((state) => state.accountId)
  const ready = useLicenceStore((state) => state.ready)
  const cases = useLicenceStore((state) => state.cases)
  const resetLicences = useLicenceStore((state) => state.resetLicences)
  const [restoreOpen, setRestoreOpen] = useState(false)
  const desk = roleId ? licenceDesk(roleId) : 'applicant'

  const visible = useMemo(
    () => cases.filter((row) => desk !== 'applicant' || row.ownerAccountId === accountId),
    [accountId, cases, desk],
  )
  const count = (status: LicenceStatus) => visible.filter((row) => row.status === status).length
  const alerts = visible.filter((row) => {
    const band = expiryBand(row.validUntil, row.supersededBy)
    return band === 'expiring' || band === 'expired'
  }).length

  if (!ready || !roleId) return <LoadingState label="Loading the demonstration licence desk" />

  const links = [
    canUseStep(desk, 'apply') ? { to: '/licences/apply', label: 'New application', detail: 'Applicant details, business details and sample documents' } : null,
    { to: '/licences/applications', label: 'Applications', detail: 'Status of demonstration filings' },
    canUseStep(desk, 'verify') ? { to: '/licences/verify', label: 'Document verification', detail: 'Licence Officer checklist' } : null,
    canUseStep(desk, 'approvals') ? { to: '/licences/approvals', label: 'Approval queue', detail: 'Mandi Manager review' } : null,
    canUseStep(desk, 'fees') ? { to: '/licences/fees', label: 'Fee and deposit', detail: 'Sample receipt only' } : null,
    canUseStep(desk, 'issue') ? { to: '/licences/issue', label: 'Issue a licence', detail: 'DEMO number and QR code' } : null,
    { to: '/licences/register', label: 'Licence register', detail: 'Issued demonstration rows' },
    { to: '/licences/alerts', label: 'Expiry alerts', detail: 'Measured from 14 Nov 2026' },
  ].filter((item) => item !== null)

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="DEMO · SOP-001"
        title="Licence desk"
        description={deskIntro(desk)}
        actions={
          <Button type="button" variant="outline" onClick={() => setRestoreOpen(true)}>Restore licence sample</Button>
        }
      />
      <LicenceNotice />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Submitted" value={String(count('submitted'))} hint="Waiting for verification" icon={ClipboardList} />
        <StatCard label="With the manager" value={String(count('pending-approval'))} hint="Pending a simulated decision" icon={Stamp} />
        <StatCard label="Awaiting a receipt" value={String(count('approved'))} hint="Fee is not collected" icon={WalletCards} />
        <StatCard label="Expiry alerts" value={String(alerts)} hint="On or before 14 Dec 2026" icon={Bell} />
      </div>
      <section className="space-y-3">
        <h2 className="font-display text-2xl tracking-tight">Workflow</h2>
        <ol className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
          {pipeline.map((status, index) => (
            <li key={status} className="flex min-w-0 flex-col gap-2 rounded-xl bg-card px-3 py-3 ring-1 ring-foreground/10">
              <span className="flex items-center justify-between gap-2">
                <span className="text-xs text-muted-foreground">Step {index + 1}</span>
                <span className="font-display text-2xl leading-none">{count(status)}</span>
              </span>
              <LicenceStatusBadge status={status} />
            </li>
          ))}
        </ol>
      </section>
      <section className="space-y-3">
        <h2 className="font-display text-2xl tracking-tight">Open a step</h2>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {links.map((item) => (
            <Link key={item.to} to={item.to} className="rounded-xl bg-card px-4 py-3 ring-1 ring-foreground/10 transition-colors hover:bg-accent">
              <span className="block text-sm font-medium">{item.label}</span>
              <span className="mt-1 block text-xs leading-5 text-muted-foreground">{item.detail}</span>
            </Link>
          ))}
        </div>
      </section>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><FileCheck className="size-4" aria-hidden /> Issued in this view</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {visible.filter((row) => row.status === 'issued' && !row.supersededBy).length === 0 ? <p>No current demonstration licence is in this view.</p> : null}
          {visible.filter((row) => row.status === 'issued' && !row.supersededBy).map((row) => (
            <div key={row.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border px-3 py-2">
              <span>{row.licenceNo} · {row.applicantLabel}</span>
              <Button type="button" size="sm" variant="outline" asChild>
                <Link to={`/licences/${row.id}/print`}>Preview</Link>
              </Button>
            </div>
          ))}
          <p className="flex items-center gap-2 text-xs text-muted-foreground"><BadgeCheck className="size-3.5" aria-hidden /> {statusLabel('issued')} means the number exists in this browser only.</p>
        </CardContent>
      </Card>
      <Dialog open={restoreOpen} onOpenChange={setRestoreOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Restore the licence sample?</DialogTitle>
            <DialogDescription>This replaces licence applications stored in this browser with the original demonstration set. Stakeholder registers stay.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setRestoreOpen(false)}>Keep current rows</Button>
            <Button type="button" onClick={() => { resetLicences(); setRestoreOpen(false); toast.success('The licence sample was restored in this browser.') }}>Restore sample</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
