import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { workingMandi } from '@/services/registry-rules'
import { useRegistryStore } from '@/store/registry-store'
import type { ActivityEntry, DemoDocument, RecordStatus } from '@/types/registry'
import { formatDateTime } from '@/utils/format'
import { cn } from '@/utils/cn'
import { downloadCsv } from '@/services/csv'
import type { CsvIssue } from '@/services/registry-io'

export function RecordStatusBadge({ status }: { status: RecordStatus }) {
  return (
    <Badge
      variant="outline"
      className={cn(
        'h-6',
        status === 'Active' && 'border-primary/20 bg-primary/10 text-primary',
        status === 'Inactive' && 'border-border bg-muted text-muted-foreground',
        status === 'Removed' && 'border-destructive/30 bg-destructive/10 text-destructive',
      )}
    >
      {status}
    </Badge>
  )
}

export function ActiveMandiNote() {
  const locations = useRegistryStore((state) => state.locations)
  const mandi = workingMandi(locations)
  return (
    <p className="rounded-lg border border-gold/40 bg-gold/10 px-3 py-2 text-sm text-foreground">
      Working mandi: <span className="font-medium">{mandi?.name ?? 'None on file'}</span>. Each row keeps a mandiId. This desk uses one working mandi.
    </p>
  )
}

export function ActivityList({ entries }: { entries: ActivityEntry[] }) {
  if (entries.length === 0) {
    return <p className="text-sm text-muted-foreground">No demonstration activity is stored for this row.</p>
  }
  return (
    <ol className="space-y-3">
      {entries.map((entry) => (
        <li key={entry.id} className="rounded-lg border px-3 py-2">
          <p className="text-sm font-medium">{entry.title}</p>
          <p className="text-xs text-muted-foreground">{formatDateTime(entry.at)}</p>
          <p className="mt-1 text-sm text-muted-foreground">{entry.detail}</p>
        </li>
      ))}
    </ol>
  )
}

export function DocumentList({ documents }: { documents: DemoDocument[] }) {
  if (documents.length === 0) {
    return <p className="text-sm text-muted-foreground">No demonstration file is attached.</p>
  }
  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {documents.map((document) => (
        <li key={document.id} className="rounded-lg border p-3">
          {document.previewDataUrl ? (
            <img src={document.previewDataUrl} alt="" className="mb-2 max-h-36 w-full rounded-md object-contain bg-muted" />
          ) : (
            <p className="mb-2 text-xs text-muted-foreground">No image preview. The file name and size are stored in this browser.</p>
          )}
          <p className="text-sm font-medium break-all">{document.name}</p>
          <p className="text-xs text-muted-foreground">
            {document.mimeType || 'file'} · {formatBytes(document.size)}
          </p>
        </li>
      ))}
    </ul>
  )
}

export function formatBytes(size: number) {
  if (size < 1024) return `${size} B`
  return `${(size / 1024).toFixed(1)} KB`
}

export function RemoveDialog({
  open,
  title,
  onCancel,
  onConfirm,
}: {
  open: boolean
  title: string
  onCancel: () => void
  onConfirm: () => void
}) {
  return (
    <Dialog open={open} onOpenChange={(next) => { if (!next) onCancel() }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Remove {title}?</DialogTitle>
          <DialogDescription>
            This marks the demonstration row as Removed. It stays in this browser and can be restored. Nothing is deleted from a mandi office.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onCancel}>
            Keep row
          </Button>
          <Button type="button" variant="destructive" onClick={onConfirm}>
            Mark removed
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function CsvDialog({
  open,
  filename,
  headers,
  exportRows,
  preview,
  onFile,
  onCommit,
  onClose,
}: {
  open: boolean
  filename: string
  headers: string[]
  exportRows: string[][]
  preview: { count: number; issues: CsvIssue[] } | null
  onFile: (text: string) => void
  onCommit: () => void
  onClose: () => void
}) {
  const [reading, setReading] = useState(false)
  return (
    <Dialog open={open} onOpenChange={(next) => { if (!next) onClose() }}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Import a demonstration CSV</DialogTitle>
          <DialogDescription>
            Valid rows are added with new DEMO ids. Existing rows stay as they are. A repeated desk label is rejected.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" onClick={() => downloadCsv(filename, [headers, ...exportRows])}>
              Export current rows
            </Button>
            <Button type="button" variant="outline" onClick={() => downloadCsv(`template-${filename}`, [headers])}>
              Download template
            </Button>
          </div>
          <label className="grid gap-1.5 text-sm">
            CSV file
            <input
              type="file"
              accept=".csv,text/csv"
              className="text-sm"
              onChange={(event) => {
                const file = event.target.files?.[0]
                event.target.value = ''
                if (!file) return
                setReading(true)
                void file.text().then((text) => {
                  onFile(text)
                  setReading(false)
                })
              }}
            />
          </label>
          {reading ? <p className="text-sm text-muted-foreground">Reading the file…</p> : null}
          {preview ? (
            <div className="space-y-2 text-sm">
              <p>{preview.count} row{preview.count === 1 ? '' : 's'} can be added. {preview.issues.length} row{preview.issues.length === 1 ? '' : 's'} failed validation.</p>
              {preview.issues.length > 0 ? (
                <ul className="max-h-40 space-y-1 overflow-auto rounded-lg border p-2 text-xs">
                  {preview.issues.slice(0, 12).map((issue) => (
                    <li key={`${issue.row}-${issue.message}`}>
                      Row {issue.row}: {issue.message}
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          ) : null}
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button type="button" disabled={!preview || preview.count === 0} onClick={onCommit}>
            Add valid rows
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export async function readDemoFile(file: File): Promise<{ document: DemoDocument } | { error: string }> {
  if (file.size > 200_000) return { error: 'Keep each file under 200 KB so it can stay in this browser.' }
  const base: DemoDocument = {
    id: `DOC-${crypto.randomUUID().slice(0, 8)}`,
    name: file.name,
    mimeType: file.type || 'application/octet-stream',
    size: file.size,
    previewDataUrl: null,
    addedAt: new Date().toISOString(),
  }
  if (!file.type.startsWith('image/')) return { document: base }
  const previewDataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(new Error('unreadable'))
    reader.readAsDataURL(file)
  }).catch(() => null)
  if (!previewDataUrl) return { error: 'That image could not be read in this browser.' }
  return { document: { ...base, previewDataUrl } }
}
