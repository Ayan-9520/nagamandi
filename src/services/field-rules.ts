import type { RoleId } from '@/types/access'
import { getRole } from '@/mocks/permissions'

export const DRAFT_KINDS = ['arrival', 'lot-inspection', 'parking-entry', 'parking-exit', 'facility-inspection'] as const
export type DraftKind = (typeof DRAFT_KINDS)[number]

export const BLOCKED_KINDS = ['payment', 'licence', 'finance', 'approval'] as const

export function canOpenField(roleId: RoleId) {
  const modules = getRole(roleId).modules
  return modules.some((item) => item === 'arrivals' || item === 'trading' || item === 'parking' || item === 'facilities')
}

export function hasModule(roleId: RoleId, moduleId: string) {
  return getRole(roleId).modules.includes(moduleId)
}

export function offlineSaveMessage() {
  return 'This browser is offline. The draft stays on this device. Payments, licences, financial postings and approvals are not completed offline.'
}

export function blockedDraftMessage() {
  return 'Offline mode saves drafts only. Payments, licences, financial postings and approvals are not completed from a draft.'
}

export function isBlockedKind(kind: string) {
  return (BLOCKED_KINDS as readonly string[]).includes(kind)
}

export function conflictText(baseToken: string, currentToken: string | null) {
  if (!currentToken) return 'That record is no longer in this browser. The draft was not applied.'
  if (baseToken && currentToken !== baseToken) return 'That record changed after this draft was saved. The draft was not applied.'
  return null
}
