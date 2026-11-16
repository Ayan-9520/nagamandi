import type { ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export function FilterBar({
  children,
  onReset,
}: {
  children: ReactNode
  onReset: () => void
}) {
  return (
    <Card className="bg-card/90">
      <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
        {children}
        <div className="flex items-end">
          <Button type="button" variant="outline" className="w-full" onClick={onReset}>
            Reset filters
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
