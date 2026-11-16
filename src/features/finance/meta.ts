import type { ClosingStatus, NoteStatus, ReceiptKind, ReconStatus } from '@/types/finance'

export function creditLabel(status: NoteStatus | 'draft' | 'approved' | 'redeemed' | 'cancelled') {
  const labels = { draft: 'Draft', approved: 'Approved', redeemed: 'Redeemed', collected: 'Collected', cancelled: 'Cancelled' }
  return labels[status]
}

export function reconLabel(status: ReconStatus) {
  const labels: Record<ReconStatus, string> = { open: 'Open', checked: 'Checked', closed: 'Closed' }
  return labels[status]
}

export function closingLabel(status: ClosingStatus) {
  const labels: Record<ClosingStatus, string> = { open: 'Open', submitted: 'Submitted', approved: 'Approved', closed: 'Closed' }
  return labels[status]
}

export function receiptKindLabel(kind: ReceiptKind) {
  const labels: Record<ReceiptKind, string> = {
    'seller-payment': 'Seller payment',
    'buyer-collection': 'Buyer collection',
    'credit-redemption': 'Credit-note redemption',
    'debit-collection': 'Debit-note collection',
  }
  return labels[kind]
}
