import {
  arrivalSeries,
  AS_OF,
  gateLots,
  licenceCounts,
  tradeSeries,
  yardInfrastructure,
} from '@/mocks/catalog'
import type {
  ArrivalBar,
  DashboardFilter,
  DashboardSnapshot,
  DataScenario,
  LicenceSlice,
  TradeBar,
  YardId,
} from '@/types/domain'
import { LICENCE_STATUSES } from '@/types/domain'
import { delay } from '@/utils/delay'
import { formatDay } from '@/utils/format'

const DAY_MS = 24 * 60 * 60 * 1000

function yardMatches(yardId: YardId, filter: string) {
  return filter === 'all' || filter === yardId
}

function commodityMatches(commodity: string, filter: string) {
  return filter === 'all' || filter === commodity
}

function inArrivalWindow(isoDate: string, days: number) {
  const end = Date.parse(`${AS_OF}T00:00:00Z`)
  const start = end - (days - 1) * DAY_MS
  const current = Date.parse(`${isoDate.slice(0, 10)}T00:00:00Z`)
  return current >= start && current <= end
}

function emptySnapshot(): DashboardSnapshot {
  return {
    asOf: AS_OF,
    arrivalsMt: 0,
    lotCount: 0,
    tradeLakh: 0,
    activeLicences: 0,
    occupancyPct: 0,
    complianceOpen: 0,
    coldOnline: 0,
    coldTotal: 0,
    arrivalSeries: [],
    tradeSeries: [],
    licenceSeries: LICENCE_STATUSES.map((status) => ({ status, count: 0 })),
    lots: [],
  }
}

function buildSnapshot(filters: DashboardFilter): DashboardSnapshot {
  const days = Number(filters.days)
  const arrivals = arrivalSeries.filter(
    (point) =>
      yardMatches(point.yardId, filters.yardId) &&
      commodityMatches(point.commodity, filters.commodity) &&
      inArrivalWindow(point.date, days),
  )
  const byDate = new Map<string, number>()
  for (const point of arrivals) {
    byDate.set(point.date, (byDate.get(point.date) ?? 0) + point.quantityMt)
  }
  const arrivalBars: ArrivalBar[] = [...byDate.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([date, quantityMt]) => ({
      date,
      label: formatDay(date),
      quantityMt: Math.round(quantityMt * 10) / 10,
    }))

  const trades = tradeSeries.filter(
    (point) =>
      yardMatches(point.yardId, filters.yardId) &&
      commodityMatches(point.commodity, filters.commodity),
  )
  const byWeek = new Map<string, { label: string; volumeLakh: number }>()
  for (const point of trades) {
    const current = byWeek.get(point.weekEnding) ?? { label: point.weekLabel, volumeLakh: 0 }
    current.volumeLakh += point.volumeLakh
    byWeek.set(point.weekEnding, current)
  }
  const tradeBars: TradeBar[] = [...byWeek.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([, value]) => ({
      week: value.label,
      volumeLakh: Math.round(value.volumeLakh * 10) / 10,
    }))

  const licenceSeries: LicenceSlice[] = LICENCE_STATUSES.map((status) => ({
    status,
    count: licenceCounts
      .filter((row) => row.status === status && yardMatches(row.yardId, filters.yardId))
      .reduce((sum, row) => sum + row.count, 0),
  }))

  const infrastructure = yardInfrastructure.filter((row) => yardMatches(row.yardId, filters.yardId))
  const occupancyPct = infrastructure.length
    ? infrastructure.reduce((sum, row) => sum + row.occupancyPct, 0) / infrastructure.length
    : 0

  const lots = gateLots
    .filter(
      (lot) =>
        yardMatches(lot.yardId, filters.yardId) &&
        commodityMatches(lot.commodity, filters.commodity) &&
        inArrivalWindow(lot.arrivedAt, days),
    )
    .sort((left, right) => right.arrivedAt.localeCompare(left.arrivedAt))

  return {
    asOf: AS_OF,
    arrivalsMt: Math.round(arrivalBars.reduce((sum, bar) => sum + bar.quantityMt, 0) * 10) / 10,
    lotCount: lots.length,
    tradeLakh: Math.round(tradeBars.reduce((sum, bar) => sum + bar.volumeLakh, 0) * 10) / 10,
    activeLicences: licenceSeries.find((slice) => slice.status === 'Active')?.count ?? 0,
    occupancyPct,
    complianceOpen: infrastructure.reduce((sum, row) => sum + row.complianceOpen, 0),
    coldOnline: infrastructure.reduce((sum, row) => sum + row.coldOnline, 0),
    coldTotal: infrastructure.reduce((sum, row) => sum + row.coldTotal, 0),
    arrivalSeries: arrivalBars,
    tradeSeries: tradeBars,
    licenceSeries,
    lots,
  }
}

export async function loadDashboard(filters: DashboardFilter, scenario: DataScenario) {
  await delay(380)
  if (scenario === 'error') {
    throw new Error('The demonstration feed is set to the error sample.')
  }
  if (scenario === 'empty') return emptySnapshot()
  return buildSnapshot(filters)
}
