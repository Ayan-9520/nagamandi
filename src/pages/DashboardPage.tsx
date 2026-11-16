import { zodResolver } from '@hookform/resolvers/zod'
import {
  BadgeCheck,
  IndianRupee,
  Snowflake,
  ShieldCheck,
  Scale,
  Truck,
  Warehouse,
} from 'lucide-react'
import { useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { useSearchParams } from 'react-router-dom'
import { z } from 'zod'
import { ChartCard } from '@/components/common/ChartCard'
import { DataTable, type DataColumn } from '@/components/common/DataTable'
import { EmptyState } from '@/components/common/EmptyState'
import { ErrorState } from '@/components/common/ErrorState'
import { FilterBar } from '@/components/common/FilterBar'
import { LoadingState } from '@/components/common/LoadingState'
import { StatCard } from '@/components/common/StatCard'
import { StatusBadge } from '@/components/common/StatusBadge'
import { Button } from '@/components/ui/button'
import { SelectItem } from '@/components/ui/select'
import { SelectField } from '@/components/forms/SelectField'
import { ArrivalBoard } from '@/features/arrivals/ArrivalBoard'
import { TradeBoard } from '@/features/trading/TradeBoard'
import { FinanceBoard } from '@/features/finance/FinanceBoard'
import { WarehouseBoard } from '@/features/warehouse/WarehouseBoard'
import { ColdBoard } from '@/features/cold-storage/ColdBoard'
import { FlpBoard } from '@/features/flp/FlpBoard'
import { ParkingBoard } from '@/features/parking/ParkingBoard'
import { FacilityBoard } from '@/features/facilities/FacilityBoard'
import { CommandBoard } from '@/features/compliance/CommandBoard'
import { ArrivalChart } from '@/features/dashboard/ArrivalChart'
import { ArrivalDialog } from '@/features/dashboard/ArrivalDialog'
import { RoleHome } from '@/features/dashboard/RoleHome'
import { LicenceStatusChart } from '@/features/dashboard/LicenceStatusChart'
import { TradeVolumeChart } from '@/features/dashboard/TradeVolumeChart'
import { useDashboard } from '@/hooks/use-dashboard'
import { AS_OF, YARDS, yardName } from '@/mocks/catalog'
import { getRole } from '@/mocks/permissions'
import { canSeeLots } from '@/services/access'
import { lookupLot } from '@/services/search-service'
import { useDemoStore } from '@/store/demo-store'
import { useSessionStore } from '@/store/session-store'
import { COMMODITIES, type DashboardFilter, type DataScenario, type GateLot } from '@/types/domain'
import { formatDateTime, formatInrFromLakh, formatMt, formatNumber, formatPercent } from '@/utils/format'

const filterSchema = z.object({
  yardId: z.string().min(1),
  commodity: z.string().min(1),
  days: z.enum(['7', '14', '30']),
})

const defaultFilters: DashboardFilter = {
  yardId: 'all',
  commodity: 'all',
  days: '30',
}

const scenarioOptions: { value: DataScenario; label: string }[] = [
  { value: 'success', label: 'Operating sample' },
  { value: 'empty', label: 'Empty sample' },
  { value: 'error', label: 'Error sample' },
]

export function DashboardPage() {
  const roleId = useSessionStore((state) => state.roleId)
  const permission = roleId ? getRole(roleId) : null
  const showLots = roleId ? canSeeLots(roleId) : false
  const scenario = useDemoStore((state) => state.scenario)
  const setScenario = useDemoStore((state) => state.setScenario)
  const [params, setParams] = useSearchParams()
  const form = useForm<DashboardFilter>({
    resolver: zodResolver(filterSchema),
    defaultValues: defaultFilters,
  })
  const yardId = form.watch('yardId')
  const commodity = form.watch('commodity')
  const days = form.watch('days')
  const filters = useMemo<DashboardFilter>(
    () => ({ yardId, commodity, days }),
    [yardId, commodity, days],
  )
  const { data, state, error, reload, refreshing } = useDashboard(filters)
  const lotId = params.get('lot')
  const selectedLot = lotId ? lookupLot(lotId) : null

  useEffect(() => {
    if (lotId && !selectedLot) {
      const next = new URLSearchParams(params)
      next.delete('lot')
      setParams(next, { replace: true })
    }
  }, [lotId, params, selectedLot, setParams])

  function openLot(id: string) {
    const next = new URLSearchParams(params)
    next.set('lot', id)
    setParams(next)
  }

  function closeLot(open: boolean) {
    if (open) return
    const next = new URLSearchParams(params)
    next.delete('lot')
    setParams(next, { replace: true })
  }

  const columns: DataColumn<GateLot>[] = [
    {
      id: 'id',
      header: 'Lot',
      sortValue: (row) => row.id,
      cell: (row) => <span className="font-medium">{row.id}</span>,
    },
    {
      id: 'arrived',
      header: 'Arrived',
      sortValue: (row) => row.arrivedAt,
      cell: (row) => formatDateTime(row.arrivedAt),
    },
    {
      id: 'yard',
      header: 'Yard',
      sortValue: (row) => yardName(row.yardId),
      cell: (row) => yardName(row.yardId),
    },
    {
      id: 'commodity',
      header: 'Commodity',
      sortValue: (row) => row.commodity,
      cell: (row) => row.commodity,
    },
    {
      id: 'quantity',
      header: 'Quantity',
      sortValue: (row) => row.quantityMt,
      cell: (row) => formatMt(row.quantityMt),
    },
    {
      id: 'status',
      header: 'Status',
      sortValue: (row) => row.status,
      cell: (row) => <StatusBadge status={row.status} />,
    },
    {
      id: 'action',
      header: 'Record',
      cell: (row) => (
        <Button type="button" variant="outline" size="sm" onClick={() => openLot(row.id)}>
          View
        </Button>
      ),
    },
  ]

  if (!permission) return null

  return (
    <div className="space-y-8">
      <RoleHome permission={permission} />
      {permission.modules.includes('arrivals') ? <ArrivalBoard /> : null}
      {permission.modules.includes('trading') ? <TradeBoard /> : null}
      {permission.modules.includes('finance') ? <FinanceBoard /> : null}
      {permission.modules.includes('warehouses') ? <WarehouseBoard /> : null}
      {permission.modules.includes('cold-storage') ? <ColdBoard /> : null}
      {permission.modules.includes('post-harvest') ? <FlpBoard /> : null}
      {permission.modules.includes('parking') ? <ParkingBoard /> : null}
      {permission.modules.includes('facilities') ? <FacilityBoard /> : null}
      {permission.modules.includes('compliance') ? <CommandBoard /> : null}
      {permission.operationsDesk ? (
      <>
      <div className="space-y-1">
        <h2 className="font-display text-2xl tracking-tight">Yard sample</h2>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Fictional yard activity for the Nagaland Mandi demonstration, held at {formatDateTime(`${AS_OF}T12:00:00+05:30`)}. Nothing on this desk is a licence, payment or settlement.
        </p>
      </div>
      <FilterBar onReset={() => form.reset(defaultFilters)}>
        <SelectField label="Yard" value={yardId} onValueChange={(value) => form.setValue('yardId', value)}>
          <SelectItem value="all">All yards</SelectItem>
          {YARDS.map((yard) => (
            <SelectItem key={yard.id} value={yard.id}>
              {yard.name}
            </SelectItem>
          ))}
        </SelectField>
        <SelectField
          label="Commodity"
          value={commodity}
          onValueChange={(value) => form.setValue('commodity', value)}
          hint="Arrivals and trade only"
        >
          <SelectItem value="all">All commodities</SelectItem>
          {COMMODITIES.map((item) => (
            <SelectItem key={item} value={item}>
              {item}
            </SelectItem>
          ))}
        </SelectField>
        <SelectField
          label="Arrival window"
          value={days}
          onValueChange={(value) => form.setValue('days', value as DashboardFilter['days'])}
          hint="Lots and the arrival chart"
        >
          <SelectItem value="7">7 days</SelectItem>
          <SelectItem value="14">14 days</SelectItem>
          <SelectItem value="30">30 days</SelectItem>
        </SelectField>
        <SelectField
          label="Sample"
          value={scenario}
          onValueChange={(value) => setScenario(value as DataScenario)}
          hint="Preview empty and error states"
        >
          {scenarioOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectField>
      </FilterBar>

      <div aria-live="polite" className="space-y-4">
        {refreshing ? <p className="text-sm text-muted-foreground">Updating the demonstration sample…</p> : null}
        {state === 'error' ? (
          <div className="space-y-3">
            <ErrorState
              title="The sample feed did not load"
              description={error ?? 'Switch the sample back to the operating set, then retry.'}
              onRetry={reload}
            />
            <Button type="button" onClick={() => setScenario('success')}>
              Show operating sample
            </Button>
          </div>
        ) : null}
        {state === 'empty' ? (
          <EmptyState
            title="This sample has no operating records"
            description="The empty sample is intentional. Switch back to the operating sample to see arrivals, trade and licences."
            actionLabel="Show operating sample"
            onAction={() => setScenario('success')}
          />
        ) : null}
        {state === 'loading' && !data ? <LoadingState /> : null}
        {data && state !== 'error' && state !== 'empty' ? (
          <>
            <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              <StatCard label="Arrivals" value={formatMt(data.arrivalsMt)} hint="Sample total in the arrival window" icon={Truck} />
              <StatCard label="Gate lots" value={formatNumber(data.lotCount)} hint="Fictional lots in the arrival window" icon={Scale} />
              <StatCard label="Trade sample" value={formatInrFromLakh(data.tradeLakh)} hint="Eight-week demonstration total" icon={IndianRupee} />
              <StatCard label="Active licences" value={formatNumber(data.activeLicences)} hint="After the yard filter" icon={BadgeCheck} />
              <StatCard label="Warehouse occupancy" value={formatPercent(data.occupancyPct)} hint="Mean of the yards in view" icon={Warehouse} />
              <StatCard
                label="Cold rooms online"
                value={`${data.coldOnline}/${data.coldTotal}`}
                hint={`${formatNumber(data.complianceOpen)} open compliance notes in view`}
                icon={Snowflake}
              />
            </section>
            <section className="grid gap-3 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <ArrivalChart series={data.arrivalSeries} />
              </div>
              <LicenceStatusChart series={data.licenceSeries} />
              <div className="lg:col-span-3">
                <TradeVolumeChart series={data.tradeSeries} />
              </div>
            </section>
            <ChartCard
              title="Recent gate lots"
              description="Fictional vehicles and growers. Open a lot to store a desk note in this browser."
              action={
                <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                  <ShieldCheck className="size-3.5" aria-hidden />
                  DEMO
                </span>
              }
            >
              <DataTable
                columns={columns}
                rows={data.lots}
                getRowId={(row) => row.id}
                caption="Demonstration gate lots"
                emptyTitle="No lots in this window"
                emptyDescription="The arrival chart can still have volume when no individual gate lot falls inside the filter."
              />
            </ChartCard>
          </>
        ) : null}
      </div>
      </>
      ) : null}
      {showLots ? <ArrivalDialog lot={selectedLot} open={Boolean(selectedLot)} onOpenChange={closeLot} /> : null}
    </div>
  )
}
