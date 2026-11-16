import type { ReactNode } from 'react'
import { Toaster } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { useApplyTheme } from '@/hooks/use-theme'

export function AppProviders({ children }: { children: ReactNode }) {
  useApplyTheme()

  return (
    <TooltipProvider delayDuration={250}>
      {children}
      <Toaster />
    </TooltipProvider>
  )
}
