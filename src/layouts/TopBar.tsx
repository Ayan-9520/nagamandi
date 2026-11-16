import { DemoStatus } from '@/layouts/DemoStatus'
import { GlobalSearch } from '@/layouts/GlobalSearch'
import { MobileNav } from '@/layouts/MobileNav'
import { NotificationMenu } from '@/layouts/NotificationMenu'
import { UserMenu } from '@/layouts/UserMenu'

export function TopBar() {
  return (
    <header className="no-print z-30 flex h-16 shrink-0 items-center gap-3 border-b bg-card px-3 md:px-5">
      <MobileNav />
      <GlobalSearch />
      <DemoStatus />
      <NotificationMenu />
      <UserMenu />
    </header>
  )
}
