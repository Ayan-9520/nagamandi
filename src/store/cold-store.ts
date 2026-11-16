import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { createColdSeed } from '@/mocks/cold-seed'
import { labelToPaise } from '@/services/money'
import {
  canDecideContract,
  canInward,
  canOperateCold,
  canOutward,
  checkQuantity,
  issuedContract,
  liveContract,
  nextSampleTenths,
  NEXT_CONTRACT,
  tenthsText,
  unitsText,
} from '@/services/cold-rules'
import { storageKeys } from '@/services/storage'
import { useArrivalStore } from '@/store/arrival-store'
import { useRegistryStore } from '@/store/registry-store'
import type { RoleId } from '@/types/access'
import type {
  CheckItem,
  CheckKind,
  ColdContract,
  ColdSave,
  ContractStatus,
  IncidentReport,
  InsuranceRecord,
  MaintenanceLog,
  StockMove,
  TemperatureReading,
} from '@/types/cold-storage'

export interface ColdActor {
  roleId: RoleId
  accountId: string
}

interface ColdState {
  chambers: ReturnType<typeof createColdSeed>['chambers']
  contracts: ColdContract[]
  moves: StockMove[]
  inspections: ReturnType<typeof createColdSeed>['inspections']
  insurance: InsuranceRecord[]
  maintenance: MaintenanceLog[]
  readings: TemperatureReading[]
  incidents: IncidentReport[]
  contractSeq: number
  moveSeq: number
  inspectionSeq: number
  insuranceSeq: number
  maintenanceSeq: number
  readingSeq: number
  incidentSeq: number
  ready: boolean
  setReady: () => void
  resetCold: () => void
  fileContract: (actor: ColdActor, input: { operatorId: string; chamberId: string; experience: string; start: string; end: string }) => ColdSave
  moveContract: (actor: ColdActor, id: string, next: ContractStatus) => ColdSave
  recordDeposit: (actor: ColdActor, id: string, rupees: string) => ColdSave
  moveStock: (actor: ColdActor, input: { kind: 'inward' | 'outward'; chamberId: string; lotId: string; quantity: string; note: string }) => ColdSave
  fileInspection: (actor: ColdActor, input: { kind: CheckKind; chamberId: string; items: CheckItem[]; note: string }) => ColdSave
  fileInsurance: (actor: ColdActor, input: { chamberId: string; cover: string; until: string }) => ColdSave
  fileMaintenance: (actor: ColdActor, input: { chamberId: string; title: string; note: string }) => ColdSave
  closeMaintenance: (actor: ColdActor, id: string) => ColdSave
  fileReading: (actor: ColdActor, input: { chamberId: string; temperature: string; note: string }) => ColdSave
  addSampleReading: (actor: ColdActor, chamberId: string) => ColdSave
  fileIncident: (actor: ColdActor, input: { chamberId: string; title: string; note: string }) => ColdSave
  closeIncident: (actor: ColdActor, id: string) => ColdSave
}

function stamp() {
  return new Date().toISOString()
}

function fail(message: string): ColdSave {
  return { ok: false, message }
}

function dateOk(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value)
}

