import type { AgreementStatus, ChargeKind, SlotState, VisitStatus } from '@/types/parking'

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

export function slotLabel(state: SlotState) {
  const labels: Record<SlotState, string> = {
    available: 'Available',
    occupied: 'Occupied',
    reserved: 'Reserved',
  }
  return labels[state]
}

export function visitLabel(status: VisitStatus) {
  const labels: Record<VisitStatus, string> = {
    reserved: 'Reserved',
    inside: 'Inside',
    exited: 'Exited',
  }
  return labels[status]
}

export function chargeLabel(kind: ChargeKind) {
  return kind === 'deposit' ? 'Deposit' : 'Rent'
}
