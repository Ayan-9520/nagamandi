import { Link } from 'react-router-dom'
import { StatCard } from '@/components/common/StatCard'
import { Button } from '@/components/ui/button'
import { buildSnapshot } from '@/services/command-snapshot'
import { COMMAND_DAY } from '@/services/compliance-rules'
import { useColdStore } from '@/store/cold-store'
import { useComplianceStore } from '@/store/compliance-store'
import { useFacilityStore } from '@/store/facility-store'
import { useFinanceStore } from '@/store/finance-store'
import { useFlpStore } from '@/store/flp-store'
import { useLicenceStore } from '@/store/licence-store'
import { useParkingStore } from '@/store/parking-store'
import { useTradeStore } from '@/store/trade-store'
import { useWarehouseStore } from '@/store/warehouse-store'
import { ClipboardCheck, ShieldAlert } from 'lucide-react'
import { useMemo } from 'react'

export function CommandBoard() {
  const complianceReady = useComplianceStore((state) => state.ready)
  const licenceReady = useLicenceStore((state) => state.ready)
  const ready = complianceReady && licenceReady
  const licences = useLicenceStore((state) => state.cases)
  const trades = useTradeStore((state) => state.trades)
  const requirements = useTradeStore((state) => state.requirements)
  const reconciliation = useFinanceStore((state) => state.reconciliation)
  const closing = useFinanceStore((state) => state.closing)
  const sheds = useWarehouseStore((state) => state.sheds)
  const warehouseMoves = useWarehouseStore((state) => state.moves)
  const warehouseContracts = useWarehouseStore((state) => state.contracts)
  const chambers = useColdStore((state) => state.chambers)
  const coldMoves = useColdStore((state) => state.moves)
  const coldReadings = useColdStore((state) => state.readings)
  const coldContracts = useColdStore((state) => state.contracts)
  const reports = useFlpStore((state) => state.reports)
  const slots = useParkingStore((state) => state.slots)
  const visits = useParkingStore((state) => state.visits)
  const parkingContracts = useParkingStore((state) => state.contracts)
  const officeLeases = useParkingStore((state) => state.leases)
  const facilityLeases = useFacilityStore((state) => state.leases)
  const stays = useFacilityStore((state) => state.stays)
  const facilityCover = useFacilityStore((state) => state.insurance)
  const incidents = useComplianceStore((state) => state.incidents)
  const actions = useComplianceStore((state) => state.actions)
  const inspections = useComplianceStore((state) => state.inspections)
  const audit = useComplianceStore((state) => state.audit)
  const snapshot = useMemo(
    () => buildSnapshot({
      licences, trades, requirements, reconciliation, closing, sheds, warehouseMoves, warehouseContracts,
      chambers, coldMoves, coldReadings, coldContracts, reports, slots, visits, parkingContracts, officeLeases,
      facilityLeases, stays, facilityCover, incidents, actions, inspections, audit,
    }, { from: '2026-11-01', to: COMMAND_DAY }),
    [licences, trades, requirements, reconciliation, closing, sheds, warehouseMoves, warehouseContracts, chambers, coldMoves, coldReadings, coldContracts, reports, slots, visits, parkingContracts, officeLeases, facilityLeases, stays, facilityCover, incidents, actions, inspections, audit],
  )
  if (!ready || !reconciliation) return null
  const attention = snapshot.matrix.filter((row) => row.status !== 'on-track').length
  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl tracking-tight">Command centre</h2>
          <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
            SOP-001 to SOP-015 in this browser. These rows are separate from the yard-sample charts. Audit rows are demo records.
          </p>
        </div>
        <Button type="button" variant="outline" asChild>
          <Link to="/compliance">Open compliance</Link>
        </Button>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard label="Procedures needing a look" value={String(attention)} hint="Attention or exception" icon={ClipboardCheck} />
        <StatCard label="Open incidents" value={String(snapshot.openIncidents)} hint="Demo records" icon={ShieldAlert} />
        <StatCard label="Pending approvals" value={String(snapshot.approvals.length)} hint="Not yet issued" icon={ClipboardCheck} />
      </div>
    </section>
  )
}
