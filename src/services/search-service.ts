import { catalogBasePath, catalogRegister, partyBasePath, partyRegister } from '@/features/registry/meta'
import { findLot, gateLots, yardName } from '@/mocks/catalog'
import { navItems } from '@/mocks/navigation'
import { getRole } from '@/mocks/permissions'
import { canSeeLots } from '@/services/access'
import { useArrivalStore } from '@/store/arrival-store'
import { useTradeStore } from '@/store/trade-store'
import { useFinanceStore } from '@/store/finance-store'
import { useWarehouseStore } from '@/store/warehouse-store'
import { useColdStore } from '@/store/cold-store'
import { useFlpStore } from '@/store/flp-store'
import { useParkingStore } from '@/store/parking-store'
import { useFacilityStore } from '@/store/facility-store'
import { useComplianceStore } from '@/store/compliance-store'
import { useLicenceStore } from '@/store/licence-store'
import { useRegistryStore } from '@/store/registry-store'
import type { RoleId } from '@/types/access'
import type { SearchHit } from '@/types/domain'

export function searchDemo(query: string, roleId: RoleId | null): SearchHit[] {
  const needle = query.trim().toLowerCase()
  if (needle.length < 2 || !roleId) return []
  const allowed = new Set(getRole(roleId).modules)

  const modules: SearchHit[] = navItems
    .filter((item) => item.id === 'dashboard' || item.id === 'settings' || allowed.has(item.id))
    .filter((item) => [item.title, item.summary, item.sop].join(' ').toLowerCase().includes(needle))
    .map((item) => ({
      id: item.id,
      kind: 'module',
      title: item.title,
      detail: item.available ? item.summary : `${item.sop} · module map`,
      to: item.to,
    }))

  const lots: SearchHit[] = canSeeLots(roleId)
    ? gateLots
        .filter((lot) =>
          [lot.id, lot.vehicleNo, lot.commodity, lot.grower, yardName(lot.yardId)]
            .join(' ')
            .toLowerCase()
            .includes(needle),
        )
        .map((lot) => ({
          id: lot.id,
          kind: 'lot' as const,
          title: lot.id,
          detail: `${lot.commodity} · ${yardName(lot.yardId)} · ${lot.vehicleNo}`,
          to: `/desk?lot=${lot.id}`,
        }))
    : []

  const records: SearchHit[] = allowed.has('stakeholders') ? registryHits(needle) : []
  const licences: SearchHit[] = allowed.has('licences') ? licenceHits(needle) : []
  const arrivals: SearchHit[] = allowed.has('arrivals') ? arrivalHits(needle) : []
  const trades: SearchHit[] = allowed.has('trading') ? tradeHits(needle) : []
  const finance: SearchHit[] = allowed.has('finance') ? financeHits(needle) : []
  const warehouses: SearchHit[] = allowed.has('warehouses') ? warehouseHits(needle) : []
  const cold: SearchHit[] = allowed.has('cold-storage') ? coldHits(needle) : []
  const flp: SearchHit[] = allowed.has('post-harvest') ? flpHits(needle) : []
  const parking: SearchHit[] = allowed.has('parking') ? parkingHits(needle) : []
  const facilities: SearchHit[] = allowed.has('facilities') ? facilityHits(needle) : []
  const compliance: SearchHit[] = allowed.has('compliance') ? complianceHits(needle) : []

  return [...compliance, ...facilities, ...parking, ...flp, ...cold, ...warehouses, ...finance, ...trades, ...arrivals, ...licences, ...records, ...modules, ...lots].slice(0, 8)
}

function registryHits(needle: string): SearchHit[] {
  const data = useRegistryStore.getState()
  const parties = data.parties
    .filter((party) => party.status !== 'Removed' && [party.id, party.label, party.area].join(' ').toLowerCase().includes(needle))
    .map((party) => ({
      id: party.id,
      kind: 'record' as const,
      title: party.label,
      detail: `${party.id} · ${partyRegister(party.kind).title}`,
      to: `${partyBasePath(party.kind)}/${party.id}`,
    }))
  const commodities = data.commodities
    .filter((row) => row.status !== 'Removed' && row.name.toLowerCase().includes(needle))
    .map((row) => ({
      id: row.id,
      kind: 'record' as const,
      title: row.name,
      detail: `${row.id} · ${catalogRegister('commodity').title}`,
      to: `${catalogBasePath('commodity')}/${row.id}`,
    }))
  return [...parties, ...commodities]
}

