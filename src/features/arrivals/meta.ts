import type { ArrivalStatus, WeighBay } from '@/types/arrival'

export const ARRIVAL_AS_OF = '2026-11-14'

export function statusLabel(status: ArrivalStatus) {
  const labels: Record<ArrivalStatus, string> = {
    arrived: 'Arrived',
    'under-inspection': 'Under Inspection',
    available: 'Available',
    reserved: 'Reserved',
    sold: 'Sold',
    dispatched: 'Dispatched',
    cancelled: 'Cancelled',
  }
  return labels[status]
}

export function movementPlace(status: ArrivalStatus) {
  const places: Record<ArrivalStatus, string> = {
    arrived: 'Gate',
    'under-inspection': 'Inspection bay',
    available: 'Auction floor',
    reserved: 'Holding',
    sold: 'Auction floor',
    dispatched: 'Exit',
    cancelled: 'Gate',
  }
  return places[status]
}

export const NEXT_STATUS: Record<ArrivalStatus, ArrivalStatus[]> = {
  arrived: ['under-inspection', 'cancelled'],
  'under-inspection': ['available', 'cancelled'],
  available: ['reserved', 'sold', 'cancelled'],
  reserved: ['available', 'sold', 'cancelled'],
  sold: ['dispatched'],
  dispatched: [],
  cancelled: [],
}

export function canMove(from: ArrivalStatus, to: ArrivalStatus) {
  return NEXT_STATUS[from].includes(to)
}

export function kalDate(iso: string) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(iso))
}

export function formatQty(value: number, symbol: string) {
  const text = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 3 }).format(value)
  return `${text} ${symbol}`
}

export function bayLabel(bay: WeighBay) {
  return bay === 'WB-01' ? 'WB-01 north' : 'WB-02 south'
}
