import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { TextAreaField } from '@/components/forms/TextAreaField'
import { StatusBadge } from '@/components/common/StatusBadge'
import { yardName } from '@/mocks/catalog'
import { useDemoStore } from '@/store/demo-store'
import type { GateLot } from '@/types/domain'
import { formatDateTime, formatMt } from '@/utils/format'

const noteSchema = z.object({
  note: z
    .string()
    .trim()
    .min(3, 'Use at least 3 characters.')
    .max(240, 'Keep the note within 240 characters.'),
})

type NoteValues = z.infer<typeof noteSchema>

export function ArrivalDialog({
  lot,
  open,
  onOpenChange,
}: {
  lot: GateLot | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const savedNote = useDemoStore((state) => (lot ? state.notes[lot.id] : undefined))
  const setNote = useDemoStore((state) => state.setNote)
  const form = useForm<NoteValues>({
    resolver: zodResolver(noteSchema),
    defaultValues: { note: savedNote ?? '' },
  })

  useEffect(() => {
    form.reset({ note: savedNote ?? '' })
  }, [form, lot?.id, savedNote])

  function onSubmit(values: NoteValues) {
    if (!lot) return
    setNote(lot.id, values.note)
    toast.success('Demonstration note saved in this browser.')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{lot ? lot.id : 'Lot'}</DialogTitle>
          <DialogDescription>
            Fictional gate record. Saving a note keeps it in this browser only.
          </DialogDescription>
        </DialogHeader>
        {lot ? (
          <div className="space-y-4">
            <dl className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <dt className="text-muted-foreground">Yard</dt>
                <dd>{yardName(lot.yardId)}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Arrived</dt>
                <dd>{formatDateTime(lot.arrivedAt)}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Commodity</dt>
                <dd>{lot.commodity}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Quantity</dt>
                <dd>{formatMt(lot.quantityMt)}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Vehicle</dt>
                <dd>{lot.vehicleNo}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Grower label</dt>
                <dd>{lot.grower}</dd>
              </div>
            </dl>
            <StatusBadge status={lot.status} />
            <form className="space-y-3" onSubmit={form.handleSubmit(onSubmit)}>
              <TextAreaField
                label="Desk note"
                hint="Stored locally as a demonstration note."
                error={form.formState.errors.note?.message}
                {...form.register('note')}
              />
              <DialogFooter>
                <Button type="submit">Save note</Button>
              </DialogFooter>
            </form>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
