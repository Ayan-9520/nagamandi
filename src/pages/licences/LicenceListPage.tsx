import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { PageHeader } from '@/components/common/PageHeader'
import { LoadingState } from '@/components/common/LoadingState'
import { FilterBar } from '@/components/common/FilterBar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { SelectItem } from '@/components/ui/select'
import { SelectField } from '@/components/forms/SelectField'
import { RegistryTable, type RegistryColumn } from '@/features/registry/RegistryTable'
import { CaseLink, LicenceNotice, LicenceStatusBadge, StepGate, canUseStep } from '@/features/licences/LicenceBits'
import { categoryLabel, deskIntro, licenceDesk, requestKindLabel, statusLabel } from '@/features/licences/meta'
import { expiryBand } from '@/services/licence-rules'
import { mandiName, workingMandi } from '@/services/registry-rules'
import { useLicenceStore } from '@/store/licence-store'
import { useRegistryStore } from '@/store/registry-store'
import { useSessionStore } from '@/store/session-store'
import type { LicenceCase, LicenceStatus } from '@/types/licence'
import { formatFullDay } from '@/utils/format'

const modes = {
  applications: { title: 'Applications', description: 'Every demonstration application this desk is allowed to see.', statuses: null, gate: null },
  verify: { title: 'Document verification', description: 'Submitted applications and cases already under verification.', statuses: ['submitted', 'under-verification'] as LicenceStatus[], gate: 'verify' as const },
  approvals: { title: 'Approval queue', description: 'Cases the Licence Officer has forwarded for a simulated manager decision.', statuses: ['pending-approval'] as LicenceStatus[], gate: 'approvals' as const },
  fees: { title: 'Fee and security deposit', description: 'Approved cases waiting for a sample receipt. No payment is taken.', statuses: ['approved'] as LicenceStatus[], gate: 'fees' as const },
  issue: { title: 'Licence issuance', description: 'Cases with a sample receipt, ready for a DEMO licence number.', statuses: ['fee-recorded'] as LicenceStatus[], gate: 'issue' as const },
  register: { title: 'Licence register', description: 'Issued demonstration licences, including rows a renewal has replaced.', statuses: ['issued'] as LicenceStatus[], gate: null },
  alerts: { title: 'Expiry alerts', description: 'Issued licences that are inside 30 days of 14 Nov 2026, or already past that demonstration date.', statuses: ['issued'] as LicenceStatus[], gate: null },
}

export function LicenceListPage({ mode }: { mode: keyof typeof modes }) {
  const spec = modes[mode]
  const roleId = useSessionStore((state) => state.roleId)
  const accountId = useSessionStore((state) => state.accountId)
  const ready = useLicenceStore((state) => state.ready)
  const cases = useLicenceStore((state) => state.cases)
  const locations = useRegistryStore((state) => state.locations)
  const registryReady = useRegistryStore((state) => state.ready)
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('all')
  const desk = roleId ? licenceDesk(roleId) : 'applicant'
  const mandi = workingMandi(locations)

  const rows = useMemo(() => {
    return cases.filter((row) => {
      if (desk === 'applicant' && row.ownerAccountId !== accountId) return false
      if (spec.statuses && !spec.statuses.includes(row.status)) return false
      if (mode === 'alerts') {
        const band = expiryBand(row.validUntil, row.supersededBy)
        if (band !== 'expiring' && band !== 'expired') return false
      }
      if (status !== 'all' && row.status !== status) return false
      const haystack = [row.id, row.licenceNo, row.applicantLabel, row.businessName, row.registrationNo, statusLabel(row.status)].join(' ').toLowerCase()
      return haystack.includes(query.trim().toLowerCase())
    })
  }, [accountId, cases, desk, mode, query, spec.statuses, status])

  if (!ready || !registryReady || !roleId) return <LoadingState label="Loading the demonstration licence desk" />

  const columns: RegistryColumn<LicenceCase>[] = [
    { id: 'id', header: 'Application', sortValue: (row) => row.id, cell: (row) => row.id },
    { id: 'label', header: 'Desk code', sortValue: (row) => row.applicantLabel, cell: (row) => row.applicantLabel },
    { id: 'kind', header: 'Request', sortValue: (row) => row.kind, cell: (row) => requestKindLabel(row.kind) },
    { id: 'category', header: 'Category', sortValue: (row) => row.category, cell: (row) => categoryLabel(row.category) },
    {
      id: 'status',
      header: 'Status',
      sortValue: (row) => row.status,
      cell: (row) => (
        <span className="flex flex-col gap-1">
          <LicenceStatusBadge status={row.status} />
          {row.supersededBy ? <span className="text-xs text-muted-foreground">Replaced in this browser</span> : null}
        </span>
      ),
    },
    {
      id: 'until',
      header: 'Valid until',
      sortValue: (row) => row.validUntil ?? '',
      cell: (row) => (row.validUntil ? formatFullDay(row.validUntil) : '—'),
    },
    { id: 'open', header: 'Open', cell: (row) => <CaseLink row={row} /> },
  ]

  const body = (
    <div className="space-y-4">
      <PageHeader eyebrow="DEMO · SOP-001" title={spec.title} description={spec.description} actions={<Button type="button" variant="outline" asChild><Link to="/licences">Licence desk</Link></Button>} />
      <LicenceNotice />
      <p className="text-sm text-muted-foreground">Working mandi: {mandi ? mandiName(locations, mandi.id) : 'None'}. {deskIntro(desk)}</p>
      <FilterBar onReset={() => { setQuery(''); setStatus('all') }}>
        <div className="grid gap-1.5">
          <Label htmlFor={`${mode}-search`}>Search</Label>
          <Input id={`${mode}-search`} value={query} placeholder="Id, desk code or business" onChange={(event) => setQuery(event.target.value)} />
        </div>
        {mode === 'applications' ? (
          <SelectField label="Status" value={status} onValueChange={setStatus}>
            <SelectItem value="all">Any status</SelectItem>
            <SelectItem value="submitted">Application Submitted</SelectItem>
            <SelectItem value="under-verification">Under Verification</SelectItem>
            <SelectItem value="clarification-required">Clarification required</SelectItem>
            <SelectItem value="pending-approval">Pending Manager Approval</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="fee-recorded">Fee/Deposit Recorded</SelectItem>
            <SelectItem value="issued">Licence Issued</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectField>
        ) : null}
      </FilterBar>
      <Card>
        <CardHeader>
          <CardTitle>{rows.length} demonstration row{rows.length === 1 ? '' : 's'}</CardTitle>
        </CardHeader>
        <CardContent>
          <RegistryTable
            columns={columns}
            rows={rows}
            getRowId={(row) => row.id}
            caption={spec.title}
            emptyTitle="No rows on this step"
            emptyDescription="Change the search, or open another step from the licence desk."
            resetKey={`${mode}|${query}|${status}|${rows.length}`}
          />
        </CardContent>
      </Card>
    </div>
  )

  if (!spec.gate) return body
  return <StepGate allow={canUseStep(desk, spec.gate)} step={spec.gate}>{body}</StepGate>
}
