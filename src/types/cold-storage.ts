export const CONTRACT_STATUSES = [
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
export type ContractStatus = (typeof CONTRACT_STATUSES)[number]

export const MOVE_KINDS = ['inward', 'outward'] as const
export type MoveKind = (typeof MOVE_KINDS)[number]

export const CHECK_KINDS = ['hygiene', 'fire', 'security', 'gas'] as const
export type CheckKind = (typeof CHECK_KINDS)[number]

export const READING_SOURCES = ['simulated-sensor', 'manual'] as const
export type ReadingSource = (typeof READING_SOURCES)[number]

export interface Chamber {
  id: string
  code: string
  name: string
  mandiId: string
  capacityUnits: number
  minTenths: number
  maxTenths: number
  setpointTenths: number
}

export interface ContractStep {
  at: string
  status: ContractStatus
  note: string
}

export interface ColdContract {
  id: string
  contractNo: string
  mandiId: string
  chamberId: string
  chamberCode: string
  operatorId: string
  operatorLabel: string
  experience: string
  status: ContractStatus
  depositPaise: number
  receiptId: string
  start: string
  end: string
  history: ContractStep[]
  createdAt: string
  updatedAt: string
}

export interface StockMove {
  id: string
  moveNo: string
  kind: MoveKind
  chamberId: string
  chamberCode: string
  lotId: string
  lotNo: string
  commodityName: string
  gradeName: string
  unitSymbol: string
  quantityUnits: number
  partyLabel: string
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
  chamberId: string
  chamberCode: string
  items: CheckItem[]
  note: string
  at: string
}

export interface InsuranceRecord {
  id: string
  policyNo: string
  chamberId: string
  chamberCode: string
  cover: string
  until: string
  note: string
}

export interface MaintenanceLog {
  id: string
  chamberId: string
  chamberCode: string
  title: string
  status: 'open' | 'closed'
  note: string
  at: string
}

export interface TemperatureReading {
  id: string
  chamberId: string
  chamberCode: string
  tenths: number
  source: ReadingSource
  note: string
  at: string
}

export interface IncidentReport {
  id: string
  chamberId: string
  chamberCode: string
  title: string
  status: 'open' | 'closed'
  note: string
  at: string
}

export interface ColdData {
  chambers: Chamber[]
  contracts: ColdContract[]
  moves: StockMove[]
  inspections: Inspection[]
  insurance: InsuranceRecord[]
  maintenance: MaintenanceLog[]
  readings: TemperatureReading[]
  incidents: IncidentReport[]
  contractSeq: number
  moveSeq: number
  inspectionSeq: number
  insuranceSeq: number
  maintenanceSeq: number
  readingSeq: number
  incidentSeq: number
}

export type ColdSave = { ok: true; id: string } | { ok: false; message: string }