function warehouseHits(needle: string): SearchHit[] {
  const data = useWarehouseStore.getState()
  const contracts = data.contracts
    .filter((row) => [row.contractNo, row.shedCode, row.operatorLabel].join(' ').toLowerCase().includes(needle))
    .map((row) => ({
      id: row.id,
      kind: 'record' as const,
      title: row.contractNo,
      detail: `${row.shedCode} · ${row.operatorLabel} · simulated contract`,
      to: `/warehouses/contracts/${row.id}`,
    }))
  const moves = data.moves
    .filter((row) => [row.moveNo, row.lotNo, row.shedCode].join(' ').toLowerCase().includes(needle))
    .map((row) => ({
      id: row.id,
      kind: 'record' as const,
      title: row.moveNo,
      detail: `${row.kind} · ${row.lotNo} · ${row.shedCode}`,
      to: '/warehouses/inventory',
    }))
  return [...contracts, ...moves]
}

function complianceHits(needle: string): SearchHit[] {
  const data = useComplianceStore.getState()
  return data.incidents
    .filter((row) => [row.id, row.sop, row.title].join(' ').toLowerCase().includes(needle))
    .map((row) => ({
      id: row.id,
      kind: 'record' as const,
      title: row.id,
      detail: `${row.sop} · ${row.title} · demo record`,
      to: '/compliance/incidents',
    }))
}

function facilityHits(needle: string): SearchHit[] {
  const data = useFacilityStore.getState()
  const leases = data.leases
    .filter((row) => [row.leaseNo, row.siteCode, row.operatorLabel].join(' ').toLowerCase().includes(needle))
    .map((row) => ({
      id: row.id,
      kind: 'record' as const,
      title: row.leaseNo,
      detail: `${row.siteCode} · ${row.operatorLabel} · simulated lease`,
      to: `/facilities/leases/${row.id}`,
    }))
  const stays = data.stays
    .filter((row) => [row.stayNo, row.guestCode, row.unitCode].join(' ').toLowerCase().includes(needle))
    .map((row) => ({
      id: row.id,
      kind: 'record' as const,
      title: row.stayNo,
      detail: `${row.guestCode} · ${row.unitCode} · simulated stay`,
      to: '/facilities/stays',
    }))
  return [...leases, ...stays]
}

function parkingHits(needle: string): SearchHit[] {
  const data = useParkingStore.getState()
  const contracts = data.contracts
    .filter((row) => [row.contractNo, row.yardCode, row.operatorLabel].join(' ').toLowerCase().includes(needle))
    .map((row) => ({
      id: row.id,
      kind: 'record' as const,
      title: row.contractNo,
      detail: `${row.yardCode} · ${row.operatorLabel} · simulated contract`,
      to: `/parking/contracts/${row.id}`,
    }))
  const visits = data.visits
    .filter((row) => [row.visitNo, row.vehicleNo, row.passNo, row.slotCode].join(' ').toLowerCase().includes(needle))
    .map((row) => ({
      id: row.id,
      kind: 'record' as const,
      title: row.visitNo,
      detail: `${row.vehicleNo} · ${row.slotCode} · simulated visit`,
      to: row.passNo ? `/parking/passes/${row.passNo}` : '/parking/movements',
    }))
  const leases = data.leases
    .filter((row) => [row.leaseNo, row.officeCode, row.lesseeLabel].join(' ').toLowerCase().includes(needle))
    .map((row) => ({
      id: row.id,
      kind: 'record' as const,
      title: row.leaseNo,
      detail: `${row.officeCode} · ${row.lesseeLabel} · simulated lease`,
      to: `/parking/offices/${row.id}`,
    }))
  return [...contracts, ...visits, ...leases]
}

function flpHits(needle: string): SearchHit[] {
  const data = useFlpStore.getState()
  const batches = data.batches
    .filter((row) => [row.batchNo, row.lotNo, row.unitCode, row.commodityName].join(' ').toLowerCase().includes(needle))
    .map((row) => ({
      id: row.id,
      kind: 'record' as const,
      title: row.batchNo,
      detail: `${row.lotNo} · ${row.unitCode} · simulated batch`,
      to: `/post-harvest/batches/${row.id}`,
    }))
  const outputs = data.outputs
    .filter((row) => row.outputNo.toLowerCase().includes(needle))
    .map((row) => ({
      id: row.id,
      kind: 'record' as const,
      title: row.outputNo,
      detail: `${row.batchId} · simulated output`,
      to: `/post-harvest/batches/${row.batchId}`,
    }))
  return [...batches, ...outputs]
}

