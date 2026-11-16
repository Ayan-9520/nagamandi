import { loadPage } from '@/routes/load'
import type { RouteObject } from 'react-router-dom'
const ArrivalDashboardPage = loadPage(() => import('@/pages/arrivals/ArrivalDashboardPage'), 'ArrivalDashboardPage')
const ArrivalDetailPage = loadPage(() => import('@/pages/arrivals/ArrivalDetailPage'), 'ArrivalDetailPage')
const ArrivalFormPage = loadPage(() => import('@/pages/arrivals/ArrivalFormPage'), 'ArrivalFormPage')
const ArrivalListPage = loadPage(() => import('@/pages/arrivals/ArrivalListPage'), 'ArrivalListPage')
const ArrivalPrintPage = loadPage(() => import('@/pages/arrivals/ArrivalPrintPage'), 'ArrivalPrintPage')

export const arrivalRoutes: RouteObject[] = [
  { index: true, element: <ArrivalDashboardPage />, handle: { crumb: 'Arrivals' } },
  { path: 'new', element: <ArrivalFormPage />, handle: { crumb: 'New arrival' } },
  { path: 'register', element: <ArrivalListPage mode="register" />, handle: { crumb: 'Arrival register' } },
  { path: 'crates', element: <ArrivalListPage mode="crates" />, handle: { crumb: 'Crate inventory' } },
  { path: ':id/print', element: <ArrivalPrintPage />, handle: { crumb: 'Arrival slip' } },
  { path: ':id', element: <ArrivalDetailPage />, handle: { crumb: 'Lot' } },
]
