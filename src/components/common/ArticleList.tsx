import { useMemo, useState, type ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const PAGE_SIZE = 4

export function ArticleList<T>({
  rows,
  searchText,
  statusText,
  empty,
  render,
}: {
  rows: T[]
  searchText: (row: T) => string
  statusText?: (row: T) => string
  empty: string
  render: (row: T) => ReactNode
}) {
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('all')
  const [page, setPage] = useState(0)
  function changeQuery(value: string) {
    setQuery(value)
    setPage(0)
  }
  function changeStatus(value: string) {
    setStatus(value)
    setPage(0)
  }
  const statuses = useMemo(() => (statusText ? [...new Set(rows.map(statusText))] : []), [rows, statusText])
  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return rows.filter((row) => {
      if (status !== 'all' && statusText && statusText(row) !== status) return false
      if (!needle) return true
      return searchText(row).toLowerCase().includes(needle)
    })
  }, [rows, query, status, statusText, searchText])
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, Math.max(0, pageCount - 1))
  const start = safePage * PAGE_SIZE
  const visible = filtered.slice(start, start + PAGE_SIZE)

  return (
    <div className="space-y-3">
      <div className="grid gap-3 md:grid-cols-2">
        <div className="grid gap-1.5">
          <Label htmlFor="article-search">Search</Label>
          <Input id="article-search" value={query} placeholder="Number, desk code or name" onChange={(event) => changeQuery(event.target.value)} />
        </div>
        {statusText ? (
          <div className="grid gap-1.5">
            <Label>Status</Label>
            <Select value={status} onValueChange={changeStatus}>
              <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                {statuses.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        ) : null}
      </div>
      {filtered.length === 0 ? <p className="text-sm text-muted-foreground">{empty}</p> : visible.map((row) => render(row))}
      {filtered.length > 0 ? (
        <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-muted-foreground">
          <p>Showing {start + 1}–{start + visible.length} of {filtered.length} demonstration rows</p>
          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" size="sm" disabled={safePage === 0} onClick={() => setPage(safePage - 1)}>Previous</Button>
            <span>Page {safePage + 1} of {pageCount}</span>
            <Button type="button" variant="outline" size="sm" disabled={safePage >= pageCount - 1} onClick={() => setPage(safePage + 1)}>Next</Button>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export function PageSlice<T>({ rows, empty, render }: { rows: T[]; empty: string; render: (row: T) => ReactNode }) {
  const [page, setPage] = useState(0)
  const pageCount = Math.max(1, Math.ceil(rows.length / PAGE_SIZE))
  const safePage = Math.min(page, Math.max(0, pageCount - 1))
  const start = safePage * PAGE_SIZE
  const visible = rows.slice(start, start + PAGE_SIZE)
  if (rows.length === 0) return <p className="text-sm text-muted-foreground">{empty}</p>
  return (
    <div className="space-y-3">
      {visible.map((row) => render(row))}
      <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-muted-foreground">
        <p>Showing {start + 1}–{start + visible.length} of {rows.length} demonstration rows</p>
        <div className="flex items-center gap-2">
          <Button type="button" variant="outline" size="sm" disabled={safePage === 0} onClick={() => setPage(safePage - 1)}>Previous</Button>
          <span>Page {safePage + 1} of {pageCount}</span>
          <Button type="button" variant="outline" size="sm" disabled={safePage >= pageCount - 1} onClick={() => setPage(safePage + 1)}>Next</Button>
        </div>
      </div>
    </div>
  )
}
