import type { DemoDocument } from '@/types/registry'

export const ARRIVAL_STATUSES = [
  'arrived',
  'under-inspection',
  'available',
  'reserved',
  'sold',
  'dispatched',
  'cancelled',
] as const
export type ArrivalStatus = (typeof ARRIVAL_STATUSES)[number]

export const WEIGH_BAYS = ['WB-01', 'WB-02'] as const
export type WeighBay = (typeof WEIGH_BAYS)[number]

export interface LotMovement {
  id: string
  at: string
  status: ArrivalStatus
  place: string
  note: string
}

export interface ArrivalLot {
  id: string
  arrivalNo: string
  lotNo: string
  mandiId: string
  sellerId: string
  sellerLabel: string
  aadathiyaId: string
  aadathiyaLabel: string
  commodityId: string
  commodityName: string
  gradeId: string
  gradeName: string
  unitId: string
  unitName: string
  unitSymbol: string
  quantity: number
  gross: number
  tare: number
  net: number
  bay: WeighBay
  crateCount: number
  crateCode: string
  vehicleNo: string
  note: string
  photos: DemoDocument[]
  status: ArrivalStatus
  qrPayload: string
  movements: LotMovement[]
  arrivedAt: string
  updatedAt: string
}

export interface ArrivalInput {
  sellerId: string
  aadathiyaId: string
  commodityId: string
  gradeId: string
  unitId: string
  quantity: number
  gross: number
  tare: number
  bay: WeighBay
  crateCount: number
  crateCode: string
  vehicleNo: string
  note: string
  photos: DemoDocument[]
}

export interface ArrivalData {
  lots: ArrivalLot[]
  seq: number
}

export type SaveResult = { ok: true; id: string } | { ok: false; message: string }
