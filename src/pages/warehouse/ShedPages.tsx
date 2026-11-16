import { Link } from 'react-router-dom'
import { PageSlice } from '@/components/common/ArticleList'
import { LoadingState } from '@/components/common/LoadingState'
import { PageHeader } from '@/components/common/PageHeader'
import { Button } from '@/components/ui/button'
import { ShedBadge, WarehouseNotice } from '@/features/warehouse/WarehouseBits'
import { daysUntil, formatUnits, issuedContract, needsAlert, occupancy, stockLines } from '@/services/warehouse-rules'
import { useWarehouseStore } from '@/store/warehouse-store'

export function DirectoryPage() {
  const ready = useWarehouseStore((state) => state.ready)
  const sheds = useWarehouseStore((state) => state.sheds)
  const contracts = useWarehouseStore((state) => state.contracts)
  if (!ready) return <LoadingState label="Loading the shed directory" />
  return (
    <div className="space-y-4">
      <PageHeader eyebrow="SOP-004" title="Warehouse directory" description="Sample sheds at Dimapur Central. Allocation follows an issued contract." actions={<Button type="button" variant="outline" asChild><Link to="/warehouses">Warehouse desk</Link></Button>} />
      <WarehouseNotice />
      {sheds.map((shed) => {
        const contract = issuedContract(contracts, shed.id)
        return (
          <article key={shed.id} className="rounded-xl bg-card px-4 py-3 text-sm ring-1 ring-foreground/10">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-medium">{shed.code} · {shed.name}</p>
              <ShedBadge tone={contract ? 'ok' : 'muted'}>{contract ? contract.operatorLabel : 'Unallocated'}</ShedBadge>
            </div>
            <p className="mt-1">Capacity {formatUnits(shed.capacityUnits)} q · {shed.mandiId}</p>
          </article>
        )
      })}
    </div>
  )
}

export function OccupancyPage() {
  const ready = useWarehouseStore((state) => state.ready)
  const sheds = useWarehouseStore((state) => state.sheds)
  const moves = useWarehouseStore((state) => state.moves)
  if (!ready) return <LoadingState label="Loading occupancy" />
  return (
    <div className="space-y-4">
      <PageHeader eyebrow="SOP-005" title="Occupancy dashboard" description="Used space is the net of inward and outward movements. It is not the yard-sample occupancy chart." actions={<Button type="button" variant="outline" asChild><Link to="/warehouses">Warehouse desk</Link></Button>} />
      <WarehouseNotice />
      {sheds.map((shed) => {
        const row = occupancy(shed, moves)
        return (
          <article key={shed.id} className="rounded-xl bg-card px-4 py-3 text-sm ring-1 ring-foreground/10">
            <p className="font-medium">{shed.code} · {row.percent}%</p>
            <p className="mt-1">Inside {formatUnits(row.used)} q · Free {formatUnits(row.free)} q · Capacity {formatUnits(shed.capacityUnits)} q</p>
          </article>
        )
      })}
    </div>
  )
}

export function InventoryPage() {
  const ready = useWarehouseStore((state) => state.ready)
  const sheds = useWarehouseStore((state) => state.sheds)
  const moves = useWarehouseStore((state) => state.moves)
  if (!ready) return <LoadingState label="Loading the inventory register" />
  const lines = stockLines({ sheds, moves })
  return (
    <div className="space-y-4">
      <PageHeader eyebrow="SOP-005" title="Inventory register" description="On-hand produce is tied to a gate lot. The history below is every simulated movement." actions={<Button type="button" variant="outline" asChild><Link to="/warehouses">Warehouse desk</Link></Button>} />
      <WarehouseNotice />
      {lines.length === 0 ? <p className="text-sm text-muted-foreground">No stock is inside a shed.</p> : null}
      {lines.map((row) => (
        <article key={`${row.shedId}-${row.lotId}`} className="rounded-xl bg-card px-4 py-3 text-sm ring-1 ring-foreground/10">
          <p className="font-medium">{row.shedCode} · {row.lotNo}</p>
          <p className="mt-1">{row.commodityName} · {row.gradeName} · {formatUnits(row.units)} {row.unitSymbol} · {row.partyLabel}</p>
        </article>
      ))}
      <h2 className="font-display text-xl">Movement history</h2>
      {moves.map((move) => (
        <article key={move.id} className="rounded-xl bg-card px-4 py-3 text-sm ring-1 ring-foreground/10">
          <p className="font-medium">{move.moveNo} · {move.kind} · {move.shedCode}</p>
          <p className="mt-1">{move.lotNo} · {formatUnits(move.quantityUnits)} {move.unitSymbol} · {move.commodityName}</p>
          <p className="mt-1 text-muted-foreground">{move.note}</p>
        </article>
      ))}
    </div>
  )
}

export function AlertsPage() {
  const ready = useWarehouseStore((state) => state.ready)
  const contracts = useWarehouseStore((state) => state.contracts)
  const insurance = useWarehouseStore((state) => state.insurance)
  if (!ready) return <LoadingState label="Loading expiry alerts" />
  const contractAlerts = contracts.filter((row) => row.status === 'issued' && needsAlert(row.end))
  const coverAlerts = insurance.filter((row) => needsAlert(row.until))
  return (
    <div className="space-y-4">
      <PageHeader eyebrow="SOP-004" title="Contract expiry alerts" description="Issued contracts and simulated cover that end within 30 days of 14 Nov 2026, or that have already passed that day." actions={<Button type="button" variant="outline" asChild><Link to="/warehouses">Warehouse desk</Link></Button>} />
      <WarehouseNotice />
      <PageSlice
        rows={[
          ...contractAlerts.map((row) => ({ id: row.id, text: `${row.contractNo} · ${row.shedCode} · ${row.operatorLabel}`, detail: `Ends ${row.end} · ${daysUntil(row.end)} days from the sample day`, to: `/warehouses/contracts/${row.id}` })),
          ...coverAlerts.map((row) => ({ id: row.id, text: `${row.policyNo} · ${row.shedCode}`, detail: `Simulated cover ends ${row.until} · ${daysUntil(row.until)} days from the sample day`, to: '' })),
        ]}
        empty="No expiry falls inside the 30-day sample window."
        render={(row) => (
          <article key={row.id} className="rounded-xl bg-card px-4 py-3 text-sm ring-1 ring-foreground/10">
            <p className="font-medium">{row.text}</p>
            <p className="mt-1">{row.detail}</p>
            {row.to ? <Button type="button" size="sm" variant="outline" className="mt-2" asChild><Link to={row.to}>Open contract</Link></Button> : null}
          </article>
        )}
      />
    </div>
  )
}
