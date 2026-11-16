import { useMemo } from 'react'
import { buildSnapshot } from '@/services/command-snapshot'
import { useColdStore } from '@/store/cold-store'
import { useComplianceStore } from '@/store/compliance-store'
import { useFacilityStore } from '@/store/facility-store'
import { useFinanceStore } from '@/store/finance-store'
import { useFlpStore } from '@/store/flp-store'
import { useLicenceStore } from '@/store/licence-store'
import { useParkingStore } from '@/store/parking-store'
import { useTradeStore } from '@/store/trade-store'
import { useWarehouseStore } from '@/store/warehouse-store'

export function useCommandBooks(from: string, to: string) {
  const licenceReady = useLicenceStore((state) => state.ready)
  const licences = useLicenceStore((state) => state.cases)
  const tradeReady = useTradeStore((state) => state.ready)
  const trades = useTradeStore((state) => state.trades)
  const requirements = useTradeStore((state) => state.requirements)
  const financeReady = useFinanceStore((state) => state.ready)
  const reconciliation = useFinanceStore((state) => state.reconciliation)
  const closing = useFinanceStore((state) => state.closing)
  const receipts = useFinanceStore((state) => state.receipts)
  const warehouseReady = useWarehouseStore((state) => state.ready)
  const sheds = useWarehouseStore((state) => state.sheds)
  const warehouseMoves = useWarehouseStore((state) => state.moves)
  const warehouseContracts = useWarehouseStore((state) => state.contracts)
  const coldReady = useColdStore((state) => state.ready)
  const chambers = useColdStore((state) => state.chambers)
  const coldMoves = useColdStore((state) => state.moves)
  const coldReadings = useColdStore((state) => state.readings)
  const coldContracts = useColdStore((state) => state.contracts)
  const flpReady = useFlpStore((state) => state.ready)
  const reports = useFlpStore((state) => state.reports)
  const parkingReady = useParkingStore((state) => state.ready)
  const slots = useParkingStore((state) => state.slots)
  const visits = useParkingStore((state) => state.visits)
  const parkingContracts = useParkingStore((state) => state.contracts)
  const officeLeases = useParkingStore((state) => state.leases)
  const facilityReady = useFacilityStore((state) => state.ready)
  const facilityLeases = useFacilityStore((state) => state.leases)
  const stays = useFacilityStore((state) => state.stays)
  const facilityCover = useFacilityStore((state) => state.insurance)
  const complianceReady = useComplianceStore((state) => state.ready)
  const incidents = useComplianceStore((state) => state.incidents)
  const actions = useComplianceStore((state) => state.actions)
  const inspections = useComplianceStore((state) => state.inspections)
  const audit = useComplianceStore((state) => state.audit)

  const ready = licenceReady && tradeReady && financeReady && warehouseReady && coldReady && flpReady && parkingReady && facilityReady && complianceReady
  const snapshot = useMemo(
    () => buildSnapshot({
      licences,
      trades,
      requirements,
      reconciliation,
      closing,
      sheds,
      warehouseMoves,
      warehouseContracts,
      chambers,
      coldMoves,
      coldReadings,
      coldContracts,
      reports,
      slots,
      visits,
      parkingContracts,
      officeLeases,
      facilityLeases,
      stays,
      facilityCover,
      incidents,
      actions,
      inspections,
      audit,
    }, { from, to }),
    [licences, trades, requirements, reconciliation, closing, sheds, warehouseMoves, warehouseContracts, chambers, coldMoves, coldReadings, coldContracts, reports, slots, visits, parkingContracts, officeLeases, facilityLeases, stays, facilityCover, incidents, actions, inspections, audit, from, to],
  )

  return { ready, snapshot, licences, trades, reconciliation, closing, receipts, reports }
}
