import { movementPlace } from '@/features/arrivals/meta'
import type { ArrivalData, ArrivalLot, ArrivalStatus, LotMovement, WeighBay } from '@/types/arrival'
import { SEED_MANDI_ID } from '@/mocks/registry-seed'

const DAY = '2026-11-14'
const PREVIOUS = '2026-11-13'

function movement(id: string, at: string, status: ArrivalStatus, note: string): LotMovement {
  return { id, at, status, place: movementPlace(status), note }
}

function lot(partial: {
  n: number
  sellerId: string
  sellerLabel: string
  aadathiyaId: string
  aadathiyaLabel: string
  commodityId: string
  commodityName: string
  gradeId: string
  gradeName: string
  unitId?: string
  unitName?: string
  unitSymbol?: string
  quantity: number
  gross: number
  tare: number
  bay: WeighBay
  crateCount: number
  crateCode: string
  vehicleNo: string
  status: ArrivalStatus
  arrivedAt: string
  note: string
  extra?: LotMovement[]
}): ArrivalLot {
  const key = String(partial.n)
  const lotNo = `DEMO-LOT-${key}`
  const arrived: LotMovement = movement(
    `MOV-${key}-1`,
    partial.arrivedAt,
    'arrived',
    'The vehicle was noted at the demonstration gate. This is not a gate pass.',
  )
  return {
    id: `DEMO-ARR-${key}`,
    arrivalNo: `DEMO-ARR-${key}`,
    lotNo,
    mandiId: SEED_MANDI_ID,
    sellerId: partial.sellerId,
    sellerLabel: partial.sellerLabel,
    aadathiyaId: partial.aadathiyaId,
    aadathiyaLabel: partial.aadathiyaLabel,
    commodityId: partial.commodityId,
    commodityName: partial.commodityName,
    gradeId: partial.gradeId,
    gradeName: partial.gradeName,
    unitId: partial.unitId ?? 'DEMO-UNT-0001',
    unitName: partial.unitName ?? 'Quintal',
    unitSymbol: partial.unitSymbol ?? 'q',
    quantity: partial.quantity,
    gross: partial.gross,
    tare: partial.tare,
    net: partial.quantity,
    bay: partial.bay,
    crateCount: partial.crateCount,
    crateCode: partial.crateCode,
    vehicleNo: partial.vehicleNo,
    note: partial.note,
    photos: [],
    status: partial.status,
    qrPayload: `DEMO|NAGA-MANDI|${lotNo}|not-a-gate-pass`,
    movements: [arrived, ...(partial.extra ?? [])],
    arrivedAt: partial.arrivedAt,
    updatedAt: partial.extra?.at(-1)?.at ?? partial.arrivedAt,
  }
}

