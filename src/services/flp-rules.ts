import type { RoleId } from '@/types/access'
import type { ArrivalLot } from '@/types/arrival'
import type {
  CheckKind,
  GradeLine,
  OutputRecord,
  PackLine,
  ProcessingBatch,
} from '@/types/flp'
import { checkQuantity, formatUnits, toUnits, unitsText } from '@/services/warehouse-rules'

export const FLP_DAY = '2026-11-14'
export { checkQuantity, formatUnits, toUnits, unitsText }

export const CHECK_ITEMS: Record<CheckKind, { id: string; label: string }[]> = {
  cleaning: [
    { id: 'floor', label: 'Floors cleaned' },
    { id: 'waste', label: 'Waste removed' },
    { id: 'equipment', label: 'Equipment cleaned' },
  ],
  safety: [
    { id: 'extinguisher', label: 'Extinguisher in place' },
    { id: 'exit', label: 'Emergency exit clear' },
    { id: 'workplace', label: 'Work area clear of loose tools' },
  ],
}

export function canNoteReport(roleId: RoleId) {
  return roleId === 'super-admin' || roleId === 'mandi-manager'
}

export function canOperateFlp(roleId: RoleId) {
  return canNoteReport(roleId) || roleId === 'flp-operator'
}

export function packCountText(text: string) {
  const trimmed = text.trim()
  if (!/^[1-9]\d*$/.test(trimmed)) return null
  return Number(trimmed)
}

export function lotIntaken(batches: ProcessingBatch[], lotId: string) {
  return batches.reduce((total, batch) => (batch.lotId === lotId ? total + batch.intakeUnits : total), 0)
}

export function canIntake(lot: ArrivalLot, batches: ProcessingBatch[], units: number) {
  if (lot.status === 'cancelled') return 'A cancelled lot cannot enter an FLP unit.'
  const quantityError = checkQuantity(units)
  if (quantityError) return quantityError
  const remaining = toUnits(lot.quantity) - lotIntaken(batches, lot.id)
  if (units > remaining) return 'That quantity is above the produce still outside this FLP book for this lot.'
  return null
}

export function linesFor(grades: GradeLine[], packs: PackLine[], outputs: OutputRecord[], batchId: string) {
  return {
    grades: grades.filter((row) => row.batchId === batchId),
    packs: packs.filter((row) => row.batchId === batchId),
    output: outputs.find((row) => row.batchId === batchId),
  }
}

export function reconcile(batch: ProcessingBatch, grades: GradeLine[], packs: PackLine[], output: OutputRecord | undefined) {
  const good = grades.filter((row) => row.kind === 'grade').reduce((total, row) => total + row.quantityUnits, 0)
  const waste = grades.filter((row) => row.kind === 'waste').reduce((total, row) => total + row.quantityUnits, 0)
  const packed = packs.reduce((total, row) => total + row.quantityUnits, 0)
  const issued = output?.quantityUnits ?? 0
  const ungraded = batch.intakeUnits - good - waste
  const unpacked = good - packed
  const unissued = packed - issued
  return {
    intake: batch.intakeUnits,
    good,
    waste,
    packed,
    issued,
    ungraded,
    unpacked,
    unissued,
    balanced: ungraded === 0 && unpacked === 0 && unissued === 0 && output !== undefined,
  }
}

export function discrepancyUnits(batch: ProcessingBatch, grades: GradeLine[], packs: PackLine[], output: OutputRecord | undefined) {
  const row = reconcile(batch, grades, packs, output)
  return row.ungraded + row.unpacked + row.unissued
}

export function canGrade(batch: ProcessingBatch, grades: GradeLine[], units: number) {
  const quantityError = checkQuantity(units)
  if (quantityError) return quantityError
  const used = grades.reduce((total, row) => total + row.quantityUnits, 0)
  if (units > batch.intakeUnits - used) return 'That quantity passes the intake still ungraded.'
  return null
}

export function canPack(grades: GradeLine[], packs: PackLine[], units: number, packsCount: number | null) {
  if (packsCount === null) return 'Enter a whole pack count of at least 1.'
  const quantityError = checkQuantity(units)
  if (quantityError) return quantityError
  const good = grades.filter((row) => row.kind === 'grade').reduce((total, row) => total + row.quantityUnits, 0)
  if (good === 0) return 'Record a grade before packaging.'
  const packed = packs.reduce((total, row) => total + row.quantityUnits, 0)
  if (units > good - packed) return 'That quantity passes the graded produce still unpacked.'
  return null
}

export function canOutput(batch: ProcessingBatch, packs: PackLine[], outputs: OutputRecord[], units: number) {
  if (outputs.some((row) => row.batchId === batch.id)) return 'This batch already has an output record.'
  const quantityError = checkQuantity(units)
  if (quantityError) return quantityError
  const packed = packs.filter((row) => row.batchId === batch.id).reduce((total, row) => total + row.quantityUnits, 0)
  if (packed === 0) return 'Record packaging before an output.'
  if (units > packed) return 'Output cannot pass the packed quantity.'
  return null
}
