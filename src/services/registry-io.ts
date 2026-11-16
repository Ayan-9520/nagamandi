import { cell, headerIndex, parseCsv } from '@/services/csv'
import {
  checkStatus,
  validateCommodityInput,
  validateFeeInput,
  validateGradeInput,
  validateLocationInput,
  validatePartyInput,
  validateUnitInput,
  workingMandi,
} from '@/services/registry-rules'
import { partyRegister } from '@/features/registry/meta'
import type {
  CommodityInput,
  FeeInput,
  GradeInput,
  LocationInput,
  PartyInput,
  PartyKind,
  RegistryData,
  UnitInput,
  UnitKind,
} from '@/types/registry'

export interface CsvIssue {
  row: number
  message: string
}

export interface CsvPreview<T> {
  rows: T[]
  issues: CsvIssue[]
}

const PARTY_COLUMNS = ['label', 'area', 'phone', 'status', 'commodity', 'notes', 'vehicleNo', 'siteCode']
const COMMODITY_COLUMNS = ['name', 'category', 'season', 'status']
const GRADE_COLUMNS = ['commodity', 'name', 'description', 'status']
const UNIT_COLUMNS = ['name', 'symbol', 'kind', 'status']
const LOCATION_COLUMNS = ['name', 'district', 'code', 'status']
const FEE_COLUMNS = ['name', 'basis', 'sampleRate', 'status']

export const csvColumns = {
  party: PARTY_COLUMNS,
  commodity: COMMODITY_COLUMNS,
  grade: GRADE_COLUMNS,
  unit: UNIT_COLUMNS,
  location: LOCATION_COLUMNS,
  fee: FEE_COLUMNS,
}

function readTable(text: string, expected: string[]) {
  const table = parseCsv(text)
  if (table.length === 0) return { issues: [{ row: 1, message: 'The file has no header row.' }] as CsvIssue[], header: null, body: [] as string[][] }
  const header = headerIndex(table[0], expected)
  if (!header.ok) return { issues: [{ row: 1, message: header.message }], header: null, body: [] as string[][] }
  const body = table.slice(1)
  if (body.length === 0) return { issues: [{ row: 2, message: 'Add at least one data row.' }], header: null, body }
  if (body.length > 100) return { issues: [{ row: 2, message: 'Import at most 100 rows at a time.' }], header: null, body: [] as string[][] }
  return { issues: [] as CsvIssue[], header: header.index, body }
}

export function previewPartyCsv(text: string, kind: PartyKind, data: RegistryData): CsvPreview<PartyInput> {
  const parsed = readTable(text, PARTY_COLUMNS)
  if (!parsed.header) return { rows: [], issues: parsed.issues }
  const mandi = workingMandi(data.locations)
  if (!mandi) return { rows: [], issues: [{ row: 1, message: 'Choose a working mandi before importing.' }] }
  const meta = partyRegister(kind)
  const rows: PartyInput[] = []
  const issues: CsvIssue[] = []
  const seen = new Set<string>()
  parsed.body.forEach((line, offset) => {
    const rowNumber = offset + 2
    const commodityName = cell(line, parsed.header!, 'commodity')
    const commodity = data.commodities.find(
      (item) => item.mandiId === mandi.id && item.status !== 'Removed' && item.name.toLowerCase() === commodityName.toLowerCase(),
    )
    const input: PartyInput = {
      label: cell(line, parsed.header!, 'label'),
      area: cell(line, parsed.header!, 'area'),
      phone: cell(line, parsed.header!, 'phone'),
      status: cell(line, parsed.header!, 'status') as PartyInput['status'],
      commodityId: meta.commodity === 'required' ? (commodity?.id ?? '') : '',
      notes: cell(line, parsed.header!, 'notes'),
      vehicleNo: meta.vehicle === 'hidden' ? '' : cell(line, parsed.header!, 'vehicleNo'),
      siteCode: meta.site === 'hidden' ? '' : cell(line, parsed.header!, 'siteCode'),
      documents: [],
    }
    if (!checkStatus(input.status)) {
      issues.push({ row: rowNumber, message: 'Status must be Active or Inactive.' })
      return
    }
    if (meta.commodity === 'required' && !commodity) {
      issues.push({ row: rowNumber, message: `Commodity “${commodityName || 'blank'}” is not on the working mandi list.` })
      return
    }
    const message = validatePartyInput(kind, input, [...data.parties, ...rowsAsParties(kind, mandi.id, rows)], data.commodities, mandi.id)
    if (message) {
      issues.push({ row: rowNumber, message: message.message })
      return
    }
    const key = input.label.toLowerCase()
    if (seen.has(key)) {
      issues.push({ row: rowNumber, message: 'That desk label is repeated in this file.' })
      return
    }
    seen.add(key)
    rows.push(input)
  })
  return { rows, issues }
}

