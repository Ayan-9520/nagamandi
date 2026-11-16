import { commodityIds, SEED_MANDI_ID } from '@/mocks/registry-seed'
import { DEFAULT_RATES, quoteTrade } from '@/services/trade-rules'
import type { BuyerRequirement, TradeData, TradeNote, TradeRecord } from '@/types/trade'

const DAY = '2026-11-14'

function note(id: string, at: string, text: string, method: TradeNote['method']): TradeNote {
  return { id, at, kind: 'discovery', method, text }
}

function trade(partial: {
  n: number
  lotId: string
  lotNo: string
  sellerId: string
  sellerLabel: string
  buyerId: string
  buyerLabel: string
  aadathiyaId: string
  aadathiyaLabel: string
  commodityId: string
  commodityName: string
  gradeName: string
  quantity: number
  price: number
  transport: number
  method: TradeRecord['method']
  status: TradeRecord['status']
  paymentStatus: TradeRecord['paymentStatus']
  at: string
  discovery: string
}): TradeRecord {
  const key = String(partial.n)
  const figures = quoteTrade(partial.quantity, partial.price, partial.transport, DEFAULT_RATES)
  const documented = partial.status === 'documented'
  return {
    id: `DEMO-TRD-${key}`,
    tradeNo: `DEMO-TRD-${key}`,
    mandiId: SEED_MANDI_ID,
    lotId: partial.lotId,
    lotNo: partial.lotNo,
    sellerId: partial.sellerId,
    sellerLabel: partial.sellerLabel,
    buyerId: partial.buyerId,
    buyerLabel: partial.buyerLabel,
    aadathiyaId: partial.aadathiyaId,
    aadathiyaLabel: partial.aadathiyaLabel,
    commodityId: partial.commodityId,
    commodityName: partial.commodityName,
    gradeName: partial.gradeName,
    unitSymbol: 'q',
    quantity: partial.quantity,
    price: partial.price,
    method: partial.method,
    rates: { ...DEFAULT_RATES },
    figures,
    status: partial.status,
    paymentStatus: partial.paymentStatus,
    sellerParchiNo: documented ? `DEMO-PRC-S-${key}` : '',
    buyerParchiNo: documented ? `DEMO-PRC-B-${key}` : '',
    qrPayload: documented ? `DEMO|NAGA-MANDI|DEMO-PRC-S-${key}|not-a-receipt` : '',
    notes: [note(`NOTE-${key}-1`, partial.at, partial.discovery, partial.method)],
    createdAt: partial.at,
    updatedAt: partial.at,
  }
}

export function createTradeSeed(): TradeData {
  const trades: TradeRecord[] = [
    trade({
      n: 6101,
      lotId: 'DEMO-ARR-5105',
      lotNo: 'DEMO-LOT-5105',
      sellerId: 'DEMO-REG-FS-1001',
      sellerLabel: 'DG-14',
      buyerId: 'DEMO-REG-BY-2001',
      buyerLabel: 'BY-03',
      aadathiyaId: 'DEMO-REG-AD-3001',
      aadathiyaLabel: 'AD-02',
      commodityId: commodityIds.chilli,
      commodityName: 'Naga king chilli',
      gradeName: 'A',
      quantity: 4.2,
      price: 8600,
      transport: 180,
      method: 'negotiated',
      status: 'documented',
      paymentStatus: 'pending',
      at: `${DAY}T10:20:00+05:30`,
      discovery: 'Negotiated sale recorded at ₹8,600 per quintal. No money was collected.',
    }),
    trade({
      n: 6102,
      lotId: 'DEMO-ARR-5104',
      lotNo: 'DEMO-LOT-5104',
      sellerId: 'DEMO-REG-FS-1004',
      sellerLabel: 'WK-19',
      buyerId: 'DEMO-REG-BY-2002',
      buyerLabel: 'BY-11',
      aadathiyaId: 'DEMO-REG-AD-3002',
      aadathiyaLabel: 'AD-09',
      commodityId: commodityIds.ginger,
      commodityName: 'Ginger',
      gradeName: 'A',
      quantity: 12,
      price: 4200,
      transport: 450,
      method: 'hatha',
      status: 'confirmed',
      paymentStatus: 'pending',
      at: `${DAY}T09:40:00+05:30`,
      discovery: 'Hatha negotiation record at ₹4,200 per quintal. The hand signal was written down. No session is open.',
    }),
    trade({
      n: 6103,
      lotId: 'DEMO-ARR-5103',
      lotNo: 'DEMO-LOT-5103',
      sellerId: 'DEMO-REG-FS-1001',
      sellerLabel: 'DG-14',
      buyerId: 'DEMO-REG-BY-2003',
      buyerLabel: 'BY-18',
      aadathiyaId: 'DEMO-REG-AD-3001',
      aadathiyaLabel: 'AD-02',
      commodityId: commodityIds.chilli,
      commodityName: 'Naga king chilli',
      gradeName: 'B',
      quantity: 9.75,
      price: 9100,
      transport: 0,
      method: 'auction-record',
      status: 'negotiating',
      paymentStatus: 'pending',
      at: `${DAY}T11:05:00+05:30`,
      discovery: 'Auction record notes ₹9,100 per quintal. This is a written note. Bidding is not open.',
    }),
  ]
  const requirements: BuyerRequirement[] = [
    {
      id: 'DEMO-REQ-6101',
      requirementNo: 'DEMO-REQ-6101',
      mandiId: SEED_MANDI_ID,
      buyerId: 'DEMO-REG-BY-2001',
      buyerLabel: 'BY-03',
      commodityId: commodityIds.chilli,
      commodityName: 'Naga king chilli',
      unitId: 'DEMO-UNT-0001',
      unitSymbol: 'q',
      quantity: 8,
      note: 'Buyer desk BY-03 is looking for grade A or B chilli on the sample day.',
      status: 'open',
      createdAt: `${DAY}T08:30:00+05:30`,
      updatedAt: `${DAY}T08:30:00+05:30`,
    },
    {
      id: 'DEMO-REQ-6102',
      requirementNo: 'DEMO-REQ-6102',
      mandiId: SEED_MANDI_ID,
      buyerId: 'DEMO-REG-BY-2002',
      buyerLabel: 'BY-11',
      commodityId: commodityIds.ginger,
      commodityName: 'Ginger',
      unitId: 'DEMO-UNT-0001',
      unitSymbol: 'q',
      quantity: 20,
      note: 'Buyer desk BY-11 asked for ginger. Twelve quintals are confirmed on DEMO-LOT-5104.',
      status: 'matched',
      createdAt: `${DAY}T09:10:00+05:30`,
      updatedAt: `${DAY}T09:40:00+05:30`,
    },
  ]
  return {
    trades,
    requirements,
    tradeSeq: 6201,
    requirementSeq: 6201,
    rates: { ...DEFAULT_RATES },
  }
}