export function createArrivalSeed(): ArrivalData {
  const lots: ArrivalLot[] = [
    lot({
      n: 5101,
      sellerId: 'DEMO-REG-FS-1001',
      sellerLabel: 'DG-14',
      aadathiyaId: 'DEMO-REG-AD-3001',
      aadathiyaLabel: 'AD-02',
      commodityId: 'DEMO-COM-0001',
      commodityName: 'Naga king chilli',
      gradeId: 'DEMO-GRD-0001',
      gradeName: 'A',
      quantity: 18.4,
      gross: 19.2,
      tare: 0.8,
      bay: 'WB-01',
      crateCount: 12,
      crateCode: 'CR-14',
      vehicleNo: 'NL07-DEMO-214',
      status: 'arrived',
      arrivedAt: `${DAY}T07:40:00+05:30`,
      note: 'Morning chilli sample at the north bay.',
    }),
    lot({
      n: 5102,
      sellerId: 'DEMO-REG-FS-1002',
      sellerLabel: 'KR-08',
      aadathiyaId: 'DEMO-REG-AD-3004',
      aadathiyaLabel: 'AD-15',
      commodityId: 'DEMO-COM-0007',
      commodityName: 'Kiwi',
      gradeId: 'DEMO-GRD-0006',
      gradeName: 'Export sample',
      quantity: 6.25,
      gross: 6.85,
      tare: 0.6,
      bay: 'WB-02',
      crateCount: 8,
      crateCode: 'CR-08',
      vehicleNo: 'NL07-DEMO-088',
      status: 'under-inspection',
      arrivedAt: `${DAY}T08:05:00+05:30`,
      note: 'Kiwi crates waiting on the inspection bay.',
      extra: [
        movement('MOV-5102-2', `${DAY}T08:20:00+05:30`, 'under-inspection', 'Moved to the inspection bay in this browser.'),
      ],
    }),
    lot({
      n: 5103,
      sellerId: 'DEMO-REG-FS-1001',
      sellerLabel: 'DG-14',
      aadathiyaId: 'DEMO-REG-AD-3001',
      aadathiyaLabel: 'AD-02',
      commodityId: 'DEMO-COM-0001',
      commodityName: 'Naga king chilli',
      gradeId: 'DEMO-GRD-0002',
      gradeName: 'B',
      quantity: 9.75,
      gross: 10.25,
      tare: 0.5,
      bay: 'WB-01',
      crateCount: 6,
      crateCode: 'CR-19',
      vehicleNo: 'NL07-DEMO-301',
      status: 'available',
      arrivedAt: `${DAY}T06:50:00+05:30`,
      note: 'Second chilli band marked available on the floor.',
      extra: [
        movement('MOV-5103-2', `${DAY}T07:05:00+05:30`, 'under-inspection', 'Inspection bay sample.'),
        movement('MOV-5103-3', `${DAY}T07:30:00+05:30`, 'available', 'Released to the auction floor sample.'),
      ],
    }),
    lot({
      n: 5104,
      sellerId: 'DEMO-REG-FS-1004',
      sellerLabel: 'WK-19',
      aadathiyaId: 'DEMO-REG-AD-3002',
      aadathiyaLabel: 'AD-09',
      commodityId: 'DEMO-COM-0002',
      commodityName: 'Ginger',
      gradeId: 'DEMO-GRD-0004',
      gradeName: 'A',
      quantity: 31,
      gross: 32.1,
      tare: 1.1,
      bay: 'WB-02',
      crateCount: 24,
      crateCode: 'CR-31',
      vehicleNo: 'NL07-DEMO-119',
      status: 'reserved',
      arrivedAt: `${DAY}T05:40:00+05:30`,
      note: 'Ginger lot held for a demonstration buyer desk.',
      extra: [
        movement('MOV-5104-2', `${DAY}T06:10:00+05:30`, 'under-inspection', 'Inspection completed in the sample.'),
        movement('MOV-5104-3', `${DAY}T06:40:00+05:30`, 'available', 'Placed on the floor sample.'),
        movement('MOV-5104-4', `${DAY}T09:15:00+05:30`, 'reserved', 'Reserved in this browser. No sale is recorded.'),
      ],
    }),
    lot({
      n: 5105,
      sellerId: 'DEMO-REG-FS-1001',
      sellerLabel: 'DG-14',
      aadathiyaId: 'DEMO-REG-AD-3001',
      aadathiyaLabel: 'AD-02',
      commodityId: 'DEMO-COM-0001',
      commodityName: 'Naga king chilli',
      gradeId: 'DEMO-GRD-0001',
      gradeName: 'A',
      quantity: 4.2,
      gross: 4.6,
      tare: 0.4,
      bay: 'WB-01',
      crateCount: 4,
      crateCode: 'CR-42',
      vehicleNo: 'NL07-DEMO-442',
      status: 'sold',
      arrivedAt: `${DAY}T05:10:00+05:30`,
      note: 'A small chilli lot marked sold. No payment is taken.',
      extra: [
        movement('MOV-5105-2', `${DAY}T05:30:00+05:30`, 'under-inspection', 'Checked at the bay.'),
        movement('MOV-5105-3', `${DAY}T06:00:00+05:30`, 'available', 'Offered on the floor sample.'),
        movement('MOV-5105-4', `${DAY}T10:05:00+05:30`, 'sold', 'Marked sold in this browser. Settlement is not run.'),
      ],
    }),
    lot({
      n: 5106,
      sellerId: 'DEMO-REG-FS-1004',
      sellerLabel: 'WK-19',
      aadathiyaId: 'DEMO-REG-AD-3002',
      aadathiyaLabel: 'AD-09',
      commodityId: 'DEMO-COM-0002',
      commodityName: 'Ginger',
      gradeId: 'DEMO-GRD-0005',
      gradeName: 'B',
      quantity: 22.5,
      gross: 23.4,
      tare: 0.9,
      bay: 'WB-02',
      crateCount: 16,
      crateCode: 'CR-16',
      vehicleNo: 'NL07-DEMO-077',
      status: 'dispatched',
      arrivedAt: `${PREVIOUS}T16:10:00+05:30`,
      note: 'Previous-day ginger that has left the yard sample.',
      extra: [
        movement('MOV-5106-2', `${PREVIOUS}T16:40:00+05:30`, 'under-inspection', 'Inspected on 13 Nov.'),
        movement('MOV-5106-3', `${PREVIOUS}T17:10:00+05:30`, 'available', 'Floor sample on 13 Nov.'),
        movement('MOV-5106-4', `${PREVIOUS}T18:00:00+05:30`, 'sold', 'Marked sold on 13 Nov. No money moved.'),
        movement('MOV-5106-5', `${DAY}T07:10:00+05:30`, 'dispatched', 'Left through the demonstration exit.'),
      ],
    }),
    lot({
      n: 5107,
      sellerId: 'DEMO-REG-FS-1002',
      sellerLabel: 'KR-08',
      aadathiyaId: 'DEMO-REG-AD-3004',
      aadathiyaLabel: 'AD-15',
      commodityId: 'DEMO-COM-0001',
      commodityName: 'Naga king chilli',
      gradeId: 'DEMO-GRD-0003',
      gradeName: 'Mixed',
      quantity: 2,
      gross: 2.3,
      tare: 0.3,
      bay: 'WB-01',
      crateCount: 2,
      crateCode: 'CR-02',
      vehicleNo: 'NL07-DEMO-510',
      status: 'cancelled',
      arrivedAt: `${DAY}T09:00:00+05:30`,
      note: 'Mixed band withdrawn before inspection.',
      extra: [
        movement('MOV-5107-2', `${DAY}T09:12:00+05:30`, 'cancelled', 'Cancelled in this browser. The vehicle did not enter the floor.'),
      ],
    }),
  ]
  return { lots, seq: 5201 }
}
