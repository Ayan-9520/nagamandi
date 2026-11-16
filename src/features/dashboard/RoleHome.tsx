import { useState } from 'react'
import { Link } from 'react-router-dom'
import { PageHeader } from '@/components/common/PageHeader'
import { StatCard } from '@/components/common/StatCard'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { LayoutDashboard } from 'lucide-react'
import type { DeskActivity, DeskTask, RolePermission } from '@/types/access'

export function RoleHome({ permission }: { permission: RolePermission }) {
  const [task, setTask] = useState<DeskTask | null>(null)
  const [activity, setActivity] = useState<DeskActivity | null>(null)

  return (
    <div className="space-y-4">
      <PageHeader
        eyebrow="DEMO"
        title={permission.title}
        description={permission.summary}
      />
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {permission.widgets.map((widget) => (
          <StatCard key={widget.label} label={widget.label} value={widget.value} hint={widget.hint} icon={LayoutDashboard} />
        ))}
      </section>
      <section className="grid items-start gap-3 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Pending tasks</CardTitle>
            <CardDescription>Fictional items for this role. Opening one does not complete a workflow.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {permission.tasks.map((item) => (
              <div key={item.id} className="flex items-start justify-between gap-3 rounded-lg border px-3 py-2">
                <div>
                  <p className="text-sm font-medium">{item.title}</p>
                  <p className="text-xs text-muted-foreground">{item.due}</p>
                </div>
                <Button type="button" variant="outline" size="sm" onClick={() => setTask(item)}>
                  Read
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Recent activity</CardTitle>
            <CardDescription>Sample events stored with the role, not an audit log.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {permission.activity.map((item) => (
              <div key={item.id} className="flex items-start justify-between gap-3 rounded-lg border px-3 py-2">
                <div>
                  <p className="text-sm font-medium">{item.title}</p>
                  <p className="text-xs text-muted-foreground">{item.at}</p>
                </div>
                <Button type="button" variant="outline" size="sm" onClick={() => setActivity(item)}>
                  Read
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
      <Card>
        <CardHeader>
          <CardTitle>Shortcuts</CardTitle>
          <CardDescription>These open only routes included in the simulated permission list.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
          {permission.shortcuts.map((shortcut) => (
            <Link
              key={shortcut.to}
              to={shortcut.to}
              className="rounded-lg border bg-background px-3 py-2.5 transition-colors hover:bg-accent"
            >
              <span className="block text-sm font-medium">{shortcut.label}</span>
              <span className="mt-0.5 block text-xs leading-5 text-muted-foreground">{shortcut.detail}</span>
            </Link>
          ))}
        </CardContent>
      </Card>
      <Dialog open={Boolean(task)} onOpenChange={(open) => { if (!open) setTask(null) }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{task?.title}</DialogTitle>
            <DialogDescription>{task?.due}. This task is a demonstration and does not start a procedure.</DialogDescription>
          </DialogHeader>
          <p className="text-sm">{task?.detail}</p>
        </DialogContent>
      </Dialog>
      <Dialog open={Boolean(activity)} onOpenChange={(open) => { if (!open) setActivity(null) }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{activity?.title}</DialogTitle>
            <DialogDescription>{activity?.at}</DialogDescription>
          </DialogHeader>
          <p className="text-sm">{activity?.detail}</p>
        </DialogContent>
      </Dialog>
    </div>
  )
}
