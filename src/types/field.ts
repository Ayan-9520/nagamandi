import type { DraftKind } from '@/services/field-rules'

export const DRAFT_STATUSES = ['saved', 'conflict', 'synced'] as const
export type DraftStatus = (typeof DRAFT_STATUSES)[number]

export interface FieldDraft {
  id: string
  kind: DraftKind
  title: string
  savedAt: string
  baseToken: string
  targetId: string
  fields: Record<string, string>
  photoName: string
  photoDataUrl: string
  status: DraftStatus
  conflict: string
}

export interface FieldData {
  drafts: FieldDraft[]
  seq: number
}

export type FieldSave = { ok: true; id: string } | { ok: false; message: string }
