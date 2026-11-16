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

export const CHECK_KINDS = ['cleaning', 'fire', 'security'] as const
export type CheckKind = (typeof CHECK_KINDS)[number]

export interface Shed {
  id: string
  code: string
  name: string
  mandiId: string
  capacityUnits: number
}

export interface ContractStep {
  at: string
  status: ContractStatus
  note: string
}

export interface WarehouseContract {
  id: string
  contractNo: string
  mandiId: string
  shedId: string
  shedCode: string
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
  shedId: string
  shedCode: string
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
  shedId: string
  shedCode: string
  items: CheckItem[]
  note: string
  at: string
}

export interface InsuranceRecord {
  id: string
  policyNo: string
  shedId: string
  shedCode: string
  cover: string
  until: string
  note: string
}

export interface MaintenanceLog {
  id: string
  shedId: string
  shedCode: string
  title: string
  status: 'open' | 'closed'
  note: string
  at: string
}

export interface WarehouseData {
  sheds: Shed[]
  contracts: WarehouseContract[]
  moves: StockMove[]
  inspections: Inspection[]
  insurance: InsuranceRecord[]
  maintenance: MaintenanceLog[]
  contractSeq: number
  moveSeq: number
  inspectionSeq: number
  insuranceSeq: number
  maintenanceSeq: number
}

export type WarehouseSave = { ok: true; id: string } | { ok: false; message: string }
