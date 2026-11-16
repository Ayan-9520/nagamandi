import type { DemoNotification } from '@/types/domain'

export const notifications: DemoNotification[] = [
  {
    id: 'DEMO-NOTE-1',
    title: 'Dimapur gate queue',
    body: 'Sample only: six vehicles are past the twenty-minute gate mark.',
    at: '2026-11-14T08:40:00+05:30',
    tone: 'warning',
  },
  {
    id: 'DEMO-NOTE-2',
    title: 'Licences expiring this week',
    body: 'Sample only: 36 Dimapur licences sit in the expiring band.',
    at: '2026-11-14T07:55:00+05:30',
    tone: 'info',
  },
  {
    id: 'DEMO-NOTE-3',
    title: 'Kohima weighbridge',
    body: 'Sample only: the morning weighment window is open.',
    at: '2026-11-14T07:10:00+05:30',
    tone: 'success',
  },
  {
    id: 'DEMO-NOTE-4',
    title: 'Cold room offline',
    body: 'Sample only: one Tuensang chamber is marked offline in the demonstration.',
    at: '2026-11-13T18:20:00+05:30',
    tone: 'warning',
  },
]

export const notificationIds = notifications.map((item) => item.id)
