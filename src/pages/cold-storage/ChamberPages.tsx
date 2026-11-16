import { Link } from 'react-router-dom'
import { PageSlice } from '@/components/common/ArticleList'
import { LoadingState } from '@/components/common/LoadingState'
import { PageHeader } from '@/components/common/PageHeader'
import { Button } from '@/components/ui/button'
import { ChamberBadge, ColdNotice } from '@/features/cold-storage/ColdBits'
import { alertRows, formatTenths, formatUnits, issuedContract, occupancy } from '@/services/cold-rules'
import { useColdStore } from '@/store/cold-store'

export function DirectoryPage() {
  const ready = useColdStore((state) => state.ready)
  const chambers = useColdStore((state) => state.chambers)
  const contracts = useColdStore((state) => state.contracts)
  if (!ready) return <LoadingState label="Loading the chamber directory" />
  return (
    <div className="space-y-4">
      <PageHeader eyebrow="SOP-006" title="Cold storage facility directory" description="Sample chambers at Dimapur Central. Allocation follows an issued contract. Temperature bands are demonstration limits." actions={<Button type="button" variant="outline" asChild><Link to="/cold-storage">Cold storage desk</Link></Button>} />
      <ColdNotice />
      {chambers.map((chamber) => {
        const issued = issuedContract(contracts, chamber.id)
        return (
          <article key={chamber.id} className="rounded-xl bg-card px-4 py-3 text-sm ring-1 ring-foreground/10">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-medium">{chamber.code} · {chamber.name}</p>
              <ChamberBadge tone={issued ? 'ok' : 'muted'}>{issued ? `Allocated · ${issued.operatorLabel}` : 'Open'}</ChamberBadge>
            </div>
            <p className="mt-1 text-muted-foreground">Band {formatTenths(chamber.minTenths)} to {formatTenths(chamber.maxTenths)} · setpoint {formatTenths(chamber.setpointTenths)} · capacity {formatUnits(chamber.capacityUnits)} q</p>
          </article>
        )
      })}
    </div>
  )
}

export function AllocationPage() {
  const ready = useColdStore((state) => state.ready)
  const chambers = useColdStore((state) => state.chambers)
  const contracts = useColdStore((state) => state.contracts)
  const moves = useColdStore((state) => state.moves)
  if (!ready) return <LoadingState label="Loading allocation" />
  return (
    <div className="space-y-4">
      <PageHeader eyebrow="SOP-007" title="Storage allocation" description="A chamber is allocated when an issued contract points at it. Used space is the net of inward and outward movements in this book." actions={<Button type="button" variant="outline" asChild><Link to="/cold-storage">Cold storage desk</Link></Button>} />
      <ColdNotice />
      {chambers.map((chamber) => {
        const issued = issuedContract(contracts, chamber.id)
        const space = occupancy(chamber, moves)
        return (
          <article key={chamber.id} className="rounded-xl bg-card px-4 py-3 text-sm ring-1 ring-foreground/10">
            <p className="font-medium">{chamber.code} · {issued ? issued.contractNo : 'Not allocated'}</p>
            <p className="mt-1">{formatUnits(space.used)} q used · {formatUnits(space.free)} q free · {space.percent}%</p>
          </article>
        )
      })}
      <h2 className="font-display text-xl">Movement history</h2>
      {moves.map((move) => (
        <article key={move.id} className="rounded-xl bg-card px-4 py-3 text-sm ring-1 ring-foreground/10">
          <p className="font-medium">{move.moveNo} · {move.kind} · {move.chamberCode}</p>
          <p className="mt-1">{move.lotNo} · {formatUnits(move.quantityUnits)} q · {move.commodityName}</p>
          <p className="mt-1 text-muted-foreground">{move.note}</p>
        </article>
      ))}
    </div>
  )
}

export function AlertsPage() {
  const ready = useColdStore((state) => state.ready)
  const chambers = useColdStore((state) => state.chambers)
  const contracts = useColdStore((state) => state.contracts)
  const insurance = useColdStore((state) => state.insurance)
  const readings = useColdStore((state) => state.readings)
  const incidents = useColdStore((state) => state.incidents)
  if (!ready) return <LoadingState label="Loading compliance alerts" />
  const rows = alertRows({ chambers, contracts, insurance, readings, incidents })
  return (
    <div className="space-y-4">
      <PageHeader eyebrow="SOP-007" title="Compliance alerts" description="Warnings use the latest reading against the demo band, issued contracts and cover ending within 30 days of 14 Nov 2026, and open incident notes." actions={<Button type="button" variant="outline" asChild><Link to="/cold-storage">Cold storage desk</Link></Button>} />
      <ColdNotice />
      <PageSlice rows={rows} empty="No compliance alert is open in this browser." render={(row) => (
        <article key={row.id} className="rounded-xl bg-card px-4 py-3 text-sm ring-1 ring-foreground/10">
          <p className="font-medium">{row.title}</p>
          <p className="mt-1 text-muted-foreground">{row.detail}</p>
          <Button type="button" size="sm" variant="outline" className="mt-2" asChild><Link to={row.to}>Open</Link></Button>
        </article>
      )} />
    </div>
  )
}
