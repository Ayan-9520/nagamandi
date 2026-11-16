import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import { ChartCard } from '@/components/common/ChartCard'
import { EmptyState } from '@/components/common/EmptyState'
import type { LicenceSlice, LicenceStatus } from '@/types/domain'
import { formatNumber } from '@/utils/format'

const colors: Record<LicenceStatus, string> = {
  Active: 'var(--chart-1)',
  Expiring: 'var(--chart-2)',
  Suspended: 'var(--chart-5)',
  Pending: 'var(--chart-4)',
}

export function LicenceStatusChart({ series }: { series: LicenceSlice[] }) {
  const visible = series.filter((slice) => slice.count > 0)
  const total = series.reduce((sum, slice) => sum + slice.count, 0)

  return (
    <ChartCard
      title="Licence status"
      description={
        total
          ? `Demonstration mix after the yard filter. ${formatNumber(total)} licences in view. Commodity does not change this chart.`
          : 'Demonstration mix. No licences match this yard filter.'
      }
    >
      {visible.length === 0 ? (
        <EmptyState
          title="No licences in this sample"
          description="Switch the sample back to the operating set, or choose another yard."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_11rem] sm:items-center">
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={visible} dataKey="count" nameKey="status" innerRadius={52} outerRadius={78} paddingAngle={2} stroke="transparent">
                  {visible.map((slice) => (
                    <Cell key={slice.status} fill={colors[slice.status]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value, name) => [formatNumber(Number(value)), String(name)]}
                  contentStyle={{
                    background: 'var(--popover)',
                    border: '1px solid var(--border)',
                    borderRadius: 12,
                    color: 'var(--popover-foreground)',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <ul className="space-y-2 text-sm">
            {series.map((slice) => (
              <li key={slice.status} className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-2">
                  <span className="size-2.5 rounded-full" style={{ background: colors[slice.status] }} />
                  {slice.status}
                </span>
                <span className="font-medium tabular-nums">{formatNumber(slice.count)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </ChartCard>
  )
}