function rowsAsParties(kind: PartyKind, mandiId: string, rows: PartyInput[]): RegistryData['parties'] {
  return rows.map((row, index) => ({
    ...row,
    id: `pending-${index}`,
    kind,
    mandiId,
    createdAt: '',
    updatedAt: '',
  }))
}

export function previewCommodityCsv(text: string, data: RegistryData): CsvPreview<CommodityInput> {
  return previewNamed(text, COMMODITY_COLUMNS, data, (line, index, mandiId, pending) => {
    const input: CommodityInput = {
      name: cell(line, index, 'name'),
      category: cell(line, index, 'category'),
      season: cell(line, index, 'season'),
      status: cell(line, index, 'status') as CommodityInput['status'],
    }
    return validateCommodityInput(input, [...data.commodities, ...pending.map((item, index) => asNamed(item, index, mandiId))], mandiId) ?? input
  })
}

export function previewGradeCsv(text: string, data: RegistryData): CsvPreview<GradeInput> {
  const parsed = readTable(text, GRADE_COLUMNS)
  if (!parsed.header) return { rows: [], issues: parsed.issues }
  const mandi = workingMandi(data.locations)
  if (!mandi) return { rows: [], issues: [{ row: 1, message: 'Choose a working mandi before importing.' }] }
  const rows: GradeInput[] = []
  const issues: CsvIssue[] = []
  parsed.body.forEach((line, offset) => {
    const commodityName = cell(line, parsed.header!, 'commodity')
    const commodity = data.commodities.find(
      (item) => item.mandiId === mandi.id && item.status !== 'Removed' && item.name.toLowerCase() === commodityName.toLowerCase(),
    )
    const input: GradeInput = {
      commodityId: commodity?.id ?? '',
      name: cell(line, parsed.header!, 'name'),
      description: cell(line, parsed.header!, 'description'),
      status: cell(line, parsed.header!, 'status') as GradeInput['status'],
    }
    const rowNumber = offset + 2
    if (!commodity) {
      issues.push({ row: rowNumber, message: `Commodity “${commodityName || 'blank'}” is not on the working mandi list.` })
      return
    }
    const message = validateGradeInput(input, [...data.grades, ...rows.map((row, index) => ({ ...row, id: `pending-${index}`, mandiId: mandi.id, status: 'Active' }))], mandi.id)
    if (message) issues.push({ row: rowNumber, message: message.message })
    else rows.push(input)
  })
  return { rows, issues }
}

export function previewUnitCsv(text: string, data: RegistryData): CsvPreview<UnitInput> {
  const parsed = readTable(text, UNIT_COLUMNS)
  if (!parsed.header) return { rows: [], issues: parsed.issues }
  const mandi = workingMandi(data.locations)
  if (!mandi) return { rows: [], issues: [{ row: 1, message: 'Choose a working mandi before importing.' }] }
  const rows: UnitInput[] = []
  const issues: CsvIssue[] = []
  parsed.body.forEach((line, offset) => {
    const kind = cell(line, parsed.header!, 'kind')
    const input: UnitInput = {
      name: cell(line, parsed.header!, 'name'),
      symbol: cell(line, parsed.header!, 'symbol'),
      kind: kind as UnitKind,
      status: cell(line, parsed.header!, 'status') as UnitInput['status'],
    }
    const rowNumber = offset + 2
    const message = validateUnitInput(
      input,
      [...data.units, ...rows.map((row, index) => ({ id: `pending-${index}`, mandiId: mandi.id, name: row.name, status: 'Active' }))],
      mandi.id,
    )
    if (message) issues.push({ row: rowNumber, message: message.message })
    else rows.push(input)
  })
  return { rows, issues }
}

