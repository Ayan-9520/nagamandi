import { round3 } from '@/services/arrival-rules'
import type { RoleId } from '@/types/access'
import type { ArrivalLot, ArrivalStatus } from '@/types/arrival'
import type { PaymentStatus, PriceMethod, TradeDraft, TradeFigures, TradeRates, TradeRecord, TradeStatus } from '@/types/trade'
import { PAYMENT_STATUSES, PRICE_METHODS, TRADE_STATUSES } from '@/types/trade'

export const DEFAULT_RATES: TradeRates = {
  sellerCommissionPercent: 2,
  buyerCommissionPercent: 1,
  hamaliPerUnit: 15,
}

export function round2(value: number) {
  return Math.round(value * 100) / 100
}

export function quoteTrade(quantity: number, price: number, transport: number, rates: TradeRates): TradeFigures {
  const saleValue = round2(quantity * price)
  const sellerCommission = round2((saleValue * rates.sellerCommissionPercent) / 100)
  const buyerCommission = round2((saleValue * rates.buyerCommissionPercent) / 100)
  const hamali = round2(quantity * rates.hamaliPerUnit)
  const transportAmount = round2(transport)
  return {
    saleValue,
    sellerCommission,
    buyerCommission,
    hamali,
    transport: transportAmount,
    sellerNet: round2(saleValue - sellerCommission),
    buyerDue: round2(saleValue + buyerCommission + hamali + transportAmount),
  }
}

export function validateRates(rates: TradeRates) {
  if (!Number.isFinite(rates.sellerCommissionPercent) || rates.sellerCommissionPercent < 0 || rates.sellerCommissionPercent > 15) {
    return 'Seller commission must be from 0 to 15 percent.'
  }
  if (!Number.isFinite(rates.buyerCommissionPercent) || rates.buyerCommissionPercent < 0 || rates.buyerCommissionPercent > 15) {
    return 'Buyer commission must be from 0 to 15 percent.'
  }
  if (!Number.isFinite(rates.hamaliPerUnit) || rates.hamaliPerUnit < 0 || rates.hamaliPerUnit > 500 || round2(rates.hamaliPerUnit) !== rates.hamaliPerUnit) {
    return 'Hamali must be from ₹0 to ₹500 per unit, with at most two decimal places.'
  }
  return null
}

export function committedQuantity(trades: TradeRecord[], lotId: string, exceptId = '') {
  const total = trades
    .filter((row) => row.lotId === lotId && row.id !== exceptId && (row.status === 'confirmed' || row.status === 'documented'))
    .reduce((sum, row) => sum + row.quantity, 0)
  return round3(total)
}

export function documentedQuantity(trades: TradeRecord[], lotId: string) {
  return round3(trades.filter((row) => row.lotId === lotId && row.status === 'documented').reduce((sum, row) => sum + row.quantity, 0))
}

export function openQuantity(lot: ArrivalLot, trades: TradeRecord[], exceptId = '') {
  return round3(lot.quantity - committedQuantity(trades, lot.id, exceptId))
}

const TRADABLE: ArrivalStatus[] = ['available', 'reserved']

export function canTradeLot(lot: ArrivalLot, trades: TradeRecord[]) {
  return TRADABLE.includes(lot.status) && openQuantity(lot, trades) > 0
}

export function validateDraft(draft: TradeDraft, lot: ArrivalLot | undefined, trades: TradeRecord[]) {
  if (!lot || !canTradeLot(lot, trades)) return 'Choose a lot that is still open on the demonstration floor.'
  if (!PRICE_METHODS.includes(draft.method)) return 'Choose negotiated sale, an auction record, or a hatha record.'
  if (!Number.isFinite(draft.quantity) || draft.quantity <= 0) return 'Quantity must be greater than zero.'
  if (draft.quantity > 100000) return 'Quantity must stay within 100,000 of the lot unit.'
  if (round3(draft.quantity) !== draft.quantity) return 'Use at most three decimal places.'
  if (draft.quantity > openQuantity(lot, trades)) return 'Quantity cannot pass the quantity still open on this lot.'
  if (!Number.isFinite(draft.price) || draft.price <= 0) return 'Price must be greater than zero.'
  if (draft.price > 1_000_000) return 'Price must stay within ₹10,00,000 per unit.'
  if (round2(draft.price) !== draft.price) return 'Use at most two decimal places for the price.'
  if (!Number.isFinite(draft.transport) || draft.transport < 0) return 'Transport cannot be negative.'
  if (draft.transport > 1_000_000) return 'Transport must stay within ₹10,00,000.'
  if (round2(draft.transport) !== draft.transport) return 'Use at most two decimal places for transport.'
  if (draft.note.trim().length < 8) return 'Add a negotiation note of at least 8 characters.'
  return null
}

export function validateRequirementQuantity(quantity: number) {
  if (!Number.isFinite(quantity) || quantity <= 0) return 'Quantity must be greater than zero.'
  if (quantity > 100000) return 'Quantity must stay within 100,000 of the chosen unit.'
  if (round3(quantity) !== quantity) return 'Use at most three decimal places.'
  return null
}

export const NEXT_TRADE: Record<TradeStatus, TradeStatus[]> = {
  negotiating: ['confirmed', 'cancelled'],
  confirmed: ['documented', 'cancelled'],
  documented: [],
  cancelled: [],
}

export function canMoveTrade(from: TradeStatus, to: TradeStatus) {
  return NEXT_TRADE[from].includes(to)
}

export function nextPayment(status: PaymentStatus): PaymentStatus[] {
  if (status === 'pending') return ['credit-note', 'debit-note', 'noted']
  if (status === 'credit-note' || status === 'debit-note') return ['noted']
  return []
}

export function canOpenTrade(roleId: RoleId) {
  return roleId === 'super-admin' || roleId === 'mandi-manager' || roleId === 'aadathiya'
}

export function canFileRequirement(roleId: RoleId) {
  return canOpenTrade(roleId) || roleId === 'buyer'
}

export function canNotePayment(roleId: RoleId) {
  return canOpenTrade(roleId) || roleId === 'accounts-officer'
}

export function isTradeStatus(value: string): value is TradeStatus {
  return TRADE_STATUSES.includes(value as TradeStatus)
}

export function isPaymentStatus(value: string): value is PaymentStatus {
  return PAYMENT_STATUSES.includes(value as PaymentStatus)
}

export function isPriceMethod(value: string): value is PriceMethod {
  return PRICE_METHODS.includes(value as PriceMethod)
}
