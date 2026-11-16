import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AuthLayout } from '@/features/auth/AuthLayout'
import { demoAccounts } from '@/mocks/accounts'
import { getRole } from '@/mocks/permissions'
import { DEMO_PASSWORD } from '@/services/access'

export function ForgotPasswordPage() {
  return (
    <AuthLayout>
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Demonstration password</CardTitle>
          <CardDescription>
            This desk does not send mail and does not reset an account. Every demonstration desk uses the same published password.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="rounded-lg border bg-muted/50 px-3 py-2 font-medium">{DEMO_PASSWORD}</p>
          <ul className="grid gap-1 text-sm text-muted-foreground sm:grid-cols-2">
            {demoAccounts.map((account) => (
              <li key={account.id}>
                {getRole(account.roleId).title}
                <span className="block text-xs">{account.id}</span>
              </li>
            ))}
          </ul>
          <Button type="button" asChild>
            <Link to="/login">Back to sign in</Link>
          </Button>
        </CardContent>
      </Card>
    </AuthLayout>
  )
}
