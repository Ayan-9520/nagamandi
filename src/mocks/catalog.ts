import type {
  ArrivalPoint,
  GateLot,
  LicenceCount,
  TradePoint,
  Yard,
  YardId,
  YardInfrastructure,
} from '@/types/domain'
import { COMMODITIES } from '@/types/domain'

/** Demonstration calendar. Figures do not move with the real clock. */
export const AS_OF = '2026-11-14'

export const YARDS: readonly Yard[] = [
  { id: 'dimapur', name: 'Dimapur Central' },
  { id: 'kohima', name: 'Kohima Ridge' },
  { id: 'mokokchung', name: 'Mokokchung' },
  { id: 'wokha', name: 'Wokha' },
  { id: 'tuensang', name: 'Tuensang' },
]

const YARD_ARRIVAL_BASE = [16, 8, 6.2, 5, 3.4]
const COMMODITY_ARRIVAL_SHARE = [0.24, 0.18, 0.14, 0.12, 0.1, 0.1, 0.07, 0.05]
const YARD_TRADE_BASE = [96, 48, 36, 28, 18]

const WEEK_ENDINGS: { id: string; label: string }[] = [
  { id: '2026-09-27', label: '27 Sep' },
  { id: '2026-10-04', label: '04 Oct' },
  { id: '2026-10-11', label: '11 Oct' },
  { id: '2026-10-18', label: '18 Oct' },
  { id: '2026-10-25', label: '25 Oct' },
  { id: '2026-11-01', label: '01 Nov' },
  { id: '2026-11-08', label: '08 Nov' },
  { id: '2026-11-14', label: '14 Nov' },
]

function unit(seed: number) {
  const value = Math.sin(seed * 12.9898) * 43758.5453
  return value - Math.floor(value)
}

function shiftDate(isoDate: string, days: number) {
  const date = new Date(`${isoDate}T00:00:00Z`)
  date.setUTCDate(date.getUTCDate() + days)
  return date.toISOString().slice(0, 10)
}

function buildArrivalSeries(): ArrivalPoint[] {
  const points: ArrivalPoint[] = []
  for (let day = 0; day < 30; day += 1) {
    const date = shiftDate('2026-10-16', day)
    const weekday = new Date(`${date}T00:00:00Z`).getUTCDay()
    const weekend = weekday === 0 ? 0.7 : 1
    YARDS.forEach((yard, yardIndex) => {
      COMMODITIES.forEach((commodity, commodityIndex) => {
        const wave = 0.82 + unit(day * 17 + yardIndex * 5 + commodityIndex) * 0.36
        const quantityMt =
          Math.round(
            (YARD_ARRIVAL_BASE[yardIndex] ?? 0) *
              (COMMODITY_ARRIVAL_SHARE[commodityIndex] ?? 0) *
              wave *
              weekend *
              10,
          ) / 10
        points.push({
          date,
          yardId: yard.id,
          commodity,
          quantityMt,
        })
      })
    })
  }
  return points
}

function buildTradeSeries(): TradePoint[] {
  const points: TradePoint[] = []
  WEEK_ENDINGS.forEach((week, weekIndex) => {
    YARDS.forEach((yard, yardIndex) => {
      COMMODITIES.forEach((commodity, commodityIndex) => {
        const wave = 0.88 + unit(weekIndex * 13 + yardIndex * 7 + commodityIndex) * 0.24
        const volumeLakh =
          Math.round(
            (YARD_TRADE_BASE[yardIndex] ?? 0) *
              (COMMODITY_ARRIVAL_SHARE[commodityIndex] ?? 0) *
              wave *
              10,
          ) / 10
        points.push({
          weekEnding: week.id,
          weekLabel: week.label,
          yardId: yard.id,
          commodity,
          volumeLakh,
        })
      })
    })
  })
  return points
}

export const arrivalSeries: ArrivalPoint[] = buildArrivalSeries()
export const tradeSeries: TradePoint[] = buildTradeSeries()

export const licenceCounts: LicenceCount[] = [
  { yardId: 'dimapur', status: 'Active', count: 420 },
  { yardId: 'dimapur', status: 'Expiring', count: 36 },
  { yardId: 'dimapur', status: 'Suspended', count: 8 },
  { yardId: 'dimapur', status: 'Pending', count: 14 },
  { yardId: 'kohima', status: 'Active', count: 210 },
  { yardId: 'kohima', status: 'Expiring', count: 22 },
  { yardId: 'kohima', status: 'Suspended', count: 4 },
  { yardId: 'kohima', status: 'Pending', count: 9 },
  { yardId: 'mokokchung', status: 'Active', count: 160 },
  { yardId: 'mokokchung', status: 'Expiring', count: 14 },
  { yardId: 'mokokchung', status: 'Suspended', count: 3 },
  { yardId: 'mokokchung', status: 'Pending', count: 7 },
  { yardId: 'wokha', status: 'Active', count: 140 },
  { yardId: 'wokha', status: 'Expiring', count: 11 },
  { yardId: 'wokha', status: 'Suspended', count: 2 },
  { yardId: 'wokha', status: 'Pending', count: 5 },
  { yardId: 'tuensang', status: 'Active', count: 110 },
  { yardId: 'tuensang', status: 'Expiring', count: 9 },
  { yardId: 'tuensang', status: 'Suspended', count: 2 },
  { yardId: 'tuensang', status: 'Pending', count: 4 },
]

