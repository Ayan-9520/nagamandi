import { useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { LoadingState } from '@/components/common/LoadingState'
import { PageHeader } from '@/components/common/PageHeader'
import { FilterBar } from '@/components/common/FilterBar'
import { SelectField } from '@/components/forms/SelectField'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { SelectItem } from '@/components/ui/select'
import { ActiveMandiNote, CsvDialog, RecordStatusBadge, RemoveDialog } from '@/features/registry/RegistryBits'
import { RegistryTable, type RegistryColumn } from '@/features/registry/RegistryTable'
import { partyBasePath, partyRegister } from '@/features/registry/meta'
import { csvColumns, previewPartyCsv } from '@/services/registry-io'
import { workingMandi } from '@/services/registry-rules'
import { useRegistryStore } from '@/store/registry-store'
import type { Party, PartyKind } from '@/types/registry'

type StatusFilter = 'working' | 'Active' | 'Inactive' | 'Removed'
type ScopeFilter = 'working' | 'all'

export function PartyListPage({ kind }: { kind: PartyKind }) {
  const meta = partyRegister(kind)
  const ready = useRegistryStore((state) => state.ready)
  const parties = useRegistryStore((state) => state.parties)
  const commodities = useRegistryStore((state) => state.commodities)
  const locations = useRegistryStore((state) => state.locations)
  const createParty = useRegistryStore((state) => state.createParty)
  const removeParty = useRegistryStore((state) => state.removeParty)
  const restoreParty = useRegistryStore((state) => state.restoreParty)
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState<StatusFilter>('working')
  const [scope, setScope] = useState<ScopeFilter>('working')
  const [commodityId, setCommodityId] = useState('all')
  const [removeId, setRemoveId] = useState<string | null>(null)
  const [importOpen, setImportOpen] = useState(false)
  const [preview, setPreview] = useState<ReturnType<typeof previewPartyCsv> | null>(null)
  const mandi = workingMandi(locations)
  const base = partyBasePath(kind)

  if (!ready) return <LoadingState label="Loading the demonstration register" />

  const rows = parties.filter((party) => {
    if (party.kind !== kind) return false
    if (scope === 'working' && party.mandiId !== mandi?.id) return false
    if (status === 'working' && party.status === 'Removed') return false
    if (status !== 'working' && party.status !== status) return false
    if (meta.commodity === 'required' && commodityId !== 'all' && party.commodityId !== commodityId) return false
    const commodity = commodities.find((item) => item.id === party.commodityId)?.name ?? ''
    const haystack = [party.id, party.label, party.area, party.phone, party.vehicleNo, party.siteCode, commodity].join(' ').toLowerCase()
    return haystack.includes(query.trim().toLowerCase())
  })

  const columns: RegistryColumn<Party>[] = [
    { id: 'id', header: 'Registration id', sortValue: (row) => row.id, cell: (row) => row.id },
    { id: 'label', header: 'Desk label', sortValue: (row) => row.label, cell: (row) => row.label },
    { id: 'area', header: 'Area', sortValue: (row) => row.area, cell: (row) => row.area },
    {
      id: 'commodity',
      header: meta.commodity === 'required' ? 'Commodity' : meta.vehicle === 'required' ? 'Vehicle' : meta.siteLabel,
      sortValue: (row) => extraValue(row, meta, commodities),
      cell: (row) => extraValue(row, meta, commodities),
    },
    { id: 'status', header: 'Status', sortValue: (row) => row.status, cell: (row) => <RecordStatusBadge status={row.status} /> },
    {
      id: 'actions',
      header: 'Actions',
      cell: (row) => (
        <div className="flex flex-wrap gap-1">
          <Button type="button" size="sm" variant="outline" asChild>
            <Link to={`${base}/${row.id}`}>View</Link>
          </Button>
          <Button type="button" size="sm" variant="outline" asChild>
            <Link to={`${base}/${row.id}/edit`}>Edit</Link>
          </Button>
          {row.status === 'Removed' ? (
            <Button type="button" size="sm" variant="outline" onClick={() => restore(row.id)}>Restore</Button>
          ) : (
            <Button type="button" size="sm" variant="destructive" onClick={() => setRemoveId(row.id)}>Remove</Button>
          )}
        </div>
      ),
    },
  ]

  function restore(id: string) {
    const result = restoreParty(id)
    if (!result.ok) toast.error(result.message)
    else toast.success('The demonstration row is back on the working list.')
  }

  function confirmRemove() {
    if (!removeId) return
    const result = removeParty(removeId)
    setRemoveId(null)
    if (!result.ok) toast.error(result.message)
    else toast.success('The demonstration row was marked removed.')
  }

  function commitImport() {
    if (!preview) return
    let added = 0
    preview.rows.forEach((row) => {
      const result = createParty(kind, row)
      if (result.ok) added += 1
    })
    toast.success(`${added} demonstration row${added === 1 ? '' : 's'} added.`)
    setPreview(null)
    setImportOpen(false)
  }

  const exportRows = rows
    .filter((row) => row.status !== 'Removed')
    .map((row) => [
      row.label,
      row.area,
      row.phone,
      row.status,
      commodities.find((item) => item.id === row.commodityId)?.name ?? '',
      row.notes,
      row.vehicleNo,
      row.siteCode,
    ])

  return (
    <div className="space-y-4">
      <PageHeader
        eyebrow="DEMO"
        title={meta.title}
        description={meta.description}
        actions={
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" onClick={() => setImportOpen(true)}>CSV</Button>
            <Button type="button" asChild>
              <Link to={`${base}/new`}>New record</Link>
            </Button>
          </div>
        }
      />
      <ActiveMandiNote />
      <FilterBar
        onReset={() => {
          setQuery('')
          setStatus('working')
          setScope('working')
          setCommodityId('all')
        }}
      >
        <div className="grid gap-1.5">
          <Label htmlFor={`${kind}-search`}>Search</Label>
          <Input id={`${kind}-search`} value={query} placeholder="Id, label or area" onChange={(event) => setQuery(event.target.value)} />
        </div>
        <SelectField label="Status" value={status} onValueChange={(value) => setStatus(value as StatusFilter)}>
          <SelectItem value="working">Working list</SelectItem>
          <SelectItem value="Active">Active</SelectItem>
          <SelectItem value="Inactive">Inactive</SelectItem>
          <SelectItem value="Removed">Removed</SelectItem>
        </SelectField>
        <SelectField label="Mandi scope" value={scope} onValueChange={(value) => setScope(value as ScopeFilter)}>
          <SelectItem value="working">Working mandi</SelectItem>
          <SelectItem value="all">All mandis on file</SelectItem>
        </SelectField>
        {meta.commodity === 'required' ? (
          <SelectField label="Commodity" value={commodityId} onValueChange={setCommodityId}>
            <SelectItem value="all">Any commodity</SelectItem>
            {commodities.filter((item) => item.status !== 'Removed' && (scope === 'all' || item.mandiId === mandi?.id)).map((item) => (
              <SelectItem key={item.id} value={item.id}>{item.name}</SelectItem>
            ))}
          </SelectField>
        ) : null}
      </FilterBar>
      <RegistryTable
        columns={columns}
        rows={rows}
        getRowId={(row) => row.id}
        caption={`${meta.title} demonstration register`}
        emptyTitle="No rows match"
        emptyDescription="Change the search or filters, or add a demonstration record."
        resetKey={`${query}|${status}|${scope}|${commodityId}|${rows.length}`}
      />
      <RemoveDialog
        open={Boolean(removeId)}
        title={parties.find((party) => party.id === removeId)?.label ?? 'this row'}
        onCancel={() => setRemoveId(null)}
        onConfirm={confirmRemove}
      />
      <CsvDialog
        open={importOpen}
        filename={`${meta.path}.csv`}
        headers={[...csvColumns.party]}
        exportRows={exportRows}
        preview={preview ? { count: preview.rows.length, issues: preview.issues } : null}
        onFile={(text) => setPreview(previewPartyCsv(text, kind, useRegistryStore.getState()))}
        onCommit={commitImport}
        onClose={() => {
          setImportOpen(false)
          setPreview(null)
        }}
      />
    </div>
  )
}

function extraValue(row: Party, meta: ReturnType<typeof partyRegister>, commodities: { id: string; name: string }[]) {
  if (meta.commodity === 'required') return commodities.find((item) => item.id === row.commodityId)?.name ?? '—'
  if (meta.vehicle === 'required') return row.vehicleNo || '—'
  if (meta.site === 'required') return row.siteCode || '—'
  return row.phone
}
