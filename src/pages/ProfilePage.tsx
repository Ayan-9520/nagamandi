import { Link, useNavigate } from 'react-router-dom'
import { PageHeader } from '@/components/common/PageHeader'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { SimulationBanner } from '@/features/auth/SimulationBanner'
import { findAccount } from '@/mocks/accounts'
import { navigation } from '@/mocks/navigation'
import { getRole } from '@/mocks/permissions'
import { useSessionStore } from '@/store/session-store'

export function ProfilePage() {
  const navigate = useNavigate()
  const accountId = useSessionStore((state) => state.accountId)
  const roleId = useSessionStore((state) => state.roleId)
  const signOut = useSessionStore((state) => state.signOut)
  const account = accountId ? findAccount(accountId) : null
  const role = roleId ? getRole(roleId) : null
  const allowed = new Set(role?.modules ?? [])
  const visible = navigation
    .flatMap((group) => group.items)
    .filter((item) => item.id === 'dashboard' || item.id === 'settings' || allowed.has(item.id))

  function endSession() {
    signOut()
    navigate('/login')
  }

  return (
    <div className="space-y-4">
      <PageHeader
        eyebrow="DEMO"
        title="Profile"
        description="This profile is the demonstration desk stored in the browser. It is not an officer record."
      />
      <SimulationBanner />
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{role?.title ?? 'Demonstration desk'}</CardTitle>
            <CardDescription>{role?.summary}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <dl className="grid gap-3">
              <div>
                <dt className="text-muted-foreground">Desk id</dt>
                <dd>{account?.id ?? 'None'}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Label</dt>
                <dd>{account?.label ?? 'None'}</dd>
              </div>
            </dl>
            <div className="flex flex-wrap gap-2">
              <Button type="button" asChild>
                <Link to="/roles">Switch role</Link>
              </Button>
              <Button type="button" variant="outline" onClick={endSession}>
                End demonstration session
              </Button>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Routes this role can open</CardTitle>
            <CardDescription>Other module addresses show the unauthorized screen.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="grid gap-1 text-sm">
              {visible.map((item) => (
                <li key={item.id}>
                  <Link to={item.to} className="text-primary underline-offset-4 hover:underline">
                    {item.title}
                  </Link>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
