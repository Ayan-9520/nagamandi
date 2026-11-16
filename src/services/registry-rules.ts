import { partyRegister } from '@/features/registry/meta'
import type {
  CommodityInput,
  CommodityRecord,
  FeeInput,
  GradeInput,
  LocationInput,
  LocationRecord,
  Party,
  PartyInput,
  PartyKind,
  UnitInput,
  WorkingStatus,
} from '@/types/registry'

const deskLabel = /^[A-Za-z0-9][A-Za-z0-9 ./-]{1,39}$/
const phonePattern = /^7\d{4}-\d{5}$/
const vehiclePattern = /^NL\d{2}-DEMO-\d{3}$/
const sitePattern = /^[A-Z]{2,4}-\d{1,2}$/

export function workingMandi(locations: LocationRecord[]) {
  return (
    locations.find((location) => location.active && location.status !== 'Removed') ??
    locations.find((location) => location.status !== 'Removed') ??
    null
  )
}

export function mandiName(locations: LocationRecord[], mandiId: string) {
  return locations.find((location) => location.id === mandiId)?.name ?? mandiId
}

export function checkDeskLabel(label: string) {
  if (!deskLabel.test(label)) return 'Use a fictional desk code such as DG-14.'
  return null
}

export function checkPhone(phone: string) {
  if (!phonePattern.test(phone)) return 'Use a fictional number such as 70000-10014.'
  return null
}

export function checkVehicle(vehicleNo: string, mode: 'required' | 'optional' | 'hidden') {
  if (mode === 'hidden') return null
  if (!vehicleNo) return mode === 'required' ? 'Enter a demonstration vehicle such as NL07-DEMO-214.' : null
  if (!vehiclePattern.test(vehicleNo)) return 'Use a demonstration vehicle such as NL07-DEMO-214.'
  return null
}

export function checkSite(siteCode: string, mode: 'required' | 'hidden') {
  if (mode === 'hidden') return null
  if (!sitePattern.test(siteCode)) return 'Use a code such as WH-D1 or FB-01.'
  return null
}

export function checkStatus(status: string): status is WorkingStatus {
  return status === 'Active' || status === 'Inactive'
}

export function duplicatePartyLabel(parties: Party[], kind: PartyKind, mandiId: string, label: string, exceptId?: string) {
  return parties.some(
    (party) =>
      party.id !== exceptId &&
      party.kind === kind &&
      party.mandiId === mandiId &&
      party.status !== 'Removed' &&
      party.label.toLowerCase() === label.toLowerCase(),
  )
}

export interface FieldIssue {
  field: string
  message: string
}

function issue(field: string, message: string): FieldIssue {
  return { field, message }
}

export function validatePartyInput(
  kind: PartyKind,
  input: PartyInput,
  parties: Party[],
  commodities: CommodityRecord[],
  mandiId: string,
  exceptId?: string,
) {
  const meta = partyRegister(kind)
  const labelError = checkDeskLabel(input.label)
  if (labelError) return issue('label', labelError)
  if (input.area.trim().length < 2 || input.area.trim().length > 60) return issue('area', 'Enter an area code between 2 and 60 characters.')
  const phoneError = checkPhone(input.phone)
  if (phoneError) return issue('phone', phoneError)
  if (!checkStatus(input.status)) return issue('status', 'Choose Active or Inactive.')
  if (input.notes.length > 280) return issue('notes', 'Keep the note within 280 characters.')
  const vehicleError = checkVehicle(input.vehicleNo, meta.vehicle)
  if (vehicleError) return issue('vehicleNo', vehicleError)
  const siteError = checkSite(input.siteCode, meta.site)
  if (siteError) return issue('siteCode', siteError)
  if (meta.commodity === 'required') {
    const commodity = commodities.find((item) => item.id === input.commodityId && item.mandiId === mandiId && item.status !== 'Removed')
    if (!commodity) return issue('commodityId', 'Choose a commodity from the working mandi.')
  }
  if (duplicatePartyLabel(parties, kind, mandiId, input.label, exceptId)) {
    return issue('label', 'That desk label is already on this mandi’s working list.')
  }
  return null
}

