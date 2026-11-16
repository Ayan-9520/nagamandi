import type { RoleId } from '@/types/access'
import type { AgreementStatus, SlotState, Visit, Yard } from '@/types/parking'

export const PARKING_DAY = '2026-11-14'
export const FEE_PAISE_PER_HOUR = 2000

export const NEXT_AGREEMENT: Record<AgreementStatus, AgreementStatus[]> = {
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

export function canDecideParking(roleId: RoleId) {
  return roleId === 'super-admin' || roleId === 'mandi-manager'
}

export function canOperateParking(roleId: RoleId) {
  return canDecideParking(roleId) || roleId === 'parking-operator'
}

export function daysUntil(until: string) {
  const start = Date.parse(`${PARKING_DAY}T00:00:00+05:30`)
  const end = Date.parse(`${until}T00:00:00+05:30`)
  return Math.round((end - start) / 86_400_000)
}

export function needsAlert(until: string) {
  return daysUntil(until) <= 30
}

export function hoursText(text: string) {
  const trimmed = text.trim()
  if (!/^[1-9]\d*$/.test(trimmed)) return null
  const hours = Number(trimmed)
  if (hours > 48) return null
  return hours
}

export function plateText(text: string) {
  const plate = text.trim().toUpperCase()
  if (!/^[A-Z0-9-]{6,16}$/.test(plate)) return null
  return plate
}

export function activeVisit(visits: Visit[], vehicleId: string) {
  return visits.find((row) => row.vehicleId === vehicleId && row.status !== 'exited')
}

export function slotVisit(visits: Visit[], slotId: string) {
  return visits.find((row) => row.slotId === slotId && row.status !== 'exited')
}

export function slotState(visits: Visit[], slotId: string): SlotState {
  const visit = slotVisit(visits, slotId)
  if (!visit) return 'available'
  return visit.status === 'inside' ? 'occupied' : 'reserved'
}

export function issuedYard(contracts: { yardId: string; status: AgreementStatus }[], yardId: string) {
  return contracts.find((row) => row.yardId === yardId && row.status === 'issued')
}

export function liveYard(contracts: { yardId: string; status: AgreementStatus }[], yardId: string) {
  return contracts.find((row) => row.yardId === yardId && row.status !== 'rejected')
}

export function issuedOffice(leases: { officeId: string; status: AgreementStatus }[], officeId: string) {
  return leases.find((row) => row.officeId === officeId && row.status === 'issued')
}

export function liveOffice(leases: { officeId: string; status: AgreementStatus }[], officeId: string) {
  return leases.find((row) => row.officeId === officeId && row.status !== 'rejected')
}

export function canReserve(visits: Visit[], contracts: { yardId: string; status: AgreementStatus }[], yard: Yard, slotId: string, vehicleId: string) {
  if (!issuedYard(contracts, yard.id)) return 'Issue the parking contract before a slot can be reserved.'
  if (activeVisit(visits, vehicleId)) return 'This vehicle already has an active visit.'
  const state = slotState(visits, slotId)
  if (state === 'occupied') return 'That slot is occupied by an active visit.'
  if (state === 'reserved') return 'That slot is reserved for another vehicle.'
  return null
}

export function canEnter(visits: Visit[], contracts: { yardId: string; status: AgreementStatus }[], yard: Yard, slotId: string, vehicleId: string) {
  if (!issuedYard(contracts, yard.id)) return 'Issue the parking contract before a vehicle can enter.'
  const current = activeVisit(visits, vehicleId)
  if (current?.status === 'inside') return 'This vehicle is already inside.'
  if (current?.status === 'reserved' && current.slotId !== slotId) return 'Enter on the slot already reserved for this vehicle.'
  if (current?.status === 'reserved') return null
  const state = slotState(visits, slotId)
  if (state === 'occupied') return 'That slot is occupied by an active visit.'
  if (state === 'reserved') return 'That slot is reserved for another vehicle.'
  return null
}

export function slotCounts(slots: { id: string }[], visits: Visit[]) {
  return slots.reduce(
    (total, slot) => {
      total[slotState(visits, slot.id)] += 1
      return total
    },
    { available: 0, occupied: 0, reserved: 0 },
  )
}
