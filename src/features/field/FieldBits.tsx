import { useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom'
import { ClipboardCheck, ParkingSquare, QrCode, Smartphone, Truck, Warehouse } from 'lucide-react'
import { hasModule } from '@/services/field-rules'
import { useFieldStore } from '@/store/field-store'
import { useSessionStore } from '@/store/session-store'
import { cn } from '@/utils/cn'

export function useOnline() {
  const [online, setOnline] = useState(() => navigator.onLine)
  useEffect(() => {
    const up = () => setOnline(true)
    const down = () => setOnline(false)
    window.addEventListener('online', up)
    window.addEventListener('offline', down)
    return () => {
      window.removeEventListener('online', up)
      window.removeEventListener('offline', down)
    }
  }, [])
  return online
}

export function FieldNotice() {
  return (
    <p className="rounded-lg border border-gold/40 bg-gold/10 px-3 py-2 text-sm text-gold-foreground">
      DEMO / SIMULATED. Offline mode saves drafts on this device. Payments, licences, financial postings and approvals are not completed offline.
    </p>
  )
}

export function ConnectionStatus() {
  const online = useOnline()
  const ready = useFieldStore((state) => state.ready)
  const drafts = useFieldStore((state) => state.drafts)
  const saved = drafts.filter((row) => row.status === 'saved').length
  const conflict = drafts.filter((row) => row.status === 'conflict').length
  const synced = drafts.filter((row) => row.status === 'synced').length
  return (
    <p className="text-sm">
      {online ? 'Online' : 'Offline'} · {ready ? `${saved} ${saved === 1 ? 'draft' : 'drafts'} waiting` : 'Drafts loading'} · {conflict} {conflict === 1 ? 'conflict' : 'conflicts'} · {synced} synced
    </p>
  )
}

const links = [
  { to: '/field', label: 'Field', icon: Smartphone, module: '' },
  { to: '/field/arrival', label: 'Arrive', icon: Truck, module: 'arrivals' },
  { to: '/field/inspection', label: 'Inspect', icon: ClipboardCheck, module: 'arrivals' },
  { to: '/field/parchi', label: 'Parchi', icon: QrCode, module: 'trading' },
  { to: '/field/parking', label: 'Park', icon: ParkingSquare, module: 'parking' },
  { to: '/field/facilities', label: 'Sites', icon: Warehouse, module: 'facilities' },
]

export function FieldBottomNav() {
  const roleId = useSessionStore((state) => state.roleId)
  if (!roleId) return null
  const items = links.filter((item) => item.module === '' || hasModule(roleId, item.module))
  return (
    <nav className="no-print fixed inset-x-0 bottom-0 z-40 border-t bg-card md:hidden" aria-label="Field">
      <ul className="grid grid-cols-3 gap-1 px-2 py-2 sm:grid-cols-6">
        {items.map((item) => (
          <li key={item.to}>
            <NavLink
              to={item.to}
              end={item.to === '/field'}
              className={({ isActive }) => cn('flex flex-col items-center gap-1 rounded-lg px-1 py-1 text-[11px]', isActive ? 'bg-primary/15 text-primary' : 'text-muted-foreground')}
            >
              <item.icon className="size-4" aria-hidden />
              {item.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}

export function readPhoto(file: File) {
  if (file.size > 400_000) return Promise.reject(new Error('Choose a photo under 400 KB.'))
  return new Promise<{ name: string; dataUrl: string }>((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(new Error('That photo could not be read.'))
    reader.onload = () => resolve({ name: file.name, dataUrl: String(reader.result) })
    reader.readAsDataURL(file)
  })
}
