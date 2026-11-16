import type { ReactNode } from 'react'
import { BrandMark } from '@/components/common/BrandMark'

export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="grid min-h-svh lg:grid-cols-[24rem_minmax(0,1fr)]">
      <aside className="flex flex-col justify-between gap-10 bg-sidebar px-8 py-8 text-sidebar-foreground">
        <BrandMark />
        <div className="space-y-4">
          <p className="font-display text-4xl leading-tight tracking-tight">Nagaland Mandi desk</p>
          <p className="max-w-xs text-sm leading-6 text-sidebar-foreground/75">
            A demonstration of the mandi operating desk. The session stays in this browser.
          </p>
        </div>
        <p className="text-xs leading-5 text-sidebar-foreground/60">
          Every desk uses the published password <span className="font-medium text-sidebar-primary">demo-mandi</span>.
        </p>
      </aside>
      <main className="app-canvas flex justify-center px-4 py-8 md:px-10 md:py-12">
        <div className="w-full max-w-3xl">{children}</div>
      </main>
    </div>
  )
}
