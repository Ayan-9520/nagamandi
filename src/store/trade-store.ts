import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { createTradeSeed } from '@/mocks/trade-seed'
import { methodNote } from '@/features/trading/meta'
import { SEED_MANDI_ID } from '@/mocks/registry-seed'
import { workingMandi } from '@/services/registry-rules'
import {
  canFileRequirement,
  canMoveTrade,
  canNotePayment,
  canOpenTrade,
  committedQuantity,
  documentedQuantity,
  nextPayment,
  quoteTrade,
  validateDraft,
  validateRates,
  validateRequirementQuantity,
} from '@/services/trade-rules'
import { storageKeys } from '@/services/storage'
import { useArrivalStore, type ArrivalActor } from '@/store/arrival-store'
import { useRegistryStore } from '@/store/registry-store'
import type { BuyerRequirement, PaymentStatus, RequirementDraft, TradeDraft, TradeNote, TradeRates, TradeRecord, TradeSave, TradeStatus } from '@/types/trade'

interface TradeState {
  trades: TradeRecord[]
  requirements: BuyerRequirement[]
  tradeSeq: number
  requirementSeq: number
  rates: TradeRates
  ready: boolean
  setReady: () => void
  resetTrades: () => void
  saveRates: (actor: ArrivalActor, rates: TradeRates) => TradeSave
  fileRequirement: (actor: ArrivalActor, draft: RequirementDraft) => TradeSave
  setRequirement: (actor: ArrivalActor, id: string, status: 'matched' | 'withdrawn') => TradeSave
  openTrade: (actor: ArrivalActor, draft: TradeDraft) => TradeSave
  moveTrade: (actor: ArrivalActor, id: string, status: TradeStatus) => TradeSave
  setPayment: (actor: ArrivalActor, id: string, status: PaymentStatus) => TradeSave
}

function stamp() {
  return new Date().toISOString()
}

function fail(message: string): TradeSave {
  return { ok: false, message }
}

function syncLot(actor: ArrivalActor, lotId: string, trades: TradeRecord[]): TradeSave | null {
  const lot = useArrivalStore.getState().lots.find((row) => row.id === lotId)
  if (!lot) return fail('That lot is not in this browser.')
  const committed = committedQuantity(trades, lotId)
  const documented = documentedQuantity(trades, lotId)
  const next = documented >= lot.quantity ? 'sold' : committed > 0 ? 'reserved' : 'available'
  if (lot.status === 'sold' || lot.status === 'dispatched' || lot.status === 'cancelled' || lot.status === 'arrived' || lot.status === 'under-inspection') {
    if (lot.status === next) return null
    if (lot.status === 'sold' && next === 'sold') return null
    return fail('This lot is closed on the gate, so the trade book cannot move it.')
  }
  const result = useArrivalStore.getState().markForTrade(actor, lotId, next, 'The trade book updated this lot. No payment was taken.')
  return result.ok ? null : result
}