export const yardInfrastructure: YardInfrastructure[] = [
  { yardId: 'dimapur', occupancyPct: 82, complianceOpen: 3, coldOnline: 6, coldTotal: 7 },
  { yardId: 'kohima', occupancyPct: 71, complianceOpen: 1, coldOnline: 3, coldTotal: 4 },
  { yardId: 'mokokchung', occupancyPct: 64, complianceOpen: 2, coldOnline: 2, coldTotal: 3 },
  { yardId: 'wokha', occupancyPct: 58, complianceOpen: 0, coldOnline: 2, coldTotal: 2 },
  { yardId: 'tuensang', occupancyPct: 49, complianceOpen: 1, coldOnline: 1, coldTotal: 2 },
]

export const gateLots: GateLot[] = [
  {
    id: 'DEMO-LOT-2414',
    arrivedAt: '2026-11-14T08:10:00+05:30',
    vehicleNo: 'NL07-DEMO-214',
    commodity: 'Naga king chilli',
    quantityMt: 4.2,
    yardId: 'dimapur',
    status: 'On floor',
    grower: 'Fictional grower DG-14',
  },
  {
    id: 'DEMO-LOT-2413',
    arrivedAt: '2026-11-14T07:35:00+05:30',
    vehicleNo: 'NL01-DEMO-088',
    commodity: 'Ginger',
    quantityMt: 6.8,
    yardId: 'dimapur',
    status: 'Weighed',
    grower: 'Fictional grower DG-08',
  },
  {
    id: 'DEMO-LOT-2412',
    arrivedAt: '2026-11-14T06:50:00+05:30',
    vehicleNo: 'NL02-DEMO-331',
    commodity: 'Pineapple',
    quantityMt: 3.1,
    yardId: 'kohima',
    status: 'Gate in',
    grower: 'Fictional grower KH-03',
  },
  {
    id: 'DEMO-LOT-2411',
    arrivedAt: '2026-11-13T16:20:00+05:30',
    vehicleNo: 'NL07-DEMO-119',
    commodity: 'Sticky rice',
    quantityMt: 5.4,
    yardId: 'mokokchung',
    status: 'Dispatched',
    grower: 'Fictional grower MK-11',
  },
  {
    id: 'DEMO-LOT-2410',
    arrivedAt: '2026-11-13T11:05:00+05:30',
    vehicleNo: 'NL03-DEMO-042',
    commodity: 'Large cardamom',
    quantityMt: 1.6,
    yardId: 'wokha',
    status: 'On floor',
    grower: 'Fictional grower WK-02',
  },
  {
    id: 'DEMO-LOT-2409',
    arrivedAt: '2026-11-12T15:40:00+05:30',
    vehicleNo: 'NL01-DEMO-276',
    commodity: 'Orange',
    quantityMt: 2.8,
    yardId: 'tuensang',
    status: 'Weighed',
    grower: 'Fictional grower TS-06',
  },
  {
    id: 'DEMO-LOT-2408',
    arrivedAt: '2026-11-12T09:15:00+05:30',
    vehicleNo: 'NL07-DEMO-503',
    commodity: 'Kiwi',
    quantityMt: 1.9,
    yardId: 'kohima',
    status: 'On floor',
    grower: 'Fictional grower KH-19',
  },
  {
    id: 'DEMO-LOT-2407',
    arrivedAt: '2026-11-10T13:25:00+05:30',
    vehicleNo: 'NL05-DEMO-017',
    commodity: 'Bamboo shoot',
    quantityMt: 0.8,
    yardId: 'dimapur',
    status: 'Dispatched',
    grower: 'Fictional grower DG-21',
  },
  {
    id: 'DEMO-LOT-2404',
    arrivedAt: '2026-11-08T10:00:00+05:30',
    vehicleNo: 'NL02-DEMO-164',
    commodity: 'Ginger',
    quantityMt: 7.5,
    yardId: 'wokha',
    status: 'Dispatched',
    grower: 'Fictional grower WK-09',
  },
  {
    id: 'DEMO-LOT-2390',
    arrivedAt: '2026-11-02T08:45:00+05:30',
    vehicleNo: 'NL01-DEMO-390',
    commodity: 'Naga king chilli',
    quantityMt: 3.6,
    yardId: 'tuensang',
    status: 'Dispatched',
    grower: 'Fictional grower TS-01',
  },
  {
    id: 'DEMO-LOT-2372',
    arrivedAt: '2026-10-22T12:10:00+05:30',
    vehicleNo: 'NL07-DEMO-612',
    commodity: 'Pineapple',
    quantityMt: 4.4,
    yardId: 'mokokchung',
    status: 'Dispatched',
    grower: 'Fictional grower MK-04',
  },
  {
    id: 'DEMO-LOT-2355',
    arrivedAt: '2026-10-12T09:30:00+05:30',
    vehicleNo: 'NL03-DEMO-228',
    commodity: 'Sticky rice',
    quantityMt: 6.1,
    yardId: 'dimapur',
    status: 'Dispatched',
    grower: 'Fictional grower DG-02',
  },
]

export function yardName(yardId: YardId) {
  return YARDS.find((yard) => yard.id === yardId)?.name ?? yardId
}

export function findLot(id: string) {
  return gateLots.find((lot) => lot.id === id) ?? null
}
