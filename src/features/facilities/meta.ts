import type { AgreementStatus, ChargeKind, CheckKind, FacilityKind } from '@/types/facility'
import { FACILITY_TEMPLATES } from '@/services/facility-rules'

export function kindLabel(kind: FacilityKind) {
  return FACILITY_TEMPLATES[kind].title
}

export function agreementLabel(status: AgreementStatus) {
  const labels: Record<AgreementStatus, string> = {
    draft: 'Draft',
    submitted: 'Submitted',
    'under-verification': 'Under verification',
    'clarification-required': 'Clarification required',
    verified: 'Verified',
    approved: 'Approved',
    'deposit-recorded': 'Deposit recorded',
    issued: 'Issued',
    rejected: 'Rejected',
  }
  return labels[status]
}

export function checkLabel(kind: CheckKind) {
  const labels: Record<CheckKind, string> = {
    cleaning: 'Cleaning checklist',
    fire: 'Fire safety inspection',
    hygiene: 'Food hygiene inspection',
    operations: 'Restaurant operational checklist',
  }
  return labels[kind]
}

export function chargeLabel(kind: ChargeKind) {
  return kind === 'deposit' ? 'Deposit' : 'Rent'
}
