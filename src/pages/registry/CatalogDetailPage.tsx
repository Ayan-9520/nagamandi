import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { EmptyState } from '@/components/common/EmptyState'
import { LoadingState } from '@/components/common/LoadingState'
import { PageHeader } from '@/components/common/PageHeader'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { catalogBasePath, catalogRegister } from '@/features/registry/meta'
import { ActivityList, RecordStatusBadge, RemoveDialog } from '@/features/registry/RegistryBits'
import { mandiName } from '@/services/registry-rules'
import { useRegistryStore } from '@/store/registry-store'
import type { CatalogKind } from '@/types/registry'
import { formatDateTime } from '@/utils/format'

export function CatalogDetailPage({ kind }: { kind: CatalogKind }) {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const meta = catalogRegister(kind)
  const ready = useRegistryStore((state) => state.ready)
  const store = useRegistryStore()
  const [removeOpen, setRemoveOpen] = useState(false)
  const base = catalogBasePath(kind)
  const fields = detailFields(kind, id, store)
  const activities = store.activities.filter((item) => item.recordId === id).sort((left, right) => right.at.localeCompare(left.at))

  if (!ready) return <LoadingState label="Loading the demonstration register" />
  if (!fields) {
    return <EmptyState title="Record not in this browser" description="That demonstration id is not on this register." actionLabel="Back to the list" onAction={() => navigate(base)} />
  }

  function confirmRemove() {
    const result = store.removeCatalog(kind, id)
    setRemoveOpen(false)
    if (!result.ok) toast.error(result.message)
    else toast.success('The demonstration row was marked removed.')
  }

  function restore() {
    const result = store.restoreCatalog(kind, id)
    if (!result.ok) toast.error(result.message)
    else toast.success('The demonstration row is back on the working list.')
  }

  function makeWorking() {
    const result = store.setWorkingMandi(id)
    if (!result.ok) toast.error(result.message)
    else toast.success('This location is now the working mandi.')
  }

  return (
    <div className="space-y-4">
      <PageHeader
        eyebrow="DEMO"
        title={fields.title}
        description={`${id} · ${meta.title}. Stored in this browser only.`}
        actions={
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" asChild>
              <Link to={base}>Back to list</Link>
            </Button>
            <Button type="button" asChild>
              <Link to={`${base}/${id}/edit`}>Edit</Link>
            </Button>
            {kind === 'location' && !fields.working ? (
              <Button type="button" variant="outline" onClick={makeWorking}>Use as working mandi</Button>
            ) : null}
            {fields.status === 'Removed' ? (
              <Button type="button" variant="outline" onClick={restore}>Restore</Button>
            ) : (
              <Button type="button" variant="destructive" onClick={() => setRemoveOpen(true)}>Remove</Button>
            )}
          </div>
        }
      />
      <Card>
        <CardHeader>
          <CardTitle>Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-muted-foreground">Status</dt>
              <dd><RecordStatusBadge status={fields.status} /></dd>
            </div>
            {fields.rows.map((row) => (
              <div key={row.label}>
                <dt className="text-muted-foreground">{row.label}</dt>
                <dd>{row.value}</dd>
              </div>
            ))}
          </dl>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Activity History</CardTitle>
        </CardHeader>
        <CardContent>
          <ActivityList entries={activities} />
        </CardContent>
      </Card>
      <RemoveDialog open={removeOpen} title={fields.title} onCancel={() => setRemoveOpen(false)} onConfirm={confirmRemove} />
    </div>
  )
}

function detailFields(kind: CatalogKind, id: string, store: ReturnType<typeof useRegistryStore.getState>) {
  if (kind === 'commodity') {
    const row = store.commodities.find((item) => item.id === id)
    if (!row) return null
    return {
      title: row.name,
      status: row.status,
      working: false,
      rows: [
        { label: 'Category', value: row.category },
        { label: 'Season', value: row.season },
        { label: 'Mandi', value: mandiName(store.locations, row.mandiId) },
        { label: 'Mandi id', value: row.mandiId },
        { label: 'Updated', value: formatDateTime(row.updatedAt) },
      ],
    }
  }
  if (kind === 'grade') {
    const row = store.grades.find((item) => item.id === id)
    if (!row) return null
    return {
      title: row.name,
      status: row.status,
      working: false,
      rows: [
        { label: 'Commodity', value: store.commodities.find((item) => item.id === row.commodityId)?.name ?? row.commodityId },
        { label: 'Description', value: row.description },
        { label: 'Mandi', value: mandiName(store.locations, row.mandiId) },
        { label: 'Mandi id', value: row.mandiId },
        { label: 'Updated', value: formatDateTime(row.updatedAt) },
      ],
    }
  }
  if (kind === 'unit') {
    const row = store.units.find((item) => item.id === id)
    if (!row) return null
    return {
      title: row.name,
      status: row.status,
      working: false,
      rows: [
        { label: 'Symbol', value: row.symbol },
        { label: 'Kind', value: row.kind },
        { label: 'Mandi', value: mandiName(store.locations, row.mandiId) },
        { label: 'Mandi id', value: row.mandiId },
        { label: 'Updated', value: formatDateTime(row.updatedAt) },
      ],
    }
  }
  if (kind === 'location') {
    const row = store.locations.find((item) => item.id === id)
    if (!row) return null
    return {
      title: row.name,
      status: row.status,
      working: row.active && row.status !== 'Removed',
      rows: [
        { label: 'District', value: row.district },
        { label: 'Code', value: row.code },
        { label: 'Mandi id', value: row.mandiId },
        { label: 'Working mandi', value: row.active ? 'Yes' : 'No' },
        { label: 'Updated', value: formatDateTime(row.updatedAt) },
      ],
    }
  }
  const row = store.fees.find((item) => item.id === id)
  if (!row) return null
  return {
    title: row.name,
    status: row.status,
    working: false,
    rows: [
      { label: 'Basis', value: row.basis },
      { label: 'Sample rate', value: row.sampleRate },
      { label: 'Mandi', value: mandiName(store.locations, row.mandiId) },
      { label: 'Mandi id', value: row.mandiId },
      { label: 'Updated', value: formatDateTime(row.updatedAt) },
    ],
  }
}
