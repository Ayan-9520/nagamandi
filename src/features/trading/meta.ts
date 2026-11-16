import type { PaymentStatus, PriceMethod, RequirementStatus, TradeStatus } from '@/types/trade'

export const TRADE_AS_OF = '2026-11-14'

export function methodLabel(method: PriceMethod) {
  const labels: Record<PriceMethod, string> = {
    negotiated: 'Negotiated sale',
    'auction-record': 'Auction record',
    hatha: 'Hatha negotiation record',
  }
  return labels[method]
}

export function tradeStatusLabel(status: TradeStatus) {
  const labels: Record<TradeStatus, string> = {
    negotiating: 'Negotiating',
    confirmed: 'Confirmed',
    documented: 'Documented',
    cancelled: 'Cancelled',
  }
  return labels[status]
}

export function paymentLabel(status: PaymentStatus) {
  const labels: Record<PaymentStatus, string> = {
    pending: 'Pending',
    'credit-note': 'Credit note',
    'debit-note': 'Debit note',
    noted: 'Noted in the book',
  }
  return labels[status]
}

export function requirementLabel(status: RequirementStatus) {
  const labels: Record<RequirementStatus, string> = {
    open: 'Open',
    matched: 'Matched',
    withdrawn: 'Withdrawn',
  }
  return labels[status]
}

export function formatRupee(value: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

export function methodNote(method: PriceMethod) {
  const notes: Record<PriceMethod, string> = {
    negotiated: 'One-to-one rate recorded in this browser. This is not a live negotiation.',
    'auction-record': 'A written auction note only. Bidding is not open.',
    hatha: 'Hand-signal rate recorded in this browser. No session was opened.',
  }
  return notes[method]
}
