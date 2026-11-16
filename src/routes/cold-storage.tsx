import { loadPage } from '@/routes/load'
import type { RouteObject } from 'react-router-dom'
const IncidentPage = loadPage(() => import('@/pages/cold-storage/CarePages'), 'IncidentPage')
const InsurancePage = loadPage(() => import('@/pages/cold-storage/CarePages'), 'InsurancePage')
const MaintenancePage = loadPage(() => import('@/pages/cold-storage/CarePages'), 'MaintenancePage')
const AlertsPage = loadPage(() => import('@/pages/cold-storage/ChamberPages'), 'AlertsPage')
const AllocationPage = loadPage(() => import('@/pages/cold-storage/ChamberPages'), 'AllocationPage')
const DirectoryPage = loadPage(() => import('@/pages/cold-storage/ChamberPages'), 'DirectoryPage')
const ChecklistPage = loadPage(() => import('@/pages/cold-storage/ChecklistPage'), 'ChecklistPage')
const ColdDashboardPage = loadPage(() => import('@/pages/cold-storage/ColdDashboardPage'), 'ColdDashboardPage')
const ContractApplyPage = loadPage(() => import('@/pages/cold-storage/ContractApplyPage'), 'ContractApplyPage')
const ContractDetailPage = loadPage(() => import('@/pages/cold-storage/ContractPages'), 'ContractDetailPage')
const ContractListPage = loadPage(() => import('@/pages/cold-storage/ContractPages'), 'ContractListPage')
const ContractPrintPage = loadPage(() => import('@/pages/cold-storage/ContractPrintPage'), 'ContractPrintPage')
const StockPage = loadPage(() => import('@/pages/cold-storage/StockPage'), 'StockPage')
const TemperatureDashboardPage = loadPage(() => import('@/pages/cold-storage/TemperaturePages'), 'TemperatureDashboardPage')
const TemperatureEntryPage = loadPage(() => import('@/pages/cold-storage/TemperaturePages'), 'TemperatureEntryPage')
const TemperatureHistoryPage = loadPage(() => import('@/pages/cold-storage/TemperaturePages'), 'TemperatureHistoryPage')

export const coldRoutes: RouteObject[] = [
  { index: true, element: <ColdDashboardPage />, handle: { crumb: 'Cold Storage' } },
  { path: 'directory', element: <DirectoryPage />, handle: { crumb: 'Directory' } },
  { path: 'apply', element: <ContractApplyPage />, handle: { crumb: 'Application' } },
  { path: 'contracts/:id/print', element: <ContractPrintPage />, handle: { crumb: 'Contract preview' } },
  { path: 'contracts/:id', element: <ContractDetailPage />, handle: { crumb: 'Contract' } },
  { path: 'contracts', element: <ContractListPage />, handle: { crumb: 'Contracts' } },
  { path: 'allocation', element: <AllocationPage />, handle: { crumb: 'Allocation' } },
  { path: 'inward', element: <StockPage kind="inward" />, handle: { crumb: 'Stock inward' } },
  { path: 'outward', element: <StockPage kind="outward" />, handle: { crumb: 'Stock outward' } },
  { path: 'temperature/entry', element: <TemperatureEntryPage />, handle: { crumb: 'Manual entry' } },
  { path: 'temperature/history', element: <TemperatureHistoryPage />, handle: { crumb: 'Temperature history' } },
  { path: 'temperature', element: <TemperatureDashboardPage />, handle: { crumb: 'Temperature' } },
  { path: 'gas', element: <ChecklistPage kind="gas" />, handle: { crumb: 'Gas safety' } },
  { path: 'fire', element: <ChecklistPage kind="fire" />, handle: { crumb: 'Fire safety' } },
  { path: 'hygiene', element: <ChecklistPage kind="hygiene" />, handle: { crumb: 'Hygiene' } },
  { path: 'security', element: <ChecklistPage kind="security" />, handle: { crumb: 'Security' } },
  { path: 'insurance', element: <InsurancePage />, handle: { crumb: 'Insurance' } },
  { path: 'maintenance', element: <MaintenancePage />, handle: { crumb: 'Maintenance' } },
  { path: 'incidents', element: <IncidentPage />, handle: { crumb: 'Incidents' } },
  { path: 'alerts', element: <AlertsPage />, handle: { crumb: 'Compliance alerts' } },
]
