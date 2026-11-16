export const FACILITY_KINDS = ['kisan-bhavan', 'hotel', 'restaurant'] as const
export type FacilityKind = (typeof FACILITY_KINDS)[number]

export const AGREEMENT_STATUSES = [
  'draft',
  'submitted',
  'under-verification',
  'clarification-required',
  'verified',
  'approved',
  'deposit-recorded',
  'issued',
  'rejected',
] as const
export type AgreementStatus = (typeof AGREEMENT_STATUSES)[number]

export const CHECK_KINDS = ['cleaning', 'fire', 'hygiene', 'operations'] as const
export type CheckKind = (typeof CHECK_KINDS)[number]

export const CHARGE_KINDS = ['deposit', 'rent'] as const
export type ChargeKind = (typeof CHARGE_KINDS)[number]

export interface AgreementStep {
  at: string
  status: AgreementStatus
  note: string
}

export interface Site {
  id: string
  code: string
  name: string
  kind: FacilityKind
  mandiId: string
}

export interface Unit {
  id: string
  code: string
  name: string
  siteId: string
}

export interface FacilityLease {
  id: string
  leaseNo: string
  mandiId: string
  kind: FacilityKind
  siteId: string
  siteCode: string
  operatorId: string
  operatorLabel: string
  purpose: string
  status: AgreementStatus
  depositPaise: number
  receiptId: string
  start: string
  end: string
  history: AgreementStep[]
  createdAt: string
  updatedAt: string
}

export interface Stay {
  id: string
  stayNo: string
  siteId: string
  siteCode: string
  unitId: string
  unitCode: string
  guestCode: string
  nights: number
  status: 'open' | 'closed'
  note: string
}

export interface Charge {
  id: string
  kind: ChargeKind
  sourceNo: string
  placeCode: string
  partyLabel: string
  paise: number
  note: string
  at: string
}

export interface CheckItem {
  id: string
  label: string
  result: 'yes' | 'no'
}

export interface Inspection {
  id: string
  kind: CheckKind
  siteId: string
  siteCode: string
  items: CheckItem[]
  note: string
  at: string
}

export interface MaintenanceLog {
  id: string
  siteId: string
  siteCode: string
  title: string
  status: 'open' | 'closed'
  note: string
  at: string
}

export interface InsuranceRecord {
  id: string
  policyNo: string
  siteId: string
  siteCode: string
  cover: string
  until: string
  note: string
}

export interface FacilityData {
  sites: Site[]
  units: Unit[]
  leases: FacilityLease[]
  stays: Stay[]
  charges: Charge[]
  inspections: Inspection[]
  maintenance: MaintenanceLog[]
  insurance: InsuranceRecord[]
  leaseSeq: number
  staySeq: number
  chargeSeq: number
  inspectionSeq: number
  maintenanceSeq: number
  insuranceSeq: number
}

export type FacilitySave = { ok: true; id: string } | { ok: false; message: string }
