import { useMemo, useState, type ReactNode } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { EmptyState } from '@/components/common/EmptyState'
import { LoadingState } from '@/components/common/LoadingState'
import { PageHeader } from '@/components/common/PageHeader'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ActivityList, DocumentList, RecordStatusBadge, RemoveDialog } from '@/features/registry/RegistryBits'
import { statusLabel } from '@/features/licences/meta'
import { partyBasePath, partyRegister } from '@/features/registry/meta'
import { mandiName } from '@/services/registry-rules'
import { formatQty, statusLabel as arrivalStatusLabel } from '@/features/arrivals/meta'
import { formatRupee, tradeStatusLabel } from '@/features/trading/meta'
import { getRole } from '@/mocks/permissions'
import { useArrivalStore } from '@/store/arrival-store'
import { useTradeStore } from '@/store/trade-store'
import { useFinanceStore } from '@/store/finance-store'
import { useWarehouseStore } from '@/store/warehouse-store'
import { useColdStore } from '@/store/cold-store'
import { useFlpStore } from '@/store/flp-store'
import { useParkingStore } from '@/store/parking-store'
import { useFacilityStore } from '@/store/facility-store'
import { contractLabel } from '@/features/warehouse/meta'
import { contractLabel as coldContractLabel } from '@/features/cold-storage/meta'
import { formatPaise } from '@/services/money'
import { creditLabel } from '@/features/finance/meta'
import { useLicenceStore } from '@/store/licence-store'
import { useRegistryStore } from '@/store/registry-store'
import { useSessionStore } from '@/store/session-store'
import type { PartyKind } from '@/types/registry'
import { formatDateTime } from '@/utils/format'
import { cn } from '@/utils/cn'

const tabs = [
  { id: 'overview', label: 'Overview' },
  { id: 'documents', label: 'Documents' },
  { id: 'transactions', label: 'Transactions' },
  { id: 'licences', label: 'Licences' },
  { id: 'activity', label: 'Activity History' },
] as const

type TabId = (typeof tabs)[number]['id']

