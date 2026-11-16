import type { CheckKind } from '@/types/flp'

export function checkLabel(kind: CheckKind) {
  return kind === 'cleaning' ? 'Cleaning and hygiene checklist' : 'Fire and workplace safety inspection'
}
