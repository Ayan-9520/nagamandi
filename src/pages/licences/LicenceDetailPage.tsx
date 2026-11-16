import { useState, type ReactNode } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { EmptyState } from '@/components/common/EmptyState'
import { LoadingState } from '@/components/common/LoadingState'
import { PageHeader } from '@/components/common/PageHeader'
import { TextAreaField } from '@/components/forms/TextAreaField'
import { SelectField } from '@/components/forms/SelectField'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { SelectItem } from '@/components/ui/select'
import { LicenceDocuments, LicenceNotice, LicenceQr, LicenceStatusBadge } from '@/features/licences/LicenceBits'
import { categoryLabel, checkLabel, licenceDesk, markLabel, requestKindLabel, statusLabel } from '@/features/licences/meta'
import { mandiName } from '@/services/registry-rules'
import { useLicenceStore } from '@/store/licence-store'
import { useRegistryStore } from '@/store/registry-store'
import { useSessionStore } from '@/store/session-store'
import type { CheckMark, LicenceChecklist, PaymentMethod } from '@/types/licence'
import { formatDateTime, formatFullDay } from '@/utils/format'

const checkKeys = ['identity', 'registration', 'tax', 'additional', 'formComplete', 'documentsAttached'] as const

export function LicenceDetailPage() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const roleId = useSessionStore((state) => state.roleId)
  const accountId = useSessionStore((state) => state.accountId)
  const ready = useLicenceStore((state) => state.ready)
  const row = useLicenceStore((state) => state.cases.find((item) => item.id === id))
  const locations = useRegistryStore((state) => state.locations)
  const startVerification = useLicenceStore((state) => state.startVerification)
  const forwardToManager = useLicenceStore((state) => state.forwardToManager)
  const requestClarification = useLicenceStore((state) => state.requestClarification)
  const rejectCase = useLicenceStore((state) => state.rejectCase)
  const approveCase = useLicenceStore((state) => state.approveCase)
  const recordFee = useLicenceStore((state) => state.recordFee)
  const issueLicence = useLicenceStore((state) => state.issueLicence)
  const resubmit = useLicenceStore((state) => state.resubmit)
  const [checklist, setChecklist] = useState<LicenceChecklist | null>(null)
  const [note, setNote] = useState('')
  const [method, setMethod] = useState<PaymentMethod>('Simulated desk note')
  const [reply, setReply] = useState('')

  if (!ready || !roleId || !accountId) return <LoadingState label="Loading the demonstration licence desk" />
  if (!row) {
    return <EmptyState title="Application not in this browser" description="That demonstration id is not on the licence desk." actionLabel="Back to the licence desk" onAction={() => navigate('/licences')} />
  }

  const desk = licenceDesk(roleId)
  const owner = desk === 'oversight' || row.ownerAccountId === accountId
  if (desk === 'applicant' && !owner) {
    return <EmptyState title="Outside this applicant desk" description="This demonstration application belongs to another simulated desk." actionLabel="Back to the licence desk" onAction={() => navigate('/licences')} />
  }

  const marks = checklist ?? row.checklist
  const actor = { roleId, accountId }

  function run(action: () => { ok: boolean; message?: string }) {
    const result = action()
    if (!result.ok) toast.error(result.message ?? 'The demonstration step did not run.')
    else toast.success('The demonstration case was updated in this browser.')
  }

  return (
    <div className="space-y-4">
      <PageHeader
        eyebrow="DEMO · SOP-001"
        title={row.applicantLabel}
        description={`${row.id} · ${requestKindLabel(row.kind)} · ${statusLabel(row.status)}. This is not an office file.`}
        actions={
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" asChild><Link to="/licences">Licence desk</Link></Button>
            {row.status === 'issued' ? <Button type="button" asChild><Link to={`/licences/${row.id}/print`}>Print preview</Link></Button> : null}
            {row.status === 'issued' && !row.supersededBy && owner ? (
              <>
                <Button type="button" variant="outline" asChild><Link to={`/licences/renew/${row.id}`}>Renew</Link></Button>
                <Button type="button" variant="outline" asChild><Link to={`/licences/modify/${row.id}`}>Modify</Link></Button>
              </>
            ) : null}
          </div>
        }
      />
      <LicenceNotice />
      <Card>
        <CardHeader><CardTitle>Overview</CardTitle></CardHeader>
        <CardContent>
          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            <Field label="Status" value={<LicenceStatusBadge status={row.status} />} />
            <Field label="Category" value={categoryLabel(row.category)} />
            <Field label="Mandi" value={mandiName(locations, row.mandiId)} />
            <Field label="Mandi id" value={row.mandiId} />
            <Field label="Phone" value={row.phone} />
            <Field label="Email" value={row.email} />
            <Field label="Business code" value={row.businessName} />
            <Field label="Business area" value={row.businessArea} />
            <Field label="Registration" value={row.registrationNo} />
            <Field label="Tax id" value={row.taxId} />
            <Field label="Licence number" value={row.licenceNo ?? 'Not issued'} />
            <Field label="Receipt" value={row.fee.receiptId ?? 'Not recorded'} />
            <Field label="Sample fee" value={row.fee.feeLabel} />
            <Field label="Sample deposit" value={row.fee.depositLabel} />
            <Field label="Valid from" value={row.validFrom ? formatFullDay(row.validFrom) : '—'} />
            <Field label="Valid until" value={row.validUntil ? formatFullDay(row.validUntil) : '—'} />
          </dl>
          {row.clarificationNote ? <p className="mt-3 text-sm">Clarification: {row.clarificationNote}</p> : null}
          {row.rejectionNote ? <p className="mt-3 text-sm">Rejection note: {row.rejectionNote}</p> : null}
          {row.supersededBy ? <p className="mt-3 text-sm">Replaced by {row.supersededBy} in this browser.</p> : null}
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Supporting documents</CardTitle></CardHeader>
        <CardContent><LicenceDocuments documents={row.documents} /></CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Verification checklist</CardTitle></CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2">
          {checkKeys.map((key) => (
            <SelectField
              key={key}
              label={checkLabel(key)}
              value={marks[key]}
              onValueChange={(value) => setChecklist({ ...marks, [key]: value as CheckMark })}
            >
              <SelectItem value="pending">{markLabel('pending')}</SelectItem>
              <SelectItem value="pass">{markLabel('pass')}</SelectItem>
              <SelectItem value="fail">{markLabel('fail')}</SelectItem>
            </SelectField>
          ))}
          <div className="md:col-span-2">
            <TextAreaField label="Officer remarks" value={marks.remarks} onChange={(event) => setChecklist({ ...marks, remarks: event.target.value })} />
          </div>
          {row.officerNote ? <p className="text-sm text-muted-foreground md:col-span-2">Saved remark: {row.officerNote}</p> : null}
        </CardContent>
      </Card>
      {row.qrPayload ? (
        <Card>
          <CardHeader><CardTitle>Demonstration QR code</CardTitle></CardHeader>
          <CardContent className="flex flex-wrap items-center gap-4">
            <LicenceQr payload={row.qrPayload} />
            <p className="max-w-sm text-sm text-muted-foreground">The code carries {row.qrPayload}. Scanning it does not open an office record.</p>
          </CardContent>
        </Card>
      ) : null}
      <Card>
        <CardHeader><CardTitle>Activity history</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {row.events.map((item) => (
            <article key={item.id} className="rounded-lg border px-3 py-2 text-sm">
              <p className="font-medium">{item.title}</p>
              <p className="text-xs text-muted-foreground">{formatDateTime(item.at)}</p>
              <p>{item.detail}</p>
            </article>
          ))}
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>This desk can</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {desk === 'officer' || desk === 'oversight' ? (
            row.status === 'submitted' ? <Button type="button" onClick={() => run(() => startVerification(actor, row.id))}>Move to under verification</Button> : null
          ) : null}
          {(desk === 'officer' || desk === 'oversight') && row.status === 'under-verification' ? (
            <div className="flex flex-wrap gap-2">
              <Button type="button" onClick={() => run(() => forwardToManager(actor, row.id, marks))}>Send for manager approval</Button>
              <Button type="button" variant="outline" onClick={() => run(() => requestClarification(actor, row.id, note))}>Ask for clarification</Button>
              <Button type="button" variant="destructive" onClick={() => run(() => rejectCase(actor, row.id, note))}>Reject</Button>
            </div>
          ) : null}
          {(desk === 'manager' || desk === 'oversight') && row.status === 'pending-approval' ? (
            <div className="flex flex-wrap gap-2">
              <Button type="button" onClick={() => run(() => approveCase(actor, row.id, note))}>Approve</Button>
              <Button type="button" variant="outline" onClick={() => run(() => requestClarification(actor, row.id, note))}>Ask for clarification</Button>
              <Button type="button" variant="destructive" onClick={() => run(() => rejectCase(actor, row.id, note))}>Reject</Button>
            </div>
          ) : null}
          {(desk === 'officer' || desk === 'manager' || desk === 'oversight') && (row.status === 'under-verification' || row.status === 'pending-approval') ? (
            <TextAreaField label="Note for clarification or rejection" hint="At least 8 characters. Approval can stay blank." value={note} onChange={(event) => setNote(event.target.value)} />
          ) : null}
          {(desk === 'accounts' || desk === 'oversight') && row.status === 'approved' ? (
            <div className="grid gap-3 md:max-w-md">
              <SelectField label="Sample method" value={method} onValueChange={(value) => setMethod(value as PaymentMethod)}>
                <SelectItem value="Simulated desk note">Simulated desk note</SelectItem>
                <SelectItem value="Simulated transfer">Simulated transfer</SelectItem>
              </SelectField>
              <Button type="button" onClick={() => run(() => recordFee(actor, row.id, method))}>Record demonstration receipt</Button>
            </div>
          ) : null}
          {(desk === 'officer' || desk === 'oversight') && row.status === 'fee-recorded' ? (
            <Button type="button" onClick={() => run(() => issueLicence(actor, row.id))}>Issue demonstration licence</Button>
          ) : null}
          {owner && row.status === 'clarification-required' ? (
            <div className="grid gap-3">
              <TextAreaField label="Reply" hint="Tell the desk what was clarified. The existing sample files stay attached." value={reply} onChange={(event) => setReply(event.target.value)} />
              <Button type="button" onClick={() => run(() => resubmit(actor, row.id, reply, {
                partyId: row.partyId,
                applicantLabel: row.applicantLabel,
                area: row.area,
                phone: row.phone,
                email: row.email,
                businessName: row.businessName,
                businessArea: row.businessArea,
                registrationNo: row.registrationNo,
                taxId: row.taxId,
                documents: row.documents,
                declared: true,
              }))}>Send clarification reply</Button>
            </div>
          ) : null}
          {desk === 'reader' || (desk === 'applicant' && row.status !== 'clarification-required' && row.status !== 'issued') ? (
            <p className="text-sm text-muted-foreground">This desk can read the case. The next action belongs to another role.</p>
          ) : null}
        </CardContent>
      </Card>
    </div>
  )
}

function Field({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div>
      <dt className="text-muted-foreground">{label}</dt>
      <dd>{value}</dd>
    </div>
  )
}
