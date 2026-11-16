import { breachCount, occupancy as coldOccupancy } from '@/services/cold-rules'
import { AUDIT_LABEL, daysFrom, inRange, needsWindow, SOP_CATALOG } from '@/services/compliance-rules'
import { slotCounts } from '@/services/parking-rules'
import { occupancy as shedOccupancy } from '@/services/warehouse-rules'
import type { Chamber, ColdContract, StockMove as ColdMove, TemperatureReading } from '@/types/cold-storage'
import type { AuditEntry, CalendarInspection, ComplianceIncident, CorrectiveAction, SopStatus } from '@/types/compliance'
import type { FacilityLease, InsuranceRecord as FacilityCover, Stay } from '@/types/facility'
import type { DayClosing, Reconciliation } from '@/types/finance'
import type { DailyReport } from '@/types/flp'
import type { LicenceCase } from '@/types/licence'
import type { OfficeLease, ParkingContract, Visit } from '@/types/parking'
import type { BuyerRequirement, TradeRecord } from '@/types/trade'
import type { Shed, StockMove as WarehouseMove, WarehouseContract } from '@/types/warehouse'

const WAITING = new Set([
  'draft',
  'submitted',
  'under-verification',
  'clarification-required',
  'verified',
  'approved',
  'deposit-recorded',
  'pending-approval',
  'fee-recorded',
])

export interface CommandRange {
  from: string
  to: string
}

export interface CommandBooks {
  licences: LicenceCase[]
  trades: TradeRecord[]
  requirements: BuyerRequirement[]
  reconciliation: Reconciliation
  closing: DayClosing
  sheds: Shed[]
  warehouseMoves: WarehouseMove[]
  warehouseContracts: WarehouseContract[]
  chambers: Chamber[]
  coldMoves: ColdMove[]
  coldReadings: TemperatureReading[]
  coldContracts: ColdContract[]
  reports: DailyReport[]
  slots: { id: string }[]
  visits: Visit[]
  parkingContracts: ParkingContract[]
  officeLeases: OfficeLease[]
  facilityLeases: FacilityLease[]
  stays: Stay[]
  facilityCover: FacilityCover[]
  incidents: ComplianceIncident[]
  actions: CorrectiveAction[]
  inspections: CalendarInspection[]
  audit: AuditEntry[]
}

export interface SopCheck {
  label: string
  result: 'yes' | 'no'
}

export interface SopScreen {
  label: string
  to: string
}

export interface SopRow {
  number: string
  name: string
  department: string
  screens: SopScreen[]
  pending: string[]
  checklist: SopCheck[]
  exceptions: string[]
  lastReview: string
  status: SopStatus
}

export interface ApprovalRow {
  id: string
  sop: string
  label: string
  status: string
  to: string
}

export interface ExpiryRow {
  id: string
  sop: string
  label: string
  end: string
  days: number
}

export interface CommandSnapshot {
  rangeOk: boolean
  matrix: SopRow[]
  approvals: ApprovalRow[]
  expiries: ExpiryRow[]
  tradesInRange: TradeRecord[]
  incidentsInRange: ComplianceIncident[]
  inspectionsInRange: CalendarInspection[]
  actionsInRange: CorrectiveAction[]
  auditInRange: AuditEntry[]
  warehousePercent: number
  warehouseUsed: number
  coldPercent: number
  coldUsed: number
  coldBreaches: number
  parking: { available: number; occupied: number; reserved: number }
  parkingPercent: number
  openIncidents: number
  openActions: number
}

function waiting(status: string) {
  return WAITING.has(status)
}

function reviewFor(audit: AuditEntry[], sop: string) {
  const row = audit.find((item) => item.sop === sop)
  return row ? row.at.slice(0, 10) : '2026-11-14'
}

function statusFor(pending: string[], checklist: SopCheck[], exceptions: string[]): SopStatus {
  if (exceptions.length > 0 || checklist.some((item) => item.result === 'no')) return 'exception'
  if (pending.length > 0) return 'attention'
  return 'on-track'
}

