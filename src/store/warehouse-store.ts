import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { createWarehouseSeed } from '@/mocks/warehouse-seed'
import { labelToPaise } from '@/services/money'
import {
  canDecideContract,
  canInward,
  canOperateWarehouse,
  canOutward,
  checkQuantity,
  issuedContract,
  liveContract,
  NEXT_CONTRACT,
  unitsText,
} from '@/services/warehouse-rules'
import { storageKeys } from '@/services/storage'
import { useArrivalStore } from '@/store/arrival-store'
import { useRegistryStore } from '@/store/registry-store'
import type { RoleId } from '@/types/access'
import type { CheckItem, CheckKind, ContractStatus, InsuranceRecord, MaintenanceLog, StockMove, WarehouseContract, WarehouseSave } from '@/types/warehouse'

export interface WarehouseActor {
  roleId: RoleId
  accountId: string
}

interface WarehouseState {
  sheds: ReturnType<typeof createWarehouseSeed>['sheds']
  contracts: WarehouseContract[]
  moves: StockMove[]
  inspections: ReturnType<typeof createWarehouseSeed>['inspections']
  insurance: InsuranceRecord[]
  maintenance: MaintenanceLog[]
  contractSeq: number
  moveSeq: number
  inspectionSeq: number
  insuranceSeq: number
  maintenanceSeq: number
  ready: boolean
  setReady: () => void
  resetWarehouse: () => void
  fileContract: (actor: WarehouseActor, input: { operatorId: string; shedId: string; experience: string; start: string; end: string }) => WarehouseSave
  moveContract: (actor: WarehouseActor, id: string, next: ContractStatus) => WarehouseSave
  recordDeposit: (actor: WarehouseActor, id: string, rupees: string) => WarehouseSave
  moveStock: (actor: WarehouseActor, input: { kind: 'inward' | 'outward'; shedId: string; lotId: string; quantity: string; note: string }) => WarehouseSave
  fileInspection: (actor: WarehouseActor, input: { kind: CheckKind; shedId: string; items: CheckItem[]; note: string }) => WarehouseSave
  fileInsurance: (actor: WarehouseActor, input: { shedId: string; cover: string; until: string }) => WarehouseSave
  fileMaintenance: (actor: WarehouseActor, input: { shedId: string; title: string; note: string }) => WarehouseSave
  closeMaintenance: (actor: WarehouseActor, id: string) => WarehouseSave
}

function stamp() {
  return new Date().toISOString()
}

function fail(message: string): WarehouseSave {
  return { ok: false, message }
}

function dateOk(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value)
}

