import { useCallback, useEffect, useState } from 'react'
import { loadDashboard } from '@/services/dashboard-service'
import { useDemoStore } from '@/store/demo-store'
import type { DashboardFilter, DashboardSnapshot, LoadState } from '@/types/domain'

export function useDashboard(filters: DashboardFilter) {
  const scenario = useDemoStore((state) => state.scenario)
  const [data, setData] = useState<DashboardSnapshot | null>(null)
  const [state, setState] = useState<LoadState>('loading')
  const [error, setError] = useState<string | null>(null)
  const [requestId, setRequestId] = useState(0)
  const requestKey = `${requestId}:${scenario}:${JSON.stringify(filters)}`
  const [seenKey, setSeenKey] = useState(requestKey)
  if (seenKey !== requestKey) {
    setSeenKey(requestKey)
    setState('loading')
    setError(null)
  }

  const reload = useCallback(() => {
    setRequestId((current) => current + 1)
  }, [])

  useEffect(() => {
    let cancelled = false

    loadDashboard(filters, scenario)
      .then((snapshot) => {
        if (cancelled) return
        setData(snapshot)
        const isEmpty =
          snapshot.arrivalSeries.length === 0 &&
          snapshot.tradeSeries.length === 0 &&
          snapshot.lots.length === 0 &&
          snapshot.activeLicences === 0
        setState(isEmpty ? 'empty' : 'success')
      })
      .catch((reason: unknown) => {
        if (cancelled) return
        setData(null)
        setError(reason instanceof Error ? reason.message : 'The demonstration feed failed.')
        setState('error')
      })

    return () => {
      cancelled = true
    }
  }, [filters, scenario, requestId])

  return { data, state, error, reload, refreshing: state === 'loading' && data !== null }
}
