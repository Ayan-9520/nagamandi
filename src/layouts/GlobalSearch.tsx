import { Search } from 'lucide-react'
import { useEffect, useId, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Input } from '@/components/ui/input'
import { searchDemo } from '@/services/search-service'
import { useSessionStore } from '@/store/session-store'
import { cn } from '@/utils/cn'

export function GlobalSearch() {
  const navigate = useNavigate()
  const listId = useId()
  const rootRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const roleId = useSessionStore((state) => state.roleId)
  const results = searchDemo(query, roleId)

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        inputRef.current?.focus()
        setOpen(query.trim().length >= 2)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [query])

  useEffect(() => {
    if (!open) return
    function onPointer(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('pointerdown', onPointer)
    return () => document.removeEventListener('pointerdown', onPointer)
  }, [open])

  function go(index: number) {
    const hit = results[index]
    if (!hit) return
    navigate(hit.to)
    setQuery('')
    setOpen(false)
    inputRef.current?.blur()
  }

  return (
    <div ref={rootRef} className="relative min-w-0 flex-1">
      <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
      <Input
        ref={inputRef}
        value={query}
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        aria-autocomplete="list"
        placeholder="Search lots, registers, licences or modules"
        className="h-9 pr-16 pl-8"
        onChange={(event) => {
          const next = event.target.value
          setQuery(next)
          setActiveIndex(0)
          setOpen(next.trim().length >= 2)
        }}
        onFocus={() => setOpen(query.trim().length >= 2)}
        onKeyDown={(event) => {
          if (event.key === 'ArrowDown') {
            event.preventDefault()
            setActiveIndex((current) => Math.min(current + 1, Math.max(results.length - 1, 0)))
          }
          if (event.key === 'ArrowUp') {
            event.preventDefault()
            setActiveIndex((current) => Math.max(current - 1, 0))
          }
          if (event.key === 'Enter' && open) {
            event.preventDefault()
            go(activeIndex)
          }
          if (event.key === 'Escape') setOpen(false)
        }}
      />
      <kbd className="pointer-events-none absolute top-1/2 right-2 hidden -translate-y-1/2 rounded border bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground sm:inline">
        Ctrl K
      </kbd>
      {open ? (
        <div className="absolute z-40 mt-1 w-full overflow-hidden rounded-lg border bg-popover text-popover-foreground shadow-lg">
          {results.length === 0 ? (
            <p className="px-3 py-3 text-sm text-muted-foreground">No demonstration matches.</p>
          ) : (
            <ul id={listId} role="listbox" className="max-h-80 overflow-auto py-1">
              {results.map((hit, index) => (
                <li key={hit.id} role="option" aria-selected={index === activeIndex}>
                  <button
                    type="button"
                    className={cn(
                      'flex w-full flex-col items-start gap-0.5 px-3 py-2 text-left text-sm hover:bg-accent',
                      index === activeIndex && 'bg-accent',
                    )}
                    onMouseEnter={() => setActiveIndex(index)}
                    onClick={() => go(index)}
                  >
                    <span className="font-medium">{hit.title}</span>
                    <span className="text-xs text-muted-foreground">{hit.detail}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}
    </div>
  )
}
