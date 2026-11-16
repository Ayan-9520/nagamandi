import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { TextField } from '@/components/forms/TextField'
import { AuthLayout } from '@/features/auth/AuthLayout'
import { demoAccounts } from '@/mocks/accounts'
import { getRole } from '@/mocks/permissions'
import { DEMO_PASSWORD, signInDemo } from '@/services/access'
import { useSessionStore } from '@/store/session-store'
import { cn } from '@/utils/cn'

const loginSchema = z.object({
  accountId: z.string().min(1, 'Choose a demonstration desk.'),
  password: z.string().min(1, 'Enter the demonstration password.'),
})

type LoginValues = z.infer<typeof loginSchema>

export function LoginPage() {
  const navigate = useNavigate()
  const signIn = useSessionStore((state) => state.signIn)
  const [formError, setFormError] = useState<string | null>(null)
  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { accountId: '', password: '' },
  })
  const accountId = form.watch('accountId')
  const selected = demoAccounts.find((account) => account.id === accountId)

  async function onSubmit(values: LoginValues) {
    setFormError(null)
    try {
      const account = await signInDemo(values.accountId, values.password)
      signIn(account.id, account.roleId)
      toast.success('Demonstration session started in this browser.')
      navigate('/desk')
    } catch (reason) {
      setFormError(reason instanceof Error ? reason.message : 'The demonstration sign-in failed.')
    }
  }

  return (
    <AuthLayout>
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Enter a demonstration desk</CardTitle>
            <CardDescription>
              Choose a desk, then enter the published password <span className="font-medium text-foreground">{DEMO_PASSWORD}</span>.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
              <TextField
                label="Demonstration password"
                type="password"
                autoComplete="off"
                error={form.formState.errors.password?.message}
                {...form.register('password')}
              />
              {form.formState.errors.accountId ? (
                <p className="text-xs text-destructive">{form.formState.errors.accountId.message}</p>
              ) : (
                <p className="text-xs text-muted-foreground">
                  {selected ? `Selected: ${selected.label}` : 'Choose a desk on the right, or below on a small screen.'}
                </p>
              )}
              {formError ? (
                <p className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive" role="alert">
                  {formError}
                </p>
              ) : null}
              <div className="flex flex-wrap gap-2">
                <Button type="button" variant="outline" onClick={() => form.setValue('password', DEMO_PASSWORD, { shouldValidate: true })}>
                  Use published password
                </Button>
                <Button type="submit" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? 'Checking the desk…' : 'Enter desk'}
                </Button>
              </div>
              <div className="flex flex-wrap gap-4">
                <Link to="/forgot-password" className="text-sm text-primary underline-offset-4 hover:underline">
                  Forgot the demonstration password?
                </Link>
                <Link to="/" className="text-sm text-primary underline-offset-4 hover:underline">
                  Back to the introduction
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Demonstration desks</CardTitle>
            <CardDescription>Choosing a desk only fills the form. Enter desk starts the simulated session.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {demoAccounts.map((account) => {
              const role = getRole(account.roleId)
              const pressed = account.id === accountId
              return (
                <button
                  key={account.id}
                  type="button"
                  aria-pressed={pressed}
                  onClick={() => form.setValue('accountId', account.id, { shouldValidate: true })}
                  className={cn(
                    'rounded-lg border px-3 py-2 text-left transition-colors hover:bg-accent',
                    pressed && 'border-primary bg-primary/5',
                  )}
                >
                  <span className="block text-sm font-medium">{role.title}</span>
                  <span className="block text-xs text-muted-foreground">{account.id}</span>
                </button>
              )
            })}
          </CardContent>
        </Card>
      </div>
    </AuthLayout>
  )
}