function coldHits(needle: string): SearchHit[] {
  const data = useColdStore.getState()
  const contracts = data.contracts
    .filter((row) => [row.contractNo, row.chamberCode, row.operatorLabel].join(' ').toLowerCase().includes(needle))
    .map((row) => ({
      id: row.id,
      kind: 'record' as const,
      title: row.contractNo,
      detail: `${row.chamberCode} · ${row.operatorLabel} · simulated contract`,
      to: `/cold-storage/contracts/${row.id}`,
    }))
  const readings = data.readings
    .filter((row) => [row.id, row.chamberCode].join(' ').toLowerCase().includes(needle))
    .map((row) => ({
      id: row.id,
      kind: 'record' as const,
      title: row.id,
      detail: `${row.chamberCode} · simulated reading`,
      to: '/cold-storage/temperature',
    }))
  return [...contracts, ...readings]
}

function financeHits(needle: string): SearchHit[] {
  const data = useFinanceStore.getState()
  const credits = data.creditNotes
    .filter((row) => [row.noteNo, row.tradeNo, row.sellerLabel, row.aadathiyaLabel].join(' ').toLowerCase().includes(needle))
    .map((row) => ({
      id: row.id,
      kind: 'record' as const,
      title: row.noteNo,
      detail: `${row.sellerLabel} · ${row.aadathiyaLabel} · simulated credit note`,
      to: '/finance/credit-notes',
    }))
  const debits = data.debitNotes
    .filter((row) => [row.noteNo, row.tradeNo, row.buyerLabel, row.aadathiyaLabel].join(' ').toLowerCase().includes(needle))
    .map((row) => ({
      id: row.id,
      kind: 'record' as const,
      title: row.noteNo,
      detail: `${row.buyerLabel} · ${row.aadathiyaLabel} · simulated debit note`,
      to: '/finance/debit-notes',
    }))
  const receipts = data.receipts
    .filter((row) => [row.receiptNo, row.tradeNo, row.partyLabel].join(' ').toLowerCase().includes(needle))
    .map((row) => ({
      id: row.id,
      kind: 'record' as const,
      title: row.receiptNo,
      detail: `${row.partyLabel} · simulated receipt`,
      to: `/finance/receipts/${row.id}/print`,
    }))
  return [...receipts, ...credits, ...debits]
}

function tradeHits(needle: string): SearchHit[] {
  return useTradeStore
    .getState()
    .trades.filter((row) => [row.id, row.tradeNo, row.lotNo, row.sellerLabel, row.buyerLabel, row.sellerParchiNo, row.buyerParchiNo].join(' ').toLowerCase().includes(needle))
    .map((row) => ({
      id: row.id,
      kind: 'record' as const,
      title: row.tradeNo,
      detail: `${row.sellerLabel} · ${row.buyerLabel} · ${row.lotNo}`,
      to: `/trading/${row.id}`,
    }))
}

function arrivalHits(needle: string): SearchHit[] {
  return useArrivalStore
    .getState()
    .lots.filter((row) => [row.id, row.lotNo, row.arrivalNo, row.sellerLabel, row.commodityName, row.vehicleNo].join(' ').toLowerCase().includes(needle))
    .map((row) => ({
      id: row.id,
      kind: 'lot' as const,
      title: row.lotNo,
      detail: `${row.commodityName} · ${row.sellerLabel} · ${row.vehicleNo}`,
      to: `/arrivals/${row.id}`,
    }))
}

function licenceHits(needle: string): SearchHit[] {
  return useLicenceStore
    .getState()
    .cases.filter((row) => [row.id, row.licenceNo, row.applicantLabel, row.businessName].join(' ').toLowerCase().includes(needle))
    .map((row) => ({
      id: row.id,
      kind: 'record' as const,
      title: row.licenceNo ?? row.id,
      detail: `${row.applicantLabel} · ${row.id}`,
      to: `/licences/${row.id}`,
    }))
}

export function lookupLot(id: string) {
  return findLot(id)
}