export const useTradeStore = create<TradeState>()(
  persist(
    (set, get) => ({
      ...createTradeSeed(),
      ready: false,
      setReady: () => set({ ready: true }),
      resetTrades: () => set({ ...createTradeSeed(), ready: true }),
      saveRates: (actor, rates) => {
        if (!canOpenTrade(actor.roleId) && actor.roleId !== 'accounts-officer') return fail('This demonstration desk cannot change the fictional rates.')
        const error = validateRates(rates)
        if (error) return fail(error)
        set({ rates: { ...rates } })
        return { ok: true, id: 'rates' }
      },
      fileRequirement: (actor, draft) => {
        if (!canFileRequirement(actor.roleId)) return fail('This demonstration desk cannot file a buyer requirement.')
        const registry = useRegistryStore.getState()
        const mandi = workingMandi(registry.locations)
        const buyer = registry.parties.find((row) => row.id === draft.buyerId)
        const commodity = registry.commodities.find((row) => row.id === draft.commodityId)
        const unit = registry.units.find((row) => row.id === draft.unitId)
        if (!mandi || !buyer || buyer.kind !== 'buyer' || buyer.status !== 'Active' || buyer.mandiId !== mandi.id) {
          return fail('Choose an active buyer on the working mandi.')
        }
        if (!commodity || commodity.status !== 'Active' || commodity.mandiId !== mandi.id) {
          return fail('Choose an active commodity on the working mandi.')
        }
        if (!unit || unit.status !== 'Active' || unit.mandiId !== mandi.id) {
          return fail('Choose an active unit on the working mandi.')
        }
        const quantityError = validateRequirementQuantity(draft.quantity)
        if (quantityError) return fail(quantityError)
        if (draft.note.trim().length < 8) return fail('Add a requirement note of at least 8 characters.')
        const seq = get().requirementSeq
        const key = String(seq)
        const now = stamp()
        const row = {
          id: `DEMO-REQ-${key}`,
          requirementNo: `DEMO-REQ-${key}`,
          mandiId: mandi.id,
          buyerId: buyer.id,
          buyerLabel: buyer.label,
          commodityId: commodity.id,
          commodityName: commodity.name,
          unitId: unit.id,
          unitSymbol: unit.symbol,
          quantity: draft.quantity,
          note: draft.note.trim(),
          status: 'open' as const,
          createdAt: now,
          updatedAt: now,
        }
        set({ requirementSeq: seq + 1, requirements: [row, ...get().requirements] })
        return { ok: true, id: row.id }
      },
      setRequirement: (actor, id, status) => {
        if (!canFileRequirement(actor.roleId)) return fail('This demonstration desk cannot change a requirement.')
        const current = get().requirements.find((row) => row.id === id)
        if (!current) return fail('That requirement is not in this browser.')
        if (current.status !== 'open') return fail('Only an open requirement can be matched or withdrawn.')
        const now = stamp()
        set({
          requirements: get().requirements.map((row) => (row.id === id ? { ...row, status, updatedAt: now } : row)),
        })
        return { ok: true, id }
      },
      openTrade: (actor, draft) => {
        if (!canOpenTrade(actor.roleId)) return fail('This demonstration desk cannot open a sale.')
        const lot = useArrivalStore.getState().lots.find((row) => row.id === draft.lotId)
        const error = validateDraft(draft, lot, get().trades)
        if (error || !lot) return fail(error ?? 'Choose a lot that is still open on the demonstration floor.')
        if (lot.mandiId !== SEED_MANDI_ID && lot.mandiId !== workingMandi(useRegistryStore.getState().locations)?.id) {
          return fail('This lot is outside the working mandi.')
        }
        const registry = useRegistryStore.getState()
        const buyer = registry.parties.find((row) => row.id === draft.buyerId)
        const mandi = workingMandi(registry.locations)
        if (!buyer || buyer.kind !== 'buyer' || buyer.status !== 'Active' || !mandi || buyer.mandiId !== mandi.id) {
          return fail('Choose an active buyer on the working mandi.')
        }
        const seq = get().tradeSeq
        const key = String(seq)
        const now = stamp()
        const rates = { ...get().rates }
        const discovery: TradeNote = {
          id: `NOTE-${key}-1`,
          at: now,
          kind: 'discovery',
          method: draft.method,
          text: draft.note.trim() || methodNote(draft.method),
        }
        const row: TradeRecord = {
          id: `DEMO-TRD-${key}`,
          tradeNo: `DEMO-TRD-${key}`,
          mandiId: lot.mandiId,
          lotId: lot.id,
          lotNo: lot.lotNo,
          sellerId: lot.sellerId,
          sellerLabel: lot.sellerLabel,
          buyerId: buyer.id,
          buyerLabel: buyer.label,
          aadathiyaId: lot.aadathiyaId,
          aadathiyaLabel: lot.aadathiyaLabel,
          commodityId: lot.commodityId,
          commodityName: lot.commodityName,
          gradeName: lot.gradeName,
          unitSymbol: lot.unitSymbol,
          quantity: draft.quantity,
          price: draft.price,
          method: draft.method,
          rates,
          figures: quoteTrade(draft.quantity, draft.price, draft.transport, rates),
          status: 'negotiating',
          paymentStatus: 'pending',
          sellerParchiNo: '',
          buyerParchiNo: '',
          qrPayload: '',
          notes: [discovery],
          createdAt: now,
          updatedAt: now,
        }
        set({ tradeSeq: seq + 1, trades: [row, ...get().trades] })
        return { ok: true, id: row.id }
      },
      moveTrade: (actor, id, status) => {
        if (!canOpenTrade(actor.roleId)) return fail('This demonstration desk cannot change a trade.')
        const current = get().trades.find((row) => row.id === id)
        if (!current) return fail('That trade is not in this browser.')
        if (!canMoveTrade(current.status, status)) {
          return fail(`A trade marked ${current.status} cannot move to ${status}.`)
        }
        if (status === 'confirmed' || status === 'documented') {
          const lot = useArrivalStore.getState().lots.find((row) => row.id === current.lotId)
          const error = validateDraft(
            {
              lotId: current.lotId,
              buyerId: current.buyerId,
              method: current.method,
              quantity: current.quantity,
              price: current.price,
              transport: current.figures.transport,
              note: current.notes[0]?.text ?? 'Recorded rate',
            },
            lot,
            status === 'confirmed' ? get().trades.filter((row) => row.id !== current.id || row.status !== 'negotiating') : get().trades,
          )
          if (status === 'confirmed') {
            const held = committedQuantity(get().trades, current.lotId)
            const lotQty = lot?.quantity ?? 0
            if (!lot || current.quantity > Math.round((lotQty - held) * 1000) / 1000) {
              return fail('Quantity cannot pass the quantity still open on this lot.')
            }
          }
          if (error && status === 'confirmed') return fail(error)
        }
        const now = stamp()
        const rates = status === 'confirmed' ? { ...get().rates } : current.rates
        const figures = status === 'confirmed'
          ? quoteTrade(current.quantity, current.price, current.figures.transport, rates)
          : current.figures
        const key = current.tradeNo.replace('DEMO-TRD-', '')
        const nextRow: TradeRecord = {
          ...current,
          status,
          rates,
          figures,
          sellerParchiNo: status === 'documented' ? `DEMO-PRC-S-${key}` : current.sellerParchiNo,
          buyerParchiNo: status === 'documented' ? `DEMO-PRC-B-${key}` : current.buyerParchiNo,
          qrPayload: status === 'documented' ? `DEMO|NAGA-MANDI|DEMO-PRC-S-${key}|not-a-receipt` : current.qrPayload,
          updatedAt: now,
          notes: [
            ...current.notes,
            {
              id: `NOTE-${crypto.randomUUID().slice(0, 8)}`,
              at: now,
              kind: status === 'confirmed' ? 'confirmed' : status === 'documented' ? 'documented' : 'cancelled',
              method: current.method,
              text: status === 'cancelled'
                ? 'The trade was cancelled in this browser. No payment was reversed because none was taken.'
                : status === 'documented'
                  ? 'Seller and buyer parchis were prepared. They are not receipts.'
                  : 'The rate was confirmed in this browser. Settlement is not run.',
            },
          ],
        }
        const nextTrades = get().trades.map((row) => (row.id === id ? nextRow : row))
        if (status !== 'negotiating') {
          const lotError = syncLot(actor, current.lotId, nextTrades)
          if (lotError) return lotError
        }
        set({ trades: nextTrades })
        return { ok: true, id }
      },
      setPayment: (actor, id, status) => {
        if (!canNotePayment(actor.roleId)) return fail('This demonstration desk cannot note a payment status.')
        const current = get().trades.find((row) => row.id === id)
        if (!current) return fail('That trade is not in this browser.')
        if (current.status !== 'documented') return fail('Note a payment only after the parchis are prepared.')
        if (!nextPayment(current.paymentStatus).includes(status)) {
          return fail(`A payment marked ${current.paymentStatus} cannot move to ${status}.`)
        }
        const now = stamp()
        set({
          trades: get().trades.map((row) =>
            row.id === id
              ? {
                  ...row,
                  paymentStatus: status,
                  updatedAt: now,
                  notes: [
                    ...row.notes,
                    {
                      id: `NOTE-${crypto.randomUUID().slice(0, 8)}`,
                      at: now,
                      kind: 'payment',
                      method: null,
                      text: 'Payment status changed in the demonstration book. No money moved.',
                    },
                  ],
                }
              : row,
          ),
        })
        return { ok: true, id }
      },
    }),
    {
      name: storageKeys.trades,
      version: 1,
      partialize: (state) => ({
        trades: state.trades,
        requirements: state.requirements,
        tradeSeq: state.tradeSeq,
        requirementSeq: state.requirementSeq,
        rates: state.rates,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setReady()
      },
    },
  ),
)

if (useTradeStore.persist.hasHydrated()) {
  useTradeStore.getState().setReady()
}

useTradeStore.persist.onFinishHydration(() => {
  useTradeStore.getState().setReady()
})