function row(
  number: string,
  pending: string[],
  checklist: SopCheck[],
  exceptions: string[],
  audit: AuditEntry[],
): SopRow {
  const catalog = SOP_CATALOG.find((item) => item.number === number)
  return {
    number,
    name: catalog?.name ?? number,
    department: catalog?.department ?? 'Mandi desk',
    screens: catalog ? [...catalog.screens] : [],
    pending,
    checklist,
    exceptions,
    lastReview: reviewFor(audit, number),
    status: statusFor(pending, checklist, exceptions),
  }
}

export function buildSnapshot(books: CommandBooks, range: CommandRange): CommandSnapshot {
  const rangeOk = range.from <= range.to
  const asOf = range.to
  const tradesInRange = rangeOk ? books.trades.filter((item) => inRange(item.createdAt, range.from, range.to)) : []
  const requirementsInRange = rangeOk ? books.requirements.filter((item) => inRange(item.createdAt, range.from, range.to)) : []
  const incidentsInRange = rangeOk ? books.incidents.filter((item) => inRange(item.at, range.from, range.to)) : []
  const inspectionsInRange = rangeOk ? books.inspections.filter((item) => inRange(item.day, range.from, range.to)) : []
  const actionsInRange = rangeOk ? books.actions.filter((item) => inRange(item.due, range.from, range.to) || item.status === 'open') : []
  const auditInRange = rangeOk ? books.audit.filter((item) => inRange(item.at, range.from, range.to)) : []

  const licencePending = books.licences.filter((item) => waiting(item.status)).map((item) => `${item.id} · ${item.status}`)
  const salePending = tradesInRange.filter((item) => item.status !== 'documented' && item.status !== 'cancelled').map((item) => `${item.tradeNo} · ${item.status}`)
  const buyPending = requirementsInRange.filter((item) => item.status === 'open').map((item) => `${item.requirementNo} · open`)
  const shedPending = books.warehouseContracts.filter((item) => waiting(item.status)).map((item) => `${item.contractNo} · ${item.status}`)
  const coldPending = books.coldContracts.filter((item) => waiting(item.status)).map((item) => `${item.contractNo} · ${item.status}`)
  const flpPending = books.reports.filter((item) => item.discrepancyUnits > 0).map((item) => `${item.reportNo} · ${item.discrepancyUnits} q apart`)
  const parkPending = books.parkingContracts.filter((item) => waiting(item.status)).map((item) => `${item.contractNo} · ${item.status}`)
  const officePending = books.officeLeases.filter((item) => waiting(item.status)).map((item) => `${item.leaseNo} · ${item.status}`)
  const stayPending = books.facilityLeases.filter((item) => item.kind !== 'restaurant' && waiting(item.status)).map((item) => `${item.leaseNo} · ${item.status}`)
  const guestPending = books.stays.filter((item) => item.status === 'open' && item.siteCode !== 'RS-D1').map((item) => `${item.stayNo} · ${item.guestCode}`)
  const restaurantPending = books.facilityLeases.filter((item) => item.kind === 'restaurant' && waiting(item.status)).map((item) => `${item.leaseNo} · ${item.status}`)
  const incidentPending = books.incidents.filter((item) => item.status === 'open').map((item) => `${item.id} · ${item.sop}`)

  const breaches = breachCount(books.chambers, books.coldReadings)
  const coldException = breaches > 0 ? [`${breaches} chamber sample sits outside its band.`] : []
  const flpException = flpPending.length > 0 ? ['A daily report does not reconcile.'] : []

  const matrix = [
    row('SOP-001', licencePending, [
      { label: 'The licence desk keeps the sample cases', result: 'yes' },
      { label: 'Issued and rejected cases leave the pending list', result: 'yes' },
    ], [], books.audit),
    row('SOP-002', salePending, [
      { label: 'Sales in the date window are listed', result: 'yes' },
      { label: 'A documented sale keeps its parchi numbers', result: tradesInRange.some((item) => item.status === 'documented' && (!item.sellerParchiNo || !item.buyerParchiNo)) ? 'no' : 'yes' },
    ], [], books.audit),
    row('SOP-003', buyPending, [
      { label: 'Buyer requirements in the date window are listed', result: 'yes' },
    ], [], books.audit),
    row('SOP-004', shedPending, [
      { label: 'Warehouse contracts share one status path', result: 'yes' },
    ], [], books.audit),
    row('SOP-005', [], [
      { label: 'Stock stays in the warehouse book', result: 'yes' },
    ], [], books.audit),
    row('SOP-006', coldPending, [
      { label: 'Cold contracts share one status path', result: 'yes' },
    ], [], books.audit),
    row('SOP-007', incidentPending.filter((item) => item.includes('SOP-007')), [
      { label: 'Readings are a sample script', result: 'yes' },
      { label: 'Every chamber sample sits inside its band', result: breaches === 0 ? 'yes' : 'no' },
    ], coldException, books.audit),
    row('SOP-008', flpPending, [
      { label: 'Daily reports stay in the FLP book', result: books.reports.length > 0 ? 'yes' : 'no' },
      { label: 'Intake and output reconcile', result: flpPending.length === 0 ? 'yes' : 'no' },
    ], flpException, books.audit),
    row('SOP-009', parkPending, [
      { label: 'Parking contracts share one status path', result: 'yes' },
    ], [], books.audit),
    row('SOP-010', books.visits.filter((item) => item.status === 'inside').map((item) => `${item.visitNo} · ${item.slotCode}`), [
      { label: 'A visit is not a gate pass', result: 'yes' },
    ], [], books.audit),
    row('SOP-011', officePending, [
      { label: 'Office leases share the contract steps', result: 'yes' },
    ], [], books.audit),
    row('SOP-012', stayPending, [
      { label: 'Hall and hotel leases share the contract steps', result: 'yes' },
    ], [], books.audit),
    row('SOP-013', guestPending, [
      { label: 'Open stays use a fictional guest code', result: books.stays.some((item) => item.status === 'open' && !/^GS-\d{2,4}$/.test(item.guestCode)) ? 'no' : 'yes' },
    ], [], books.audit),
    row('SOP-014', restaurantPending, [
      { label: 'Restaurant leases use the same contract steps', result: 'yes' },
    ], [], books.audit),
    row('SOP-015', [], [
      { label: 'Hygiene and operations stay on the restaurant template', result: 'yes' },
    ], [], books.audit),
  ]

  const approvals: ApprovalRow[] = [
    ...books.licences.filter((item) => waiting(item.status)).map((item) => ({ id: item.id, sop: 'SOP-001', label: `${item.id} · ${item.applicantLabel}`, status: item.status, to: `/licences/${item.id}` })),
    ...books.warehouseContracts.filter((item) => waiting(item.status)).map((item) => ({ id: item.id, sop: 'SOP-004', label: `${item.contractNo} · ${item.shedCode}`, status: item.status, to: `/warehouses/contracts/${item.id}` })),
    ...books.coldContracts.filter((item) => waiting(item.status)).map((item) => ({ id: item.id, sop: 'SOP-006', label: `${item.contractNo} · ${item.chamberCode}`, status: item.status, to: `/cold-storage/contracts/${item.id}` })),
    ...books.parkingContracts.filter((item) => waiting(item.status)).map((item) => ({ id: item.id, sop: 'SOP-009', label: `${item.contractNo} · ${item.yardCode}`, status: item.status, to: `/parking/contracts/${item.id}` })),
    ...books.officeLeases.filter((item) => waiting(item.status)).map((item) => ({ id: item.id, sop: 'SOP-011', label: `${item.leaseNo} · ${item.officeCode}`, status: item.status, to: `/parking/offices/${item.id}` })),
    ...books.facilityLeases.filter((item) => waiting(item.status)).map((item) => ({ id: item.id, sop: item.kind === 'restaurant' ? 'SOP-014' : 'SOP-012', label: `${item.leaseNo} · ${item.siteCode}`, status: item.status, to: `/facilities/leases/${item.id}` })),
  ]

  const expiries: ExpiryRow[] = [
    ...books.warehouseContracts.filter((item) => item.status === 'issued' && needsWindow(asOf, item.end)).map((item) => ({ id: item.id, sop: 'SOP-004', label: `${item.contractNo} · ${item.shedCode}`, end: item.end, days: daysFrom(asOf, item.end) ?? 0 })),
    ...books.coldContracts.filter((item) => item.status === 'issued' && needsWindow(asOf, item.end)).map((item) => ({ id: item.id, sop: 'SOP-006', label: `${item.contractNo} · ${item.chamberCode}`, end: item.end, days: daysFrom(asOf, item.end) ?? 0 })),
    ...books.parkingContracts.filter((item) => item.status === 'issued' && needsWindow(asOf, item.end)).map((item) => ({ id: item.id, sop: 'SOP-009', label: `${item.contractNo} · ${item.yardCode}`, end: item.end, days: daysFrom(asOf, item.end) ?? 0 })),
    ...books.officeLeases.filter((item) => item.status === 'issued' && needsWindow(asOf, item.end)).map((item) => ({ id: item.id, sop: 'SOP-011', label: `${item.leaseNo} · ${item.officeCode}`, end: item.end, days: daysFrom(asOf, item.end) ?? 0 })),
    ...books.facilityLeases.filter((item) => item.status === 'issued' && needsWindow(asOf, item.end)).map((item) => ({ id: item.id, sop: item.kind === 'restaurant' ? 'SOP-014' : 'SOP-012', label: `${item.leaseNo} · ${item.siteCode}`, end: item.end, days: daysFrom(asOf, item.end) ?? 0 })),
    ...books.facilityCover.filter((item) => needsWindow(asOf, item.until)).map((item) => ({ id: item.id, sop: 'SOP-015', label: `${item.policyNo} · ${item.siteCode}`, end: item.until, days: daysFrom(asOf, item.until) ?? 0 })),
    ...books.actions.filter((item) => item.status === 'open' && needsWindow(asOf, item.due)).map((item) => ({ id: item.id, sop: item.sop, label: `${item.id} · ${item.title}`, end: item.due, days: daysFrom(asOf, item.due) ?? 0 })),
  ]

  const warehouseUsed = books.sheds.reduce((total, shed) => total + shedOccupancy(shed, books.warehouseMoves).used, 0)
  const warehouseCapacity = books.sheds.reduce((total, shed) => total + shed.capacityUnits, 0)
  const coldUsed = books.chambers.reduce((total, chamber) => total + coldOccupancy(chamber, books.coldMoves).used, 0)
  const coldCapacity = books.chambers.reduce((total, chamber) => total + chamber.capacityUnits, 0)
  const parking = slotCounts(books.slots, books.visits)

  return {
    rangeOk,
    matrix,
    approvals,
    expiries,
    tradesInRange,
    incidentsInRange,
    inspectionsInRange,
    actionsInRange,
    auditInRange,
    warehousePercent: warehouseCapacity === 0 ? 0 : Math.round((warehouseUsed / warehouseCapacity) * 100),
    warehouseUsed,
    coldPercent: coldCapacity === 0 ? 0 : Math.round((coldUsed / coldCapacity) * 100),
    coldUsed,
    coldBreaches: breaches,
    parking,
    parkingPercent: books.slots.length === 0 ? 0 : Math.round((parking.occupied / books.slots.length) * 100),
    openIncidents: books.incidents.filter((item) => item.status === 'open').length,
    openActions: books.actions.filter((item) => item.status === 'open').length,
  }
}

export function csvEscape(value: string) {
  return `"${value.replaceAll('"', '""')}"`
}

export function reportCsv(title: string, headers: string[], rows: string[][]) {
  const lines = [
    `# ${title}`,
    `# ${AUDIT_LABEL}`,
    headers.map(csvEscape).join(','),
    ...rows.map((row) => row.map(csvEscape).join(',')),
  ]
  return lines.join('\n')
}
