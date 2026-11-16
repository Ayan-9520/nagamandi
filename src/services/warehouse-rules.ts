import type { RoleId } from '@/types/access'
import type { ArrivalLot } from '@/types/arrival'
import type {
  CheckKind,
  ContractStatus,
  Shed,
  StockMove,
  WarehouseContract,
  WarehouseData,
} from '@/types/warehouse'

export const WAREHOUSE_DAY = '2026-11-14'

export const NEXT_CONTRACT: Record<ContractStatus, ContractStatus[]> = {
  draft: ['submitted'],
  submitted: ['under-verification', 'rejected'],
  'under-verification': ['verified', 'clarification-required', 'rejected'],
  'clarification-required': ['submitted'],
  verified: ['approved', 'rejected'],
  approved: ['deposit-recorded'],
  'deposit-recorded': ['issued'],
  issued: [],
  rejected: [],
}

export const CHECK_ITEMS: Record<CheckKind, { id: string; label: string }[]> = {
  cleaning: [
    { id: 'floor', label: 'Floor swept and free of spilled produce' },
    { id: 'waste', label: 'Waste bins emptied' },
    { id: 'drain', label: 'Drains clear' },
  ],
  fire: [
    { id: 'extinguisher', label: 'Extinguisher in place' },
    { id: 'alarm', label: 'Alarm noted as working' },
    { id: 'exit', label: 'Emergency exit clear' },
  ],
  security: [
    { id: 'gate', label: 'Gate check recorded' },
    { id: 'cctv', label: 'CCTV noted as covering the shed' },
    { id: 'access', label: 'Access list current' },
  ],
}

export function canDecideContract(roleId: RoleId) {
  return roleId === 'super-admin' || roleId === 'mandi-manager'
}

export function canOperateWarehouse(roleId: RoleId) {
  return canDecideContract(roleId) || roleId === 'warehouse-operator'
}

export function toUnits(quantity: number) {
  if (!Number.isFinite(quantity)) return 0
  const [whole, frac] = Math.abs(quantity).toFixed(2).split('.')
  const units = Number(whole) * 100 + Number(frac)
  return quantity < 0 ? -units : units
}

export function unitsText(text: string) {
  const trimmed = text.trim()
  if (!/^\d+(\.\d{1,2})?$/.test(trimmed)) return null
  const [whole, frac = ''] = trimmed.split('.')
  return Number(whole) * 100 + Number(frac.padEnd(2, '0'))
}

export function formatUnits(units: number) {
  const abs = Math.abs(Math.trunc(units))
  return `${Math.trunc(abs / 100)}.${String(abs % 100).padStart(2, '0')}`
}

export function daysUntil(until: string) {
  const start = Date.parse(`${WAREHOUSE_DAY}T00:00:00+05:30`)
  const end = Date.parse(`${until}T00:00:00+05:30`)
  return Math.round((end - start) / 86_400_000)
}

export function needsAlert(until: string) {
  return daysUntil(until) <= 30
}

export function onHand(moves: StockMove[], shedId: string, lotId: string) {
  return moves.reduce((total, move) => {
    if (move.shedId !== shedId || move.lotId !== lotId) return total
    return total + (move.kind === 'inward' ? move.quantityUnits : -move.quantityUnits)
  }, 0)
}

export function shedUsed(moves: StockMove[], shedId: string) {
  return moves.reduce((total, move) => {
    if (move.shedId !== shedId) return total
    return total + (move.kind === 'inward' ? move.quantityUnits : -move.quantityUnits)
  }, 0)
}

export function lotStored(moves: StockMove[], lotId: string) {
  return moves.reduce((total, move) => {
    if (move.lotId !== lotId) return total
    return total + (move.kind === 'inward' ? move.quantityUnits : -move.quantityUnits)
  }, 0)
}

export function issuedContract(contracts: WarehouseContract[], shedId: string) {
  return contracts.find((row) => row.shedId === shedId && row.status === 'issued')
}

export function liveContract(contracts: WarehouseContract[], shedId: string) {
  return contracts.find((row) => row.shedId === shedId && row.status !== 'rejected')
}

export function checkQuantity(units: number | null) {
  if (units === null) return 'Enter a quantity with at most two decimal places.'
  if (units <= 0) return 'Quantity must be greater than zero.'
  return null
}

export function canInward(shed: Shed, contracts: WarehouseContract[], moves: StockMove[], lot: ArrivalLot, units: number) {
  if (lot.status === 'cancelled') return 'A cancelled lot cannot enter a shed.'
  if (!issuedContract(contracts, shed.id)) return 'Allocate the shed with an issued contract before stock can move.'
  const quantityError = checkQuantity(units)
  if (quantityError) return quantityError
  const free = shed.capacityUnits - shedUsed(moves, shed.id)
  if (units > free) return 'That quantity does not fit the free simulated capacity.'
  const remaining = toUnits(lot.quantity) - lotStored(moves, lot.id)
  if (units > remaining) return 'That quantity is above the produce still outside the sheds for this lot.'
  return null
}

export function canOutward(shed: Shed, contracts: WarehouseContract[], moves: StockMove[], lotId: string, units: number) {
  if (!issuedContract(contracts, shed.id)) return 'Allocate the shed with an issued contract before stock can move.'
  const quantityError = checkQuantity(units)
  if (quantityError) return quantityError
  const held = onHand(moves, shed.id, lotId)
  if (units > held) return 'Outward quantity cannot pass the stock still in this shed.'
  return null
}

export function occupancy(shed: Shed, moves: StockMove[]) {
  const used = shedUsed(moves, shed.id)
  const percent = shed.capacityUnits === 0 ? 0 : Math.round((used / shed.capacityUnits) * 100)
  return { used, free: shed.capacityUnits - used, percent }
}

export function stockLines(data: Pick<WarehouseData, 'sheds' | 'moves'>) {
  const keys = new Map<string, StockMove>()
  for (const move of data.moves) keys.set(`${move.shedId}:${move.lotId}`, move)
  return [...keys.values()]
    .map((move) => ({
      shedId: move.shedId,
      shedCode: move.shedCode,
      lotId: move.lotId,
      lotNo: move.lotNo,
      commodityName: move.commodityName,
      gradeName: move.gradeName,
      unitSymbol: move.unitSymbol,
      partyLabel: move.partyLabel,
      units: onHand(data.moves, move.shedId, move.lotId),
    }))
    .filter((row) => row.units > 0)
}
