import { loadPage } from '@/routes/load'
import type { RouteObject } from 'react-router-dom'
const BatchDetailPage = loadPage(() => import('@/pages/flp/BatchPages'), 'BatchDetailPage')
const BatchListPage = loadPage(() => import('@/pages/flp/BatchPages'), 'BatchListPage')
const IncidentPage = loadPage(() => import('@/pages/flp/CarePages'), 'IncidentPage')
const InsurancePage = loadPage(() => import('@/pages/flp/CarePages'), 'InsurancePage')
const MaintenancePage = loadPage(() => import('@/pages/flp/CarePages'), 'MaintenancePage')
const ChecklistPage = loadPage(() => import('@/pages/flp/ChecklistPage'), 'ChecklistPage')
const FlpDashboardPage = loadPage(() => import('@/pages/flp/FlpDashboardPage'), 'FlpDashboardPage')
const IntakePage = loadPage(() => import('@/pages/flp/IntakePage'), 'IntakePage')
const MovementPage = loadPage(() => import('@/pages/flp/MovementPage'), 'MovementPage')
const OutputPage = loadPage(() => import('@/pages/flp/ProcessPages'), 'OutputPage')
const PackagingPage = loadPage(() => import('@/pages/flp/ProcessPages'), 'PackagingPage')
const SortingPage = loadPage(() => import('@/pages/flp/ProcessPages'), 'SortingPage')
const ReportPage = loadPage(() => import('@/pages/flp/ReportPage'), 'ReportPage')
const DirectoryPage = loadPage(() => import('@/pages/flp/UnitPages'), 'DirectoryPage')

export const flpRoutes: RouteObject[] = [
  { index: true, element: <FlpDashboardPage />, handle: { crumb: 'Post-Harvest' } },
  { path: 'directory', element: <DirectoryPage />, handle: { crumb: 'Directory' } },
  { path: 'intake', element: <IntakePage />, handle: { crumb: 'Intake' } },
  { path: 'batches/:id', element: <BatchDetailPage />, handle: { crumb: 'Batch' } },
  { path: 'batches', element: <BatchListPage />, handle: { crumb: 'Batches' } },
  { path: 'sorting', element: <SortingPage />, handle: { crumb: 'Sorting' } },
  { path: 'packaging', element: <PackagingPage />, handle: { crumb: 'Packaging' } },
  { path: 'output', element: <OutputPage />, handle: { crumb: 'Output' } },
  { path: 'movement', element: <MovementPage />, handle: { crumb: 'Material movement' } },
  { path: 'cleaning', element: <ChecklistPage kind="cleaning" />, handle: { crumb: 'Cleaning' } },
  { path: 'maintenance', element: <MaintenancePage />, handle: { crumb: 'Maintenance' } },
  { path: 'safety', element: <ChecklistPage kind="safety" />, handle: { crumb: 'Safety' } },
  { path: 'insurance', element: <InsurancePage />, handle: { crumb: 'Insurance' } },
  { path: 'incidents', element: <IncidentPage />, handle: { crumb: 'Incidents' } },
  { path: 'reports', element: <ReportPage />, handle: { crumb: 'Daily reports' } },
]
