import { loadPage } from '@/routes/load'
import type { RouteObject } from 'react-router-dom'
const FacilityDashboardPage = loadPage(() => import('@/pages/facilities/FacilityDashboardPage'), 'FacilityDashboardPage')
const ApplyPage = loadPage(() => import('@/pages/facilities/LeasePages'), 'ApplyPage')
const KindPage = loadPage(() => import('@/pages/facilities/LeasePages'), 'KindPage')
const LeaseDetailPage = loadPage(() => import('@/pages/facilities/LeasePages'), 'LeaseDetailPage')
const LeasePrintPage = loadPage(() => import('@/pages/facilities/LeasePages'), 'LeasePrintPage')
const AlertsPage = loadPage(() => import('@/pages/facilities/OpsPages'), 'AlertsPage')
const ChargePage = loadPage(() => import('@/pages/facilities/OpsPages'), 'ChargePage')
const ChecklistPage = loadPage(() => import('@/pages/facilities/OpsPages'), 'ChecklistPage')
const InsurancePage = loadPage(() => import('@/pages/facilities/OpsPages'), 'InsurancePage')
const MaintenancePage = loadPage(() => import('@/pages/facilities/OpsPages'), 'MaintenancePage')
const RegisterPage = loadPage(() => import('@/pages/facilities/OpsPages'), 'RegisterPage')
const StayPage = loadPage(() => import('@/pages/facilities/OpsPages'), 'StayPage')

export const facilityRoutes: RouteObject[] = [
  { index: true, element: <FacilityDashboardPage />, handle: { crumb: 'Facilities' } },
  { path: 'kisan', element: <KindPage kind="kisan-bhavan" />, handle: { crumb: 'Kisan Bhavan' } },
  { path: 'hotel', element: <KindPage kind="hotel" />, handle: { crumb: 'Hotel' } },
  { path: 'restaurant', element: <KindPage kind="restaurant" />, handle: { crumb: 'Restaurant' } },
  { path: 'apply/:kind', element: <ApplyPage />, handle: { crumb: 'Application' } },
  { path: 'leases/:id/print', element: <LeasePrintPage />, handle: { crumb: 'Contract document' } },
  { path: 'leases/:id', element: <LeaseDetailPage />, handle: { crumb: 'Lease' } },
  { path: 'deposits', element: <ChargePage mode="deposit" />, handle: { crumb: 'Deposits' } },
  { path: 'rent', element: <ChargePage mode="rent" />, handle: { crumb: 'Rent' } },
  { path: 'register', element: <RegisterPage />, handle: { crumb: 'Register' } },
  { path: 'stays', element: <StayPage />, handle: { crumb: 'Stays' } },
  { path: 'cleaning', element: <ChecklistPage kind="cleaning" />, handle: { crumb: 'Cleaning' } },
  { path: 'fire', element: <ChecklistPage kind="fire" />, handle: { crumb: 'Fire safety' } },
  { path: 'hygiene', element: <ChecklistPage kind="hygiene" />, handle: { crumb: 'Food hygiene' } },
  { path: 'operations', element: <ChecklistPage kind="operations" />, handle: { crumb: 'Operations' } },
  { path: 'maintenance', element: <MaintenancePage />, handle: { crumb: 'Maintenance' } },
  { path: 'insurance', element: <InsurancePage />, handle: { crumb: 'Insurance' } },
  { path: 'alerts', element: <AlertsPage />, handle: { crumb: 'Expiry alerts' } },
]
