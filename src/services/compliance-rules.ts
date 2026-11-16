import type { RoleId } from '@/types/access'

export const COMMAND_DAY = '2026-11-14'
export const AUDIT_LABEL = 'Demo record. Not authoritative evidence.'

export const SOP_CATALOG = [
  { number: 'SOP-001', name: 'Licence issue', department: 'Licence desk', screens: [{ label: 'Licences', to: '/licences' }] },
  { number: 'SOP-002', name: 'Mandi sales', department: 'Trading desk', screens: [{ label: 'Trading', to: '/trading' }, { label: 'Finance', to: '/finance' }] },
  { number: 'SOP-003', name: 'Mandi buying', department: 'Trading desk', screens: [{ label: 'Trading', to: '/trading' }] },
  { number: 'SOP-004', name: 'Warehouse contract award', department: 'Warehouse desk', screens: [{ label: 'Warehouses', to: '/warehouses' }] },
  { number: 'SOP-005', name: 'Warehouse operations', department: 'Warehouse desk', screens: [{ label: 'Warehouses', to: '/warehouses' }] },
  { number: 'SOP-006', name: 'Cold storage contract award', department: 'Cold storage desk', screens: [{ label: 'Cold storage', to: '/cold-storage' }] },
  { number: 'SOP-007', name: 'Cold storage operations', department: 'Cold storage desk', screens: [{ label: 'Cold storage', to: '/cold-storage' }] },
  { number: 'SOP-008', name: 'Post-harvest and FLP operations', department: 'Post-harvest desk', screens: [{ label: 'Post-harvest', to: '/post-harvest' }] },
  { number: 'SOP-009', name: 'Parking contract', department: 'Parking desk', screens: [{ label: 'Parking', to: '/parking' }] },
  { number: 'SOP-010', name: 'Vehicle parking', department: 'Parking desk', screens: [{ label: 'Parking', to: '/parking' }] },
  { number: 'SOP-011', name: 'Transport office lease', department: 'Parking desk', screens: [{ label: 'Parking', to: '/parking' }] },
  { number: 'SOP-012', name: 'Kisan Bhavan and hotel lease', department: 'Facilities desk', screens: [{ label: 'Kisan Bhavan', to: '/facilities/kisan' }, { label: 'Hotel', to: '/facilities/hotel' }] },
  { number: 'SOP-013', name: 'Kisan Bhavan and hotel operations', department: 'Facilities desk', screens: [{ label: 'Facilities', to: '/facilities' }] },
  { number: 'SOP-014', name: 'Restaurant lease', department: 'Facilities desk', screens: [{ label: 'Restaurant', to: '/facilities/restaurant' }] },
  { number: 'SOP-015', name: 'Restaurant operations', department: 'Facilities desk', screens: [{ label: 'Facilities', to: '/facilities' }] },
] as const

export type SopNumber = (typeof SOP_CATALOG)[number]['number']

export function isSopNumber(value: string): value is SopNumber {
  return SOP_CATALOG.some((row) => row.number === value)
}

export function canPostCompliance(roleId: RoleId) {
  return roleId === 'super-admin' || roleId === 'mandi-manager'
}

export function dayOf(value: string) {
  return value.slice(0, 10)
}

export function inRange(value: string, from: string, to: string) {
  const day = dayOf(value)
  return day >= from && day <= to
}

export function daysFrom(asOf: string, end: string) {
  const start = Date.parse(`${asOf}T00:00:00Z`)
  const finish = Date.parse(`${dayOf(end)}T00:00:00Z`)
  if (Number.isNaN(start) || Number.isNaN(finish)) return null
  return Math.round((finish - start) / 86_400_000)
}

export function needsWindow(asOf: string, end: string) {
  const days = daysFrom(asOf, end)
  return days !== null && days <= 30
}
