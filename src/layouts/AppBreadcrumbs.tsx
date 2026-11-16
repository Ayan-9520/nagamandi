import { ChevronRight } from 'lucide-react'
import { Link, useLocation, useMatches } from 'react-router-dom'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { readCrumb } from '@/utils/route'

export function AppBreadcrumbs() {
  const location = useLocation()
  const matches = useMatches()
  const current = [...matches].reverse().map((match) => readCrumb(match.handle)).find(Boolean) ?? 'Desk'
  const onDashboard = location.pathname === '/desk'

  return (
    <Breadcrumb className="no-print">
      <BreadcrumbList>
        {onDashboard ? (
          <BreadcrumbItem>
            <BreadcrumbPage>Dashboard</BreadcrumbPage>
          </BreadcrumbItem>
        ) : (
          <>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/desk">Dashboard</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator>
              <ChevronRight className="size-3.5" />
            </BreadcrumbSeparator>
            <BreadcrumbItem>
              <BreadcrumbPage>{current}</BreadcrumbPage>
            </BreadcrumbItem>
          </>
        )}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
