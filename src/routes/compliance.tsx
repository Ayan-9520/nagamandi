import { loadPage } from '@/routes/load'
import { useParams } from 'react-router-dom'
import type { RouteObject } from 'react-router-dom'
const ApprovalsPage = loadPage(() => import('@/pages/compliance/CommandPages'), 'ApprovalsPage')
const ColdStatusPage = loadPage(() => import('@/pages/compliance/CommandPages'), 'ColdStatusPage')
const CommandDashboardPage = loadPage(() => import('@/pages/compliance/CommandPages'), 'CommandDashboardPage')
const ExpiryPage = loadPage(() => import('@/pages/compliance/CommandPages'), 'ExpiryPage')
const FinanceStatusPage = loadPage(() => import('@/pages/compliance/CommandPages'), 'FinanceStatusPage')
const LicenceStatusPage = loadPage(() => import('@/pages/compliance/CommandPages'), 'LicenceStatusPage')
const MatrixPage = loadPage(() => import('@/pages/compliance/CommandPages'), 'MatrixPage')
const ParkingStatusPage = loadPage(() => import('@/pages/compliance/CommandPages'), 'ParkingStatusPage')
const SopDetailPage = loadPage(() => import('@/pages/compliance/CommandPages'), 'SopDetailPage')
const TradingSummaryPage = loadPage(() => import('@/pages/compliance/CommandPages'), 'TradingSummaryPage')
const WarehouseStatusPage = loadPage(() => import('@/pages/compliance/CommandPages'), 'WarehouseStatusPage')
const ActionPage = loadPage(() => import('@/pages/compliance/TrackerPages'), 'ActionPage')
const AuditPage = loadPage(() => import('@/pages/compliance/TrackerPages'), 'AuditPage')
const CalendarPage = loadPage(() => import('@/pages/compliance/TrackerPages'), 'CalendarPage')
const IncidentPage = loadPage(() => import('@/pages/compliance/TrackerPages'), 'IncidentPage')

function SopRoute() {
  const { number = '' } = useParams()
  return <SopDetailPage number={number} />
}

export const complianceRoutes: RouteObject[] = [
  { index: true, element: <CommandDashboardPage />, handle: { crumb: 'Compliance' } },
  { path: 'matrix/:number', element: <SopRoute />, handle: { crumb: 'SOP' } },
  { path: 'matrix', element: <MatrixPage />, handle: { crumb: 'SOP matrix' } },
  { path: 'licences', element: <LicenceStatusPage />, handle: { crumb: 'Licence status' } },
  { path: 'trading', element: <TradingSummaryPage />, handle: { crumb: 'Trading summary' } },
  { path: 'finance', element: <FinanceStatusPage />, handle: { crumb: 'Reconciliation' } },
  { path: 'warehouses', element: <WarehouseStatusPage />, handle: { crumb: 'Warehouse occupancy' } },
  { path: 'cold-storage', element: <ColdStatusPage />, handle: { crumb: 'Cold storage status' } },
  { path: 'parking', element: <ParkingStatusPage />, handle: { crumb: 'Parking occupancy' } },
  { path: 'expiry', element: <ExpiryPage />, handle: { crumb: 'Expiry' } },
  { path: 'approvals', element: <ApprovalsPage />, handle: { crumb: 'Pending approvals' } },
  { path: 'incidents', element: <IncidentPage />, handle: { crumb: 'Incidents' } },
  { path: 'calendar', element: <CalendarPage />, handle: { crumb: 'Inspection calendar' } },
  { path: 'actions', element: <ActionPage />, handle: { crumb: 'Corrective actions' } },
  { path: 'audit', element: <AuditPage />, handle: { crumb: 'Audit trail' } },
]
