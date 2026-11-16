import { Suspense, lazy, type ComponentType } from 'react'
import { LoadingState } from '@/components/common/LoadingState'

export function loadPage(importer: () => Promise<Record<string, ComponentType<never>>>, name: string) {
  const Page = lazy(() => importer().then((mod) => ({ default: mod[name] as ComponentType<Record<string, unknown>> })))
  return function Loaded(props: Record<string, unknown>) {
    return (
      <Suspense fallback={<LoadingState label="Opening the demonstration page" />}>
        <Page {...props} />
      </Suspense>
    )
  }
}
