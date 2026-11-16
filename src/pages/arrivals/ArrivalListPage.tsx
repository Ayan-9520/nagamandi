import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { PageHeader } from '@/components/common/PageHeader'
import { LoadingState } from '@/components/common/LoadingState'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { RegistryTable, type RegistryColumn } from '@/features/registry/RegistryTable'
import { ArrivalNotice, ArrivalStatusBadge } from '@/features/arrivals/ArrivalBits'
import { formatQty, statusLabel } from '@/features/arrivals/meta'
import { useArrivalStore } from '@/store/arrival-store'
import { ARRIVAL_STATUSES, type ArrivalLot, type ArrivalStatus } from '@/types/arrival'

export function ArrivalListPage({ mode }: { mode: 'register' | 'crates' }) {
  const ready = useArrivalStore((state) => state.ready)
  const lots = useArrivalStore((state) => state.lots)
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState<ArrivalStatus | 'all'>('all')
  const rows = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return lots.filter((row) => {
      if (mode === 'crates' && (row.crateCount <= 0 || row.status === 'dispatched' || row.status === 'cancelled')) return false
      if (mode === 'register' && status !== 'all' && row.status !== status) return false
      if (!needle) return true
      return [row.arrivalNo, row.lotNo, row.sellerLabel, row.aadathiyaLabel, row.commodityName, row.vehicleNo, row.crateCode].join(' ').toLowerCase().includes(needle)
    })
  }, [lots, mode, query, status])

  const columns: RegistryColumn<ArrivalLot>[] = [
    { id: 'lot', header: 'Lot', sortValue: (row) => row.lotNo, cell: (row) => row.lotNo },
    { id: 'seller', header: 'Seller', sortValue: (row) => row.sellerLabel, cell: (row) => row.sellerLabel },
    { id: 'goods', header: 'Commodity', sortValue: (row) => row.commodityName, cell: (row) => `${row.commodityName} · ${row.gradeName}` },
    { id: 'qty', header: 'Quantity', sortValue: (row) => row.quantity, cell: (row) => formatQty(row.quantity, row.unitSymbol) },
    mode === 'crates'
      ? { id: 'crates', header: 'Crates', sortValue: (row) => row.crateCount, cell: (row) => `${row.crateCount} · ${row.crateCode}` }
      : { id: 'vehicle', header: 'Vehicle', sortValue: (row) => row.vehicleNo, cell: (row) => row.vehicleNo },
    { id: 'status', header: 'Status', sortValue: (row) => row.status, cell: (row) => <ArrivalStatusBadge status={row.status} /> },
    { id: 'open', header: 'Open', cell: (row) => <Button type="button" size="sm" variant="outline" asChild><Link to={`/arrivals/${row.id}`}>Open</Link></Button> },
  ]

  if (!ready) return <LoadingState label="Loading the demonstration register" />

  return (
    <div className="space-y-4">
      <PageHeader
        eyebrow="DEMO · gate"
        title={mode === 'crates' ? 'Crate inventory' : 'Arrival register'}
        description={mode === 'crates'
          ? 'Crates still on the demonstration yard. Dispatched and cancelled lots are left out.'
          : 'Every demonstration arrival and lot stored in this browser.'}
        actions={<Button type="button" variant="outline" asChild><Link to="/arrivals">Arrival desk</Link></Button>}
      />
      <ArrivalNotice />
      <div className="grid gap-3 md:grid-cols-2">
        <div className="grid gap-1.5">
          <Label htmlFor="arrival-search">Search</Label>
          <Input id="arrival-search" value={query} placeholder="Lot, seller, commodity or vehicle" onChange={(event) => setQuery(event.target.value)} />
        </div>
        {mode === 'register' ? (
          <div className="grid gap-1.5">
            <Label>Status</Label>
            <Select value={status} onValueChange={(value) => setStatus(value as ArrivalStatus | 'all')}>
              <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                {ARRIVAL_STATUSES.map((item) => <SelectItem key={item} value={item}>{statusLabel(item)}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        ) : null}
      </div>
      <RegistryTable
        columns={columns}
        rows={rows}
        getRowId={(row) => row.id}
        caption={mode === 'crates' ? 'Demonstration crates' : 'Demonstration arrivals'}
        emptyTitle="No lots match"
        emptyDescription="Change the search or status, or register a new arrival."
        resetKey={`${query}:${status}:${mode}`}
      />
    </div>
  )
}
