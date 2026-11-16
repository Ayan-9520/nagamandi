import { Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { notifications } from '@/mocks/notifications'
import { useDemoStore } from '@/store/demo-store'
import { formatDateTime } from '@/utils/format'

export function NotificationMenu() {
  const readIds = useDemoStore((state) => state.readIds)
  const markRead = useDemoStore((state) => state.markRead)
  const markAllRead = useDemoStore((state) => state.markAllRead)
  const unread = notifications.filter((item) => !readIds.includes(item.id)).length

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button type="button" variant="outline" size="icon" className="relative" aria-label={`Notifications, ${unread} unread`}>
          <Bell />
          {unread > 0 ? (
            <span className="absolute -top-1 -right-1 grid min-w-4 place-items-center rounded-full bg-gold px-1 text-[10px] font-semibold text-gold-foreground">
              {unread}
            </span>
          ) : null}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between gap-3">
          <span>Demonstration notices</span>
          <button
            type="button"
            className="text-xs font-normal text-primary disabled:text-muted-foreground"
            onClick={markAllRead}
            disabled={unread === 0}
          >
            Mark all read
          </button>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {notifications.map((item) => {
          const read = readIds.includes(item.id)
          return (
            <DropdownMenuItem
              key={item.id}
              className="items-start"
              onSelect={() => {
                if (!read) markRead(item.id)
              }}
            >
              <span className="grid gap-0.5">
                <span className="flex items-center gap-2">
                  <span className="font-medium">{item.title}</span>
                  {read ? null : <span className="size-1.5 rounded-full bg-gold" aria-hidden />}
                </span>
                <span className="text-xs text-muted-foreground">{item.body}</span>
                <span className="text-[11px] text-muted-foreground">{formatDateTime(item.at)}</span>
              </span>
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
