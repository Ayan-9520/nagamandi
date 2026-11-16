import type { RoleId } from '@/types/access'
import type { AgreementStatus, CheckKind, FacilityKind, Stay } from '@/types/facility'

export const FACILITY_DAY = '2026-11-14'

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

export const FACILITY_TEMPLATES: Record<FacilityKind, {
  title: string
  leaseSop: string
  operationsSop: string
  unitNoun: string
  stayNoun: string
  checks: CheckKind[]
}> = {
  'kisan-bhavan': {
    title: 'Kisan Bhavan',
    leaseSop: 'SOP-012',
    operationsSop: 'SOP-013',
    unitNoun: 'Hall',
    stayNoun: 'Booking',
    checks: ['cleaning', 'fire'],
  },
  hotel: {
    title: 'Hotel',
    leaseSop: 'SOP-012',
    operationsSop: 'SOP-013',
    unitNoun: 'Room',
    stayNoun: 'Stay',
    checks: ['cleaning', 'fire'],
  },
  restaurant: {
    title: 'Restaurant',
    leaseSop: 'SOP-014',
    operationsSop: 'SOP-015',
    unitNoun: 'Service area',
    stayNoun: 'Service',
    checks: ['cleaning', 'fire', 'hygiene', 'operations'],
  },
}

export const CHECK_ITEMS: Record<CheckKind, { id: string; label: string }[]> = {
  cleaning: [
    { id: 'floor', label: 'Floors cleaned' },
    { id: 'waste', label: 'Waste removed' },
    { id: 'linen', label: 'Linen or service cloths changed' },
  ],
  fire: [
    { id: 'extinguisher', label: 'Extinguisher in place' },
    { id: 'exit', label: 'Exit clear' },
    { id: 'alarm', label: 'Alarm noted as working' },
  ],
  hygiene: [
    { id: 'storage', label: 'Food stored off the floor' },
    { id: 'surfaces', label: 'Preparation surfaces cleaned' },
    { id: 'water', label: 'Wash water noted as clean' },
  ],
  operations: [
    { id: 'menu', label: 'Service list current' },
    { id: 'staff', label: 'Desk roster noted' },
    { id: 'waste', label: 'Service waste closed' },
  ],
}

export function isFacilityKind(value: string): value is FacilityKind {
  return value === 'kisan-bhavan' || value === 'hotel' || value === 'restaurant'
}

export function canDecideFacility(roleId: RoleId) {
  return roleId === 'super-admin' || roleId === 'mandi-manager'
}

export function canOperateFacility(roleId: RoleId) {
  return canDecideFacility(roleId) || roleId === 'facility-operator'
}

export function daysUntil(until: string) {
  const start = Date.parse(`${FACILITY_DAY}T00:00:00+05:30`)
  const end = Date.parse(`${until}T00:00:00+05:30`)
  return Math.round((end - start) / 86_400_000)
}

export function needsAlert(until: string) {
  return daysUntil(until) <= 30
}

export function guestText(text: string) {
  const code = text.trim().toUpperCase()
  if (!/^GS-\d{2,4}$/.test(code)) return null
  return code
}

export function nightsText(text: string) {
  const trimmed = text.trim()
  if (!/^[1-9]\d*$/.test(trimmed)) return null
  const nights = Number(trimmed)
  if (nights > 30) return null
  return nights
}

export function issuedSite(leases: { siteId: string; status: AgreementStatus }[], siteId: string) {
  return leases.find((row) => row.siteId === siteId && row.status === 'issued')
}

export function liveSite(leases: { siteId: string; status: AgreementStatus }[], siteId: string) {
  return leases.find((row) => row.siteId === siteId && row.status !== 'rejected')
}

export function openStay(stays: Stay[], unitId: string) {
  return stays.find((row) => row.unitId === unitId && row.status === 'open')
}

export function canStay(stays: Stay[], leases: { siteId: string; status: AgreementStatus }[], siteId: string, unitId: string) {
  if (!issuedSite(leases, siteId)) return 'Issue the lease before a stay can be recorded.'
  if (openStay(stays, unitId)) return 'That unit already has an open stay.'
  return null
}
