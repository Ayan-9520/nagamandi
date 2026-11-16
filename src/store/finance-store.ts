import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { createFinanceSeed } from '@/mocks/finance-seed'
import {
  availableSecurity,
  bookTotals,
  buyerLines,
  canMoveCredit,
  canMoveDebit,
  canPostFinance,
  checkAmount,
  documentedTrades,
  NEXT_CLOSING,
  NEXT_RECON,
  receiptTaken,
  sellerLines,
  withinOutstanding,
  withinSecurity,
} from '@/services/finance-rules'
import { storageKeys } from '@/services/storage'
import { useLicenceStore } from '@/store/licence-store'
import { useTradeStore } from '@/store/trade-store'
import type { RoleId } from '@/types/access'
import type { ClosingStatus, CreditNote, DebitNote, FinanceReceipt, FinanceSave, ReconStatus, ReceiptKind } from '@/types/finance'

export interface FinanceActor {
  roleId: RoleId
  accountId: string
}

interface FinanceState {
  opening: ReturnType<typeof createFinanceSeed>['opening']
  creditNotes: CreditNote[]
  debitNotes: DebitNote[]
  receipts: FinanceReceipt[]
  reconciliation: ReturnType<typeof createFinanceSeed>['reconciliation']
  closing: ReturnType<typeof createFinanceSeed>['closing']
  creditSeq: number
  debitSeq: number
  receiptSeq: number
  commissionApproved: string[]
  ready: boolean
  setReady: () => void
  resetFinance: () => void
  issueCredit: (actor: FinanceActor, tradeId: string, amountPaise: number | null) => FinanceSave
  moveCredit: (actor: FinanceActor, id: string, next: 'approved' | 'cancelled') => FinanceSave
  redeemCredit: (actor: FinanceActor, id: string) => FinanceSave
  issueDebit: (actor: FinanceActor, tradeId: string, amountPaise: number | null) => FinanceSave
  moveDebit: (actor: FinanceActor, id: string, next: 'approved' | 'cancelled') => FinanceSave
  collectDebit: (actor: FinanceActor, id: string) => FinanceSave
  recordSellerReceipt: (actor: FinanceActor, tradeId: string, amountPaise: number | null) => FinanceSave
  recordBuyerReceipt: (actor: FinanceActor, tradeId: string, amountPaise: number | null) => FinanceSave
  approveCommission: (actor: FinanceActor, tradeId: string) => FinanceSave
  moveReconciliation: (actor: FinanceActor, next: ReconStatus) => FinanceSave
  moveClosing: (actor: FinanceActor, next: ClosingStatus) => FinanceSave
}

function stamp() {
  return new Date().toISOString()
}

function fail(message: string): FinanceSave {
  return { ok: false, message }
}

function books() {
  return {
    cases: useLicenceStore.getState().cases,
    trades: useTradeStore.getState().trades,
  }
}

