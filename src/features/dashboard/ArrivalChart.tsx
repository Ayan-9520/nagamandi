import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { ChartCard } from '@/components/common/ChartCard'
import { EmptyState } from '@/components/common/EmptyState'
import type { ArrivalBar } from '@/types/domain'
import { formatMt } from '@/utils/format'

export function ArrivalChart({ series }: { series: ArrivalBar[] }) {
  const latest = series.at(-1)

  return (
    <ChartCard
      title="Produce arrivals"
      description={
        latest
          ? `Demonstration series. Latest day ${latest.label}: ${formatMt(latest.quantityMt)}.`
          : 'Demonstration series. No arrival days match this filter.'
      }
    >
      {series.length === 0 ? (
        <EmptyState
          title="No arrivals in this window"
          description="Widen the arrival window or clear the yard and commodity filters."
        />
      ) : (
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={series} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid stroke="var(--border)" vertical={false} />
              <XAxis dataKey="label" tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }} interval="preserveStartEnd" />
              <YAxis tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }} width={40} />
              <Tooltip
                formatter={(value) => [formatMt(Number(value)), 'Arrivals']}
                contentStyle={{
                  background: 'var(--popover)',
                  border: '1px solid var(--border)',
                  borderRadius: 12,
                  color: 'var(--popover-foreground)',
                }}
              />
              <Area
                type="monotone"
                dataKey="quantityMt"
                stroke="var(--chart-1)"
                fill="var(--chart-1)"
                fillOpacity={0.18}
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </ChartCard>
  )
}
