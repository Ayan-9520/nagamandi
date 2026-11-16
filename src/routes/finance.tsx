import { loadPage } from '@/routes/load'
import type { RouteObject } from 'react-router-dom'
const ClosingPage = loadPage(() => import('@/pages/finance/ClosingPage'), 'ClosingPage')
const FinanceDashboardPage = loadPage(() => import('@/pages/finance/FinanceDashboardPage'), 'FinanceDashboardPage')
const FinanceRegisterPage = loadPage(() => import('@/pages/finance/FinanceRegisterPage'), 'FinanceRegisterPage')
const NotePrintPage = loadPage(() => import('@/pages/finance/NotePrintPage'), 'NotePrintPage')
const NotesPage = loadPage(() => import('@/pages/finance/NotesPage'), 'NotesPage')
const ReceiptPrintPage = loadPage(() => import('@/pages/finance/ReceiptPrintPage'), 'ReceiptPrintPage')
const ReconciliationPage = loadPage(() => import('@/pages/finance/ReconciliationPage'), 'ReconciliationPage')
const ReportsPage = loadPage(() => import('@/pages/finance/ReportsPage'), 'ReportsPage')
const SettlementPage = loadPage(() => import('@/pages/finance/SettlementPage'), 'SettlementPage')

export const financeRoutes: RouteObject[] = [
  { index: true, element: <FinanceDashboardPage />, handle: { crumb: 'Finance' } },
  { path: 'fees', element: <FinanceRegisterPage mode="fees" />, handle: { crumb: 'Licence fees' } },
  { path: 'deposits', element: <FinanceRegisterPage mode="deposits" />, handle: { crumb: 'Security deposits' } },
  { path: 'commission', element: <FinanceRegisterPage mode="commission" />, handle: { crumb: 'Commission' } },
  { path: 'collections', element: <SettlementPage side="buyer" />, handle: { crumb: 'Buyer collections' } },
  { path: 'seller-payments', element: <SettlementPage side="seller" />, handle: { crumb: 'Seller payments' } },
  { path: 'notes/:id/print', element: <NotePrintPage />, handle: { crumb: 'Note preview' } },
  { path: 'credit-notes', element: <NotesPage kind="credit" />, handle: { crumb: 'Credit notes' } },
  { path: 'debit-notes', element: <NotesPage kind="debit" />, handle: { crumb: 'Debit notes' } },
  { path: 'receipts/:id/print', element: <ReceiptPrintPage />, handle: { crumb: 'Receipt' } },
  { path: 'receipts', element: <FinanceRegisterPage mode="receipts" />, handle: { crumb: 'Receipts' } },
  { path: 'receivables', element: <FinanceRegisterPage mode="receivables" />, handle: { crumb: 'Receivables' } },
  { path: 'reconciliation', element: <ReconciliationPage />, handle: { crumb: 'Reconciliation' } },
  { path: 'closing', element: <ClosingPage />, handle: { crumb: 'Closing' } },
  { path: 'reports', element: <ReportsPage />, handle: { crumb: 'Financial reports' } },
]
