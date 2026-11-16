import { useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { FilterBar } from '@/components/common/FilterBar'
import { LoadingState } from '@/components/common/LoadingState'
import { PageHeader } from '@/components/common/PageHeader'
import { SelectField } from '@/components/forms/SelectField'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { SelectItem } from '@/components/ui/select'
import { ActiveMandiNote, CsvDialog, RecordStatusBadge, RemoveDialog } from '@/features/registry/RegistryBits'
import { RegistryTable, type RegistryColumn } from '@/features/registry/RegistryTable'
import { catalogBasePath, catalogRegister } from '@/features/registry/meta'
import {
  csvColumns,
  previewCommodityCsv,
  previewFeeCsv,
  previewGradeCsv,
  previewLocationCsv,
  previewUnitCsv,
} from '@/services/registry-io'
import { workingMandi } from '@/services/registry-rules'
import { useRegistryStore } from '@/store/registry-store'
import type { CatalogKind, RecordStatus } from '@/types/registry'

interface ViewRow {
  id: string
  mandiId: string
  status: RecordStatus
  primary: string
  secondary: string
  tertiary: string
  working?: boolean
}

type StatusFilter = 'working' | 'Active' | 'Inactive' | 'Removed'
type ScopeFilter = 'working' | 'all'

export function CatalogListPage({ kind }: { kind: CatalogKind }) {
  const meta = catalogRegister(kind)
  const ready = useRegistryStore((state) => state.ready)
  const data = useRegistryStore()
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState<StatusFilter>('working')
  const [scope, setScope] = useState<ScopeFilter>('working')
  const [removeId, setRemoveId] = useState<string | null>(null)
  const [importOpen, setImportOpen] = useState(false)
  const [previewCount, setPreviewCount] = useState(0)
  const [issues, setIssues] = useState<{ row: number; message: string }[]>([])
  const [pending, setPending] = useState<unknown[]>([])
  const mandi = workingMandi(data.locations)
  const base = catalogBasePath(kind)
  const headers = csvColumns[kind]

  if (!ready) return <LoadingState label="Loading the demonstration register" />

  const rows = viewRows(kind, data).filter((row) => {
    if (kind !== 'location' && scope === 'working' && row.mandiId !== mandi?.id) return false
    if (status === 'working' && row.status === 'Removed') return false
    if (status !== 'working' && row.status !== status) return false
    return [row.id, row.primary, row.secondary, row.tertiary].join(' ').toLowerCase().includes(query.trim().toLowerCase())
  })

  const columns: RegistryColumn<ViewRow>[] = [
    { id: 'id', header: 'Id', sortValue: (row) => row.id, cell: (row) => row.id },
    { id: 'primary', header: 'Name', sortValue: (row) => row.primary, cell: (row) => row.primary },
    { id: 'secondary', header: secondaryHeader(kind), sortValue: (row) => row.secondary, cell: (row) => row.secondary },
    { id: 'tertiary', header: tertiaryHeader(kind), sortValue: (row) => row.tertiary, cell: (row) => row.tertiary },
    {
      id: 'status',
      header: 'Status',
      sortValue: (row) => row.status,
      cell: (row) => (
        <span className="inline-flex items-center gap-2">
          <RecordStatusBadge status={row.status} />
          {row.working ? <span className="text-xs text-primary">Working mandi</span> : null}
        </span>
      ),
    },
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
    const result = data.restoreCatalog(kind, id)
    if (!result.ok) toast.error(result.message)
    else toast.success('The demonstration row is back on the working list.')
  }

  function confirmRemove() {
    if (!removeId) return
    const result = data.removeCatalog(kind, removeId)
    setRemoveId(null)
    if (!result.ok) toast.error(result.message)
    else toast.success('The demonstration row was marked removed.')
  }

  function onFile(text: string) {
    const state = useRegistryStore.getState()
    const result =
      kind === 'commodity' ? previewCommodityCsv(text, state)
      : kind === 'grade' ? previewGradeCsv(text, state)
      : kind === 'unit' ? previewUnitCsv(text, state)
      : kind === 'location' ? previewLocationCsv(text, state)
      : previewFeeCsv(text, state)
    setPending(result.rows)
    setPreviewCount(result.rows.length)
    setIssues(result.issues)
  }

  function commit() {
    let added = 0
    pending.forEach((row) => {
      const result = createPending(kind, row)
      if (result.ok) added += 1
    })
    toast.success(`${added} demonstration row${added === 1 ? '' : 's'} added.`)
    setImportOpen(false)
    setPending([])
    setPreviewCount(0)
    setIssues([])
  }

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
        }}
      >
        <div className="grid gap-1.5">
          <Label htmlFor={`${kind}-search`}>Search</Label>
          <Input id={`${kind}-search`} value={query} placeholder="Id or name" onChange={(event) => setQuery(event.target.value)} />
        </div>
        <SelectField label="Status" value={status} onValueChange={(value) => setStatus(value as StatusFilter)}>
          <SelectItem value="working">Working list</SelectItem>
          <SelectItem value="Active">Active</SelectItem>
          <SelectItem value="Inactive">Inactive</SelectItem>
          <SelectItem value="Removed">Removed</SelectItem>
        </SelectField>
        {kind === 'location' ? null : (
          <SelectField label="Mandi scope" value={scope} onValueChange={(value) => setScope(value as ScopeFilter)}>
            <SelectItem value="working">Working mandi</SelectItem>
            <SelectItem value="all">All mandis on file</SelectItem>
          </SelectField>
        )}
      </FilterBar>
      <RegistryTable
        columns={columns}
        rows={rows}
        getRowId={(row) => row.id}
        caption={`${meta.title} demonstration register`}
        emptyTitle="No rows match"
        emptyDescription="Change the search or filters, or add a demonstration record."
        resetKey={`${query}|${status}|${scope}|${rows.length}`}
      />
      <RemoveDialog
        open={Boolean(removeId)}
        title={rows.find((row) => row.id === removeId)?.primary ?? 'this row'}
        onCancel={() => setRemoveId(null)}
        onConfirm={confirmRemove}
      />
      <CsvDialog
        open={importOpen}
        filename={`${meta.path}.csv`}
        headers={[...headers]}
        exportRows={exportRows(kind, rows)}
        preview={importOpen && (previewCount > 0 || issues.length > 0) ? { count: previewCount, issues } : null}
        onFile={onFile}
        onCommit={commit}
        onClose={() => {
          setImportOpen(false)
          setPending([])
          setPreviewCount(0)
          setIssues([])
        }}
      />
    </div>
  )
}

