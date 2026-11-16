import type { LucideIcon } from 'lucide-react'
import {
  BadgeCheck,
  BarChart3,
  Building2,
  IndianRupee,
  LayoutDashboard,
  Smartphone,
  ParkingSquare,
  Scale,
  Settings,
  ShieldCheck,
  Snowflake,
  Sprout,
  Truck,
  Users,
  Warehouse,
} from 'lucide-react'
import type { NavItem } from '@/types/domain'

const icons: Record<NavItem['icon'], LucideIcon> = {
  dashboard: LayoutDashboard,
  field: Smartphone,
  stakeholders: Users,
  licences: BadgeCheck,
  arrivals: Truck,
  trading: Scale,
  finance: IndianRupee,
  warehouses: Warehouse,
  'cold-storage': Snowflake,
  'post-harvest': Sprout,
  parking: ParkingSquare,
  facilities: Building2,
  compliance: ShieldCheck,
  reports: BarChart3,
  settings: Settings,
}

export function NavIcon({ name, className }: { name: NavItem['icon']; className?: string }) {
  const Icon = icons[name]
  return <Icon className={className} aria-hidden />
}
