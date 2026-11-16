import { CircleAlert } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function ErrorState({
  title,
  description,
  onRetry,
}: {
  title: string
  description: string
  onRetry: () => void
}) {
  return (
    <div className="flex flex-col items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-8 sm:px-6" role="alert">
      <span className="grid size-10 place-items-center rounded-lg bg-background text-destructive ring-1 ring-destructive/30">
        <CircleAlert className="size-5" aria-hidden />
      </span>
      <div className="space-y-1">
        <h2 className="text-base font-medium">{title}</h2>
        <p className="max-w-xl text-sm text-muted-foreground">{description}</p>
      </div>
      <Button type="button" variant="outline" onClick={onRetry}>
        Retry sample
      </Button>
    </div>
  )
}
