import { WEIGH_BAYS, type ArrivalInput, type WeighBay } from '@/types/arrival'
import type { CommodityRecord, GradeRecord, Party, UnitRecord } from '@/types/registry'

export interface FieldIssue {
  field: keyof ArrivalInput
  message: string
}

export interface ArrivalRefs {
  seller: Party | undefined
  aadathiya: Party | undefined
  commodity: CommodityRecord | undefined
  grade: GradeRecord | undefined
  unit: UnitRecord | undefined
  mandiId: string
}

export function round3(value: number) {
  return Math.round(value * 1000) / 1000
}

function activeOnMandi(row: { status: string; mandiId: string } | undefined, mandiId: string) {
  return Boolean(row && row.status === 'Active' && row.mandiId === mandiId)
}

export function validateArrivalInput(input: ArrivalInput, refs: ArrivalRefs): FieldIssue | null {
  if (!activeOnMandi(refs.seller, refs.mandiId) || refs.seller?.kind !== 'farmer' || refs.seller.id !== input.sellerId) {
    return { field: 'sellerId', message: 'Choose an active seller on the working mandi.' }
  }
  if (!activeOnMandi(refs.aadathiya, refs.mandiId) || refs.aadathiya?.kind !== 'aadathiya' || refs.aadathiya.id !== input.aadathiyaId) {
    return { field: 'aadathiyaId', message: 'Choose an active aadathiya on the working mandi.' }
  }
  if (!activeOnMandi(refs.commodity, refs.mandiId) || refs.commodity?.id !== input.commodityId) {
    return { field: 'commodityId', message: 'Choose an active commodity on the working mandi.' }
  }
  if (!activeOnMandi(refs.grade, refs.mandiId) || refs.grade?.id !== input.gradeId || refs.grade.commodityId !== input.commodityId) {
    return { field: 'gradeId', message: 'Choose a grade that belongs to this commodity.' }
  }
  if (!activeOnMandi(refs.unit, refs.mandiId) || refs.unit?.id !== input.unitId) {
    return { field: 'unitId', message: 'Choose an active unit on the working mandi.' }
  }
  if (!Number.isFinite(input.quantity) || input.quantity <= 0) {
    return { field: 'quantity', message: 'Quantity must be greater than zero.' }
  }
  if (input.quantity > 100_000) {
    return { field: 'quantity', message: 'Quantity must stay within 100,000 of the chosen unit.' }
  }
  if (round3(input.quantity) !== input.quantity) {
    return { field: 'quantity', message: 'Use at most three decimal places.' }
  }
  if (!Number.isFinite(input.gross) || input.gross <= 0) {
    return { field: 'gross', message: 'Gross weight must be greater than zero.' }
  }
  if (!Number.isFinite(input.tare) || input.tare < 0) {
    return { field: 'tare', message: 'Tare cannot be negative.' }
  }
  if (input.gross <= input.tare) {
    return { field: 'gross', message: 'Gross weight must be greater than the tare.' }
  }
  const net = round3(input.gross - input.tare)
  if (net !== round3(input.quantity)) {
    return { field: 'quantity', message: 'Quantity must equal gross minus tare.' }
  }
  if (!WEIGH_BAYS.includes(input.bay)) {
    return { field: 'bay', message: 'Choose WB-01 or WB-02.' }
  }
  if (!Number.isInteger(input.crateCount) || input.crateCount < 0 || input.crateCount > 500) {
    return { field: 'crateCount', message: 'Crate count must be a whole number from 0 to 500.' }
  }
  if (input.crateCount > 0 && !/^CR-\d{2,4}$/.test(input.crateCode.trim())) {
    return { field: 'crateCode', message: 'Use a crate code such as CR-14.' }
  }
  if (!/^NL\d{2}-DEMO-\d{3}$/.test(input.vehicleNo.trim())) {
    return { field: 'vehicleNo', message: 'Use a demonstration vehicle such as NL07-DEMO-214.' }
  }
  if (input.photos.length > 3) {
    return { field: 'photos', message: 'Attach at most three demonstration photos.' }
  }
  return null
}

export function isWeighBay(value: string): value is WeighBay {
  return WEIGH_BAYS.includes(value as WeighBay)
}