export const useColdStore = create<ColdState>()(
  persist(
    (set, get) => ({
      ...createColdSeed(),
      ready: false,
      setReady: () => set({ ready: true }),
      resetCold: () => set({ ...createColdSeed(), ready: true }),
      fileContract: (actor, input) => {
        if (!canOperateCold(actor.roleId)) return fail('This demonstration desk cannot file a cold storage application.')
        const chamber = get().chambers.find((row) => row.id === input.chamberId)
        if (!chamber) return fail('Choose a chamber from this browser.')
        if (liveContract(get().contracts, chamber.id)) return fail('That chamber already has an open simulated contract.')
        const operator = useRegistryStore.getState().parties.find((row) => row.id === input.operatorId && row.kind === 'warehouse-operator' && row.status === 'Active')
        if (!operator) return fail('Choose an active operator desk code.')
        if (input.experience.trim().length < 8) return fail('Describe the proposed operations in at least 8 characters.')
        if (!dateOk(input.start) || !dateOk(input.end) || input.end <= input.start) return fail('The contract end date must fall after the start date.')
        const seq = get().contractSeq
        const key = String(seq)
        const now = stamp()
        const contract: ColdContract = {
          id: `DEMO-CSC-${key}`,
          contractNo: `DEMO-CSC-${key}`,
          mandiId: chamber.mandiId,
          chamberId: chamber.id,
          chamberCode: chamber.code,
          operatorId: operator.id,
          operatorLabel: operator.label,
          experience: input.experience.trim(),
          status: 'submitted',
          depositPaise: 0,
          receiptId: '',
          start: input.start,
          end: input.end,
          history: [{ at: now, status: 'submitted', note: 'Application filed in this browser. No fee was taken.' }],
          createdAt: now,
          updatedAt: now,
        }
        set({ contractSeq: seq + 1, contracts: [contract, ...get().contracts] })
        return { ok: true, id: contract.id }
      },
      moveContract: (actor, id, next) => {
        const current = get().contracts.find((row) => row.id === id)
        if (!current) return fail('That contract is not in this browser.')
        const applicantStep = next === 'submitted' && (current.status === 'draft' || current.status === 'clarification-required')
        if (applicantStep && !canOperateCold(actor.roleId)) return fail('This demonstration desk cannot move the application.')
        if (!applicantStep && !canDecideContract(actor.roleId)) return fail('A Mandi official desk records verification, approval and issue.')
        if (!NEXT_CONTRACT[current.status].includes(next)) return fail(`A contract marked ${current.status} cannot move to ${next}.`)
        if (next === 'issued') {
          const other = issuedContract(get().contracts, current.chamberId)
          if (other) return fail('That chamber is already allocated on an issued contract.')
          if (!current.receiptId) return fail('Record the simulated deposit before the contract is issued.')
        }
        const now = stamp()
        set({
          contracts: get().contracts.map((row) =>
            row.id === id
              ? { ...row, status: next, updatedAt: now, history: [...row.history, { at: now, status: next, note: 'Simulated step. No deed was signed.' }] }
              : row,
          ),
        })
        return { ok: true, id }
      },
      recordDeposit: (actor, id, rupees) => {
        if (!canDecideContract(actor.roleId)) return fail('A Mandi official desk records the simulated deposit.')
        const current = get().contracts.find((row) => row.id === id)
        if (!current) return fail('That contract is not in this browser.')
        if (current.status !== 'approved') return fail('Approve the contract before the simulated deposit.')
        if (current.receiptId) return fail('A simulated deposit receipt is already on this contract.')
        const paise = /^\d+(\.\d{1,2})?$/.test(rupees.trim()) ? labelToPaise(rupees) : 0
        if (paise <= 0) return fail('Enter a deposit above zero, with at most two decimal places.')
        const seq = get().contractSeq
        const receiptId = `DEMO-CS-RCT-${seq}`
        const now = stamp()
        set({
          contractSeq: seq + 1,
          contracts: get().contracts.map((row) =>
            row.id === id
              ? {
                  ...row,
                  status: 'deposit-recorded',
                  depositPaise: paise,
                  receiptId,
                  updatedAt: now,
                  history: [...row.history, { at: now, status: 'deposit-recorded' as const, note: `${receiptId} is a simulated deposit. No money moved.` }],
                }
              : row,
          ),
        })
        return { ok: true, id: receiptId }
      },
      moveStock: (actor, input) => {
        if (!canOperateCold(actor.roleId)) return fail('This demonstration desk cannot move chamber stock.')
        const chamber = get().chambers.find((row) => row.id === input.chamberId)
        if (!chamber) return fail('Choose a chamber from this browser.')
        const lot = useArrivalStore.getState().lots.find((row) => row.id === input.lotId)
        if (!lot) return fail('Choose a produce lot from this browser.')
        const units = unitsText(input.quantity)
        if (units === null) return fail(checkQuantity(null) ?? 'Enter a quantity.')
        const reason = input.kind === 'inward'
          ? canInward(chamber, get().contracts, get().moves, lot, units)
          : canOutward(chamber, get().contracts, get().moves, lot.id, units)
        if (reason) return fail(reason)
        const seq = get().moveSeq
        const key = String(seq)
        const move: StockMove = {
          id: `DEMO-CSM-${key}`,
          moveNo: `DEMO-CSM-${key}`,
          kind: input.kind,
          chamberId: chamber.id,
          chamberCode: chamber.code,
          lotId: lot.id,
          lotNo: lot.lotNo,
          commodityName: lot.commodityName,
          gradeName: lot.gradeName,
          unitSymbol: lot.unitSymbol,
          quantityUnits: units,
          partyLabel: lot.sellerLabel,
          note: input.note.trim() || 'Simulated movement. Not a cold-storage receipt.',
          at: stamp(),
        }
        set({ moveSeq: seq + 1, moves: [move, ...get().moves] })
        return { ok: true, id: move.id }
      },
      fileInspection: (actor, input) => {
        if (!canOperateCold(actor.roleId)) return fail('This demonstration desk cannot file a checklist.')
        const chamber = get().chambers.find((row) => row.id === input.chamberId)
        if (!chamber) return fail('Choose a chamber from this browser.')
        if (!issuedContract(get().contracts, chamber.id)) return fail('File the checklist on a chamber with an issued contract.')
        if (input.items.length === 0 || input.items.some((item) => item.result !== 'yes' && item.result !== 'no')) {
          return fail('Mark every checklist line yes or no.')
        }
        if (input.items.some((item) => item.result === 'no') && input.note.trim().length < 8) {
          return fail('A failed line needs a note of at least 8 characters.')
        }
        const seq = get().inspectionSeq
        const row = {
          id: `DEMO-CSK-${seq}`,
          kind: input.kind,
          chamberId: chamber.id,
          chamberCode: chamber.code,
          items: input.items,
          note: input.note.trim() || 'All lines passed in this browser.',
          at: stamp(),
        }
        set({ inspectionSeq: seq + 1, inspections: [row, ...get().inspections] })
        return { ok: true, id: row.id }
      },
      fileInsurance: (actor, input) => {
        if (!canOperateCold(actor.roleId)) return fail('This demonstration desk cannot file an insurance note.')
        const chamber = get().chambers.find((row) => row.id === input.chamberId)
        if (!chamber) return fail('Choose a chamber from this browser.')
        if (input.cover.trim().length < 8) return fail('Describe the simulated cover in at least 8 characters.')
        if (!dateOk(input.until)) return fail('Enter the cover end as YYYY-MM-DD.')
        const seq = get().insuranceSeq
        const row: InsuranceRecord = {
          id: `DEMO-CSI-${seq}`,
          policyNo: `DEMO-CSI-${seq}`,
          chamberId: chamber.id,
          chamberCode: chamber.code,
          cover: input.cover.trim(),
          until: input.until,
          note: 'Simulated cover. No insurer and no claim.',
        }
        set({ insuranceSeq: seq + 1, insurance: [row, ...get().insurance] })
        return { ok: true, id: row.id }
      },
      fileMaintenance: (actor, input) => {
        if (!canOperateCold(actor.roleId)) return fail('This demonstration desk cannot file a maintenance log.')
        const chamber = get().chambers.find((row) => row.id === input.chamberId)
        if (!chamber) return fail('Choose a chamber from this browser.')
        if (input.title.trim().length < 4) return fail('Give the log a short title.')
        const seq = get().maintenanceSeq
        const row: MaintenanceLog = {
          id: `DEMO-CSN-${seq}`,
          chamberId: chamber.id,
          chamberCode: chamber.code,
          title: input.title.trim(),
          status: 'open',
          note: input.note.trim() || 'Sample log. No work order was sent.',
          at: stamp(),
        }
        set({ maintenanceSeq: seq + 1, maintenance: [row, ...get().maintenance] })
        return { ok: true, id: row.id }
      },
      closeMaintenance: (actor, id) => {
        if (!canOperateCold(actor.roleId)) return fail('This demonstration desk cannot close a maintenance log.')
        const current = get().maintenance.find((row) => row.id === id)
        if (!current) return fail('That log is not in this browser.')
        if (current.status === 'closed') return fail('This log is already closed.')
        set({
          maintenance: get().maintenance.map((row) => (row.id === id ? { ...row, status: 'closed', at: stamp() } : row)),
        })
        return { ok: true, id }
      },
      fileReading: (actor, input) => {
        if (!canOperateCold(actor.roleId)) return fail('This demonstration desk cannot record a temperature.')
        const chamber = get().chambers.find((row) => row.id === input.chamberId)
        if (!chamber) return fail('Choose a chamber from this browser.')
        const tenths = tenthsText(input.temperature)
        if (tenths === null) return fail('Enter a temperature with at most one decimal place.')
        const seq = get().readingSeq
        const row: TemperatureReading = {
          id: `DEMO-CSR-${seq}`,
          chamberId: chamber.id,
          chamberCode: chamber.code,
          tenths,
          source: 'manual',
          note: input.note.trim() || 'Manual entry. No probe was read.',
          at: stamp(),
        }
        set({ readingSeq: seq + 1, readings: [row, ...get().readings] })
        return { ok: true, id: row.id }
      },
      addSampleReading: (actor, chamberId) => {
        if (!canOperateCold(actor.roleId)) return fail('This demonstration desk cannot add a sample reading.')
        const chamber = get().chambers.find((row) => row.id === chamberId)
        if (!chamber) return fail('Choose a chamber from this browser.')
        const simulated = get().readings.filter((row) => row.chamberId === chamber.id && row.source === 'simulated-sensor').length
        const seq = get().readingSeq
        const row: TemperatureReading = {
          id: `DEMO-CSR-${seq}`,
          chamberId: chamber.id,
          chamberCode: chamber.code,
          tenths: nextSampleTenths(simulated),
          source: 'simulated-sensor',
          note: 'Sample script. No probe was read.',
          at: stamp(),
        }
        set({ readingSeq: seq + 1, readings: [row, ...get().readings] })
        return { ok: true, id: row.id }
      },
      fileIncident: (actor, input) => {
        if (!canOperateCold(actor.roleId)) return fail('This demonstration desk cannot file an incident.')
        const chamber = get().chambers.find((row) => row.id === input.chamberId)
        if (!chamber) return fail('Choose a chamber from this browser.')
        if (input.title.trim().length < 4) return fail('Give the report a short title.')
        if (input.note.trim().length < 8) return fail('Describe the incident in at least 8 characters.')
        const seq = get().incidentSeq
        const row: IncidentReport = {
          id: `DEMO-CSX-${seq}`,
          chamberId: chamber.id,
          chamberCode: chamber.code,
          title: input.title.trim(),
          status: 'open',
          note: input.note.trim(),
          at: stamp(),
        }
        set({ incidentSeq: seq + 1, incidents: [row, ...get().incidents] })
        return { ok: true, id: row.id }
      },
      closeIncident: (actor, id) => {
        if (!canOperateCold(actor.roleId)) return fail('This demonstration desk cannot close an incident.')
        const current = get().incidents.find((row) => row.id === id)
        if (!current) return fail('That report is not in this browser.')
        if (current.status === 'closed') return fail('This report is already closed.')
        set({
          incidents: get().incidents.map((row) => (row.id === id ? { ...row, status: 'closed', at: stamp() } : row)),
        })
        return { ok: true, id }
      },
    }),
    {
      name: storageKeys.coldStorage,
      version: 1,
      partialize: (state) => ({
        chambers: state.chambers,
        contracts: state.contracts,
        moves: state.moves,
        inspections: state.inspections,
        insurance: state.insurance,
        maintenance: state.maintenance,
        readings: state.readings,
        incidents: state.incidents,
        contractSeq: state.contractSeq,
        moveSeq: state.moveSeq,
        inspectionSeq: state.inspectionSeq,
        insuranceSeq: state.insuranceSeq,
        maintenanceSeq: state.maintenanceSeq,
        readingSeq: state.readingSeq,
        incidentSeq: state.incidentSeq,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setReady()
      },
    },
  ),
)

if (useColdStore.persist.hasHydrated()) {
  useColdStore.getState().setReady()
}

useColdStore.persist.onFinishHydration(() => {
  useColdStore.getState().setReady()
})
