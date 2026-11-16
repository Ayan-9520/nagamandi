import { Link } from 'react-router-dom'
import { PageHeader } from '@/components/common/PageHeader'
import { Button } from '@/components/ui/button'

export function NotFoundPage() {
  return (
    <div className="space-y-4">
      <PageHeader
        title="Page not on the desk"
        description="That address is not part of Naga Mandi OS."
      />
      <Button type="button" asChild>
        <Link to="/desk">Back to dashboard</Link>
      </Button>
    </div>
  )
}
