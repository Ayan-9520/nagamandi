export const YARD_IDS = ['dimapur', 'kohima', 'mokokchung', 'wokha', 'tuensang'] as const
export type YardId = (typeof YARD_IDS)[number]

export const COMMODITIES = [
  'Naga king chilli',
  'Ginger',
  'Pineapple',
  'Sticky rice',
  'Large cardamom',
  'Orange',
  'Kiwi',
  'Bamboo shoot',
] as const
export type Commodity = (typeof COMMODITIES)[number]

export const LOT_STATUSES = ['Gate in', 'Weighed', 'On floor', 'Dispatched'] as const
export type LotStatus = (typeof LOT_STATUSES)[number]

export const LICENCE_STATUSES = ['Active', 'Expiring', 'Suspended', 'Pending'] as const
export type LicenceStatus = (typeof LICENCE_STATUSES)[number]

export type DataScenario = 'success' | 'empty' | 'error'
export type ThemeMode = 'light' | 'dark'
export type LoadState = 'loading' | 'success' | 'empty' | 'error'

export interface Yard {
  id: YardId
  name: string
}

export interface ArrivalPoint {
  date: string
  yardId: YardId
  commodity: Commodity
  quantityMt: number
}

export interface TradePoint {
  weekEnding: string
  weekLabel: string
  yardId: YardId
  commodity: Commodity
  volumeLakh: number
}

export interface LicenceCount {
  yardId: YardId
  status: LicenceStatus
  count: number
}

export interface YardInfrastructure {
  yardId: YardId
  occupancyPct: number
  complianceOpen: number
  coldOnline: number
  coldTotal: number
}

export interface GateLot {
  id: string
  arrivedAt: string
  vehicleNo: string
  commodity: Commodity
  quantityMt: number
  yardId: YardId
  status: LotStatus
  grower: string
}

export interface DemoNotification {
  id: string
  title: string
  body: string
  at: string
  tone: 'info' | 'warning' | 'success'
}

export interface NavIconName {
  name:
    | 'dashboard'
    | 'field'
    | 'stakeholders'
    | 'licences'
    | 'arrivals'
    | 'trading'
    | 'finance'
    | 'warehouses'
    | 'cold-storage'
    | 'post-harvest'
    | 'parking'
    | 'facilities'
    | 'compliance'
    | 'reports'
    | 'settings'
}

export interface NavItem {
  id: string
  title: string
  to: string
  icon: NavIconName['name']
  summary: string
  sop: string
  available: boolean
}

export interface ArrivalBar {
  date: string
  label: string
  quantityMt: number
}

export interface TradeBar {
  week: string
  volumeLakh: number
}

export interface LicenceSlice {
  status: LicenceStatus
  count: number
}

export interface DashboardSnapshot {
  asOf: string
  arrivalsMt: number
  lotCount: number
  tradeLakh: number
  activeLicences: number
  occupancyPct: number
  complianceOpen: number
  coldOnline: number
  coldTotal: number
  arrivalSeries: ArrivalBar[]
  tradeSeries: TradeBar[]
  licenceSeries: LicenceSlice[]
  lots: GateLot[]
}

export interface DashboardFilter {
  yardId: string
  commodity: string
  days: '7' | '14' | '30'
}

export interface SearchHit {
  id: string
  kind: 'module' | 'lot' | 'record'
  title: string
  detail: string
  to: string
}