function createPending(kind: CatalogKind, row: unknown) {
  const store = useRegistryStore.getState()
  if (kind === 'commodity') return store.createCommodity(row as Parameters<typeof store.createCommodity>[0])
  if (kind === 'grade') return store.createGrade(row as Parameters<typeof store.createGrade>[0])
  if (kind === 'unit') return store.createUnit(row as Parameters<typeof store.createUnit>[0])
  if (kind === 'location') return store.createLocation(row as Parameters<typeof store.createLocation>[0])
  return store.createFee(row as Parameters<typeof store.createFee>[0])
}

function viewRows(kind: CatalogKind, data: ReturnType<typeof useRegistryStore.getState>): ViewRow[] {
  if (kind === 'commodity') {
    return data.commodities.map((row) => ({ id: row.id, mandiId: row.mandiId, status: row.status, primary: row.name, secondary: row.category, tertiary: row.season }))
  }
  if (kind === 'grade') {
    return data.grades.map((row) => ({
      id: row.id,
      mandiId: row.mandiId,
      status: row.status,
      primary: row.name,
      secondary: data.commodities.find((item) => item.id === row.commodityId)?.name ?? row.commodityId,
      tertiary: row.description,
    }))
  }
  if (kind === 'unit') {
    return data.units.map((row) => ({ id: row.id, mandiId: row.mandiId, status: row.status, primary: row.name, secondary: row.symbol, tertiary: row.kind }))
  }
  if (kind === 'location') {
    return data.locations.map((row) => ({
      id: row.id,
      mandiId: row.mandiId,
      status: row.status,
      primary: row.name,
      secondary: row.district,
      tertiary: row.code,
      working: row.active && row.status !== 'Removed',
    }))
  }
  return data.fees.map((row) => ({ id: row.id, mandiId: row.mandiId, status: row.status, primary: row.name, secondary: row.basis, tertiary: row.sampleRate }))
}

function exportRows(kind: CatalogKind, rows: ViewRow[]) {
  return rows.filter((row) => row.status !== 'Removed').map((row) => {
    if (kind === 'unit') return [row.primary, row.secondary, row.tertiary, row.status]
    if (kind === 'grade') return [row.secondary, row.primary, row.tertiary, row.status]
    if (kind === 'location') return [row.primary, row.secondary, row.tertiary, row.status]
    if (kind === 'fee') return [row.primary, row.secondary, row.tertiary, row.status]
    return [row.primary, row.secondary, row.tertiary, row.status]
  })
}

function secondaryHeader(kind: CatalogKind) {
  if (kind === 'commodity') return 'Category'
  if (kind === 'grade') return 'Commodity'
  if (kind === 'unit') return 'Symbol'
  if (kind === 'location') return 'District'
  return 'Basis'
}

function tertiaryHeader(kind: CatalogKind) {
  if (kind === 'commodity') return 'Season'
  if (kind === 'grade') return 'Description'
  if (kind === 'unit') return 'Kind'
  if (kind === 'location') return 'Code'
  return 'Sample rate'
}
