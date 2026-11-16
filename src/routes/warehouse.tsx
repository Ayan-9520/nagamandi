import { loadPage } from '@/routes/load'
import type { RouteObject } from 'react-router-dom'
const InsurancePage = loadPage(() => import('@/pages/warehouse/CarePages'), 'InsurancePage')
const MaintenancePage = loadPage(() => import('@/pages/warehouse/CarePages'), 'MaintenancePage')
const ChecklistPage = loadPage(() => import('@/pages/warehouse/ChecklistPage'), 'ChecklistPage')
const ContractApplyPage = loadPage(() => import('@/pages/warehouse/ContractApplyPage'), 'ContractApplyPage')
const ContractDetailPage = loadPage(() => import('@/pages/warehouse/ContractPages'), 'ContractDetailPage')
const ContractListPage = loadPage(() => import('@/pages/warehouse/ContractPages'), 'ContractListPage')
const ContractPrintPage = loadPage(() => import('@/pages/warehouse/ContractPrintPage'), 'ContractPrintPage')
const AlertsPage = loadPage(() => import('@/pages/warehouse/ShedPages'), 'AlertsPage')
const DirectoryPage = loadPage(() => import('@/pages/warehouse/ShedPages'), 'DirectoryPage')
const InventoryPage = loadPage(() => import('@/pages/warehouse/ShedPages'), 'InventoryPage')
const OccupancyPage = loadPage(() => import('@/pages/warehouse/ShedPages'), 'OccupancyPage')
const StockPage = loadPage(() => import('@/pages/warehouse/StockPage'), 'StockPage')
const WarehouseDashboardPage = loadPage(() => import('@/pages/warehouse/WarehouseDashboardPage'), 'WarehouseDashboardPage')

export const warehouseRoutes: RouteObject[] = [
  { index: true, element: <WarehouseDashboardPage />, handle: { crumb: 'Warehouses' } },
  { path: 'directory', element: <DirectoryPage />, handle: { crumb: 'Directory' } },
  { path: 'apply', element: <ContractApplyPage />, handle: { crumb: 'Application' } },
  { path: 'contracts/:id/print', element: <ContractPrintPage />, handle: { crumb: 'Contract preview' } },
  { path: 'contracts/:id', element: <ContractDetailPage />, handle: { crumb: 'Contract' } },
  { path: 'contracts', element: <ContractListPage />, handle: { crumb: 'Contracts' } },
  { path: 'inward', element: <StockPage kind="inward" />, handle: { crumb: 'Stock inward' } },
  { path: 'outward', element: <StockPage kind="outward" />, handle: { crumb: 'Stock outward' } },
  { path: 'inventory', element: <InventoryPage />, handle: { crumb: 'Inventory' } },
  { path: 'occupancy', element: <OccupancyPage />, handle: { crumb: 'Occupancy' } },
  { path: 'cleaning', element: <ChecklistPage kind="cleaning" />, handle: { crumb: 'Cleaning' } },
  { path: 'fire', element: <ChecklistPage kind="fire" />, handle: { crumb: 'Fire safety' } },
  { path: 'security', element: <ChecklistPage kind="security" />, handle: { crumb: 'Security' } },
  { path: 'insurance', element: <InsurancePage />, handle: { crumb: 'Insurance' } },
  { path: 'maintenance', element: <MaintenancePage />, handle: { crumb: 'Maintenance' } },
  { path: 'alerts', element: <AlertsPage />, handle: { crumb: 'Expiry alerts' } },
]
