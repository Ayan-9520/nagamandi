import { useMemo, useState, type ReactNode } from 'react'
import { ChevronDown, ChevronUp, ChevronsUpDown } from 'lucide-react'
import { EmptyState } from '@/components/common/EmptyState'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { cn } from '@/utils/cn'

export interface RegistryColumn<T> {
  id: string
  header: string
  cell: (row: T) => ReactNode
  sortValue?: (row: T) => string | number
  className?: string
}

const PAGE_SIZE = 4

export function RegistryTable<T>({
  columns,
  rows,
  getRowId,
  caption,
  emptyTitle,
  emptyDescription,
  resetKey,
}: {
  columns: RegistryColumn<T>[]
  rows: T[]
  getRowId: (row: T) => string
  caption: string
  emptyTitle: string
  emptyDescription: string
  resetKey: string
}) {
  const [sort, setSort] = useState<{ id: string; direction: 'asc' | 'desc' } | null>(null)
  const [page, setPage] = useState(0)
  const [pageKey, setPageKey] = useState(resetKey)
  if (pageKey !== resetKey) {
    setPageKey(resetKey)
    setPage(0)
  }

  const sorted = useMemo(() => {
    if (!sort) return rows
    const column = columns.find((item) => item.id === sort.id)
    if (!column?.sortValue) return rows
    return [...rows].sort((left, right) => {
      const a = column.sortValue?.(left) ?? ''
      const b = column.sortValue?.(right) ?? ''
      const result = a < b ? -1 : a > b ? 1 : 0
      return sort.direction === 'asc' ? result : -result
    })
  }, [columns, rows, sort])

  const pageCount = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE))
  const safePage = Math.min(page, pageCount - 1)
  const start = safePage * PAGE_SIZE
  const visible = sorted.slice(start, start + PAGE_SIZE)

  function toggleSort(id: string) {
    setSort((current) => {
      if (current?.id !== id) return { id, direction: 'asc' }
      if (current.direction === 'asc') return { id, direction: 'desc' }
      return null
    })
    setPage(0)
  }

  if (rows.length === 0) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />
  }

  return (
    <div className="space-y-3">
      <Table>
        <caption className="sr-only">{caption}</caption>
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <TableHead key={column.id} className={column.className}>
                {column.sortValue ? (
                  <button type="button" className="inline-flex items-center gap-1 text-left" onClick={() => toggleSort(column.id)}>
                    {column.header}
                    {sort?.id === column.id ? (
                      sort.direction === 'asc' ? <ChevronUp className="size-3.5" aria-hidden /> : <ChevronDown className="size-3.5" aria-hidden />
                    ) : (
                      <ChevronsUpDown className="size-3.5 opacity-40" aria-hidden />
                    )}
                    <span className="sr-only">{sort?.id === column.id ? `, sorted ${sort.direction}ending` : ', sortable'}</span>
                  </button>
                ) : (
                  column.header
                )}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {visible.map((row) => (
            <TableRow key={getRowId(row)}>
              {columns.map((column) => (
                <TableCell key={column.id} className={cn(column.className)}>
                  {column.cell(row)}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-muted-foreground">
        <p>
          Showing {start + 1}–{start + visible.length} of {sorted.length} demonstration rows
        </p>
        <div className="flex items-center gap-2">
          <Button type="button" variant="outline" size="sm" disabled={safePage === 0} onClick={() => setPage(safePage - 1)}>
            Previous
          </Button>
          <span>
            Page {safePage + 1} of {pageCount}
          </span>
          <Button type="button" variant="outline" size="sm" disabled={safePage >= pageCount - 1} onClick={() => setPage(safePage + 1)}>
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}
