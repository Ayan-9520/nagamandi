import type { CheckKind, ContractStatus } from '@/types/warehouse'

export function contractLabel(status: ContractStatus) {
  const labels: Record<ContractStatus, string> = {
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
    fire: 'Fire safety checklist',
    security: 'Security inspection',
  }
  return labels[kind]
}