export const useWarehouseStore = create<WarehouseState>()(
  persist(
    (set, get) => ({
      ...createWarehouseSeed(),
      ready: false,
      setReady: () => set({ ready: true }),
      resetWarehouse: () => set({ ...createWarehouseSeed(), ready: true }),
      fileContract: (actor, input) => {
        if (!canOperateWarehouse(actor.roleId)) return fail('This demonstration desk cannot file a warehouse application.')
        const shed = get().sheds.find((row) => row.id === input.shedId)
        if (!shed) return fail('Choose a shed from this browser.')
        if (liveContract(get().contracts, shed.id)) return fail('That shed already has an open simulated contract.')
        const operator = useRegistryStore.getState().parties.find((row) => row.id === input.operatorId && row.kind === 'warehouse-operator' && row.status === 'Active')
        if (!operator) return fail('Choose an active warehouse desk code.')
        if (input.experience.trim().length < 8) return fail('Describe the proposed operations in at least 8 characters.')
        if (!dateOk(input.start) || !dateOk(input.end) || input.end <= input.start) return fail('The contract end date must fall after the start date.')
        const seq = get().contractSeq
        const key = String(seq)
        const now = stamp()
        const contract: WarehouseContract = {
          id: `DEMO-WHC-${key}`,
          contractNo: `DEMO-WHC-${key}`,
          mandiId: shed.mandiId,
          shedId: shed.id,
          shedCode: shed.code,
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
        if (applicantStep && !canOperateWarehouse(actor.roleId)) return fail('This demonstration desk cannot move the application.')
        if (!applicantStep && !canDecideContract(actor.roleId)) return fail('A Mandi official desk records verification, approval and issue.')
        if (!NEXT_CONTRACT[current.status].includes(next)) return fail(`A contract marked ${current.status} cannot move to ${next}.`)
        if (next === 'issued') {
          const other = issuedContract(get().contracts, current.shedId)
          if (other) return fail('That shed is already allocated on an issued contract.')
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
        const receiptId = `DEMO-WH-RCT-${seq}`
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
        if (!canOperateWarehouse(actor.roleId)) return fail('This demonstration desk cannot move shed stock.')
        const shed = get().sheds.find((row) => row.id === input.shedId)
        if (!shed) return fail('Choose a shed from this browser.')
        const lot = useArrivalStore.getState().lots.find((row) => row.id === input.lotId)
        if (!lot) return fail('Choose a produce lot from this browser.')
        const units = unitsText(input.quantity)
        const reason = input.kind === 'inward'
          ? canInward(shed, get().contracts, get().moves, lot, units ?? 0)
          : canOutward(shed, get().contracts, get().moves, lot.id, units ?? 0)
        if (units === null) return fail(checkQuantity(null) ?? 'Enter a quantity.')
        if (reason) return fail(reason)
        const seq = get().moveSeq
        const key = String(seq)
        const move: StockMove = {
          id: `DEMO-WHM-${key}`,
          moveNo: `DEMO-WHM-${key}`,
          kind: input.kind,
          shedId: shed.id,
          shedCode: shed.code,
          lotId: lot.id,
          lotNo: lot.lotNo,
          commodityName: lot.commodityName,
          gradeName: lot.gradeName,
          unitSymbol: lot.unitSymbol,
          quantityUnits: units,
          partyLabel: lot.sellerLabel,
          note: input.note.trim() || 'Simulated movement. Not a warehouse receipt.',
          at: stamp(),
        }
        set({ moveSeq: seq + 1, moves: [move, ...get().moves] })
        return { ok: true, id: move.id }
      },
      fileInspection: (actor, input) => {
        if (!canOperateWarehouse(actor.roleId)) return fail('This demonstration desk cannot file a checklist.')
        const shed = get().sheds.find((row) => row.id === input.shedId)
        if (!shed) return fail('Choose a shed from this browser.')
        if (!issuedContract(get().contracts, shed.id)) return fail('File the checklist on a shed with an issued contract.')
        if (input.items.length === 0 || input.items.some((item) => item.result !== 'yes' && item.result !== 'no')) {
          return fail('Mark every checklist line yes or no.')
        }
        if (input.items.some((item) => item.result === 'no') && input.note.trim().length < 8) {
          return fail('A failed line needs a note of at least 8 characters.')
        }
        const seq = get().inspectionSeq
        const row = {
          id: `DEMO-WHK-${seq}`,
          kind: input.kind,
          shedId: shed.id,
          shedCode: shed.code,
          items: input.items,
          note: input.note.trim() || 'All lines passed in this browser.',
          at: stamp(),
        }
        set({ inspectionSeq: seq + 1, inspections: [row, ...get().inspections] })
        return { ok: true, id: row.id }
      },
      fileInsurance: (actor, input) => {
        if (!canOperateWarehouse(actor.roleId)) return fail('This demonstration desk cannot file an insurance note.')
        const shed = get().sheds.find((row) => row.id === input.shedId)
        if (!shed) return fail('Choose a shed from this browser.')
        if (input.cover.trim().length < 8) return fail('Describe the simulated cover in at least 8 characters.')
        if (!dateOk(input.until)) return fail('Enter the cover end as YYYY-MM-DD.')
        const seq = get().insuranceSeq
        const row: InsuranceRecord = {
          id: `DEMO-INS-${seq}`,
          policyNo: `DEMO-INS-${seq}`,
          shedId: shed.id,
          shedCode: shed.code,
          cover: input.cover.trim(),
          until: input.until,
          note: 'Simulated cover. No insurer and no claim.',
        }
        set({ insuranceSeq: seq + 1, insurance: [row, ...get().insurance] })
        return { ok: true, id: row.id }
      },
      fileMaintenance: (actor, input) => {
        if (!canOperateWarehouse(actor.roleId)) return fail('This demonstration desk cannot file a maintenance log.')
        const shed = get().sheds.find((row) => row.id === input.shedId)
        if (!shed) return fail('Choose a shed from this browser.')
        if (input.title.trim().length < 4) return fail('Give the log a short title.')
        const seq = get().maintenanceSeq
        const row: MaintenanceLog = {
          id: `DEMO-MNT-${seq}`,
          shedId: shed.id,
          shedCode: shed.code,
          title: input.title.trim(),
          status: 'open',
          note: input.note.trim() || 'Sample log. No work order was sent.',
          at: stamp(),
        }
        set({ maintenanceSeq: seq + 1, maintenance: [row, ...get().maintenance] })
        return { ok: true, id: row.id }
      },
      closeMaintenance: (actor, id) => {
        if (!canOperateWarehouse(actor.roleId)) return fail('This demonstration desk cannot close a maintenance log.')
        const current = get().maintenance.find((row) => row.id === id)
        if (!current) return fail('That log is not in this browser.')
        if (current.status === 'closed') return fail('This log is already closed.')
        set({
          maintenance: get().maintenance.map((row) => (row.id === id ? { ...row, status: 'closed', at: stamp() } : row)),
        })
        return { ok: true, id }
      },
    }),
    {
      name: storageKeys.warehouses,
      version: 1,
      partialize: (state) => ({
        sheds: state.sheds,
        contracts: state.contracts,
        moves: state.moves,
        inspections: state.inspections,
        insurance: state.insurance,
        maintenance: state.maintenance,
        contractSeq: state.contractSeq,
        moveSeq: state.moveSeq,
        inspectionSeq: state.inspectionSeq,
        insuranceSeq: state.insuranceSeq,
        maintenanceSeq: state.maintenanceSeq,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setReady()
      },
    },
  ),
)

if (useWarehouseStore.persist.hasHydrated()) {
  useWarehouseStore.getState().setReady()
}

useWarehouseStore.persist.onFinishHydration(() => {
  useWarehouseStore.getState().setReady()
})
