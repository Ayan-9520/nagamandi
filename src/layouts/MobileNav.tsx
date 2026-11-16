import { Menu } from 'lucide-react'
import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { SidebarNav } from '@/layouts/SidebarNav'

export function MobileNav() {
  const location = useLocation()
  const [openPath, setOpenPath] = useState<string | null>(null)
  const open = openPath === location.pathname

  return (
    <Sheet open={open} onOpenChange={(next) => setOpenPath(next ? location.pathname : null)}>
      <Button type="button" variant="outline" size="icon" className="lg:hidden" onClick={() => setOpenPath(location.pathname)} aria-label="Open navigation">
        <Menu />
      </Button>
      <SheetContent side="left" className="w-72 bg-sidebar p-0 text-sidebar-foreground sm:max-w-none" showCloseButton>
        <SheetHeader className="sr-only">
          <SheetTitle>Navigation</SheetTitle>
          <SheetDescription>Naga Mandi OS sections</SheetDescription>
        </SheetHeader>
        <SidebarNav onNavigate={() => setOpenPath(null)} showCollapse={false} />
      </SheetContent>
    </Sheet>
  )
}
