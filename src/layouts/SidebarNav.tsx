import { PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { BrandMark } from '@/components/common/BrandMark'
import { NavIcon } from '@/components/common/NavIcon'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { navigationForRole } from '@/services/access'
import { useSessionStore } from '@/store/session-store'
import { useUiStore } from '@/store/ui-store'
import { cn } from '@/utils/cn'

export function SidebarNav({
  collapsed = false,
  onNavigate,
  showCollapse = true,
}: {
  collapsed?: boolean
  onNavigate?: () => void
  showCollapse?: boolean
}) {
  const toggleSidebar = useUiStore((state) => state.toggleSidebar)
  const roleId = useSessionStore((state) => state.roleId)
  const groups = roleId ? navigationForRole(roleId) : []

  return (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      <div className={cn('flex h-16 items-center border-b border-sidebar-border px-3', collapsed && 'justify-center px-2')}>
        <BrandMark compact={collapsed} />
      </div>
      <ScrollArea className="min-h-0 flex-1">
        <nav className="space-y-5 px-2 py-4" aria-label="Primary" data-role={roleId ?? 'none'}>
          {groups.map((group) => (
            <div key={group.label} className="space-y-1">
              {collapsed ? null : (
                <p className="px-2.5 text-[10px] font-semibold tracking-[0.16em] text-sidebar-foreground/50 uppercase">
                  {group.label}
                </p>
              )}
              <ul className="space-y-0.5">
                {group.items.map((item) => {
                  const link = (
                    <NavLink
                      to={item.to}
                      end={item.to === '/desk'}
                      data-nav={item.id}
                      onClick={onNavigate}
                      title={collapsed ? item.title : undefined}
                      className={({ isActive }) =>
                        cn(
                          'flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                          item.available ? 'text-sidebar-foreground/85' : 'text-sidebar-foreground/45',
                          collapsed && 'justify-center px-2',
                          isActive && 'bg-sidebar-accent text-sidebar-accent-foreground shadow-[inset_3px_0_0_0_var(--gold)]',
                        )
                      }
                    >
                      <NavIcon name={item.icon} className="size-4 shrink-0" />
                      {collapsed ? <span className="sr-only">{item.title}</span> : (
                        <span className="flex min-w-0 flex-1 items-center justify-between gap-2">
                          <span className="truncate">{item.title}</span>
                          {item.available ? null : <span className="shrink-0 text-[10px] tracking-wide uppercase">Later</span>}
                        </span>
                      )}
                    </NavLink>
                  )

                  return (
                    <li key={item.id}>
                      {collapsed ? (
                        <Tooltip>
                          <TooltipTrigger asChild>{link}</TooltipTrigger>
                          <TooltipContent side="right">{item.title}</TooltipContent>
                        </Tooltip>
                      ) : (
                        link
                      )}
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </nav>
      </ScrollArea>
      {showCollapse ? (
      <div className="border-t border-sidebar-border p-2">
        <Button
          type="button"
          variant="ghost"
          className={cn(
            'w-full text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
            collapsed ? 'justify-center px-0' : 'justify-start',
          )}
          onClick={toggleSidebar}
          aria-pressed={collapsed}
        >
          {collapsed ? <PanelLeftOpen /> : <PanelLeftClose />}
          {collapsed ? <span className="sr-only">Expand sidebar</span> : 'Collapse sidebar'}
        </Button>
      </div>
      ) : null}
    </div>
  )
}
