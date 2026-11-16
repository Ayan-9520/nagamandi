import { loadPage } from '@/routes/load'
import type { RouteObject } from 'react-router-dom'
const ContractApplyPage = loadPage(() => import('@/pages/parking/ContractPages'), 'ContractApplyPage')
const ContractDetailPage = loadPage(() => import('@/pages/parking/ContractPages'), 'ContractDetailPage')
const ContractListPage = loadPage(() => import('@/pages/parking/ContractPages'), 'ContractListPage')
const AlertsPage = loadPage(() => import('@/pages/parking/OfficePages'), 'AlertsPage')
const ChargePage = loadPage(() => import('@/pages/parking/OfficePages'), 'ChargePage')
const LeaseApplyPage = loadPage(() => import('@/pages/parking/OfficePages'), 'LeaseApplyPage')
const LeaseDetailPage = loadPage(() => import('@/pages/parking/OfficePages'), 'LeaseDetailPage')
const LeaseListPage = loadPage(() => import('@/pages/parking/OfficePages'), 'LeaseListPage')
const LeasePrintPage = loadPage(() => import('@/pages/parking/OfficePages'), 'LeasePrintPage')
const ParkingDashboardPage = loadPage(() => import('@/pages/parking/ParkingDashboardPage'), 'ParkingDashboardPage')
const EntryPage = loadPage(() => import('@/pages/parking/VehiclePages'), 'EntryPage')
const ExitPage = loadPage(() => import('@/pages/parking/VehiclePages'), 'ExitPage')
const PassPage = loadPage(() => import('@/pages/parking/VehiclePages'), 'PassPage')
const VehiclePage = loadPage(() => import('@/pages/parking/VehiclePages'), 'VehiclePage')
const AllocationPage = loadPage(() => import('@/pages/parking/YardPages'), 'AllocationPage')
const FeePage = loadPage(() => import('@/pages/parking/YardPages'), 'FeePage')
const MovementPage = loadPage(() => import('@/pages/parking/YardPages'), 'MovementPage')
const OccupancyPage = loadPage(() => import('@/pages/parking/YardPages'), 'OccupancyPage')

export const parkingRoutes: RouteObject[] = [
  { index: true, element: <ParkingDashboardPage />, handle: { crumb: 'Parking' } },
  { path: 'apply', element: <ContractApplyPage />, handle: { crumb: 'Parking application' } },
  { path: 'contracts/:id', element: <ContractDetailPage />, handle: { crumb: 'Contract' } },
  { path: 'contracts', element: <ContractListPage />, handle: { crumb: 'Contracts' } },
  { path: 'vehicles', element: <VehiclePage />, handle: { crumb: 'Vehicles' } },
  { path: 'entry', element: <EntryPage />, handle: { crumb: 'Entry' } },
  { path: 'exit', element: <ExitPage />, handle: { crumb: 'Exit' } },
  { path: 'allocation', element: <AllocationPage />, handle: { crumb: 'Allocation' } },
  { path: 'occupancy', element: <OccupancyPage />, handle: { crumb: 'Occupancy' } },
  { path: 'fees', element: <FeePage />, handle: { crumb: 'Fees' } },
  { path: 'movements', element: <MovementPage />, handle: { crumb: 'Movements' } },
  { path: 'passes/:id', element: <PassPage />, handle: { crumb: 'Entry pass' } },
  { path: 'offices/apply', element: <LeaseApplyPage />, handle: { crumb: 'Office application' } },
  { path: 'offices/:id/print', element: <LeasePrintPage />, handle: { crumb: 'Lease preview' } },
  { path: 'offices/:id', element: <LeaseDetailPage />, handle: { crumb: 'Lease' } },
  { path: 'offices', element: <LeaseListPage />, handle: { crumb: 'Offices' } },
  { path: 'charges', element: <ChargePage />, handle: { crumb: 'Deposits and rent' } },
  { path: 'alerts', element: <AlertsPage />, handle: { crumb: 'Expiry alerts' } },
]
