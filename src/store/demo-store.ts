import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { notificationIds } from '@/mocks/notifications'
import { storageKeys } from '@/services/storage'
import type { DataScenario } from '@/types/domain'

interface DemoState {
  scenario: DataScenario
  readIds: string[]
  notes: Record<string, string>
  setScenario: (scenario: DataScenario) => void
  markRead: (id: string) => void
  markAllRead: () => void
  setNote: (lotId: string, note: string) => void
  resetDemo: () => void
}

export const useDemoStore = create<DemoState>()(
  persist(
    (set, get) => ({
      scenario: 'success',
      readIds: [],
      notes: {},
      setScenario: (scenario) => set({ scenario }),
      markRead: (id) => {
        if (get().readIds.includes(id)) return
        set({ readIds: [...get().readIds, id] })
      },
      markAllRead: () => set({ readIds: notificationIds }),
      setNote: (lotId, note) => set({ notes: { ...get().notes, [lotId]: note } }),
      resetDemo: () => set({ scenario: 'success', readIds: [], notes: {} }),
    }),
    { name: storageKeys.demo },
  ),
)
