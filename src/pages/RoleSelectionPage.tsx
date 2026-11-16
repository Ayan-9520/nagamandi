import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { PageHeader } from '@/components/common/PageHeader'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { SimulationBanner } from '@/features/auth/SimulationBanner'
import { demoAccounts } from '@/mocks/accounts'
import { getRole } from '@/mocks/permissions'
import { useSessionStore } from '@/store/session-store'
import type { RoleId } from '@/types/access'
import { cn } from '@/utils/cn'

export function RoleSelectionPage() {
  const navigate = useNavigate()
  const roleId = useSessionStore((state) => state.roleId)
  const switchRole = useSessionStore((state) => state.switchRole)

  function choose(nextRole: RoleId) {
    switchRole(nextRole)
    const role = getRole(nextRole)
    toast.success(`${role.title} is now the simulated role on this browser.`)
    navigate('/desk')
  }

  return (
    <div className="space-y-4">
      <PageHeader
        eyebrow="DEMO"
        title="Role selection"
        description="Switching a role only changes the simulated sidebar and route list stored in this browser."
      />
      <SimulationBanner />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {demoAccounts.map((account) => {
          const role = getRole(account.roleId)
          const current = account.roleId === roleId
          return (
            <Card key={account.id} className={cn(current && 'ring-2 ring-primary')}>
              <CardHeader>
                <CardTitle>{role.title}</CardTitle>
                <CardDescription>{role.summary}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-xs text-muted-foreground">{account.id}</p>
                <Button type="button" variant={current ? 'secondary' : 'default'} aria-pressed={current} onClick={() => choose(account.roleId)}>
                  {current ? 'Using this role' : 'Use this role'}
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
