import { FINANCE_DAY } from '@/services/finance-rules'
import type { FinanceData } from '@/types/finance'

export function createFinanceSeed(): FinanceData {
  return {
    opening: [
      {
        id: 'DEMO-SEC-7001',
        aadathiyaId: 'DEMO-REG-AD-3001',
        aadathiyaLabel: 'AD-02',
        amountPaise: 1_000_000,
        note: 'Opening simulated security for AD-02. Not a bank deposit.',
      },
      {
        id: 'DEMO-SEC-7002',
        aadathiyaId: 'DEMO-REG-AD-3002',
        aadathiyaLabel: 'AD-09',
        amountPaise: 2_000_000,
        note: 'Opening simulated security for AD-09. Not a bank deposit.',
      },
    ],
    creditNotes: [
      {
        id: 'DEMO-CRN-7101',
        noteNo: 'DEMO-CRN-7101',
        tradeId: 'DEMO-TRD-6101',
        tradeNo: 'DEMO-TRD-6101',
        mandiId: 'mandi-dimapur',
        sellerId: 'DEMO-REG-FS-1001',
        sellerLabel: 'DG-14',
        aadathiyaId: 'DEMO-REG-AD-3001',
        aadathiyaLabel: 'AD-02',
        amountPaise: 200_000,
        status: 'approved',
        receiptId: '',
        createdAt: `${FINANCE_DAY}T11:00:00+05:30`,
        updatedAt: `${FINANCE_DAY}T11:10:00+05:30`,
      },
    ],
    debitNotes: [
      {
        id: 'DEMO-DBN-7101',
        noteNo: 'DEMO-DBN-7101',
        tradeId: 'DEMO-TRD-6101',
        tradeNo: 'DEMO-TRD-6101',
        mandiId: 'mandi-dimapur',
        buyerId: 'DEMO-REG-BY-2001',
        buyerLabel: 'BY-03',
        aadathiyaId: 'DEMO-REG-AD-3001',
        aadathiyaLabel: 'AD-02',
        amountPaise: 100_000,
        status: 'draft',
        receiptId: '',
        createdAt: `${FINANCE_DAY}T11:20:00+05:30`,
        updatedAt: `${FINANCE_DAY}T11:20:00+05:30`,
      },
    ],
    receipts: [],
    reconciliation: {
      day: FINANCE_DAY,
      status: 'open',
      snapshot: null,
      note: '',
      updatedAt: `${FINANCE_DAY}T12:00:00+05:30`,
    },
    closing: {
      day: FINANCE_DAY,
      status: 'open',
      note: '',
      updatedAt: `${FINANCE_DAY}T12:00:00+05:30`,
    },
    creditSeq: 7201,
    debitSeq: 7201,
    receiptSeq: 7201,
    commissionApproved: [],
  }
}
