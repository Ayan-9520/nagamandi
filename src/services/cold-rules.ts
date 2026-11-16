import type { RoleId } from '@/types/access'
import type { ArrivalLot } from '@/types/arrival'
import type {
  Chamber,
  CheckKind,
  ColdContract,
  ColdData,
  ContractStatus,
  StockMove,
  TemperatureReading,
} from '@/types/cold-storage'
import { checkQuantity, daysUntil, formatUnits, needsAlert, toUnits, unitsText } from '@/services/warehouse-rules'

export const COLD_DAY = '2026-11-14'
export { checkQuantity, daysUntil, formatUnits, needsAlert, toUnits, unitsText }

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
  hygiene: [
    { id: 'floor', label: 'Floor clean and free of spilled produce' },
    { id: 'waste', label: 'Waste removed from the chamber' },
    { id: 'drain', label: 'Drains clear' },
  ],
  fire: [
    { id: 'extinguisher', label: 'Extinguisher in place' },
    { id: 'alarm', label: 'Alarm noted as working' },
    { id: 'exit', label: 'Emergency exit clear' },
  ],
  security: [
    { id: 'gate', label: 'Gate check recorded' },
    { id: 'cctv', label: 'CCTV noted as covering the chamber' },
    { id: 'access', label: 'Access list current' },
  ],
  gas: [
    { id: 'cylinder', label: 'Gas store noted as closed and upright' },
    { id: 'sign', label: 'Safety signage visible' },
    { id: 'vent', label: 'Ventilation path clear' },
  ],
}

const SAMPLE_TENTHS = [38, 41, 44, 72, 45, 40, 39]

export function canDecideContract(roleId: RoleId) {
  return roleId === 'super-admin' || roleId === 'mandi-manager'
}

export function canOperateCold(roleId: RoleId) {
  return canDecideContract(roleId) || roleId === 'cold-storage-operator'
}

export function tenthsText(text: string) {
  const trimmed = text.trim()
  if (!/^-?\d+(\.\d)?$/.test(trimmed)) return null
  const negative = trimmed.startsWith('-')
  const body = negative ? trimmed.slice(1) : trimmed
  const [whole, frac = ''] = body.split('.')
  const tenths = Number(whole) * 10 + Number(frac.padEnd(1, '0'))
  return negative ? -tenths : tenths
}

export function formatTenths(tenths: number) {
  const negative = tenths < 0
  const abs = Math.abs(Math.trunc(tenths))
  return `${negative ? '-' : ''}${Math.trunc(abs / 10)}.${abs % 10}°C`
}

export function outsideBand(chamber: Chamber, tenths: number) {
  return tenths < chamber.minTenths || tenths > chamber.maxTenths
}

export function nextSampleTenths(simulatedCount: number) {
  const index = ((simulatedCount % SAMPLE_TENTHS.length) + SAMPLE_TENTHS.length) % SAMPLE_TENTHS.length
  return SAMPLE_TENTHS[index] ?? 40
}

export function onHand(moves: StockMove[], chamberId: string, lotId: string) {
  return moves.reduce((total, move) => {
    if (move.chamberId !== chamberId || move.lotId !== lotId) return total
    return total + (move.kind === 'inward' ? move.quantityUnits : -move.quantityUnits)
  }, 0)
}

export function chamberUsed(moves: StockMove[], chamberId: string) {
  return moves.reduce((total, move) => {
    if (move.chamberId !== chamberId) return total
    return total + (move.kind === 'inward' ? move.quantityUnits : -move.quantityUnits)
  }, 0)
}

export function lotStored(moves: StockMove[], lotId: string) {
  return moves.reduce((total, move) => {
    if (move.lotId !== lotId) return total
    return total + (move.kind === 'inward' ? move.quantityUnits : -move.quantityUnits)
  }, 0)
}

export function issuedContract(contracts: ColdContract[], chamberId: string) {
  return contracts.find((row) => row.chamberId === chamberId && row.status === 'issued')
}

export function liveContract(contracts: ColdContract[], chamberId: string) {
  return contracts.find((row) => row.chamberId === chamberId && row.status !== 'rejected')
}

export function canInward(chamber: Chamber, contracts: ColdContract[], moves: StockMove[], lot: ArrivalLot, units: number) {
  if (lot.status === 'cancelled') return 'A cancelled lot cannot enter a chamber.'
  if (!issuedContract(contracts, chamber.id)) return 'Allocate the chamber with an issued contract before stock can move.'
  const quantityError = checkQuantity(units)
  if (quantityError) return quantityError
  const free = chamber.capacityUnits - chamberUsed(moves, chamber.id)
  if (units > free) return 'That quantity does not fit the free simulated capacity.'
  const remaining = toUnits(lot.quantity) - lotStored(moves, lot.id)
  if (units > remaining) return 'That quantity is above the produce still outside the chambers for this lot.'
  return null
}

export function canOutward(chamber: Chamber, contracts: ColdContract[], moves: StockMove[], lotId: string, units: number) {
  if (!issuedContract(contracts, chamber.id)) return 'Allocate the chamber with an issued contract before stock can move.'
  const quantityError = checkQuantity(units)
  if (quantityError) return quantityError
  const held = onHand(moves, chamber.id, lotId)
  if (units > held) return 'Outward quantity cannot pass the stock still in this chamber.'
  return null
}

export function occupancy(chamber: Chamber, moves: StockMove[]) {
  const used = chamberUsed(moves, chamber.id)
  const percent = chamber.capacityUnits === 0 ? 0 : Math.round((used / chamber.capacityUnits) * 100)
  return { used, free: chamber.capacityUnits - used, percent }
}

export function latestReading(readings: TemperatureReading[], chamberId: string) {
  return readings.find((row) => row.chamberId === chamberId)
}

export function breachCount(chambers: Chamber[], readings: TemperatureReading[]) {
  return chambers.filter((chamber) => {
    const latest = latestReading(readings, chamber.id)
    return latest ? outsideBand(chamber, latest.tenths) : false
  }).length
}

export function alertRows(data: Pick<ColdData, 'chambers' | 'contracts' | 'insurance' | 'readings' | 'incidents'>) {
  const temperature = data.chambers.flatMap((chamber) => {
    const latest = latestReading(data.readings, chamber.id)
    if (!latest || !outsideBand(chamber, latest.tenths)) return []
    return [{
      id: latest.id,
      title: `${chamber.code} is outside the demo band`,
      detail: `${formatTenths(latest.tenths)} · band ${formatTenths(chamber.minTenths)} to ${formatTenths(chamber.maxTenths)} · simulated`,
      to: '/cold-storage/temperature',
    }]
  })
  const contracts = data.contracts
    .filter((row) => row.status === 'issued' && needsAlert(row.end))
    .map((row) => ({
      id: row.id,
      title: `${row.contractNo} ends ${row.end}`,
      detail: `${row.chamberCode} · ${daysUntil(row.end)} days from ${COLD_DAY}`,
      to: `/cold-storage/contracts/${row.id}`,
    }))
  const insurance = data.insurance
    .filter((row) => needsAlert(row.until))
    .map((row) => ({
      id: row.id,
      title: `${row.policyNo} ends ${row.until}`,
      detail: `${row.chamberCode} · simulated cover`,
      to: '/cold-storage/insurance',
    }))
  const incidents = data.incidents
    .filter((row) => row.status === 'open')
    .map((row) => ({
      id: row.id,
      title: `${row.id} is open`,
      detail: `${row.chamberCode} · ${row.title}`,
      to: '/cold-storage/incidents',
    }))
  return [...temperature, ...contracts, ...insurance, ...incidents]
}
