import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { createFlpSeed } from '@/mocks/flp-seed'
import {
  canGrade,
  canIntake,
  canNoteReport,
  canOperateFlp,
  canOutput,
  canPack,
  checkQuantity,
  discrepancyUnits,
  FLP_DAY,
  packCountText,
  unitsText,
} from '@/services/flp-rules'
import { storageKeys } from '@/services/storage'
import { useArrivalStore } from '@/store/arrival-store'
import type { RoleId } from '@/types/access'
import type {
  CheckItem,
  CheckKind,
  DailyReport,
  FlpSave,
  GradeKind,
  GradeLine,
  IncidentReport,
  InsuranceRecord,
  MaintenanceLog,
  MaterialMove,
  MoveKind,
  OutputRecord,
  PackLine,
  ProcessingBatch,
} from '@/types/flp'

export interface FlpActor {
  roleId: RoleId
  accountId: string
}

interface FlpState {
  units: ReturnType<typeof createFlpSeed>['units']
  batches: ProcessingBatch[]
  grades: GradeLine[]
  packs: PackLine[]
  outputs: OutputRecord[]
  moves: MaterialMove[]
  inspections: ReturnType<typeof createFlpSeed>['inspections']
  maintenance: MaintenanceLog[]
  insurance: InsuranceRecord[]
  incidents: IncidentReport[]
  reports: DailyReport[]
  batchSeq: number
  gradeSeq: number
  packSeq: number
  outputSeq: number
  moveSeq: number
  inspectionSeq: number
  maintenanceSeq: number
  insuranceSeq: number
  incidentSeq: number
  reportSeq: number
  ready: boolean
  setReady: () => void
  resetFlp: () => void
  fileIntake: (actor: FlpActor, input: { unitId: string; lotId: string; quantity: string; note: string }) => FlpSave
  fileGrade: (actor: FlpActor, input: { batchId: string; kind: GradeKind; label: string; quantity: string }) => FlpSave
  filePack: (actor: FlpActor, input: { batchId: string; gradeLabel: string; packs: string; quantity: string }) => FlpSave
  fileOutput: (actor: FlpActor, input: { batchId: string; quantity: string; note: string }) => FlpSave
  fileMovement: (actor: FlpActor, input: { unitId: string; batchId: string; kind: MoveKind; item: string; quantity: string; note: string }) => FlpSave
  fileInspection: (actor: FlpActor, input: { kind: CheckKind; unitId: string; items: CheckItem[]; note: string }) => FlpSave
  fileMaintenance: (actor: FlpActor, input: { unitId: string; title: string; note: string }) => FlpSave
  closeMaintenance: (actor: FlpActor, id: string) => FlpSave
  fileInsurance: (actor: FlpActor, input: { unitId: string; cover: string; until: string }) => FlpSave
  fileIncident: (actor: FlpActor, input: { unitId: string; title: string; note: string }) => FlpSave
  closeIncident: (actor: FlpActor, id: string) => FlpSave
  fileReport: (actor: FlpActor) => FlpSave
  noteReport: (actor: FlpActor, id: string) => FlpSave
}

function stamp() {
  return new Date().toISOString()
}

function fail(message: string): FlpSave {
  return { ok: false, message }
}

function dateOk(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value)
}

