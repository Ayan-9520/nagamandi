import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { storageKeys } from '@/services/storage'
import type { ThemeMode } from '@/types/domain'

const defaultDeskLabel = 'Demonstration desk'

interface UiState {
  theme: ThemeMode
  sidebarCollapsed: boolean
  deskLabel: string
  setTheme: (theme: ThemeMode) => void
  toggleTheme: () => void
  toggleSidebar: () => void
  setDeskLabel: (deskLabel: string) => void
  resetUi: () => void
}

export const useUiStore = create<UiState>()(
  persist(
    (set, get) => ({
      theme: 'light',
      sidebarCollapsed: false,
      deskLabel: defaultDeskLabel,
      setTheme: (theme) => set({ theme }),
      toggleTheme: () => set({ theme: get().theme === 'light' ? 'dark' : 'light' }),
      toggleSidebar: () => set({ sidebarCollapsed: !get().sidebarCollapsed }),
      setDeskLabel: (deskLabel) => set({ deskLabel }),
      resetUi: () =>
        set({
          theme: 'light',
          sidebarCollapsed: false,
          deskLabel: defaultDeskLabel,
        }),
    }),
    { name: storageKeys.ui },
  ),
)
