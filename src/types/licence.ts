export const LICENCE_STATUSES = [
  'submitted',
  'under-verification',
  'clarification-required',
  'pending-approval',
  'rejected',
  'approved',
  'fee-recorded',
  'issued',
] as const

export type LicenceStatus = (typeof LICENCE_STATUSES)[number]

export const LICENCE_CATEGORIES = ['vendor', 'trader', 'buyer'] as const
export type LicenceCategory = (typeof LICENCE_CATEGORIES)[number]

export const REQUEST_KINDS = ['new', 'renewal', 'modification'] as const
export type RequestKind = (typeof REQUEST_KINDS)[number]

export const CHECK_MARKS = ['pending', 'pass', 'fail'] as const
export type CheckMark = (typeof CHECK_MARKS)[number]

export const DOC_SLOTS = ['identity', 'registration', 'tax', 'additional'] as const
export type DocSlot = (typeof DOC_SLOTS)[number]

export const PAYMENT_METHODS = ['Simulated desk note', 'Simulated transfer'] as const
export type PaymentMethod = (typeof PAYMENT_METHODS)[number]

export interface LicenceDocument {
  id: string
  slot: DocSlot
  name: string
  mimeType: string
  size: number
  previewDataUrl: string | null
  addedAt: string
}

export interface LicenceChecklist {
  identity: CheckMark
  registration: CheckMark
  tax: CheckMark
  additional: CheckMark
  formComplete: CheckMark
  documentsAttached: CheckMark
  remarks: string
}

export interface LicenceFee {
  feeLabel: string
  depositLabel: string
  method: PaymentMethod | ''
  receiptId: string | null
  recordedAt: string | null
}

export interface LicenceEvent {
  id: string
  at: string
  title: string
  detail: string
}

export interface LicenceCase {
  id: string
  mandiId: string
  kind: RequestKind
  status: LicenceStatus
  category: LicenceCategory
  partyId: string
  ownerAccountId: string
  applicantLabel: string
  area: string
  phone: string
  email: string
  businessName: string
  businessArea: string
  registrationNo: string
  taxId: string
  documents: LicenceDocument[]
  checklist: LicenceChecklist
  officerNote: string
  managerNote: string
  clarificationNote: string
  clarificationFrom: 'officer' | 'manager' | ''
  rejectionNote: string
  fee: LicenceFee
  licenceNo: string | null
  issuedAt: string | null
  validFrom: string | null
  validUntil: string | null
  parentId: string | null
  supersededBy: string | null
  qrPayload: string | null
  events: LicenceEvent[]
  createdAt: string
  updatedAt: string
}

export interface LicenceInput {
  partyId: string
  applicantLabel: string
  area: string
  phone: string
  email: string
  businessName: string
  businessArea: string
  registrationNo: string
  taxId: string
  documents: LicenceDocument[]
  declared: boolean
}

export interface LicenceData {
  cases: LicenceCase[]
  seq: number
}

export type SaveResult = { ok: true; id: string } | { ok: false; message: string }
