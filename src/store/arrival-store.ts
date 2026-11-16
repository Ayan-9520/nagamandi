import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { canMove, movementPlace, statusLabel } from '@/features/arrivals/meta'
import { createArrivalSeed } from '@/mocks/arrival-seed'
import { getRole } from '@/mocks/permissions'
import { round3, validateArrivalInput, type ArrivalRefs } from '@/services/arrival-rules'
import { storageKeys } from '@/services/storage'
import type { RoleId } from '@/types/access'
import type { ArrivalInput, ArrivalLot, ArrivalStatus, LotMovement, SaveResult } from '@/types/arrival'

export interface ArrivalActor {
  roleId: RoleId
  accountId: string
}

interface ArrivalState {
  lots: ArrivalLot[]
  seq: number
  ready: boolean
  setReady: () => void
  resetArrivals: () => void
  createLot: (actor: ArrivalActor, input: ArrivalInput, refs: ArrivalRefs) => SaveResult
  moveStatus: (actor: ArrivalActor, id: string, status: ArrivalStatus, note: string) => SaveResult
  markForTrade: (actor: ArrivalActor, id: string, status: 'available' | 'reserved' | 'sold', note: string) => SaveResult
}

function stamp() {
  return new Date().toISOString()
}

function fail(message: string): SaveResult {
  return { ok: false, message }
}

function allowed(actor: ArrivalActor) {
  return getRole(actor.roleId).modules.includes('arrivals')
}

export const useArrivalStore = create<ArrivalState>()(
  persist(
    (set, get) => ({
      ...createArrivalSeed(),
      ready: false,
      setReady: () => set({ ready: true }),
      resetArrivals: () => set({ ...createArrivalSeed(), ready: true }),
      createLot: (actor, input, refs) => {
        if (!allowed(actor)) return fail('This demonstration desk cannot register a lot.')
        const error = validateArrivalInput(input, refs)
        if (error) return fail(error.message)
        const seller = refs.seller
        const aadathiya = refs.aadathiya
        const commodity = refs.commodity
        const grade = refs.grade
        const unit = refs.unit
        if (!seller || !aadathiya || !commodity || !grade || !unit) return fail('The selected registers could not be read.')
        const seq = get().seq
        const key = String(seq)
        const now = stamp()
        const lotNo = `DEMO-LOT-${key}`
        const id = `DEMO-ARR-${key}`
        const first: LotMovement = {
          id: `MOV-${key}-1`,
          at: now,
          status: 'arrived',
          place: movementPlace('arrived'),
          note: 'Registered at the demonstration gate. This is not a gate pass.',
        }
        const row: ArrivalLot = {
          id,
          arrivalNo: id,
          lotNo,
          mandiId: refs.mandiId,
          sellerId: seller.id,
          sellerLabel: seller.label,
          aadathiyaId: aadathiya.id,
          aadathiyaLabel: aadathiya.label,
          commodityId: commodity.id,
          commodityName: commodity.name,
          gradeId: grade.id,
          gradeName: grade.name,
          unitId: unit.id,
          unitName: unit.name,
          unitSymbol: unit.symbol,
          quantity: input.quantity,
          gross: input.gross,
          tare: input.tare,
          net: round3(input.gross - input.tare),
          bay: input.bay,
          crateCount: input.crateCount,
          crateCode: input.crateCount > 0 ? input.crateCode.trim() : '',
          vehicleNo: input.vehicleNo.trim(),
          note: input.note.trim(),
          photos: input.photos,
          status: 'arrived',
          qrPayload: `DEMO|NAGA-MANDI|${lotNo}|not-a-gate-pass`,
          movements: [first],
          arrivedAt: now,
          updatedAt: now,
        }
        set({ seq: seq + 1, lots: [row, ...get().lots] })
        return { ok: true, id }
      },
      moveStatus: (actor, id, status, note) => {
        if (!allowed(actor)) return fail('This demonstration desk cannot change a lot.')
        const current = get().lots.find((row) => row.id === id)
        if (!current) return fail('That lot is not in this browser.')
        if (!canMove(current.status, status)) {
          return fail(`A lot marked ${statusLabel(current.status)} cannot move to ${statusLabel(status)}.`)
        }
        const trimmed = note.trim()
        if (status === 'cancelled' && trimmed.length < 8) {
          return fail('Add a cancellation note of at least 8 characters.')
        }
        const now = stamp()
        const step: LotMovement = {
          id: `MOV-${crypto.randomUUID().slice(0, 8)}`,
          at: now,
          status,
          place: movementPlace(status),
          note: trimmed || `Marked ${statusLabel(status)} in this browser.`,
        }
        set({
          lots: get().lots.map((row) =>
            row.id === id ? { ...row, status, updatedAt: now, movements: [...row.movements, step] } : row,
          ),
        })
        return { ok: true, id }
      },
      markForTrade: (actor, id, status, note) => {
        const role = getRole(actor.roleId)
        if (!role.modules.includes('trading') && !role.modules.includes('arrivals')) {
          return fail('This demonstration desk cannot update a lot from a trade.')
        }
        const current = get().lots.find((row) => row.id === id)
        if (!current) return fail('That lot is not in this browser.')
        if (current.status === status) return { ok: true, id }
        const legal =
          (current.status === 'available' && (status === 'reserved' || status === 'sold')) ||
          (current.status === 'reserved' && (status === 'available' || status === 'sold'))
        if (!legal) {
          return fail(`A lot marked ${statusLabel(current.status)} cannot move to ${statusLabel(status)} for a trade.`)
        }
        const now = stamp()
        const step: LotMovement = {
          id: `MOV-${crypto.randomUUID().slice(0, 8)}`,
          at: now,
          status,
          place: movementPlace(status),
          note: note.trim() || `Trade desk marked ${statusLabel(status)}. This is not a sale receipt.`,
        }
        set({
          lots: get().lots.map((row) =>
            row.id === id ? { ...row, status, updatedAt: now, movements: [...row.movements, step] } : row,
          ),
        })
        return { ok: true, id }
      },
    }),
    {
      name: storageKeys.arrivals,
      version: 1,
      partialize: (state) => ({ lots: state.lots, seq: state.seq }),
      onRehydrateStorage: () => (state) => {
        state?.setReady()
      },
    },
  ),
)

if (useArrivalStore.persist.hasHydrated()) {
  useArrivalStore.getState().setReady()
}

useArrivalStore.persist.onFinishHydration(() => {
  useArrivalStore.getState().setReady()
})
