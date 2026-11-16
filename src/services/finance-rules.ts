import { labelToPaise, sumPaise, toPaise } from '@/services/money'
import type { RoleId } from '@/types/access'
import type { BookTotals, ClosingStatus, CreditNote, DebitNote, FinanceData, FinanceReceipt, OpeningSecurity, ReconStatus } from '@/types/finance'
import type { LicenceCase } from '@/types/licence'
import type { TradeRecord } from '@/types/trade'

export const FINANCE_DAY = '2026-11-14'

export const NEXT_RECON: Record<ReconStatus, ReconStatus[]> = {
  open: ['checked'],
  checked: ['closed'],
  closed: [],
}

export const NEXT_CLOSING: Record<ClosingStatus, ClosingStatus[]> = {
  open: ['submitted'],
  submitted: ['approved'],
  approved: ['closed'],
  closed: [],
}

const POSTED_LICENCE = new Set(['fee-recorded', 'issued'])

export function canPostFinance(roleId: RoleId) {
  return roleId === 'super-admin' || roleId === 'mandi-manager' || roleId === 'accounts-officer'
}

export function licenceFeeRows(cases: LicenceCase[]) {
  return cases
    .filter((row) => POSTED_LICENCE.has(row.status) && row.fee.receiptId)
    .map((row) => ({
      id: row.id,
      receiptId: row.fee.receiptId ?? '',
      partyLabel: row.applicantLabel,
      category: row.category,
      feePaise: labelToPaise(row.fee.feeLabel),
      depositPaise: labelToPaise(row.fee.depositLabel),
      method: row.fee.method,
      recordedAt: row.fee.recordedAt ?? row.updatedAt,
    }))
}

export function securityRows(cases: LicenceCase[], opening: OpeningSecurity[], credits: CreditNote[]) {
  const posted = new Map<string, { label: string; sources: { id: string; paise: number; detail: string }[] }>()
  function add(id: string, label: string, sourceId: string, paise: number, detail: string) {
    const current = posted.get(id) ?? { label, sources: [] }
    current.label = label || current.label
    current.sources.push({ id: sourceId, paise, detail })
    posted.set(id, current)
  }
  for (const row of opening) add(row.aadathiyaId, row.aadathiyaLabel, row.id, row.amountPaise, row.note)
  for (const row of licenceFeeRows(cases)) {
    if (row.category !== 'trader' || row.depositPaise <= 0) continue
    const licence = cases.find((item) => item.id === row.id)
    if (!licence) continue
    add(licence.partyId, licence.applicantLabel, row.receiptId, row.depositPaise, 'Licence security label. No deposit was banked.')
  }
  return [...posted.entries()].map(([aadathiyaId, row]) => {
    const postedPaise = sumPaise(row.sources.map((source) => source.paise))
    const redeemedPaise = sumPaise(credits.filter((note) => note.aadathiyaId === aadathiyaId && note.status === 'redeemed').map((note) => note.amountPaise))
    return {
      aadathiyaId,
      label: row.label,
      sources: row.sources,
      postedPaise,
      redeemedPaise,
      availablePaise: postedPaise - redeemedPaise,
    }
  })
}

export function availableSecurity(cases: LicenceCase[], opening: OpeningSecurity[], credits: CreditNote[], aadathiyaId: string) {
  return securityRows(cases, opening, credits).find((row) => row.aadathiyaId === aadathiyaId)?.availablePaise ?? 0
}

function tradePaise(trade: TradeRecord) {
  return {
    sellerNet: toPaise(trade.figures.sellerNet),
    buyerDue: toPaise(trade.figures.buyerDue),
    sellerCommission: toPaise(trade.figures.sellerCommission),
    buyerCommission: toPaise(trade.figures.buyerCommission),
  }
}

export function documentedTrades(trades: TradeRecord[]) {
  return trades.filter((row) => row.status === 'documented')
}

export function sellerReserved(data: Pick<FinanceData, 'creditNotes' | 'receipts'>, tradeId: string) {
  const notes = sumPaise(data.creditNotes.filter((row) => row.tradeId === tradeId && row.status !== 'cancelled').map((row) => row.amountPaise))
  const receipts = sumPaise(data.receipts.filter((row) => row.tradeId === tradeId && row.kind === 'seller-payment').map((row) => row.amountPaise))
  return notes + receipts
}

export function buyerReserved(data: Pick<FinanceData, 'debitNotes' | 'receipts'>, tradeId: string) {
  const notes = sumPaise(data.debitNotes.filter((row) => row.tradeId === tradeId && row.status !== 'cancelled').map((row) => row.amountPaise))
  const receipts = sumPaise(data.receipts.filter((row) => row.tradeId === tradeId && row.kind === 'buyer-collection').map((row) => row.amountPaise))
  return notes + receipts
}

