import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { createSeed } from '@/mocks/registry-seed'
import { storageKeys } from '@/services/storage'
import { duplicatePartyLabel, workingMandi } from '@/services/registry-rules'
import { partyRegister, catalogRegister } from '@/features/registry/meta'
import type {
  ActivityEntry,
  CatalogKind,
  CommodityInput,
  FeeInput,
  GradeInput,
  LocationInput,
  Party,
  PartyInput,
  PartyKind,
  RegistryCollection,
  RegistryData,
  SaveResult,
  UnitInput,
} from '@/types/registry'

interface RegistryState extends RegistryData {
  ready: boolean
  setReady: () => void
  resetRegistry: () => void
  createParty: (kind: PartyKind, input: PartyInput) => SaveResult
  updateParty: (id: string, input: PartyInput) => SaveResult
  removeParty: (id: string) => SaveResult
  restoreParty: (id: string) => SaveResult
  createCommodity: (input: CommodityInput) => SaveResult
  updateCommodity: (id: string, input: CommodityInput) => SaveResult
  createGrade: (input: GradeInput) => SaveResult
  updateGrade: (id: string, input: GradeInput) => SaveResult
  createUnit: (input: UnitInput) => SaveResult
  updateUnit: (id: string, input: UnitInput) => SaveResult
  createLocation: (input: LocationInput) => SaveResult
  updateLocation: (id: string, input: LocationInput) => SaveResult
  createFee: (input: FeeInput) => SaveResult
  updateFee: (id: string, input: FeeInput) => SaveResult
  removeCatalog: (kind: CatalogKind, id: string) => SaveResult
  restoreCatalog: (kind: CatalogKind, id: string) => SaveResult
  setWorkingMandi: (id: string) => SaveResult
}

function stamp() {
  return new Date().toISOString()
}

function activity(seq: number, collection: RegistryCollection, recordId: string, title: string, detail: string): ActivityEntry {
  return { id: `ACT-${seq}`, at: stamp(), title, detail, recordId, collection }
}

function takeSeq(seq: number) {
  return { seq: seq + 1, next: seq }
}

function partyMessage(kind: PartyKind, label: string, action: string) {
  return `${partyRegister(kind).singular} ${label} was ${action} in this browser.`
}

