import { ShieldAlert } from 'lucide-react'

export function SimulationBanner({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <p className="no-print flex items-center gap-2 border-b border-gold/30 bg-gold/15 px-4 py-2 text-xs text-gold-foreground">
        <ShieldAlert className="size-3.5 shrink-0" aria-hidden />
        <span>Demonstration session in this browser. It does not identify an officer or protect a record.</span>
      </p>
    )
  }

  return (
    <div className="no-print rounded-xl border border-gold/40 bg-gold/15 px-4 py-3 text-sm text-gold-foreground">
      <p className="flex items-center gap-2 font-medium">
        <ShieldAlert className="size-4 shrink-0" aria-hidden />
        Simulated sign-in
      </p>
      <p className="mt-1">
        Login and permissions are a demonstration in this browser. They do not identify an officer or protect a record.
      </p>
    </div>
  )
}
