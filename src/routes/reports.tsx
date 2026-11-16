import { loadPage } from '@/routes/load'
import type { RouteObject } from 'react-router-dom'
const ReportsPage = loadPage(() => import('@/pages/reports/ReportsPage'), 'ReportsPage')

export const reportRoutes: RouteObject[] = [
  { index: true, element: <ReportsPage />, handle: { crumb: 'Reports' } },
]
