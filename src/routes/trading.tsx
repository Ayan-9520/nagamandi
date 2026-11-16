import { loadPage } from '@/routes/load'
import type { RouteObject } from 'react-router-dom'
const ChargesPage = loadPage(() => import('@/pages/trading/ChargesPage'), 'ChargesPage')
const CommissionPage = loadPage(() => import('@/pages/trading/CommissionPage'), 'CommissionPage')
const DiscoveryPage = loadPage(() => import('@/pages/trading/DiscoveryPage'), 'DiscoveryPage')
const ParchiPrintPage = loadPage(() => import('@/pages/trading/ParchiPrintPage'), 'ParchiPrintPage')
const RequirementPage = loadPage(() => import('@/pages/trading/RequirementPage'), 'RequirementPage')
const TradeDetailPage = loadPage(() => import('@/pages/trading/TradeDetailPage'), 'TradeDetailPage')
const TradingDashboardPage = loadPage(() => import('@/pages/trading/TradingDashboardPage'), 'TradingDashboardPage')
const TradingListPage = loadPage(() => import('@/pages/trading/TradingListPage'), 'TradingListPage')

export const tradingRoutes: RouteObject[] = [
  { index: true, element: <TradingDashboardPage />, handle: { crumb: 'Trading' } },
  { path: 'arrivals', element: <TradingListPage mode="arrivals" />, handle: { crumb: 'Seller arrivals' } },
  { path: 'requirements', element: <RequirementPage />, handle: { crumb: 'Buyer requirements' } },
  { path: 'lots', element: <TradingListPage mode="lots" />, handle: { crumb: 'Available lots' } },
  { path: 'workspace', element: <TradingListPage mode="workspace" />, handle: { crumb: 'Aadathiya workspace' } },
  { path: 'discover', element: <DiscoveryPage />, handle: { crumb: 'Price discovery' } },
  { path: 'discover/:lotId', element: <DiscoveryPage />, handle: { crumb: 'Price discovery' } },
  { path: 'negotiations', element: <TradingListPage mode="negotiations" />, handle: { crumb: 'Negotiation records' } },
  { path: 'commission', element: <CommissionPage />, handle: { crumb: 'Commission' } },
  { path: 'charges', element: <ChargesPage />, handle: { crumb: 'Charges' } },
  { path: 'register', element: <TradingListPage mode="register" />, handle: { crumb: 'Trade register' } },
  { path: 'payments', element: <TradingListPage mode="payments" />, handle: { crumb: 'Pending payments' } },
  { path: ':id/seller-parchi', element: <ParchiPrintPage side="seller" />, handle: { crumb: 'Seller parchi' } },
  { path: ':id/buyer-parchi', element: <ParchiPrintPage side="buyer" />, handle: { crumb: 'Buyer parchi' } },
  { path: ':id', element: <TradeDetailPage />, handle: { crumb: 'Trade' } },
]
