import { cn } from '@/utils/cn'

export function BrandMark({
  compact = false,
  className,
  tone = 'sidebar',
}: {
  compact?: boolean
  className?: string
  tone?: 'sidebar' | 'paper'
}) {
  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-gold text-gold-foreground shadow-sm">
        <svg viewBox="0 0 24 24" className="size-5" aria-hidden>
          <path
            fill="currentColor"
            d="M12 2.5c.5 3.4 1.8 5.6 4.6 7-2.6 1.1-3.8 3.4-4.6 7.2-.8-3.8-2-6.1-4.6-7.2 2.8-1.4 4.1-3.6 4.6-7Z"
          />
          <path
            fill="currentColor"
            d="M12 16.8c.3 1.5.9 2.7 2.1 3.5-1.3.4-2.1.5-2.1.5s-.8-.1-2.1-.5c1.2-.8 1.8-2 2.1-3.5Z"
            opacity="0.75"
          />
        </svg>
      </span>
      {compact ? <span className="sr-only">Naga Mandi OS</span> : null}
      {compact ? null : (
        <span className="min-w-0 text-left">
          <span className="font-display block text-[1.05rem] leading-none tracking-tight">Naga Mandi</span>
          <span className={cn(
            'mt-1 block text-[10px] font-semibold tracking-[0.18em] uppercase',
            tone === 'paper' ? 'text-muted-foreground' : 'text-sidebar-foreground/65',
          )}>
            Operations
          </span>
        </span>
      )}
    </div>
  )
}
