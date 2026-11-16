import { useEffect } from 'react'
import { Outlet, useMatches } from 'react-router-dom'
import { AppBreadcrumbs } from '@/layouts/AppBreadcrumbs'
import { Sidebar } from '@/layouts/Sidebar'
import { TopBar } from '@/layouts/TopBar'
import { SimulationBanner } from '@/features/auth/SimulationBanner'
import { FieldBottomNav } from '@/features/field/FieldBits'
import { canOpenField } from '@/services/field-rules'
import { useSessionStore } from '@/store/session-store'
import { readCrumb } from '@/utils/route'

export function AppShell() {
  const matches = useMatches()
  const roleId = useSessionStore((state) => state.roleId)
  const fieldNav = roleId ? canOpenField(roleId) : false
  const crumb = [...matches].reverse().map((match) => readCrumb(match.handle)).find(Boolean) ?? 'Desk'

  useEffect(() => {
    document.title = `${crumb} · Naga Mandi OS`
  }, [crumb])

  return (
    <div className="app-shell flex h-svh overflow-hidden bg-background">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar />
        <SimulationBanner compact />
        <main className="app-canvas flex-1 overflow-y-auto px-4 py-5 pb-24 md:px-8 md:py-7">
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
            <AppBreadcrumbs />
            <Outlet />
          </div>
        </main>
        {fieldNav ? <FieldBottomNav /> : null}
      </div>
    </div>
  )
}
