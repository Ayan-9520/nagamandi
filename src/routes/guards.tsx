import { useEffect } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { isRoleId } from '@/mocks/accounts'
import { isPathAllowed } from '@/services/access'
import { useSessionStore } from '@/store/session-store'

export function SessionGate() {
  const hydrated = useSessionStore((state) => state.hydrated)
  const signedIn = useSessionStore((state) => state.signedIn)
  const roleId = useSessionStore((state) => state.roleId)
  const signOut = useSessionStore((state) => state.signOut)
  const location = useLocation()
  const roleIsValid = isRoleId(roleId)

  useEffect(() => {
    if (hydrated && signedIn && !roleIsValid) signOut()
  }, [hydrated, roleIsValid, signOut, signedIn])

  if (!hydrated) {
    return (
      <div className="grid min-h-svh place-items-center bg-background px-6 text-sm text-muted-foreground">
        Checking the demonstration session…
      </div>
    )
  }

  if (!signedIn || !roleIsValid) {
    return <Navigate to="/" replace state={{ from: location.pathname }} />
  }

  return <Outlet />
}

export function AccessGate() {
  const roleId = useSessionStore((state) => state.roleId)
  const location = useLocation()

  if (!roleId || !isPathAllowed(roleId, location.pathname)) {
    return <Navigate to="/unauthorized" replace state={{ from: location.pathname }} />
  }

  return <Outlet />
}

export function GuestGate() {
  const hydrated = useSessionStore((state) => state.hydrated)
  const signedIn = useSessionStore((state) => state.signedIn)

  if (!hydrated) {
    return (
      <div className="grid min-h-svh place-items-center bg-background px-6 text-sm text-muted-foreground">
        Checking the demonstration session…
      </div>
    )
  }

  if (signedIn) return <Navigate to="/desk" replace />
  return <Outlet />
}
