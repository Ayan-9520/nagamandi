import { Link, useLocation } from 'react-router-dom'
import { PageHeader } from '@/components/common/PageHeader'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { findNavItemByPath } from '@/mocks/navigation'

export function LaterPhasePage() {
  const location = useLocation()
  const item = findNavItemByPath(location.pathname)

  return (
    <div className="space-y-4">
      <PageHeader
        eyebrow="NOT IN THIS PHASE"
        title={item?.title ?? 'Module'}
        description="This section is on the operating map. Its workflows are not part of this build, so there is nothing to submit, approve or settle here."
      />
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>{item?.sop ?? 'Later phase'}</CardTitle>
          <CardDescription>{item?.summary}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            This build has the desk shell and a simulated sign-in. Open the dashboard to review the fictional operating sample.
          </p>
          <Button type="button" asChild>
            <Link to="/desk">Back to dashboard</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
