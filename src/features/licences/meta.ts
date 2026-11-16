import type { RoleId } from '@/types/access'
import type { CheckMark, DocSlot, LicenceCategory, LicenceChecklist, LicenceStatus, RequestKind } from '@/types/licence'
import type { PartyKind } from '@/types/registry'

export type LicenceDesk = 'applicant' | 'officer' | 'manager' | 'accounts' | 'oversight' | 'reader'

export const LICENCE_AS_OF = '2026-11-14'

export function licenceDesk(roleId: RoleId): LicenceDesk {
  if (roleId === 'licence-officer') return 'officer'
  if (roleId === 'mandi-manager') return 'manager'
  if (roleId === 'accounts-officer') return 'accounts'
  if (roleId === 'super-admin') return 'oversight'
  if (roleId === 'inspector') return 'reader'
  return 'applicant'
}

export function applicantPartyKinds(roleId: RoleId): PartyKind[] {
  if (roleId === 'farmer-seller') return ['farmer']
  if (roleId === 'buyer') return ['buyer']
  if (roleId === 'aadathiya') return ['aadathiya']
  return ['farmer', 'buyer', 'aadathiya']
}

export function categoryForParty(kind: PartyKind): LicenceCategory | null {
  if (kind === 'farmer') return 'vendor'
  if (kind === 'aadathiya') return 'trader'
  if (kind === 'buyer') return 'buyer'
  return null
}

export function statusLabel(status: LicenceStatus) {
  const labels: Record<LicenceStatus, string> = {
    submitted: 'Application Submitted',
    'under-verification': 'Under Verification',
    'clarification-required': 'Clarification required',
    'pending-approval': 'Pending Manager Approval',
    rejected: 'Rejected',
    approved: 'Approved',
    'fee-recorded': 'Fee/Deposit Recorded',
    issued: 'Licence Issued',
  }
  return labels[status]
}

export function categoryLabel(category: LicenceCategory) {
  if (category === 'vendor') return 'Vendor'
  if (category === 'trader') return 'Trader (Aadathiya)'
  return 'Buyer'
}

export function requestKindLabel(kind: RequestKind) {
  if (kind === 'renewal') return 'Renewal'
  if (kind === 'modification') return 'Modification'
  return 'New application'
}

export function slotLabel(slot: DocSlot) {
  if (slot === 'identity') return 'Proof of identity'
  if (slot === 'registration') return 'Business registration'
  if (slot === 'tax') return 'Tax identification'
  return 'Additional document'
}

export function checkLabel(key: keyof Omit<LicenceChecklist, 'remarks'>) {
  const labels = {
    identity: 'Identity proof verified',
    registration: 'Business registration verified',
    tax: 'Tax identification verified',
    additional: 'Additional documents verified',
    formComplete: 'Application form complete',
    documentsAttached: 'Required documents attached',
  }
  return labels[key]
}

export function markLabel(mark: CheckMark) {
  if (mark === 'pass') return 'Pass'
  if (mark === 'fail') return 'Fail'
  return 'Pending'
}

export function feeSchedule(category: LicenceCategory) {
  if (category === 'vendor') return { fee: '₹2,400 sample', deposit: '₹10,000 sample' }
  if (category === 'trader') return { fee: '₹6,000 sample', deposit: '₹25,000 sample' }
  return { fee: '₹4,000 sample', deposit: '₹15,000 sample' }
}

export function deskIntro(desk: LicenceDesk) {
  if (desk === 'officer') return 'Licence Officer desk. Verify documents, then issue a DEMO licence after the simulated receipt is on file.'
  if (desk === 'manager') return 'Mandi Manager desk. Review cases the officer has forwarded. Approval here is a simulation.'
  if (desk === 'accounts') return 'Accounts desk. Record a simulated licence fee and security deposit. No money moves.'
  if (desk === 'oversight') return 'Oversight can open every SOP-001 step in this browser. It does not grant an office authority.'
  if (desk === 'reader') return 'Read-only view of the demonstration register, alerts and case history.'
  return 'Applicant desk. File a demonstration application and follow its status. Nothing here is lodged with a mandi office.'
}
