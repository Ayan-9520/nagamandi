import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { CHECK_ITEMS } from '@/services/facility-rules'
import { blockedDraftMessage, conflictText, isBlockedKind, offlineSaveMessage, type DraftKind } from '@/services/field-rules'
import { storageKeys } from '@/services/storage'
import { workingMandi } from '@/services/registry-rules'
import { useArrivalStore } from '@/store/arrival-store'
import { useFacilityStore } from '@/store/facility-store'
import { useParkingStore } from '@/store/parking-store'
import { useRegistryStore } from '@/store/registry-store'
import type { RoleId } from '@/types/access'
import type { ArrivalInput, WeighBay } from '@/types/arrival'
import type { FieldData, FieldDraft, FieldSave } from '@/types/field'
import type { CheckKind } from '@/types/facility'
import type { DemoDocument } from '@/types/registry'

export interface FieldActor {
  roleId: RoleId
  accountId: string
}

interface FieldState extends FieldData {
  ready: boolean
  setReady: () => void
  resetDrafts: () => void
  saveDraft: (input: Omit<FieldDraft, 'id' | 'savedAt' | 'status' | 'conflict'> & { id?: string }) => FieldSave
  syncDraft: (actor: FieldActor, id: string, online: boolean) => FieldSave
}

function fail(message: string): FieldSave {
  return { ok: false, message }
}

function stamp() {
  return new Date().toISOString()
}

function numberField(value: string) {
  const text = value.trim()
  if (!text) return Number.NaN
  return Number(text)
}

function photo(draft: FieldDraft): DemoDocument[] {
  if (!draft.photoDataUrl) return []
  return [{
    id: `PHOTO-${draft.id}`,
    name: draft.photoName || 'field-photo.jpg',
    mimeType: 'image/jpeg',
    size: draft.photoDataUrl.length,
    previewDataUrl: draft.photoDataUrl,
    addedAt: draft.savedAt,
  }]
}

function applyDraft(actor: FieldActor, draft: FieldDraft): FieldSave {
  if (isBlockedKind(draft.kind)) return fail(blockedDraftMessage())
  if (draft.kind === 'arrival') return applyArrival(actor, draft)
  if (draft.kind === 'lot-inspection') return applyInspection(actor, draft)
  if (draft.kind === 'parking-entry') return applyEntry(actor, draft)
  if (draft.kind === 'parking-exit') return applyExit(actor, draft)
  return applyFacility(actor, draft)
}

function applyArrival(actor: FieldActor, draft: FieldDraft): FieldSave {
  const arrivals = useArrivalStore.getState()
  const clash = arrivals.lots.find((row) => row.vehicleNo === draft.fields.vehicleNo.trim() && row.arrivedAt > draft.savedAt)
  if (clash) return fail('That record changed after this draft was saved. The draft was not applied.')
  const registry = useRegistryStore.getState()
  const mandi = workingMandi(registry.locations)
  if (!mandi) return fail('The working mandi is not in this browser.')
  const input: ArrivalInput = {
    sellerId: draft.fields.sellerId,
    aadathiyaId: draft.fields.aadathiyaId,
    commodityId: draft.fields.commodityId,
    gradeId: draft.fields.gradeId,
    unitId: draft.fields.unitId,
    quantity: numberField(draft.fields.quantity),
    gross: numberField(draft.fields.gross),
    tare: numberField(draft.fields.tare),
    bay: draft.fields.bay as WeighBay,
    crateCount: numberField(draft.fields.crateCount),
    crateCode: draft.fields.crateCode,
    vehicleNo: draft.fields.vehicleNo,
    note: draft.fields.note,
    photos: photo(draft),
  }
  return arrivals.createLot({ roleId: actor.roleId, accountId: actor.accountId }, input, {
    seller: registry.parties.find((row) => row.id === input.sellerId),
    aadathiya: registry.parties.find((row) => row.id === input.aadathiyaId),
    commodity: registry.commodities.find((row) => row.id === input.commodityId),
    grade: registry.grades.find((row) => row.id === input.gradeId),
    unit: registry.units.find((row) => row.id === input.unitId),
    mandiId: mandi.id,
  })
}

