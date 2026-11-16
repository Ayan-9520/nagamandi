import { createBrowserRouter } from 'react-router-dom'
import { AppShell } from '@/layouts/AppShell'
import { navItems } from '@/mocks/navigation'
import { loadPage } from '@/routes/load'

const DashboardPage = loadPage(() => import('@/pages/DashboardPage'), 'DashboardPage')
import { IntroductionPage } from '@/pages/IntroductionPage'
import { ForgotPasswordPage } from '@/pages/ForgotPasswordPage'
import { LaterPhasePage } from '@/pages/LaterPhasePage'
import { LoginPage } from '@/pages/LoginPage'
import { NotFoundPage } from '@/pages/NotFoundPage'
import { ProfilePage } from '@/pages/ProfilePage'
import { RoleSelectionPage } from '@/pages/RoleSelectionPage'
import { SettingsPage } from '@/pages/SettingsPage'
import { UnauthorizedPage } from '@/pages/UnauthorizedPage'
import { AccessGate, GuestGate, SessionGate } from '@/routes/guards'
import { stakeholderRoutes } from '@/routes/stakeholders'
import { licenceRoutes } from '@/routes/licences'
import { arrivalRoutes } from '@/routes/arrivals'
import { tradingRoutes } from '@/routes/trading'
import { financeRoutes } from '@/routes/finance'
import { warehouseRoutes } from '@/routes/warehouse'
import { coldRoutes } from '@/routes/cold-storage'
import { flpRoutes } from '@/routes/flp'
import { parkingRoutes } from '@/routes/parking'
import { facilityRoutes } from '@/routes/facilities'
import { complianceRoutes } from '@/routes/compliance'
import { reportRoutes } from '@/routes/reports'
import { fieldRoutes } from '@/routes/field'

const laterRoutes = navItems
  .filter((item) => !item.available)
  .map((item) => ({
    path: item.to.replace(/^\//, ''),
    element: <LaterPhasePage />,
    handle: { crumb: item.title },
  }))

export const router = createBrowserRouter([
  { path: '/', element: <IntroductionPage /> },
  {
    element: <GuestGate />,
    children: [
      { path: '/login', element: <LoginPage /> },
      { path: '/forgot-password', element: <ForgotPasswordPage /> },
    ],
  },
  {
    element: <SessionGate />,
    children: [
      {
        element: <AppShell />,
        children: [
          {
            element: <AccessGate />,
            children: [
              { path: 'desk', element: <DashboardPage />, handle: { crumb: 'Dashboard' } },
              { path: 'field', children: fieldRoutes },
              { path: 'profile', element: <ProfilePage />, handle: { crumb: 'Profile' } },
              { path: 'roles', element: <RoleSelectionPage />, handle: { crumb: 'Role selection' } },
              { path: 'unauthorized', element: <UnauthorizedPage />, handle: { crumb: 'Unauthorized' } },
              { path: 'settings', element: <SettingsPage />, handle: { crumb: 'Settings' } },
              { path: 'stakeholders', children: stakeholderRoutes },
              { path: 'licences', children: licenceRoutes },
              { path: 'arrivals', children: arrivalRoutes },
              { path: 'trading', children: tradingRoutes },
              { path: 'finance', children: financeRoutes },
              { path: 'warehouses', children: warehouseRoutes },
              { path: 'cold-storage', children: coldRoutes },
              { path: 'post-harvest', children: flpRoutes },
              { path: 'parking', children: parkingRoutes },
              { path: 'facilities', children: facilityRoutes },
              { path: 'compliance', children: complianceRoutes },
              { path: 'reports', children: reportRoutes },
              ...laterRoutes,
              { path: '*', element: <NotFoundPage />, handle: { crumb: 'Not found' } },
            ],
          },
        ],
      },
    ],
  },
])
