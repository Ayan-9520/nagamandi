export const PARTY_KINDS = [
  'farmer',
  'buyer',
  'aadathiya',
  'transporter',
  'warehouse-operator',
  'facility-operator',
] as const
export type PartyKind = (typeof PARTY_KINDS)[number]

export const CATALOG_KINDS = ['commodity', 'grade', 'unit', 'location', 'fee'] as const
export type CatalogKind = (typeof CATALOG_KINDS)[number]

export type RegistryCollection = PartyKind | CatalogKind
export type RecordStatus = 'Active' | 'Inactive' | 'Removed'
export type WorkingStatus = 'Active' | 'Inactive'
export type UnitKind = 'Weight' | 'Count' | 'Volume'

export interface DemoDocument {
  id: string
  name: string
  mimeType: string
  size: number
  previewDataUrl: string | null
  addedAt: string
}

export interface ActivityEntry {
  id: string
  at: string
  title: string
  detail: string
  recordId: string
  collection: RegistryCollection
}

export interface SampleTransaction {
  id: string
  partyId: string
  mandiId: string
  at: string
  summary: string
  amountLabel: string
}

export interface SampleLicence {
  id: string
  partyId: string
  mandiId: string
  band: 'Active' | 'Expiring' | 'Pending'
  label: string
  detail: string
}

export interface Party {
  id: string
  mandiId: string
  kind: PartyKind
  label: string
  area: string
  phone: string
  status: RecordStatus
  commodityId: string
  notes: string
  vehicleNo: string
  siteCode: string
  documents: DemoDocument[]
  createdAt: string
  updatedAt: string
}

export interface PartyInput {
  label: string
  area: string
  phone: string
  status: WorkingStatus
  commodityId: string
  notes: string
  vehicleNo: string
  siteCode: string
  documents: DemoDocument[]
}

export interface CommodityRecord {
  id: string
  mandiId: string
  name: string
  category: string
  season: string
  status: RecordStatus
  createdAt: string
  updatedAt: string
}

export interface CommodityInput {
  name: string
  category: string
  season: string
  status: WorkingStatus
}

export interface GradeRecord {
  id: string
  mandiId: string
  commodityId: string
  name: string
  description: string
  status: RecordStatus
  createdAt: string
  updatedAt: string
}

export interface GradeInput {
  commodityId: string
  name: string
  description: string
  status: WorkingStatus
}

export interface UnitRecord {
  id: string
  mandiId: string
  name: string
  symbol: string
  kind: UnitKind
  status: RecordStatus
  createdAt: string
  updatedAt: string
}

export interface UnitInput {
  name: string
  symbol: string
  kind: UnitKind
  status: WorkingStatus
}

export interface LocationRecord {
  id: string
  mandiId: string
  name: string
  district: string
  code: string
  active: boolean
  status: RecordStatus
  createdAt: string
  updatedAt: string
}

export interface LocationInput {
  name: string
  district: string
  code: string
  status: WorkingStatus
  active: boolean
}

export interface FeeRecord {
  id: string
  mandiId: string
  name: string
  basis: string
  sampleRate: string
  status: RecordStatus
  createdAt: string
  updatedAt: string
}

export interface FeeInput {
  name: string
  basis: string
  sampleRate: string
  status: WorkingStatus
}

export interface RegistryData {
  parties: Party[]
  commodities: CommodityRecord[]
  grades: GradeRecord[]
  units: UnitRecord[]
  locations: LocationRecord[]
  fees: FeeRecord[]
  activities: ActivityEntry[]
  transactions: SampleTransaction[]
  licences: SampleLicence[]
  seq: number
}

export type SaveResult = { ok: true; id: string } | { ok: false; message: string }
