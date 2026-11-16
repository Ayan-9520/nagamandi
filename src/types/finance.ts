export const NOTE_STATUSES = ['draft', 'approved', 'redeemed', 'collected', 'cancelled'] as const
export type NoteStatus = (typeof NOTE_STATUSES)[number]

export const CREDIT_MOVES = ['approved', 'redeemed', 'cancelled'] as const
export type CreditMove = (typeof CREDIT_MOVES)[number]

export const DEBIT_MOVES = ['approved', 'collected', 'cancelled'] as const
export type DebitMove = (typeof DEBIT_MOVES)[number]

export const RECON_STATUSES = ['open', 'checked', 'closed'] as const
export type ReconStatus = (typeof RECON_STATUSES)[number]

export const CLOSING_STATUSES = ['open', 'submitted', 'approved', 'closed'] as const
export type ClosingStatus = (typeof CLOSING_STATUSES)[number]

export const RECEIPT_KINDS = ['seller-payment', 'buyer-collection', 'credit-redemption', 'debit-collection'] as const
export type ReceiptKind = (typeof RECEIPT_KINDS)[number]

export interface OpeningSecurity {
  id: string
  aadathiyaId: string
  aadathiyaLabel: string
  amountPaise: number
  note: string
}

export interface CreditNote {
  id: string
  noteNo: string
  tradeId: string
  tradeNo: string
  mandiId: string
  sellerId: string
  sellerLabel: string
  aadathiyaId: string
  aadathiyaLabel: string
  amountPaise: number
  status: 'draft' | 'approved' | 'redeemed' | 'cancelled'
  receiptId: string
  createdAt: string
  updatedAt: string
}

export interface DebitNote {
  id: string
  noteNo: string
  tradeId: string
  tradeNo: string
  mandiId: string
  buyerId: string
  buyerLabel: string
  aadathiyaId: string
  aadathiyaLabel: string
  amountPaise: number
  status: 'draft' | 'approved' | 'collected' | 'cancelled'
  receiptId: string
  createdAt: string
  updatedAt: string
}

export interface FinanceReceipt {
  id: string
  receiptNo: string
  kind: ReceiptKind
  tradeId: string
  tradeNo: string
  partyLabel: string
  aadathiyaLabel: string
  amountPaise: number
  sourceId: string
  note: string
  at: string
}

export interface BookTotals {
  licenceFeePaise: number
  securityPostedPaise: number
  securityAvailablePaise: number
  commissionPaise: number
  buyerOutstandingPaise: number
  sellerOutstandingPaise: number
  openCreditPaise: number
  redeemedCreditPaise: number
  openDebitPaise: number
  receiptPaise: number
}

export interface Reconciliation {
  day: string
  status: ReconStatus
  snapshot: BookTotals | null
  note: string
  updatedAt: string
}

export interface DayClosing {
  day: string
  status: ClosingStatus
  note: string
  updatedAt: string
}

export interface FinanceData {
  opening: OpeningSecurity[]
  creditNotes: CreditNote[]
  debitNotes: DebitNote[]
  receipts: FinanceReceipt[]
  reconciliation: Reconciliation
  closing: DayClosing
  creditSeq: number
  debitSeq: number
  receiptSeq: number
  commissionApproved: string[]
}

export type FinanceSave = { ok: true; id: string } | { ok: false; message: string }
