export const PRICE_METHODS = ['negotiated', 'auction-record', 'hatha'] as const
export type PriceMethod = (typeof PRICE_METHODS)[number]

export const TRADE_STATUSES = ['negotiating', 'confirmed', 'documented', 'cancelled'] as const
export type TradeStatus = (typeof TRADE_STATUSES)[number]

export const PAYMENT_STATUSES = ['pending', 'credit-note', 'debit-note', 'noted'] as const
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number]

export const REQUIREMENT_STATUSES = ['open', 'matched', 'withdrawn'] as const
export type RequirementStatus = (typeof REQUIREMENT_STATUSES)[number]

export interface TradeRates {
  sellerCommissionPercent: number
  buyerCommissionPercent: number
  hamaliPerUnit: number
}

export interface TradeFigures {
  saleValue: number
  sellerCommission: number
  buyerCommission: number
  hamali: number
  transport: number
  sellerNet: number
  buyerDue: number
}

export interface TradeNote {
  id: string
  at: string
  kind: 'discovery' | 'confirmed' | 'documented' | 'cancelled' | 'payment'
  method: PriceMethod | null
  text: string
}

export interface TradeRecord {
  id: string
  tradeNo: string
  mandiId: string
  lotId: string
  lotNo: string
  sellerId: string
  sellerLabel: string
  buyerId: string
  buyerLabel: string
  aadathiyaId: string
  aadathiyaLabel: string
  commodityId: string
  commodityName: string
  gradeName: string
  unitSymbol: string
  quantity: number
  price: number
  method: PriceMethod
  rates: TradeRates
  figures: TradeFigures
  status: TradeStatus
  paymentStatus: PaymentStatus
  sellerParchiNo: string
  buyerParchiNo: string
  qrPayload: string
  notes: TradeNote[]
  createdAt: string
  updatedAt: string
}

export interface BuyerRequirement {
  id: string
  requirementNo: string
  mandiId: string
  buyerId: string
  buyerLabel: string
  commodityId: string
  commodityName: string
  unitId: string
  unitSymbol: string
  quantity: number
  note: string
  status: RequirementStatus
  createdAt: string
  updatedAt: string
}

export interface TradeDraft {
  lotId: string
  buyerId: string
  method: PriceMethod
  quantity: number
  price: number
  transport: number
  note: string
}

export interface RequirementDraft {
  buyerId: string
  commodityId: string
  unitId: string
  quantity: number
  note: string
}

export interface TradeData {
  trades: TradeRecord[]
  requirements: BuyerRequirement[]
  tradeSeq: number
  requirementSeq: number
  rates: TradeRates
}

export type TradeSave = { ok: true; id: string } | { ok: false; message: string }
