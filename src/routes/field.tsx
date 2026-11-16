import { loadPage } from '@/routes/load'
import type { RouteObject } from 'react-router-dom'
const ArrivalFieldPage = loadPage(() => import('@/pages/field/FieldPages'), 'ArrivalFieldPage')
const FacilityFieldPage = loadPage(() => import('@/pages/field/FieldPages'), 'FacilityFieldPage')
const FieldHomePage = loadPage(() => import('@/pages/field/FieldPages'), 'FieldHomePage')
const InspectionFieldPage = loadPage(() => import('@/pages/field/FieldPages'), 'InspectionFieldPage')
const ParchiFieldPage = loadPage(() => import('@/pages/field/FieldPages'), 'ParchiFieldPage')
const ParkingFieldPage = loadPage(() => import('@/pages/field/FieldPages'), 'ParkingFieldPage')

export const fieldRoutes: RouteObject[] = [
  { index: true, element: <FieldHomePage />, handle: { crumb: 'Field' } },
  { path: 'arrival', element: <ArrivalFieldPage />, handle: { crumb: 'Arrival entry' } },
  { path: 'inspection', element: <InspectionFieldPage />, handle: { crumb: 'Lot inspection' } },
  { path: 'parchi', element: <ParchiFieldPage />, handle: { crumb: 'Parchi preview' } },
  { path: 'parking', element: <ParkingFieldPage />, handle: { crumb: 'Parking' } },
  { path: 'facilities', element: <FacilityFieldPage />, handle: { crumb: 'Facility inspections' } },
]
