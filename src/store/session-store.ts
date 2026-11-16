import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { accountForRole } from '@/services/access'
import { storageKeys } from '@/services/storage'
import type { RoleId } from '@/types/access'

interface SessionState {
  hydrated: boolean
  signedIn: boolean
  accountId: string | null
  roleId: RoleId | null
  signIn: (accountId: string, roleId: RoleId) => void
  switchRole: (roleId: RoleId) => void
  signOut: () => void
  setHydrated: () => void
}

export const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      hydrated: false,
      signedIn: false,
      accountId: null,
      roleId: null,
      signIn: (accountId, roleId) => set({ signedIn: true, accountId, roleId }),
      switchRole: (roleId) => {
        const account = accountForRole(roleId)
        set({ signedIn: true, accountId: account.id, roleId: account.roleId })
      },
      signOut: () => set({ signedIn: false, accountId: null, roleId: null }),
      setHydrated: () => set({ hydrated: true }),
    }),
    {
      name: storageKeys.session,
      partialize: (state) => ({
        signedIn: state.signedIn,
        accountId: state.accountId,
        roleId: state.roleId,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated()
      },
    },
  ),
)

if (useSessionStore.persist.hasHydrated()) {
  useSessionStore.getState().setHydrated()
}

useSessionStore.persist.onFinishHydration(() => {
  useSessionStore.getState().setHydrated()
})