export function previewLocationCsv(text: string, data: RegistryData): CsvPreview<LocationInput> {
  const parsed = readTable(text, LOCATION_COLUMNS)
  if (!parsed.header) return { rows: [], issues: parsed.issues }
  const rows: LocationInput[] = []
  const issues: CsvIssue[] = []
  parsed.body.forEach((line, offset) => {
    const input: LocationInput = {
      name: cell(line, parsed.header!, 'name'),
      district: cell(line, parsed.header!, 'district'),
      code: cell(line, parsed.header!, 'code').toUpperCase(),
      status: cell(line, parsed.header!, 'status') as LocationInput['status'],
      active: false,
    }
    const message = validateLocationInput(input, [
      ...data.locations,
      ...rows.map((row, index) => ({
        id: `pending-${index}`,
        mandiId: `pending-${index}`,
        name: row.name,
        district: row.district,
        code: row.code,
        active: false,
        status: 'Active' as const,
        createdAt: '',
        updatedAt: '',
      })),
    ])
    if (message) issues.push({ row: offset + 2, message: message.message })
    else rows.push(input)
  })
  return { rows, issues }
}

export function previewFeeCsv(text: string, data: RegistryData): CsvPreview<FeeInput> {
  const parsed = readTable(text, FEE_COLUMNS)
  if (!parsed.header) return { rows: [], issues: parsed.issues }
  const mandi = workingMandi(data.locations)
  if (!mandi) return { rows: [], issues: [{ row: 1, message: 'Choose a working mandi before importing.' }] }
  const rows: FeeInput[] = []
  const issues: CsvIssue[] = []
  parsed.body.forEach((line, offset) => {
    const input: FeeInput = {
      name: cell(line, parsed.header!, 'name'),
      basis: cell(line, parsed.header!, 'basis'),
      sampleRate: cell(line, parsed.header!, 'sampleRate'),
      status: cell(line, parsed.header!, 'status') as FeeInput['status'],
    }
    const message = validateFeeInput(
      input,
      [...data.fees, ...rows.map((row, index) => ({ id: `pending-${index}`, mandiId: mandi.id, name: row.name, status: 'Active' }))],
      mandi.id,
    )
    if (message) issues.push({ row: offset + 2, message: message.message })
    else rows.push(input)
  })
  return { rows, issues }
}

function asNamed(input: { name: string }, index: number, mandiId: string) {
  return { id: `pending-${index}`, mandiId, name: input.name, category: '', season: '', status: 'Active' as const, createdAt: '', updatedAt: '' }
}

function previewNamed(
  text: string,
  columns: string[],
  data: RegistryData,
  build: (line: string[], index: Map<string, number>, mandiId: string, pending: CommodityInput[]) => CommodityInput | { field: string; message: string },
): CsvPreview<CommodityInput> {
  const parsed = readTable(text, columns)
  if (!parsed.header) return { rows: [], issues: parsed.issues }
  const mandi = workingMandi(data.locations)
  if (!mandi) return { rows: [], issues: [{ row: 1, message: 'Choose a working mandi before importing.' }] }
  const rows: CommodityInput[] = []
  const issues: CsvIssue[] = []
  parsed.body.forEach((line, offset) => {
    const result = build(line, parsed.header!, mandi.id, rows)
    if ('field' in result) issues.push({ row: offset + 2, message: result.message })
    else rows.push(result)
  })
  return { rows, issues }
}
