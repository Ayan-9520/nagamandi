import { Moon, Sun } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { findAccount } from '@/mocks/accounts'
import { getRole } from '@/mocks/permissions'
import { useDemoStore } from '@/store/demo-store'
import { useSessionStore } from '@/store/session-store'
import { useUiStore } from '@/store/ui-store'

export function UserMenu() {
  const deskLabel = useUiStore((state) => state.deskLabel)
  const theme = useUiStore((state) => state.theme)
  const toggleTheme = useUiStore((state) => state.toggleTheme)
  const resetUi = useUiStore((state) => state.resetUi)
  const resetDemo = useDemoStore((state) => state.resetDemo)
  const roleId = useSessionStore((state) => state.roleId)
  const accountId = useSessionStore((state) => state.accountId)
  const signOut = useSessionStore((state) => state.signOut)
  const navigate = useNavigate()
  const [resetOpen, setResetOpen] = useState(false)
  const role = roleId ? getRole(roleId) : null
  const account = accountId ? findAccount(accountId) : null
  const initials = (role?.title ?? deskLabel)
    .replace(/[^A-Za-z ]/g, ' ')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')

  function clearSavedData() {
    resetUi()
    resetDemo()
    setResetOpen(false)
    toast.success('Saved demonstration preferences were cleared on this browser.')
  }

  function endSession() {
    signOut()
    navigate('/')
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button type="button" variant="outline" className="h-9 gap-2 px-2">
            <span className="grid size-6 place-items-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground">
              {initials || 'DM'}
            </span>
            <span className="hidden max-w-36 truncate text-left text-sm sm:inline">{role?.title ?? deskLabel}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-72">
          <DropdownMenuLabel>
            <span className="block">{role?.title ?? 'Demonstration desk'}</span>
            <span className="block text-xs font-normal text-muted-foreground">{account?.id ?? 'No desk'} · simulated session</span>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={toggleTheme}>
            {theme === 'dark' ? <Sun /> : <Moon />}
            Use {theme === 'dark' ? 'light' : 'dark'} theme
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => navigate('/')}>Introduction</DropdownMenuItem>
          <DropdownMenuItem onSelect={() => navigate('/profile')}>Profile</DropdownMenuItem>
          <DropdownMenuItem onSelect={() => navigate('/roles')}>Switch demonstration role</DropdownMenuItem>
          <DropdownMenuItem onSelect={() => navigate('/settings')}>Settings</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={endSession}>End demonstration session</DropdownMenuItem>
          <DropdownMenuItem variant="destructive" onSelect={() => setResetOpen(true)}>
            Clear saved demo data
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={resetOpen} onOpenChange={setResetOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Clear saved demo data?</DialogTitle>
            <DialogDescription>
              This removes the theme, desk label, lot notes and read notices stored in this browser. The signed-in demonstration role, the stakeholder registers, the licence cases, the arrival lots, the trade records, the simulated finance book, the warehouse book, the cold storage book, the FLP book, the parking book, the facilities book, the compliance book and field drafts stay.
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
    </>
  )
}