export const useRegistryStore = create<RegistryState>()(
  persist(
    (set, get) => ({
      ...createSeed(),
      ready: false,
      setReady: () => set({ ready: true }),
      resetRegistry: () => set({ ...createSeed(), ready: true }),
      createParty: (kind, input) => {
        const mandi = workingMandi(get().locations)
        if (!mandi) return { ok: false, message: 'Choose a working mandi before adding a desk.' }
        if (duplicatePartyLabel(get().parties, kind, mandi.id, input.label)) {
          return { ok: false, message: 'That desk label is already on this mandi’s working list.' }
        }
        const { seq, next } = takeSeq(get().seq)
        const id = `DEMO-REG-${partyRegister(kind).prefix}-${next}`
        const now = stamp()
        const row: Party = { ...input, id, kind, mandiId: mandi.id, createdAt: now, updatedAt: now }
        set({
          seq,
          parties: [row, ...get().parties],
          activities: [activity(next, kind, id, 'Record added', partyMessage(kind, input.label, 'added')), ...get().activities],
        })
        return { ok: true, id }
      },
      updateParty: (id, input) => {
        const current = get().parties.find((party) => party.id === id)
        if (!current) return { ok: false, message: 'That demonstration record is not in this browser.' }
        if (duplicatePartyLabel(get().parties, current.kind, current.mandiId, input.label, id)) {
          return { ok: false, message: 'That desk label is already on this mandi’s working list.' }
        }
        const { seq, next } = takeSeq(get().seq)
        set({
          seq,
          parties: get().parties.map((party) => (party.id === id ? { ...party, ...input, updatedAt: stamp() } : party)),
          activities: [
            activity(next, current.kind, id, 'Record edited', partyMessage(current.kind, input.label, 'edited')),
            ...get().activities,
          ],
        })
        return { ok: true, id }
      },
      removeParty: (id) => {
        const current = get().parties.find((party) => party.id === id)
        if (!current) return { ok: false, message: 'That demonstration record is not in this browser.' }
        if (current.status === 'Removed') return { ok: false, message: 'That row is already marked removed.' }
        const { seq, next } = takeSeq(get().seq)
        set({
          seq,
          parties: get().parties.map((party) => (party.id === id ? { ...party, status: 'Removed', updatedAt: stamp() } : party)),
          activities: [
            activity(next, current.kind, id, 'Record removed', `${current.label} was marked removed. The row stays in this browser.`),
            ...get().activities,
          ],
        })
        return { ok: true, id }
      },
      restoreParty: (id) => {
        const current = get().parties.find((party) => party.id === id)
        if (!current) return { ok: false, message: 'That demonstration record is not in this browser.' }
        if (duplicatePartyLabel(get().parties, current.kind, current.mandiId, current.label, id)) {
          return { ok: false, message: 'That desk label is already on the working list.' }
        }
        const { seq, next } = takeSeq(get().seq)
        set({
          seq,
          parties: get().parties.map((party) => (party.id === id ? { ...party, status: 'Active', updatedAt: stamp() } : party)),
          activities: [activity(next, current.kind, id, 'Record restored', `${current.label} was put back on the working list.`), ...get().activities],
        })
        return { ok: true, id }
      },
      createCommodity: (input) => addCatalog(set, get, 'commodity', input, (id, mandiId, now) => ({ ...input, id, mandiId, createdAt: now, updatedAt: now })),
      updateCommodity: (id, input) => editCatalog(set, get, 'commodity', id, input),
      createGrade: (input) => addCatalog(set, get, 'grade', input, (id, mandiId, now) => ({ ...input, id, mandiId, createdAt: now, updatedAt: now })),
      updateGrade: (id, input) => editCatalog(set, get, 'grade', id, input),
      createUnit: (input) => addCatalog(set, get, 'unit', input, (id, mandiId, now) => ({ ...input, id, mandiId, createdAt: now, updatedAt: now })),
      updateUnit: (id, input) => editCatalog(set, get, 'unit', id, input),
      createLocation: (input) => {
        const { seq, next } = takeSeq(get().seq)
        const id = `DEMO-${catalogRegister('location').prefix}-${next}`
        const now = stamp()
        const makeActive = input.active || !workingMandi(get().locations)
        const row = {
          ...input,
          id,
          mandiId: id,
          active: makeActive,
          createdAt: now,
          updatedAt: now,
        }
        set({
          seq,
          locations: [row, ...get().locations.map((location) => ({ ...location, active: makeActive ? false : location.active }))],
          activities: [activity(next, 'location', id, 'Record added', `${input.name} was added to the location sample.`), ...get().activities],
        })
        return { ok: true, id }
      },
      updateLocation: (id, input) => {
        const current = get().locations.find((location) => location.id === id)
        if (!current) return { ok: false, message: 'That demonstration record is not in this browser.' }
        if (current.active && !input.active) {
          return { ok: false, message: 'Choose another location as the working mandi first.' }
        }
        const { seq, next } = takeSeq(get().seq)
        set({
          seq,
          locations: get().locations.map((location) => {
            if (location.id === id) return { ...location, ...input, mandiId: location.mandiId, active: input.active, updatedAt: stamp() }
            if (input.active) return { ...location, active: false }
            return location
          }),
          activities: [activity(next, 'location', id, 'Record edited', `${input.name} was edited in this browser.`), ...get().activities],
        })
        return { ok: true, id }
      },
      createFee: (input) => addCatalog(set, get, 'fee', input, (id, mandiId, now) => ({ ...input, id, mandiId, createdAt: now, updatedAt: now })),
      updateFee: (id, input) => editCatalog(set, get, 'fee', id, input),
      removeCatalog: (kind, id) => {
        const rows = rowsFor(get(), kind)
        const current = rows.find((row) => row.id === id)
        if (!current) return { ok: false, message: 'That demonstration record is not in this browser.' }
        if (current.status === 'Removed') return { ok: false, message: 'That row is already marked removed.' }
        if (kind === 'location' && 'active' in current && current.active) {
          return { ok: false, message: 'The working mandi stays on file. Choose another working mandi first.' }
        }
        const { seq, next } = takeSeq(get().seq)
        set({
          seq,
          ...patchRows(get(), kind, id, { status: 'Removed', updatedAt: stamp() }),
          activities: [activity(next, kind, id, 'Record removed', 'The row was marked removed and stays in this browser.'), ...get().activities],
        })
        return { ok: true, id }
      },
      restoreCatalog: (kind, id) => {
        const current = rowsFor(get(), kind).find((row) => row.id === id)
        if (!current) return { ok: false, message: 'That demonstration record is not in this browser.' }
        const { seq, next } = takeSeq(get().seq)
        set({
          seq,
          ...patchRows(get(), kind, id, { status: 'Active', updatedAt: stamp() }),
          activities: [activity(next, kind, id, 'Record restored', 'The row was put back on the working list.'), ...get().activities],
        })
        return { ok: true, id }
      },
      setWorkingMandi: (id) => {
        const current = get().locations.find((location) => location.id === id)
        if (!current || current.status === 'Removed') {
          return { ok: false, message: 'That location cannot be the working mandi.' }
        }
        const { seq, next } = takeSeq(get().seq)
        set({
          seq,
          locations: get().locations.map((location) => ({ ...location, active: location.id === id })),
          activities: [activity(next, 'location', id, 'Working mandi set', `${current.name} is now the working mandi on this desk.`), ...get().activities],
        })
        return { ok: true, id }
      },
    }),
    {
      name: storageKeys.registry,
      version: 1,
      partialize: (state) => ({
        parties: state.parties,
        commodities: state.commodities,
        grades: state.grades,
        units: state.units,
        locations: state.locations,
        fees: state.fees,
        activities: state.activities,
        transactions: state.transactions,
        licences: state.licences,
        seq: state.seq,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setReady()
      },
    },
  ),
)

if (useRegistryStore.persist.hasHydrated()) {
  useRegistryStore.getState().setReady()
}

useRegistryStore.persist.onFinishHydration(() => {
  useRegistryStore.getState().setReady()
})

type StoreSet = (partial: Partial<RegistryState> | ((state: RegistryState) => Partial<RegistryState>)) => void
type StoreGet = () => RegistryState

function addCatalog<TInput extends object>(
  set: StoreSet,
  get: StoreGet,
  kind: Exclude<CatalogKind, 'location'>,
  input: TInput,
  build: (id: string, mandiId: string, now: string) => object,
): SaveResult {
  const mandi = workingMandi(get().locations)
  if (!mandi) return { ok: false, message: 'Choose a working mandi before adding a row.' }
  const clash = catalogClash(get(), kind, mandi.id, input)
  if (clash) return { ok: false, message: clash }
  const { seq, next } = takeSeq(get().seq)
  const id = `DEMO-${catalogRegister(kind).prefix}-${next}`
  const row = build(id, mandi.id, stamp())
  const key = collectionKey(kind)
  set({
    seq,
    [key]: [row, ...get()[key]],
    activities: [activity(next, kind, id, 'Record added', `${catalogRegister(kind).singular} was added for ${mandi.name}.`), ...get().activities],
  })
  return { ok: true, id }
}

function editCatalog<TInput extends object>(set: StoreSet, get: StoreGet, kind: Exclude<CatalogKind, 'location'>, id: string, input: TInput): SaveResult {
  const current = rowsFor(get(), kind).find((row) => row.id === id)
  if (!current) return { ok: false, message: 'That demonstration record is not in this browser.' }
  const clash = catalogClash(get(), kind, current.mandiId, input, id)
  if (clash) return { ok: false, message: clash }
  const { seq, next } = takeSeq(get().seq)
  set({
    seq,
    ...patchRows(get(), kind, id, { ...input, updatedAt: stamp() }),
    activities: [activity(next, kind, id, 'Record edited', `${catalogRegister(kind).singular} was edited in this browser.`), ...get().activities],
  })
  return { ok: true, id }
}

function collectionKey(kind: Exclude<CatalogKind, 'location'>) {
  if (kind === 'commodity') return 'commodities' as const
  if (kind === 'grade') return 'grades' as const
  if (kind === 'unit') return 'units' as const
  return 'fees' as const
}

function rowsFor(state: RegistryData, kind: CatalogKind) {
  if (kind === 'commodity') return state.commodities
  if (kind === 'grade') return state.grades
  if (kind === 'unit') return state.units
  if (kind === 'location') return state.locations
  return state.fees
}

function patchRows(state: RegistryData, kind: CatalogKind, id: string, patch: object) {
  if (kind === 'commodity') return { commodities: state.commodities.map((row) => (row.id === id ? { ...row, ...patch } : row)) }
  if (kind === 'grade') return { grades: state.grades.map((row) => (row.id === id ? { ...row, ...patch } : row)) }
  if (kind === 'unit') return { units: state.units.map((row) => (row.id === id ? { ...row, ...patch } : row)) }
  if (kind === 'location') return { locations: state.locations.map((row) => (row.id === id ? { ...row, ...patch } : row)) }
  return { fees: state.fees.map((row) => (row.id === id ? { ...row, ...patch } : row)) }
}

function catalogClash(state: RegistryData, kind: Exclude<CatalogKind, 'location'>, mandiId: string, input: object, exceptId?: string) {
  const nameOf = (row: { id: string; mandiId: string; status: string }) => {
    if ('name' in row && typeof row.name === 'string') return row.name
    return ''
  }
  const rows = rowsFor(state, kind).filter((row) => row.id !== exceptId && row.mandiId === mandiId && row.status !== 'Removed')
  if (kind === 'grade') {
    const grade = input as GradeInput
    const clash = state.grades.some(
      (row) =>
        row.id !== exceptId &&
        row.mandiId === mandiId &&
        row.status !== 'Removed' &&
        row.commodityId === grade.commodityId &&
        row.name.toLowerCase() === grade.name.toLowerCase(),
    )
    return clash ? 'That grade is already listed for this commodity.' : null
  }
  const label = nameOf(input as { id: string; mandiId: string; status: string; name?: string })
  const clash = rows.some((row) => nameOf(row).toLowerCase() === label.toLowerCase())
  return clash ? 'That name is already on this mandi’s list.' : null
}
