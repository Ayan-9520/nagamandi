import { loadPage } from '@/routes/load'
import type { RouteObject } from 'react-router-dom'
import { catalogRegisters, partyRegisters } from '@/features/registry/meta'
const CatalogDetailPage = loadPage(() => import('@/pages/registry/CatalogDetailPage'), 'CatalogDetailPage')
const CatalogFormPage = loadPage(() => import('@/pages/registry/CatalogFormPage'), 'CatalogFormPage')
const CatalogListPage = loadPage(() => import('@/pages/registry/CatalogListPage'), 'CatalogListPage')
const PartyDetailPage = loadPage(() => import('@/pages/registry/PartyDetailPage'), 'PartyDetailPage')
const PartyFormPage = loadPage(() => import('@/pages/registry/PartyFormPage'), 'PartyFormPage')
const PartyListPage = loadPage(() => import('@/pages/registry/PartyListPage'), 'PartyListPage')
const RegistryHubPage = loadPage(() => import('@/pages/registry/RegistryHubPage'), 'RegistryHubPage')

export const stakeholderRoutes: RouteObject[] = [
  { index: true, element: <RegistryHubPage />, handle: { crumb: 'Stakeholders' } },
  ...partyRegisters.flatMap((meta) => [
    { path: meta.path, element: <PartyListPage kind={meta.kind} />, handle: { crumb: meta.title } },
    { path: `${meta.path}/new`, element: <PartyFormPage kind={meta.kind} />, handle: { crumb: `New ${meta.singular.toLowerCase()}` } },
    { path: `${meta.path}/:id`, element: <PartyDetailPage kind={meta.kind} />, handle: { crumb: meta.singular } },
    { path: `${meta.path}/:id/edit`, element: <PartyFormPage kind={meta.kind} />, handle: { crumb: `Edit ${meta.singular.toLowerCase()}` } },
  ]),
  ...catalogRegisters.flatMap((meta) => [
    { path: meta.path, element: <CatalogListPage kind={meta.kind} />, handle: { crumb: meta.title } },
    { path: `${meta.path}/new`, element: <CatalogFormPage kind={meta.kind} />, handle: { crumb: `New ${meta.singular.toLowerCase()}` } },
    { path: `${meta.path}/:id`, element: <CatalogDetailPage kind={meta.kind} />, handle: { crumb: meta.singular } },
    { path: `${meta.path}/:id/edit`, element: <CatalogFormPage kind={meta.kind} />, handle: { crumb: `Edit ${meta.singular.toLowerCase()}` } },
  ]),
]