export const useFinanceStore = create<FinanceState>()(
  persist(
    (set, get) => ({
      ...createFinanceSeed(),
      ready: false,
      setReady: () => set({ ready: true }),
      resetFinance: () => set({ ...createFinanceSeed(), ready: true }),
      issueCredit: (actor, tradeId, amountPaise) => {
        const gate = gateWrite(actor, get().closing.status)
        if (gate) return gate
        const amountError = checkAmount(amountPaise)
        if (amountError || amountPaise === null) return fail(amountError ?? 'Amount must be greater than zero.')
        const trade = documentedTrades(books().trades).find((row) => row.id === tradeId)
        if (!trade) return fail('Issue a credit note only for a documented trade.')
        const line = sellerLines(books().trades, get()).find((row) => row.tradeId === tradeId)
        const limit = withinOutstanding(amountPaise, line?.outstandingPaise ?? 0)
        if (limit) return fail(limit)
        const seq = get().creditSeq
        const key = String(seq)
        const now = stamp()
        const note: CreditNote = {
          id: `DEMO-CRN-${key}`,
          noteNo: `DEMO-CRN-${key}`,
          tradeId: trade.id,
          tradeNo: trade.tradeNo,
          mandiId: trade.mandiId,
          sellerId: trade.sellerId,
          sellerLabel: trade.sellerLabel,
          aadathiyaId: trade.aadathiyaId,
          aadathiyaLabel: trade.aadathiyaLabel,
          amountPaise,
          status: 'draft',
          receiptId: '',
          createdAt: now,
          updatedAt: now,
        }
        set({ creditSeq: seq + 1, creditNotes: [note, ...get().creditNotes] })
        return { ok: true, id: note.id }
      },
      moveCredit: (actor, id, next) => {
        const gate = gateWrite(actor, get().closing.status)
        if (gate) return gate
        const current = get().creditNotes.find((row) => row.id === id)
        if (!current) return fail('That credit note is not in this browser.')
        if (!canMoveCredit(current.status, next)) return fail(`A credit note marked ${current.status} cannot move to ${next}.`)
        const now = stamp()
        set({
          creditNotes: get().creditNotes.map((row) => (row.id === id ? { ...row, status: next, updatedAt: now } : row)),
        })
        return { ok: true, id }
      },
      redeemCredit: (actor, id) => {
        const gate = gateWrite(actor, get().closing.status)
        if (gate) return gate
        const current = get().creditNotes.find((row) => row.id === id)
        if (!current) return fail('That credit note is not in this browser.')
        if (current.status === 'redeemed' || receiptTaken(get().receipts, current.id)) {
          return fail('This credit note was already redeemed in the simulated book.')
        }
        if (!canMoveCredit(current.status, 'redeemed')) return fail('Approve the credit note before the simulated redemption.')
        const { cases } = books()
        const available = availableSecurity(cases, get().opening, get().creditNotes, current.aadathiyaId)
        const securityError = withinSecurity(current.amountPaise, available)
        if (securityError) return fail(securityError)
        const receipt = makeReceipt(get().receiptSeq, 'credit-redemption', current, 'Simulated redemption against Aadathiya security. No money moved.')
        const now = stamp()
        set({
          receiptSeq: get().receiptSeq + 1,
          receipts: [receipt, ...get().receipts],
          creditNotes: get().creditNotes.map((row) =>
            row.id === id ? { ...row, status: 'redeemed', receiptId: receipt.id, updatedAt: now } : row,
          ),
        })
        return { ok: true, id: receipt.id }
      },
      issueDebit: (actor, tradeId, amountPaise) => {
        const gate = gateWrite(actor, get().closing.status)
        if (gate) return gate
        const amountError = checkAmount(amountPaise)
        if (amountError || amountPaise === null) return fail(amountError ?? 'Amount must be greater than zero.')
        const trade = documentedTrades(books().trades).find((row) => row.id === tradeId)
        if (!trade) return fail('Issue a debit note only for a documented trade.')
        const line = buyerLines(books().trades, get()).find((row) => row.tradeId === tradeId)
        const limit = withinOutstanding(amountPaise, line?.outstandingPaise ?? 0)
        if (limit) return fail(limit)
        const seq = get().debitSeq
        const key = String(seq)
        const now = stamp()
        const note: DebitNote = {
          id: `DEMO-DBN-${key}`,
          noteNo: `DEMO-DBN-${key}`,
          tradeId: trade.id,
          tradeNo: trade.tradeNo,
          mandiId: trade.mandiId,
          buyerId: trade.buyerId,
          buyerLabel: trade.buyerLabel,
          aadathiyaId: trade.aadathiyaId,
          aadathiyaLabel: trade.aadathiyaLabel,
          amountPaise,
          status: 'draft',
          receiptId: '',
          createdAt: now,
          updatedAt: now,
        }
        set({ debitSeq: seq + 1, debitNotes: [note, ...get().debitNotes] })
        return { ok: true, id: note.id }
      },
      moveDebit: (actor, id, next) => {
        const gate = gateWrite(actor, get().closing.status)
        if (gate) return gate
        const current = get().debitNotes.find((row) => row.id === id)
        if (!current) return fail('That debit note is not in this browser.')
        if (!canMoveDebit(current.status, next)) return fail(`A debit note marked ${current.status} cannot move to ${next}.`)
        const now = stamp()
        set({
          debitNotes: get().debitNotes.map((row) => (row.id === id ? { ...row, status: next, updatedAt: now } : row)),
        })
        return { ok: true, id }
      },
      collectDebit: (actor, id) => {
        const gate = gateWrite(actor, get().closing.status)
        if (gate) return gate
        const current = get().debitNotes.find((row) => row.id === id)
        if (!current) return fail('That debit note is not in this browser.')
        if (current.status === 'collected' || receiptTaken(get().receipts, current.id)) {
          return fail('This debit note was already collected in the simulated book.')
        }
        if (!canMoveDebit(current.status, 'collected')) return fail('Approve the debit note before the simulated collection.')
        const receipt = makeReceipt(get().receiptSeq, 'debit-collection', current, 'Simulated debit collection. No money moved.')
        const now = stamp()
        set({
          receiptSeq: get().receiptSeq + 1,
          receipts: [receipt, ...get().receipts],
          debitNotes: get().debitNotes.map((row) =>
            row.id === id ? { ...row, status: 'collected', receiptId: receipt.id, updatedAt: now } : row,
          ),
        })
        return { ok: true, id: receipt.id }
      },
      recordSellerReceipt: (actor, tradeId, amountPaise) => {
        const gate = gateWrite(actor, get().closing.status)
        if (gate) return gate
        const amountError = checkAmount(amountPaise)
        if (amountError || amountPaise === null) return fail(amountError ?? 'Amount must be greater than zero.')
        const trade = documentedTrades(books().trades).find((row) => row.id === tradeId)
        if (!trade) return fail('Record a seller receipt only for a documented trade.')
        const line = sellerLines(books().trades, get()).find((row) => row.tradeId === tradeId)
        const limit = withinOutstanding(amountPaise, line?.outstandingPaise ?? 0)
        if (limit) return fail(limit)
        const receipt = makeReceipt(get().receiptSeq, 'seller-payment', {
          id: `seller-${tradeId}-${get().receiptSeq}`,
          tradeId: trade.id,
          tradeNo: trade.tradeNo,
          sellerLabel: trade.sellerLabel,
          buyerLabel: trade.buyerLabel,
          aadathiyaLabel: trade.aadathiyaLabel,
          amountPaise,
        }, 'Simulated seller payment. Security was not used, and no money moved.')
        set({ receiptSeq: get().receiptSeq + 1, receipts: [receipt, ...get().receipts] })
        return { ok: true, id: receipt.id }
      },
      recordBuyerReceipt: (actor, tradeId, amountPaise) => {
        const gate = gateWrite(actor, get().closing.status)
        if (gate) return gate
        const amountError = checkAmount(amountPaise)
        if (amountError || amountPaise === null) return fail(amountError ?? 'Amount must be greater than zero.')
        const trade = documentedTrades(books().trades).find((row) => row.id === tradeId)
        if (!trade) return fail('Record a buyer receipt only for a documented trade.')
        const line = buyerLines(books().trades, get()).find((row) => row.tradeId === tradeId)
        const limit = withinOutstanding(amountPaise, line?.outstandingPaise ?? 0)
        if (limit) return fail(limit)
        const receipt = makeReceipt(get().receiptSeq, 'buyer-collection', {
          id: `buyer-${tradeId}-${get().receiptSeq}`,
          tradeId: trade.id,
          tradeNo: trade.tradeNo,
          sellerLabel: trade.sellerLabel,
          buyerLabel: trade.buyerLabel,
          aadathiyaLabel: trade.aadathiyaLabel,
          amountPaise,
        }, 'Simulated buyer collection. No money moved.')
        set({ receiptSeq: get().receiptSeq + 1, receipts: [receipt, ...get().receipts] })
        return { ok: true, id: receipt.id }
      },
      approveCommission: (actor, tradeId) => {
        const gate = gateWrite(actor, get().closing.status)
        if (gate) return gate
        const trade = documentedTrades(books().trades).find((row) => row.id === tradeId)
        if (!trade) return fail('Approve commission only on a documented trade.')
        if (get().commissionApproved.includes(tradeId)) return fail('This commission line is already approved in the simulated ledger.')
        set({ commissionApproved: [...get().commissionApproved, tradeId] })
        return { ok: true, id: tradeId }
      },
      moveReconciliation: (actor, next) => {
        const gate = gateWrite(actor, 'open')
        if (gate) return gate
        const current = get().reconciliation
        if (!NEXT_RECON[current.status].includes(next)) return fail(`Reconciliation marked ${current.status} cannot move to ${next}.`)
        const { cases, trades } = books()
        const snapshot = next === 'checked' ? bookTotals(cases, trades, get()) : current.snapshot
        set({
          reconciliation: {
            ...current,
            status: next,
            snapshot,
            note: next === 'closed' ? 'The sample day was reconciled in this browser. Nothing was posted to a bank.' : current.note,
            updatedAt: stamp(),
          },
        })
        return { ok: true, id: current.day }
      },
      moveClosing: (actor, next) => {
        const gate = gateWrite(actor, 'open')
        if (gate) return gate
        const current = get().closing
        if (!NEXT_CLOSING[current.status].includes(next)) return fail(`Closing marked ${current.status} cannot move to ${next}.`)
        if (next === 'submitted' && get().reconciliation.status === 'open') {
          return fail('Check the daily reconciliation before submitting the closing.')
        }
        set({
          closing: {
            ...current,
            status: next,
            note: next === 'closed' ? 'The sample day was closed in this browser. No ledger was posted.' : current.note,
            updatedAt: stamp(),
          },
        })
        return { ok: true, id: current.day }
      },
    }),
    {
      name: storageKeys.finance,
      version: 1,
      partialize: (state) => ({
        opening: state.opening,
        creditNotes: state.creditNotes,
        debitNotes: state.debitNotes,
        receipts: state.receipts,
        reconciliation: state.reconciliation,
        closing: state.closing,
        creditSeq: state.creditSeq,
        debitSeq: state.debitSeq,
        receiptSeq: state.receiptSeq,
        commissionApproved: state.commissionApproved,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setReady()
      },
    },
  ),
)

function gateWrite(actor: FinanceActor, closing: 'open' | 'submitted' | 'approved' | 'closed'): FinanceSave | null {
  if (!canPostFinance(actor.roleId)) return fail('This demonstration desk cannot post a simulated finance entry.')
  if (closing === 'closed') return fail('The sample day is closed. Restore the finance sample to post again.')
  return null
}

function makeReceipt(
  seq: number,
  kind: ReceiptKind,
  source: { id: string; tradeId: string; tradeNo: string; sellerLabel?: string; buyerLabel?: string; aadathiyaLabel: string; amountPaise: number },
  note: string,
): FinanceReceipt {
  const key = String(seq)
  return {
    id: `DEMO-FIN-${key}`,
    receiptNo: `DEMO-FIN-${key}`,
    kind,
    tradeId: source.tradeId,
    tradeNo: source.tradeNo,
    partyLabel: kind === 'buyer-collection' || kind === 'debit-collection' ? source.buyerLabel ?? source.sellerLabel ?? '' : source.sellerLabel ?? source.buyerLabel ?? '',
    aadathiyaLabel: source.aadathiyaLabel,
    amountPaise: source.amountPaise,
    sourceId: source.id,
    note,
    at: stamp(),
  }
}

if (useFinanceStore.persist.hasHydrated()) {
  useFinanceStore.getState().setReady()
}

useFinanceStore.persist.onFinishHydration(() => {
  useFinanceStore.getState().setReady()
})
