import type { ComponentProps } from 'react'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

export function TextAreaField({
  label,
  hint,
  error,
  id,
  ...props
}: ComponentProps<typeof Textarea> & {
  label: string
  hint?: string
  error?: string
}) {
  const fieldId = id ?? props.name
  return (
    <div className="grid gap-1.5">
      <Label htmlFor={fieldId}>{label}</Label>
      <Textarea id={fieldId} aria-invalid={Boolean(error)} {...props} />
      {error ? (
        <p className="text-xs text-destructive">{error}</p>
      ) : hint ? (
        <p className="text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  )
}
