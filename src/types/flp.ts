export const GRADE_KINDS = ['grade', 'waste'] as const
export type GradeKind = (typeof GRADE_KINDS)[number]

export const MOVE_KINDS = ['inward', 'outward'] as const
export type MoveKind = (typeof MOVE_KINDS)[number]

export const CHECK_KINDS = ['cleaning', 'safety'] as const
export type CheckKind = (typeof CHECK_KINDS)[number]

export interface FlpUnit {
  id: string
  code: string
  name: string
  mandiId: string
  capacityUnits: number
}

export interface ProcessingBatch {
  id: string
  batchNo: string
  unitId: string
  unitCode: string
  lotId: string
  lotNo: string
  sellerId: string
  sellerLabel: string
  commodityName: string
  gradeName: string
  intakeUnits: number
  note: string
  at: string
}

export interface GradeLine {
  id: string
  batchId: string
  kind: GradeKind
  label: string
  quantityUnits: number
  at: string
}

export interface PackLine {
  id: string
  batchId: string
  gradeLabel: string
  packCount: number
  quantityUnits: number
  at: string
}

export interface OutputRecord {
  id: string
  batchId: string
  outputNo: string
  quantityUnits: number
  note: string
  at: string
}

export interface MaterialMove {
  id: string
  moveNo: string
  kind: MoveKind
  unitId: string
  unitCode: string
  batchId: string
  item: string
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
  unitId: string
  unitCode: string
  items: CheckItem[]
  note: string
  at: string
}

export interface MaintenanceLog {
  id: string
  unitId: string
  unitCode: string
  title: string
  status: 'open' | 'closed'
  note: string
  at: string
}

export interface InsuranceRecord {
  id: string
  policyNo: string
  unitId: string
  unitCode: string
  cover: string
  until: string
  note: string
}

export interface IncidentReport {
  id: string
  unitId: string
  unitCode: string
  title: string
  status: 'open' | 'closed'
  note: string
  at: string
}

export interface DailyReport {
  id: string
  reportNo: string
  day: string
  batchCount: number
  intakeUnits: number
  outputUnits: number
  discrepancyUnits: number
  status: 'filed' | 'noted'
  note: string
  at: string
}

export interface FlpData {
  units: FlpUnit[]
  batches: ProcessingBatch[]
  grades: GradeLine[]
  packs: PackLine[]
  outputs: OutputRecord[]
  moves: MaterialMove[]
  inspections: Inspection[]
  maintenance: MaintenanceLog[]
  insurance: InsuranceRecord[]
  incidents: IncidentReport[]
  reports: DailyReport[]
  batchSeq: number
  gradeSeq: number
  packSeq: number
  outputSeq: number
  moveSeq: number
  inspectionSeq: number
  maintenanceSeq: number
  insuranceSeq: number
  incidentSeq: number
  reportSeq: number
}

export type FlpSave = { ok: true; id: string } | { ok: false; message: string }