export function validateCommodityInput(input: CommodityInput, rows: CommodityRecord[], mandiId: string, exceptId?: string) {
  if (input.name.trim().length < 2 || input.name.trim().length > 40) return issue('name', 'Enter a commodity name between 2 and 40 characters.')
  if (input.category.trim().length < 2) return issue('category', 'Enter a category.')
  if (input.season.trim().length < 2) return issue('season', 'Enter a season label.')
  if (!checkStatus(input.status)) return issue('status', 'Choose Active or Inactive.')
  const clash = rows.some(
    (row) =>
      row.id !== exceptId &&
      row.mandiId === mandiId &&
      row.status !== 'Removed' &&
      row.name.toLowerCase() === input.name.trim().toLowerCase(),
  )
  return clash ? issue('name', 'That name is already on this mandi’s list.') : null
}

export function validateGradeInput(input: GradeInput, rows: { id: string; mandiId: string; commodityId: string; name: string; status: string }[], mandiId: string, exceptId?: string) {
  if (input.name.trim().length < 1 || input.name.trim().length > 40) return issue('name', 'Enter a grade name.')
  if (input.description.trim().length < 2) return issue('description', 'Enter a short description.')
  if (!checkStatus(input.status)) return issue('status', 'Choose Active or Inactive.')
  const clash = rows.some(
    (row) =>
      row.id !== exceptId &&
      row.mandiId === mandiId &&
      row.status !== 'Removed' &&
      row.commodityId === input.commodityId &&
      row.name.toLowerCase() === input.name.trim().toLowerCase(),
  )
  return clash ? issue('name', 'That grade is already listed for this commodity.') : null
}

export function validateUnitInput(input: UnitInput, rows: { id: string; mandiId: string; name: string; status: string }[], mandiId: string, exceptId?: string) {
  if (input.name.trim().length < 2) return issue('name', 'Enter a unit name.')
  if (!/^[A-Za-z]{1,6}$/.test(input.symbol.trim())) return issue('symbol', 'Use a short symbol such as kg or MT.')
  if (!['Weight', 'Count', 'Volume'].includes(input.kind)) return issue('kind', 'Choose Weight, Count or Volume.')
  if (!checkStatus(input.status)) return issue('status', 'Choose Active or Inactive.')
  const clash = rows.some(
    (row) => row.id !== exceptId && row.mandiId === mandiId && row.status !== 'Removed' && row.name.toLowerCase() === input.name.trim().toLowerCase(),
  )
  return clash ? issue('name', 'That name is already on this mandi’s list.') : null
}

export function validateLocationInput(input: LocationInput, rows: LocationRecord[], exceptId?: string) {
  if (input.name.trim().length < 2) return issue('name', 'Enter the mandi name.')
  if (input.district.trim().length < 2) return issue('district', 'Enter the district label.')
  if (!/^[A-Z]{2,6}$/.test(input.code.trim())) return issue('code', 'Use a short code such as DMP.')
  if (!checkStatus(input.status)) return issue('status', 'Choose Active or Inactive.')
  const current = rows.find((row) => row.id === exceptId)
  if (current?.active && !input.active) return issue('active', 'Choose another location as the working mandi first.')
  const clash = rows.some(
    (row) => row.id !== exceptId && row.status !== 'Removed' && (row.code === input.code.trim() || row.name.toLowerCase() === input.name.trim().toLowerCase()),
  )
  return clash ? issue('name', 'That name or code is already on file.') : null
}

export function validateFeeInput(input: FeeInput, rows: { id: string; mandiId: string; name: string; status: string }[], mandiId: string, exceptId?: string) {
  if (input.name.trim().length < 2) return issue('name', 'Enter a fee label.')
  if (input.basis.trim().length < 2) return issue('basis', 'Enter the basis, such as per quintal.')
  if (input.sampleRate.trim().length < 2) return issue('sampleRate', 'Enter a sample rate label. It is not collected.')
  if (!checkStatus(input.status)) return issue('status', 'Choose Active or Inactive.')
  const clash = rows.some(
    (row) => row.id !== exceptId && row.mandiId === mandiId && row.status !== 'Removed' && row.name.toLowerCase() === input.name.trim().toLowerCase(),
  )
  return clash ? issue('name', 'That name is already on this mandi’s list.') : null
}