export function sellerLines(trades: TradeRecord[], data: Pick<FinanceData, 'creditNotes' | 'receipts'>) {
  return documentedTrades(trades).map((trade) => {
    const netPaise = tradePaise(trade).sellerNet
    const reservedPaise = sellerReserved(data, trade.id)
    return {
      tradeId: trade.id,
      tradeNo: trade.tradeNo,
      sellerId: trade.sellerId,
      sellerLabel: trade.sellerLabel,
      aadathiyaId: trade.aadathiyaId,
      aadathiyaLabel: trade.aadathiyaLabel,
      netPaise,
      reservedPaise,
      outstandingPaise: netPaise - reservedPaise,
    }
  })
}

export function buyerLines(trades: TradeRecord[], data: Pick<FinanceData, 'debitNotes' | 'receipts'>) {
  return documentedTrades(trades).map((trade) => {
    const duePaise = tradePaise(trade).buyerDue
    const reservedPaise = buyerReserved(data, trade.id)
    return {
      tradeId: trade.id,
      tradeNo: trade.tradeNo,
      buyerId: trade.buyerId,
      buyerLabel: trade.buyerLabel,
      aadathiyaId: trade.aadathiyaId,
      aadathiyaLabel: trade.aadathiyaLabel,
      duePaise,
      reservedPaise,
      outstandingPaise: duePaise - reservedPaise,
    }
  })
}

export function commissionLines(trades: TradeRecord[], approved: string[]) {
  return documentedTrades(trades).map((trade) => {
    const amounts = tradePaise(trade)
    return {
      tradeId: trade.id,
      tradeNo: trade.tradeNo,
      aadathiyaLabel: trade.aadathiyaLabel,
      sellerPaise: amounts.sellerCommission,
      buyerPaise: amounts.buyerCommission,
      totalPaise: amounts.sellerCommission + amounts.buyerCommission,
      approved: approved.includes(trade.id),
    }
  })
}

export function bookTotals(cases: LicenceCase[], trades: TradeRecord[], data: FinanceData): BookTotals {
  const fees = licenceFeeRows(cases)
  const deposits = securityRows(cases, data.opening, data.creditNotes)
  const commission = commissionLines(trades, data.commissionApproved)
  const sellers = sellerLines(trades, data)
  const buyers = buyerLines(trades, data)
  return {
    licenceFeePaise: sumPaise(fees.map((row) => row.feePaise)),
    securityPostedPaise: sumPaise(deposits.map((row) => row.postedPaise)),
    securityAvailablePaise: sumPaise(deposits.map((row) => row.availablePaise)),
    commissionPaise: sumPaise(commission.map((row) => row.totalPaise)),
    buyerOutstandingPaise: sumPaise(buyers.map((row) => row.outstandingPaise)),
    sellerOutstandingPaise: sumPaise(sellers.map((row) => row.outstandingPaise)),
    openCreditPaise: sumPaise(data.creditNotes.filter((row) => row.status === 'draft' || row.status === 'approved').map((row) => row.amountPaise)),
    redeemedCreditPaise: sumPaise(data.creditNotes.filter((row) => row.status === 'redeemed').map((row) => row.amountPaise)),
    openDebitPaise: sumPaise(data.debitNotes.filter((row) => row.status === 'draft' || row.status === 'approved').map((row) => row.amountPaise)),
    receiptPaise: sumPaise(data.receipts.map((row) => row.amountPaise)),
  }
}

export function checkAmount(amountPaise: number | null) {
  if (amountPaise === null) return 'Enter a rupee amount with at most two decimal places.'
  if (amountPaise <= 0) return 'Amount must be greater than zero.'
  if (!Number.isInteger(amountPaise)) return 'Amount must be a whole number of paise.'
  return null
}

export function withinOutstanding(amountPaise: number, outstandingPaise: number) {
  if (amountPaise > outstandingPaise) return 'Amount cannot pass the outstanding simulated balance.'
  return null
}

export function withinSecurity(amountPaise: number, availablePaise: number) {
  if (availablePaise < 0) return 'The simulated security balance is already negative. Redemption is stopped.'
  if (amountPaise > availablePaise) return 'Credit-note redemption cannot pass the available simulated Aadathiya security balance.'
  return null
}

export function canMoveCredit(status: CreditNote['status'], next: 'approved' | 'redeemed' | 'cancelled') {
  if (status === 'draft') return next === 'approved' || next === 'cancelled'
  if (status === 'approved') return next === 'redeemed' || next === 'cancelled'
  return false
}

export function canMoveDebit(status: DebitNote['status'], next: 'approved' | 'collected' | 'cancelled') {
  if (status === 'draft') return next === 'approved' || next === 'cancelled'
  if (status === 'approved') return next === 'collected' || next === 'cancelled'
  return false
}

export function receiptTaken(receipts: FinanceReceipt[], sourceId: string) {
  return receipts.some((row) => row.sourceId === sourceId)
}
