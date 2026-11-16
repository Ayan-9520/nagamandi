import { categoryForParty, feeSchedule, LICENCE_AS_OF } from '@/features/licences/meta'
import { checkDeskLabel, checkPhone } from '@/services/registry-rules'
import type { LicenceCase, LicenceChecklist, LicenceInput } from '@/types/licence'
import type { Party } from '@/types/registry'

const emailPattern = /^[a-z0-9][a-z0-9.-]{0,30}@demo\.mandi$/
const registrationPattern = /^DEMO-BR-\d{4}$/
const taxPattern = /^DEMO-TAX-\d{5}$/

export interface FieldIssue {
  field: keyof LicenceInput
  message: string
}

function issue(field: keyof LicenceInput, message: string): FieldIssue {
  return { field, message }
}

export function addDays(iso: string, days: number) {
  const [year, month, day] = iso.split('-').map(Number)
  const date = new Date(Date.UTC(year, month - 1, day))
  date.setUTCDate(date.getUTCDate() + days)
  return date.toISOString().slice(0, 10)
}

export function addYears(iso: string, years: number) {
  const [year, month, day] = iso.split('-')
  return `${Number(year) + years}-${month}-${day}`
}

export function expiryBand(validUntil: string | null, supersededBy: string | null) {
  if (!validUntil || supersededBy) return null
  if (validUntil < LICENCE_AS_OF) return 'expired' as const
  if (validUntil <= addDays(LICENCE_AS_OF, 30)) return 'expiring' as const
  return 'current' as const
}

export function validateLicenceInput(input: LicenceInput, party: Party | undefined): FieldIssue | null {
  if (!party || party.status === 'Removed') return issue('partyId', 'Choose an active desk code from this browser.')
  if (!categoryForParty(party.kind)) return issue('partyId', 'Choose a seller, buyer or aadathiya desk code.')
  const label = checkDeskLabel(input.applicantLabel)
  if (label) return issue('applicantLabel', label)
  if (input.area.trim().length < 2) return issue('area', 'Enter a sample area code.')
  const phone = checkPhone(input.phone)
  if (phone) return issue('phone', phone)
  if (!emailPattern.test(input.email)) return issue('email', 'Use a fictional address such as dg14@demo.mandi.')
  const business = checkDeskLabel(input.businessName)
  if (business) return issue('businessName', 'Use a fictional stall code such as DG-14 stall.')
  if (input.businessArea.trim().length < 2) return issue('businessArea', 'Enter a sample business area.')
  if (!registrationPattern.test(input.registrationNo)) return issue('registrationNo', 'Use a sample registration such as DEMO-BR-1008.')
  if (!taxPattern.test(input.taxId)) return issue('taxId', 'Use a sample tax id such as DEMO-TAX-10008.')
  const slots = new Set(input.documents.map((document) => document.slot))
  if (!slots.has('identity') || !slots.has('registration') || !slots.has('tax')) {
    return issue('documents', 'Attach sample copies for identity, registration and tax.')
  }
  if (!input.declared) return issue('declared', 'Confirm the demonstration declaration before submitting.')
  return null
}

export function checklistBlock(list: LicenceChecklist, hasAdditional: boolean) {
  const required: (keyof Omit<LicenceChecklist, 'remarks'>)[] = ['identity', 'registration', 'tax', 'formComplete', 'documentsAttached']
  if (required.some((key) => list[key] !== 'pass')) {
    return 'Mark every required checklist line as pass before sending this to the manager.'
  }
  if (hasAdditional && list.additional !== 'pass') return 'Mark the additional document as pass, or remove it.'
  if (list.additional === 'fail') return 'A failed additional document cannot be forwarded.'
  return null
}

export function emptyFee(category: LicenceCase['category']) {
  const schedule = feeSchedule(category)
  return { feeLabel: schedule.fee, depositLabel: schedule.deposit, method: '' as const, receiptId: null, recordedAt: null }
}

export function validityFor(kind: LicenceCase['kind'], parent: LicenceCase | null) {
  if (kind === 'modification' && parent?.validFrom && parent.validUntil) {
    return { validFrom: parent.validFrom, validUntil: parent.validUntil }
  }
  if (kind === 'renewal' && parent?.validUntil && parent.validUntil >= LICENCE_AS_OF) {
    const validFrom = addDays(parent.validUntil, 1)
    return { validFrom, validUntil: addYears(validFrom, 1) }
  }
  return { validFrom: LICENCE_AS_OF, validUntil: addYears(LICENCE_AS_OF, 1) }
}