export const useFlpStore = create<FlpState>()(
  persist(
    (set, get) => ({
      ...createFlpSeed(),
      ready: false,
      setReady: () => set({ ready: true }),
      resetFlp: () => set({ ...createFlpSeed(), ready: true }),
      fileIntake: (actor, input) => {
        if (!canOperateFlp(actor.roleId)) return fail('This demonstration desk cannot record an intake.')
        const unit = get().units.find((row) => row.id === input.unitId)
        if (!unit) return fail('Choose a unit from this browser.')
        const lot = useArrivalStore.getState().lots.find((row) => row.id === input.lotId)
        if (!lot) return fail('Choose a produce lot from this browser.')
        const units = unitsText(input.quantity)
        if (units === null) return fail(checkQuantity(null) ?? 'Enter a quantity.')
        const reason = canIntake(lot, get().batches, units)
        if (reason) return fail(reason)
        const seq = get().batchSeq
        const moveSeq = get().moveSeq
        const now = stamp()
        const batch: ProcessingBatch = {
          id: `DEMO-FLB-${seq}`,
          batchNo: `DEMO-FLB-${seq}`,
          unitId: unit.id,
          unitCode: unit.code,
          lotId: lot.id,
          lotNo: lot.lotNo,
          sellerId: lot.sellerId,
          sellerLabel: lot.sellerLabel,
          commodityName: lot.commodityName,
          gradeName: lot.gradeName,
          intakeUnits: units,
          note: input.note.trim() || 'Simulated intake. Not a process certificate.',
          at: now,
        }
        const move: MaterialMove = {
          id: `DEMO-FLM-${moveSeq}`,
          moveNo: `DEMO-FLM-${moveSeq}`,
          kind: 'inward',
          unitId: unit.id,
          unitCode: unit.code,
          batchId: batch.id,
          item: 'Produce intake',
          quantityUnits: units,
          partyLabel: lot.sellerLabel,
          note: `Linked to ${lot.lotNo}. Not a gate pass.`,
          at: now,
        }
        set({
          batchSeq: seq + 1,
          moveSeq: moveSeq + 1,
          batches: [batch, ...get().batches],
          moves: [move, ...get().moves],
        })
        return { ok: true, id: batch.id }
      },
      fileGrade: (actor, input) => {
        if (!canOperateFlp(actor.roleId)) return fail('This demonstration desk cannot record a grade.')
        const batch = get().batches.find((row) => row.id === input.batchId)
        if (!batch) return fail('Choose a batch from this browser.')
        const units = unitsText(input.quantity)
        if (units === null) return fail(checkQuantity(null) ?? 'Enter a quantity.')
        const reason = canGrade(batch, get().grades.filter((row) => row.batchId === batch.id), units)
        if (reason) return fail(reason)
        if (input.kind === 'grade' && input.label.trim().length < 1) return fail('Name the grade.')
        const seq = get().gradeSeq
        const row: GradeLine = {
          id: `DEMO-FLG-${seq}`,
          batchId: batch.id,
          kind: input.kind,
          label: input.kind === 'waste' ? 'Waste' : input.label.trim(),
          quantityUnits: units,
          at: stamp(),
        }
        set({ gradeSeq: seq + 1, grades: [row, ...get().grades] })
        return { ok: true, id: row.id }
      },
      filePack: (actor, input) => {
        if (!canOperateFlp(actor.roleId)) return fail('This demonstration desk cannot record packaging.')
        const batch = get().batches.find((row) => row.id === input.batchId)
        if (!batch) return fail('Choose a batch from this browser.')
        const units = unitsText(input.quantity)
        const count = packCountText(input.packs)
        if (units === null) return fail(checkQuantity(null) ?? 'Enter a quantity.')
        const reason = canPack(
          get().grades.filter((row) => row.batchId === batch.id),
          get().packs.filter((row) => row.batchId === batch.id),
          units,
          count,
        )
        if (reason) return fail(reason)
        const seq = get().packSeq
        const row: PackLine = {
          id: `DEMO-FLK-${seq}`,
          batchId: batch.id,
          gradeLabel: input.gradeLabel.trim() || 'Packed',
          packCount: count ?? 0,
          quantityUnits: units,
          at: stamp(),
        }
        set({ packSeq: seq + 1, packs: [row, ...get().packs] })
        return { ok: true, id: row.id }
      },
      fileOutput: (actor, input) => {
        if (!canOperateFlp(actor.roleId)) return fail('This demonstration desk cannot record an output.')
        const batch = get().batches.find((row) => row.id === input.batchId)
        if (!batch) return fail('Choose a batch from this browser.')
        const units = unitsText(input.quantity)
        if (units === null) return fail(checkQuantity(null) ?? 'Enter a quantity.')
        const reason = canOutput(batch, get().packs, get().outputs, units)
        if (reason) return fail(reason)
        const seq = get().outputSeq
        const moveSeq = get().moveSeq
        const now = stamp()
        const row: OutputRecord = {
          id: `DEMO-FLO-${seq}`,
          batchId: batch.id,
          outputNo: `DEMO-FLO-${seq}`,
          quantityUnits: units,
          note: input.note.trim() || 'Simulated output. Not a delivery note.',
          at: now,
        }
        const move: MaterialMove = {
          id: `DEMO-FLM-${moveSeq}`,
          moveNo: `DEMO-FLM-${moveSeq}`,
          kind: 'outward',
          unitId: batch.unitId,
          unitCode: batch.unitCode,
          batchId: batch.id,
          item: 'Packed output',
          quantityUnits: units,
          partyLabel: batch.sellerLabel,
          note: `Linked to ${row.outputNo}. Not a delivery note.`,
          at: now,
        }
        set({
          outputSeq: seq + 1,
          moveSeq: moveSeq + 1,
          outputs: [row, ...get().outputs],
          moves: [move, ...get().moves],
        })
        return { ok: true, id: row.id }
      },
      fileMovement: (actor, input) => {
        if (!canOperateFlp(actor.roleId)) return fail('This demonstration desk cannot record a material movement.')
        const unit = get().units.find((row) => row.id === input.unitId)
        if (!unit) return fail('Choose a unit from this browser.')
        if (input.batchId && !get().batches.some((row) => row.id === input.batchId)) return fail('Choose a batch from this browser.')
        if (input.item.trim().length < 3) return fail('Name the material in at least 3 characters.')
        const units = unitsText(input.quantity)
        if (units === null) return fail(checkQuantity(null) ?? 'Enter a quantity.')
        const seq = get().moveSeq
        const row: MaterialMove = {
          id: `DEMO-FLM-${seq}`,
          moveNo: `DEMO-FLM-${seq}`,
          kind: input.kind,
          unitId: unit.id,
          unitCode: unit.code,
          batchId: input.batchId,
          item: input.item.trim(),
          quantityUnits: units,
          partyLabel: 'Desk sample',
          note: input.note.trim() || 'Simulated material movement. It does not change batch reconciliation.',
          at: stamp(),
        }
        set({ moveSeq: seq + 1, moves: [row, ...get().moves] })
        return { ok: true, id: row.id }
      },
      fileInspection: (actor, input) => {
        if (!canOperateFlp(actor.roleId)) return fail('This demonstration desk cannot file a checklist.')
        const unit = get().units.find((row) => row.id === input.unitId)
        if (!unit) return fail('Choose a unit from this browser.')
        if (input.items.length === 0 || input.items.some((item) => item.result !== 'yes' && item.result !== 'no')) {
          return fail('Mark every checklist line yes or no.')
        }
        if (input.items.some((item) => item.result === 'no') && input.note.trim().length < 8) {
          return fail('A failed line needs a note of at least 8 characters.')
        }
        const seq = get().inspectionSeq
        const row = {
          id: `DEMO-FLC-${seq}`,
          kind: input.kind,
          unitId: unit.id,
          unitCode: unit.code,
          items: input.items,
          note: input.note.trim() || 'All lines passed in this browser.',
          at: stamp(),
        }
        set({ inspectionSeq: seq + 1, inspections: [row, ...get().inspections] })
        return { ok: true, id: row.id }
      },
      fileMaintenance: (actor, input) => {
        if (!canOperateFlp(actor.roleId)) return fail('This demonstration desk cannot file a maintenance log.')
        const unit = get().units.find((row) => row.id === input.unitId)
        if (!unit) return fail('Choose a unit from this browser.')
        if (input.title.trim().length < 4) return fail('Give the log a short title.')
        const seq = get().maintenanceSeq
        const row: MaintenanceLog = {
          id: `DEMO-FLN-${seq}`,
          unitId: unit.id,
          unitCode: unit.code,
          title: input.title.trim(),
          status: 'open',
          note: input.note.trim() || 'Sample log. No work order was sent.',
          at: stamp(),
        }
        set({ maintenanceSeq: seq + 1, maintenance: [row, ...get().maintenance] })
        return { ok: true, id: row.id }
      },
      closeMaintenance: (actor, id) => {
        if (!canOperateFlp(actor.roleId)) return fail('This demonstration desk cannot close a maintenance log.')
        const current = get().maintenance.find((row) => row.id === id)
        if (!current) return fail('That log is not in this browser.')
        if (current.status === 'closed') return fail('This log is already closed.')
        set({ maintenance: get().maintenance.map((row) => (row.id === id ? { ...row, status: 'closed', at: stamp() } : row)) })
        return { ok: true, id }
      },
      fileInsurance: (actor, input) => {
        if (!canOperateFlp(actor.roleId)) return fail('This demonstration desk cannot file an insurance note.')
        const unit = get().units.find((row) => row.id === input.unitId)
        if (!unit) return fail('Choose a unit from this browser.')
        if (input.cover.trim().length < 8) return fail('Describe the simulated cover in at least 8 characters.')
        if (!dateOk(input.until)) return fail('Enter the cover end as YYYY-MM-DD.')
        const seq = get().insuranceSeq
        const row: InsuranceRecord = {
          id: `DEMO-FLI-${seq}`,
          policyNo: `DEMO-FLI-${seq}`,
          unitId: unit.id,
          unitCode: unit.code,
          cover: input.cover.trim(),
          until: input.until,
          note: 'Simulated cover. No insurer and no claim.',
        }
        set({ insuranceSeq: seq + 1, insurance: [row, ...get().insurance] })
        return { ok: true, id: row.id }
      },
      fileIncident: (actor, input) => {
        if (!canOperateFlp(actor.roleId)) return fail('This demonstration desk cannot file an incident.')
        const unit = get().units.find((row) => row.id === input.unitId)
        if (!unit) return fail('Choose a unit from this browser.')
        if (input.title.trim().length < 4) return fail('Give the report a short title.')
        if (input.note.trim().length < 8) return fail('Describe the incident in at least 8 characters.')
        const seq = get().incidentSeq
        const row: IncidentReport = {
          id: `DEMO-FLX-${seq}`,
          unitId: unit.id,
          unitCode: unit.code,
          title: input.title.trim(),
          status: 'open',
          note: input.note.trim(),
          at: stamp(),
        }
        set({ incidentSeq: seq + 1, incidents: [row, ...get().incidents] })
        return { ok: true, id: row.id }
      },
      closeIncident: (actor, id) => {
        if (!canOperateFlp(actor.roleId)) return fail('This demonstration desk cannot close an incident.')
        const current = get().incidents.find((row) => row.id === id)
        if (!current) return fail('That report is not in this browser.')
        if (current.status === 'closed') return fail('This report is already closed.')
        set({ incidents: get().incidents.map((row) => (row.id === id ? { ...row, status: 'closed', at: stamp() } : row)) })
        return { ok: true, id }
      },
      fileReport: (actor) => {
        if (!canOperateFlp(actor.roleId)) return fail('This demonstration desk cannot file a daily report.')
        if (get().reports.some((row) => row.day === FLP_DAY)) return fail('A daily report is already filed for this sample day.')
        const batches = get().batches
        const gap = batches.reduce((total, batch) => total + discrepancyUnits(batch, get().grades.filter((row) => row.batchId === batch.id), get().packs.filter((row) => row.batchId === batch.id), get().outputs.find((row) => row.batchId === batch.id)), 0)
        const intake = batches.reduce((total, batch) => total + batch.intakeUnits, 0)
        const output = get().outputs.reduce((total, row) => total + row.quantityUnits, 0)
        const seq = get().reportSeq
        const row: DailyReport = {
          id: `DEMO-FLR-${seq}`,
          reportNo: `DEMO-FLR-${seq}`,
          day: FLP_DAY,
          batchCount: batches.length,
          intakeUnits: intake,
          outputUnits: output,
          discrepancyUnits: gap,
          status: 'filed',
          note: 'Simulated daily report. Discrepancies are shown and nothing was audited.',
          at: stamp(),
        }
        set({ reportSeq: seq + 1, reports: [row, ...get().reports] })
        return { ok: true, id: row.id }
      },
      noteReport: (actor, id) => {
        if (!canNoteReport(actor.roleId)) return fail('A Mandi official desk notes the daily report.')
        const current = get().reports.find((row) => row.id === id)
        if (!current) return fail('That report is not in this browser.')
        if (current.status === 'noted') return fail('This report is already noted.')
        set({ reports: get().reports.map((row) => (row.id === id ? { ...row, status: 'noted' } : row)) })
        return { ok: true, id }
      },
    }),
    {
      name: storageKeys.flp,
      version: 1,
      partialize: (state) => ({
        units: state.units,
        batches: state.batches,
        grades: state.grades,
        packs: state.packs,
        outputs: state.outputs,
        moves: state.moves,
        inspections: state.inspections,
        maintenance: state.maintenance,
        insurance: state.insurance,
        incidents: state.incidents,
        reports: state.reports,
        batchSeq: state.batchSeq,
        gradeSeq: state.gradeSeq,
        packSeq: state.packSeq,
        outputSeq: state.outputSeq,
        moveSeq: state.moveSeq,
        inspectionSeq: state.inspectionSeq,
        maintenanceSeq: state.maintenanceSeq,
        insuranceSeq: state.insuranceSeq,
        incidentSeq: state.incidentSeq,
        reportSeq: state.reportSeq,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setReady()
      },
    },
  ),
)

if (useFlpStore.persist.hasHydrated()) {
  useFlpStore.getState().setReady()
}

useFlpStore.persist.onFinishHydration(() => {
  useFlpStore.getState().setReady()
})
