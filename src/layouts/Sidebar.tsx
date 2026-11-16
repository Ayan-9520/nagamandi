import { SidebarNav } from '@/layouts/SidebarNav'
import { useUiStore } from '@/store/ui-store'
import { cn } from '@/utils/cn'

export function Sidebar() {
  const collapsed = useUiStore((state) => state.sidebarCollapsed)

  return (
    <aside
      className={cn(
        'no-print hidden h-svh shrink-0 border-r border-sidebar-border transition-[width] duration-200 lg:block',
        collapsed ? 'w-[4.5rem]' : 'w-64',
      )}
    >
      <SidebarNav collapsed={collapsed} />
    </aside>
  )
}