export function PartyDetailPage({ kind }: { kind: PartyKind }) {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const meta = partyRegister(kind)
  const ready = useRegistryStore((state) => state.ready)
  const party = useRegistryStore((state) => state.parties.find((item) => item.id === id && item.kind === kind))
  const locations = useRegistryStore((state) => state.locations)
  const commodities = useRegistryStore((state) => state.commodities)
  const activityRows = useRegistryStore((state) => state.activities)
  const transactionRows = useRegistryStore((state) => state.transactions)
  const licenceRows = useRegistryStore((state) => state.licences)
  const sopRows = useLicenceStore((state) => state.cases)
  const arrivalRows = useArrivalStore((state) => state.lots)
  const tradeRows = useTradeStore((state) => state.trades)
  const creditRows = useFinanceStore((state) => state.creditNotes)
  const debitRows = useFinanceStore((state) => state.debitNotes)
  const warehouseContracts = useWarehouseStore((state) => state.contracts)
  const coldContracts = useColdStore((state) => state.contracts)
  const flpBatches = useFlpStore((state) => state.batches)
  const parkingVisits = useParkingStore((state) => state.visits)
  const facilityLeases = useFacilityStore((state) => state.leases)
  const roleId = useSessionStore((state) => state.roleId)
  const activities = useMemo(
    () => activityRows.filter((item) => item.recordId === id).sort((left, right) => right.at.localeCompare(left.at)),
    [activityRows, id],
  )
  const transactions = useMemo(() => transactionRows.filter((item) => item.partyId === id), [transactionRows, id])
  const licences = useMemo(() => licenceRows.filter((item) => item.partyId === id), [licenceRows, id])
  const sopCases = useMemo(() => sopRows.filter((item) => item.partyId === id), [sopRows, id])
  const gateLots = useMemo(
    () => arrivalRows.filter((item) => item.sellerId === id || item.aadathiyaId === id),
    [arrivalRows, id],
  )
  const floorTrades = useMemo(
    () => tradeRows.filter((item) => item.sellerId === id || item.buyerId === id || item.aadathiyaId === id),
    [tradeRows, id],
  )
  const financeNotes = useMemo(
    () => [
      ...creditRows
        .filter((item) => item.sellerId === id || item.aadathiyaId === id)
        .map((item) => ({ id: item.id, title: item.noteNo, detail: `${item.sellerLabel} · ${creditLabel(item.status)} · ${formatPaise(item.amountPaise)}`, to: '/finance/credit-notes' })),
      ...debitRows
        .filter((item) => item.buyerId === id || item.aadathiyaId === id)
        .map((item) => ({ id: item.id, title: item.noteNo, detail: `${item.buyerLabel} · ${creditLabel(item.status)} · ${formatPaise(item.amountPaise)}`, to: '/finance/debit-notes' })),
    ],
    [creditRows, debitRows, id],
  )
  const shedContracts = useMemo(
    () => warehouseContracts.filter((item) => item.operatorId === id),
    [warehouseContracts, id],
  )
  const chamberContracts = useMemo(
    () => coldContracts.filter((item) => item.operatorId === id),
    [coldContracts, id],
  )
  const sellerBatches = useMemo(
    () => flpBatches.filter((item) => item.sellerId === id),
    [flpBatches, id],
  )
  const transporterVisits = useMemo(
    () => parkingVisits.filter((item) => item.transporterId === id),
    [parkingVisits, id],
  )
  const operatorLeases = useMemo(
    () => facilityLeases.filter((item) => item.operatorId === id),
    [facilityLeases, id],
  )
  const canOpenArrivals = roleId ? getRole(roleId).modules.includes('arrivals') : false
  const canOpenTrading = roleId ? getRole(roleId).modules.includes('trading') : false
  const canOpenFinance = roleId ? getRole(roleId).modules.includes('finance') : false
  const canOpenWarehouse = roleId ? getRole(roleId).modules.includes('warehouses') : false
  const canOpenCold = roleId ? getRole(roleId).modules.includes('cold-storage') : false
  const canOpenFlp = roleId ? getRole(roleId).modules.includes('post-harvest') : false
  const canOpenParking = roleId ? getRole(roleId).modules.includes('parking') : false
  const canOpenFacilities = roleId ? getRole(roleId).modules.includes('facilities') : false
  const removeParty = useRegistryStore((state) => state.removeParty)
  const restoreParty = useRegistryStore((state) => state.restoreParty)
  const [tab, setTab] = useState<TabId>('overview')
  const [removeOpen, setRemoveOpen] = useState(false)

  if (!ready) return <LoadingState label="Loading the demonstration register" />
  if (!party) {
    return (
      <EmptyState
        title="Record not in this browser"
        description="That demonstration id is not on this register."
        actionLabel="Back to the list"
        onAction={() => navigate(partyBasePath(kind))}
      />
    )
  }

  const commodity = commodities.find((item) => item.id === party.commodityId)

  function confirmRemove() {
    const result = removeParty(party!.id)
    setRemoveOpen(false)
    if (!result.ok) {
      toast.error(result.message)
      return
    }
    toast.success('The demonstration row was marked removed.')
  }

  function restore() {
    const result = restoreParty(party!.id)
    if (!result.ok) toast.error(result.message)
    else toast.success('The demonstration row is back on the working list.')
  }

  return (
    <div className="space-y-4">
      <PageHeader
        eyebrow="DEMO"
        title={party.label}
        description={`${party.id} · ${meta.title}. This is a demonstration desk code, not an officer or grower record.`}
        actions={
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" asChild>
              <Link to={partyBasePath(kind)}>Back to list</Link>
            </Button>
            <Button type="button" asChild>
              <Link to={`${partyBasePath(kind)}/${party.id}/edit`}>Edit</Link>
            </Button>
            {party.status === 'Removed' ? (
              <Button type="button" variant="outline" onClick={restore}>Restore</Button>
            ) : (
              <Button type="button" variant="destructive" onClick={() => setRemoveOpen(true)}>Remove</Button>
            )}
          </div>
        }
      />
      <div role="tablist" aria-label="Stakeholder record" className="flex gap-1 overflow-x-auto border-b">
        {tabs.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            id={`tab-${item.id}`}
            aria-selected={tab === item.id}
            aria-controls={`panel-${item.id}`}
            className={cn(
              'shrink-0 border-b-2 px-3 py-2 text-sm',
              tab === item.id ? 'border-primary font-medium text-foreground' : 'border-transparent text-muted-foreground',
            )}
            onClick={() => setTab(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>
      <div role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`} className="space-y-4">
        {tab === 'overview' ? (
          <Card>
            <CardHeader>
              <CardTitle>Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid gap-3 text-sm sm:grid-cols-2">
                <Field label="Registration id" value={party.id} />
                <Field label="Status" value={<RecordStatusBadge status={party.status} />} />
                <Field label="Mandi" value={mandiName(locations, party.mandiId)} />
                <Field label="Mandi id" value={party.mandiId} />
                <Field label="Area code" value={party.area} />
                <Field label="Phone" value={party.phone} />
                {commodity ? <Field label="Commodity" value={commodity.name} /> : null}
                {party.vehicleNo ? <Field label="Vehicle" value={party.vehicleNo} /> : null}
                {party.siteCode ? <Field label={meta.siteLabel} value={party.siteCode} /> : null}
                <Field label="Updated" value={formatDateTime(party.updatedAt)} />
                <div className="sm:col-span-2">
                  <dt className="text-muted-foreground">Note</dt>
                  <dd>{party.notes || 'No note.'}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>
        ) : null}
        {tab === 'documents' ? (
          <Card>
            <CardHeader>
              <CardTitle>Documents</CardTitle>
            </CardHeader>
            <CardContent>
              <DocumentList documents={party.documents} />
            </CardContent>
          </Card>
        ) : null}
        {tab === 'transactions' ? (
          <Card>
            <CardHeader>
              <CardTitle>Transactions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm text-muted-foreground">Gate lots, floor trades, simulated finance notes, warehouse contracts, cold storage contracts, FLP batches, parking visits and facility leases. A contract is not a deed. A batch is not a process certificate. A visit is not a gate pass. A facility lease is not a booking.</p>
              {gateLots.map((item) => (
                <article key={item.id} className="rounded-lg border px-3 py-2 text-sm">
                  <p className="font-medium">{item.lotNo}</p>
                  <p>{item.commodityName} · {formatQty(item.quantity, item.unitSymbol)} · {arrivalStatusLabel(item.status)}</p>
                  {canOpenArrivals ? (
                    <Button type="button" variant="outline" size="sm" className="mt-2" asChild>
                      <Link to={`/arrivals/${item.id}`}>Open on the arrival desk</Link>
                    </Button>
                  ) : null}
                </article>
              ))}
              {floorTrades.map((item) => (
                <article key={item.id} className="rounded-lg border px-3 py-2 text-sm">
                  <p className="font-medium">{item.tradeNo}</p>
                  <p>{item.commodityName} · {formatRupee(item.figures.saleValue)} · {tradeStatusLabel(item.status)}</p>
                  {canOpenTrading ? (
                    <Button type="button" variant="outline" size="sm" className="mt-2" asChild>
                      <Link to={`/trading/${item.id}`}>Open on the trading desk</Link>
                    </Button>
                  ) : null}
                </article>
              ))}
              {financeNotes.map((item) => (
                <article key={item.id} className="rounded-lg border px-3 py-2 text-sm">
                  <p className="font-medium">{item.title}</p>
                  <p>{item.detail} · DEMO / SIMULATED</p>
                  {canOpenFinance ? (
                    <Button type="button" variant="outline" size="sm" className="mt-2" asChild>
                      <Link to={item.to}>Open on the finance desk</Link>
                    </Button>
                  ) : null}
                </article>
              ))}
              {shedContracts.map((item) => (
                <article key={item.id} className="rounded-lg border px-3 py-2 text-sm">
                  <p className="font-medium">{item.contractNo}</p>
                  <p>{item.shedCode} · {contractLabel(item.status)} · DEMO / SIMULATED</p>
                  {canOpenWarehouse ? (
                    <Button type="button" variant="outline" size="sm" className="mt-2" asChild>
                      <Link to={`/warehouses/contracts/${item.id}`}>Open on the warehouse desk</Link>
                    </Button>
                  ) : null}
                </article>
              ))}
              {chamberContracts.map((item) => (
                <article key={item.id} className="rounded-lg border px-3 py-2 text-sm">
                  <p className="font-medium">{item.contractNo}</p>
                  <p>{item.chamberCode} · {coldContractLabel(item.status)} · DEMO / SIMULATED</p>
                  {canOpenCold ? (
                    <Button type="button" variant="outline" size="sm" className="mt-2" asChild>
                      <Link to={`/cold-storage/contracts/${item.id}`}>Open on the cold storage desk</Link>
                    </Button>
                  ) : null}
                </article>
              ))}
              {sellerBatches.map((item) => (
                <article key={item.id} className="rounded-lg border px-3 py-2 text-sm">
                  <p className="font-medium">{item.batchNo}</p>
                  <p>{item.lotNo} · {item.unitCode} · DEMO / SIMULATED</p>
                  {canOpenFlp ? (
                    <Button type="button" variant="outline" size="sm" className="mt-2" asChild>
                      <Link to={`/post-harvest/batches/${item.id}`}>Open on the FLP desk</Link>
                    </Button>
                  ) : null}
                </article>
              ))}
              {transporterVisits.map((item) => (
                <article key={item.id} className="rounded-lg border px-3 py-2 text-sm">
                  <p className="font-medium">{item.visitNo}</p>
                  <p>{item.vehicleNo} · {item.slotCode} · DEMO / SIMULATED</p>
                  {canOpenParking ? (
                    <Button type="button" variant="outline" size="sm" className="mt-2" asChild>
                      <Link to={item.passNo ? `/parking/passes/${item.passNo}` : '/parking/movements'}>Open on the parking desk</Link>
                    </Button>
                  ) : null}
                </article>
              ))}
              {operatorLeases.map((item) => (
                <article key={item.id} className="rounded-lg border px-3 py-2 text-sm">
                  <p className="font-medium">{item.leaseNo}</p>
                  <p>{item.siteCode} · DEMO / SIMULATED</p>
                  {canOpenFacilities ? (
                    <Button type="button" variant="outline" size="sm" className="mt-2" asChild>
                      <Link to={`/facilities/leases/${item.id}`}>Open on the facilities desk</Link>
                    </Button>
                  ) : null}
                </article>
              ))}
              {transactions.length === 0 && gateLots.length === 0 && floorTrades.length === 0 && financeNotes.length === 0 && shedContracts.length === 0 && chamberContracts.length === 0 && sellerBatches.length === 0 && transporterVisits.length === 0 && operatorLeases.length === 0 ? <p className="text-sm">No sample transaction is linked to this desk code.</p> : null}
              {transactions.map((item) => (
                <article key={item.id} className="rounded-lg border px-3 py-2 text-sm">
                  <p className="font-medium">{item.id}</p>
                  <p>{item.summary}</p>
                  <p className="text-xs text-muted-foreground">{formatDateTime(item.at)} · {item.amountLabel}</p>
                </article>
              ))}
            </CardContent>
          </Card>
        ) : null}
        {tab === 'licences' ? (
          <Card>
            <CardHeader>
              <CardTitle>Licences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm text-muted-foreground">SOP-001 cases are simulations. The older sample bands below are not issued licences.</p>
              {sopCases.length === 0 ? <p className="text-sm">No SOP-001 case is linked to this desk code.</p> : null}
              {sopCases.map((item) => (
                <article key={item.id} className="rounded-lg border px-3 py-2 text-sm">
                  <p className="font-medium">{item.licenceNo ?? item.id}</p>
                  <p>{statusLabel(item.status)} · {item.applicantLabel}</p>
                  <Button type="button" variant="outline" size="sm" className="mt-2" asChild>
                    <Link to={`/licences/${item.id}`}>Open on the licence desk</Link>
                  </Button>
                </article>
              ))}
              {licences.map((item) => (
                <article key={item.id} className="rounded-lg border px-3 py-2 text-sm">
                  <p className="font-medium">{item.label} · {item.id}</p>
                  <p className="text-xs text-muted-foreground">{item.band}</p>
                  <p>{item.detail}</p>
                </article>
              ))}
            </CardContent>
          </Card>
        ) : null}
        {tab === 'activity' ? (
          <Card>
            <CardHeader>
              <CardTitle>Activity History</CardTitle>
            </CardHeader>
            <CardContent>
              <ActivityList entries={activities} />
            </CardContent>
          </Card>
        ) : null}
      </div>
      <RemoveDialog open={removeOpen} title={party.label} onCancel={() => setRemoveOpen(false)} onConfirm={confirmRemove} />
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
