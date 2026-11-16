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

export const VISIT_STATUSES = ['reserved', 'inside', 'exited'] as const
export type VisitStatus = (typeof VISIT_STATUSES)[number]

export const SLOT_STATES = ['available', 'occupied', 'reserved'] as const
export type SlotState = (typeof SLOT_STATES)[number]

export const CHARGE_KINDS = ['deposit', 'rent'] as const
export type ChargeKind = (typeof CHARGE_KINDS)[number]

export interface Yard {
  id: string
  code: string
  name: string
  mandiId: string
}

export interface Office {
  id: string
  code: string
  name: string
  mandiId: string
}

export interface Slot {
  id: string
  code: string
  yardId: string
}

export interface AgreementStep {
  at: string
  status: AgreementStatus
  note: string
}

export interface ParkingContract {
  id: string
  contractNo: string
  mandiId: string
  yardId: string
  yardCode: string
  operatorId: string
  operatorLabel: string
  experience: string
  status: AgreementStatus
  depositPaise: number
  receiptId: string
  start: string
  end: string
  history: AgreementStep[]
  createdAt: string
  updatedAt: string
}

export interface OfficeLease {
  id: string
  leaseNo: string
  mandiId: string
  officeId: string
  officeCode: string
  lesseeId: string
  lesseeLabel: string
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

export interface Vehicle {
  id: string
  vehicleNo: string
  transporterId: string
  transporterLabel: string
  note: string
}

export interface Visit {
  id: string
  visitNo: string
  vehicleId: string
  vehicleNo: string
  transporterId: string
  transporterLabel: string
  yardId: string
  yardCode: string
  slotId: string
  slotCode: string
  status: VisitStatus
  passNo: string
  enteredAt: string
  exitedAt: string
  hours: number
  feePaise: number
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

export interface ParkingData {
  yards: Yard[]
  offices: Office[]
  slots: Slot[]
  contracts: ParkingContract[]
  leases: OfficeLease[]
  vehicles: Vehicle[]
  visits: Visit[]
  charges: Charge[]
  contractSeq: number
  leaseSeq: number
  vehicleSeq: number
  visitSeq: number
  chargeSeq: number
}

export type ParkingSave = { ok: true; id: string } | { ok: false; message: string }