function applyInspection(actor: FieldActor, draft: FieldDraft): FieldSave {
  const arrivals = useArrivalStore.getState()
  const lot = arrivals.lots.find((row) => row.id === draft.targetId)
  const clash = conflictText(draft.baseToken, lot ? lot.updatedAt : null)
  if (clash) return fail(clash)
  return arrivals.moveStatus({ roleId: actor.roleId, accountId: actor.accountId }, draft.targetId, 'under-inspection', draft.fields.note)
}

function applyEntry(actor: FieldActor, draft: FieldDraft): FieldSave {
  const parking = useParkingStore.getState()
  const slot = parking.slots.find((row) => row.id === draft.fields.slotId)
  const visit = parking.visits.find((row) => row.slotId === draft.fields.slotId && row.status !== 'exited')
  const current = visit ? visit.status : 'available'
  const clash = conflictText(draft.baseToken, slot ? current : null)
  if (clash) return fail(clash)
  return parking.enterVehicle({ roleId: actor.roleId, accountId: actor.accountId }, { vehicleId: draft.fields.vehicleId, slotId: draft.fields.slotId })
}

function applyExit(actor: FieldActor, draft: FieldDraft): FieldSave {
  const parking = useParkingStore.getState()
  const visit = parking.visits.find((row) => row.id === draft.targetId)
  const clash = conflictText(draft.baseToken, visit ? visit.status : null)
  if (clash) return fail(clash)
  return parking.exitVehicle({ roleId: actor.roleId, accountId: actor.accountId }, { visitId: draft.targetId, hours: draft.fields.hours })
}

function applyFacility(actor: FieldActor, draft: FieldDraft): FieldSave {
  const facilities = useFacilityStore.getState()
  const lease = facilities.leases.find((row) => row.siteId === draft.fields.siteId && row.status === 'issued')
  const clash = conflictText(draft.baseToken, lease ? lease.updatedAt : null)
  if (clash) return fail(clash)
  const kind = draft.fields.check as CheckKind
  const template = CHECK_ITEMS[kind]
  if (!template) return fail('Choose a checklist for this facility template.')
  const items = template.map((item) => ({ id: item.id, label: item.label, result: draft.fields[item.id] === 'no' ? 'no' as const : 'yes' as const }))
  return facilities.fileInspection({ roleId: actor.roleId, accountId: actor.accountId }, {
    kind,
    siteId: draft.fields.siteId,
    items,
    note: draft.fields.note,
  })
}

export const useFieldStore = create<FieldState>()(
  persist(
    (set, get) => ({
      drafts: [],
      seq: 14201,
      ready: false,
      setReady: () => set({ ready: true }),
      resetDrafts: () => set({ drafts: [], seq: 14201, ready: true }),
      saveDraft: (input) => {
        if (isBlockedKind(input.kind)) return fail(blockedDraftMessage())
        const seq = get().seq
        const id = input.id ?? `DEMO-FLD-${seq}`
        const row: FieldDraft = {
          ...input,
          id,
          savedAt: stamp(),
          status: 'saved',
          conflict: '',
        }
        const rest = get().drafts.filter((item) => item.id !== id)
        set({ seq: input.id ? seq : seq + 1, drafts: [row, ...rest] })
        return { ok: true, id }
      },
      syncDraft: (actor, id, online) => {
        if (!online) return fail(offlineSaveMessage())
        const draft = get().drafts.find((row) => row.id === id)
        if (!draft) return fail('That draft is not on this device.')
        if (draft.status === 'synced') return fail('This draft is already on the book.')
        if (isBlockedKind(draft.kind)) return fail(blockedDraftMessage())
        const result = applyDraft(actor, draft)
        if (!result.ok) {
          const conflict = result.message.includes('changed') || result.message.includes('no longer')
          set({
            drafts: get().drafts.map((row) => row.id === id ? { ...row, status: conflict ? 'conflict' : 'saved', conflict: result.message } : row),
          })
          return result
        }
        set({
          drafts: get().drafts.map((row) => row.id === id ? { ...row, status: 'synced', conflict: '' } : row),
        })
        return { ok: true, id: result.id }
      },
    }),
    {
      name: storageKeys.field,
      partialize: (state) => ({ drafts: state.drafts, seq: state.seq }),
      onRehydrateStorage: () => (state) => {
        state?.setReady()
      },
    },
  ),
)

if (useFieldStore.persist.hasHydrated()) {
  useFieldStore.getState().setReady()
}

useFieldStore.persist.onFinishHydration(() => {
  useFieldStore.getState().setReady()
})

export type { DraftKind }
