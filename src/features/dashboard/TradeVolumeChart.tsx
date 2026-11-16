import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { ChartCard } from '@/components/common/ChartCard'
import { EmptyState } from '@/components/common/EmptyState'
import type { TradeBar } from '@/types/domain'
import { formatLakh } from '@/utils/format'

export function TradeVolumeChart({ series }: { series: TradeBar[] }) {
  const latest = series.at(-1)

  return (
    <ChartCard
      title="Trade volume"
      description={
        latest
          ? `Eight-week demonstration, filtered by yard and commodity. Latest week ${latest.week}: ${formatLakh(latest.volumeLakh)}.`
          : 'Eight-week demonstration. No trade rows match this filter.'
      }
    >
      {series.length === 0 ? (
        <EmptyState
          title="No trade sample in this filter"
          description="Choose another yard or commodity. The arrival window does not change this chart."
        />
      ) : (
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={series} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid stroke="var(--border)" vertical={false} />
              <XAxis dataKey="week" tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }} />
              <YAxis tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }} width={40} />
              <Tooltip
                formatter={(value) => [formatLakh(Number(value)), 'Trade']}
                contentStyle={{
                  background: 'var(--popover)',
                  border: '1px solid var(--border)',
                  borderRadius: 12,
                  color: 'var(--popover-foreground)',
                }}
              />
              <Bar dataKey="volumeLakh" fill="var(--chart-2)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </ChartCard>
  )
}
