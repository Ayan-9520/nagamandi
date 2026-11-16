import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { PageHeader } from '@/components/common/PageHeader'
import { TextField } from '@/components/forms/TextField'
import { SelectField } from '@/components/forms/SelectField'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { SelectItem } from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useDemoStore } from '@/store/demo-store'
import { useUiStore } from '@/store/ui-store'
import type { DataScenario, ThemeMode } from '@/types/domain'

const deskSchema = z.object({
  deskLabel: z
    .string()
    .trim()
    .min(2, 'Use at least 2 characters.')
    .max(40, 'Keep the label within 40 characters.'),
})

type DeskValues = z.infer<typeof deskSchema>

export function SettingsPage() {
  const theme = useUiStore((state) => state.theme)
  const setTheme = useUiStore((state) => state.setTheme)
  const deskLabel = useUiStore((state) => state.deskLabel)
  const setDeskLabel = useUiStore((state) => state.setDeskLabel)
  const resetUi = useUiStore((state) => state.resetUi)
  const scenario = useDemoStore((state) => state.scenario)
  const setScenario = useDemoStore((state) => state.setScenario)
  const resetDemo = useDemoStore((state) => state.resetDemo)
  const [resetOpen, setResetOpen] = useState(false)
  const form = useForm<DeskValues>({
    resolver: zodResolver(deskSchema),
    defaultValues: { deskLabel },
  })

  useEffect(() => {
    form.reset({ deskLabel })
  }, [deskLabel, form])

  function saveLabel(values: DeskValues) {
    setDeskLabel(values.deskLabel)
    toast.success('Desk label saved in this browser.')
  }

  function clearSavedData() {
    resetUi()
    resetDemo()
    setResetOpen(false)
    toast.success('Saved demonstration preferences were cleared on this browser.')
  }

  const themes: { id: ThemeMode; label: string; detail: string }[] = [
    { id: 'light', label: 'Light', detail: 'Paper and forest green' },
    { id: 'dark', label: 'Dark', detail: 'Night yard desk' },
  ]

  return (
    <div className="space-y-4">
      <PageHeader
        eyebrow="DEMO"
        title="Settings"
        description="Preferences for this browser. They do not create an account or change a mandi record."
      />
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
            <CardDescription>The choice is saved on this browser.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2 sm:grid-cols-2">
            {themes.map((option) => (
              <Button
                key={option.id}
                type="button"
                variant={theme === option.id ? 'default' : 'outline'}
                className="h-auto flex-col items-start gap-1 px-3 py-3"
                aria-pressed={theme === option.id}
                onClick={() => setTheme(option.id)}
              >
                <span>{option.label}</span>
                <span className="text-xs font-normal opacity-80">{option.detail}</span>
              </Button>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Desk label</CardTitle>
            <CardDescription>Shown in the top bar. This is not a user account.</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-3" onSubmit={form.handleSubmit(saveLabel)}>
              <TextField
                label="Label"
                error={form.formState.errors.deskLabel?.message}
                {...form.register('deskLabel')}
              />
              <Button type="submit">Save label</Button>
            </form>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Dashboard sample</CardTitle>
            <CardDescription>Controls the empty, error and operating states on the desk.</CardDescription>
          </CardHeader>
          <CardContent>
            <SelectField label="Sample" value={scenario} onValueChange={(value) => setScenario(value as DataScenario)}>
              <SelectItem value="success">Operating sample</SelectItem>
              <SelectItem value="empty">Empty sample</SelectItem>
              <SelectItem value="error">Error sample</SelectItem>
            </SelectField>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Saved browser data</CardTitle>
            <CardDescription>
              Clears the theme, label, lot notes and read notices stored here. Stakeholder registers, licence cases, arrival lots, trade records, the simulated finance book, the warehouse book, the cold storage book, the FLP book, the parking book, the facilities book, the compliance book and field drafts stay until you restore each sample.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button type="button" variant="destructive" onClick={() => setResetOpen(true)}>
              Clear saved demo data
            </Button>
          </CardContent>
        </Card>
      </div>
      <Dialog open={resetOpen} onOpenChange={setResetOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Clear saved demo data?</DialogTitle>
            <DialogDescription>
              Only this browser’s saved preferences and notes are removed. Stakeholder registers, licence cases, arrival lots, trade records, the simulated finance book, the warehouse book, the cold storage book, the FLP book, the parking book, the facilities book, the compliance book and field drafts stay on this browser.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setResetOpen(false)}>
              Keep data
            </Button>
            <Button type="button" variant="destructive" onClick={clearSavedData}>
              Clear saved data
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
