import { loadPage } from '@/routes/load'
import type { RouteObject } from 'react-router-dom'
const LicenceApplyPage = loadPage(() => import('@/pages/licences/LicenceApplyPage'), 'LicenceApplyPage')
const LicenceDashboardPage = loadPage(() => import('@/pages/licences/LicenceDashboardPage'), 'LicenceDashboardPage')
const LicenceDetailPage = loadPage(() => import('@/pages/licences/LicenceDetailPage'), 'LicenceDetailPage')
const LicenceListPage = loadPage(() => import('@/pages/licences/LicenceListPage'), 'LicenceListPage')
const LicencePrintPage = loadPage(() => import('@/pages/licences/LicencePrintPage'), 'LicencePrintPage')

export const licenceRoutes: RouteObject[] = [
  { index: true, element: <LicenceDashboardPage />, handle: { crumb: 'Licences' } },
  { path: 'apply', element: <LicenceApplyPage mode="new" />, handle: { crumb: 'New application' } },
  { path: 'applications', element: <LicenceListPage mode="applications" />, handle: { crumb: 'Applications' } },
  { path: 'verify', element: <LicenceListPage mode="verify" />, handle: { crumb: 'Document verification' } },
  { path: 'approvals', element: <LicenceListPage mode="approvals" />, handle: { crumb: 'Approval queue' } },
  { path: 'fees', element: <LicenceListPage mode="fees" />, handle: { crumb: 'Fee and deposit' } },
  { path: 'issue', element: <LicenceListPage mode="issue" />, handle: { crumb: 'Licence issuance' } },
  { path: 'register', element: <LicenceListPage mode="register" />, handle: { crumb: 'Licence register' } },
  { path: 'alerts', element: <LicenceListPage mode="alerts" />, handle: { crumb: 'Expiry alerts' } },
  { path: 'renew/:id', element: <LicenceApplyPage mode="renewal" />, handle: { crumb: 'Renew licence' } },
  { path: 'modify/:id', element: <LicenceApplyPage mode="modification" />, handle: { crumb: 'Modify licence' } },
  { path: ':id/print', element: <LicencePrintPage />, handle: { crumb: 'Licence preview' } },
  { path: ':id', element: <LicenceDetailPage />, handle: { crumb: 'Licence case' } },
]
