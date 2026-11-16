import { Link, useLocation } from 'react-router-dom'
import { PageHeader } from '@/components/common/PageHeader'
import { Button } from '@/components/ui/button'
import { SimulationBanner } from '@/features/auth/SimulationBanner'
import { getRole } from '@/mocks/permissions'
import { useSessionStore } from '@/store/session-store'

export function UnauthorizedPage() {
  const location = useLocation()
  const roleId = useSessionStore((state) => state.roleId)
  const role = roleId ? getRole(roleId) : null
  const from = location.state && typeof location.state === 'object' && 'from' in location.state && typeof location.state.from === 'string'
    ? location.state.from
    : null

  return (
    <div className="space-y-4">
      <PageHeader
        eyebrow="DEMO"
        title="Outside this role"
        description={
          from
            ? `${from} is not in the simulated permission list for ${role?.title ?? 'this desk'}.`
            : `That address is not in the simulated permission list for ${role?.title ?? 'this desk'}.`
        }
      />
      <SimulationBanner />
      <div className="flex flex-wrap gap-2">
        <Button type="button" asChild>
          <Link to="/desk">Back to dashboard</Link>
        </Button>
        <Button type="button" variant="outline" asChild>
          <Link to="/roles">Switch demonstration role</Link>
        </Button>
      </div>
    </div>
  )
}
