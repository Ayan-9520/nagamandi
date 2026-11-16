import { CartesianGrid, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { ChartCard } from '@/components/common/ChartCard'
import { EmptyState } from '@/components/common/EmptyState'
import { formatTenths } from '@/services/cold-rules'
import type { Chamber, TemperatureReading } from '@/types/cold-storage'

export function TemperatureChart({ chamber, readings }: { chamber: Chamber; readings: TemperatureReading[] }) {
  const series = [...readings].reverse().map((row) => ({
    label: row.at.slice(11, 16),
    celsius: row.tenths / 10,
    source: row.source === 'manual' ? 'Manual entry' : 'Sample script',
  }))

  return (
    <ChartCard
      title={`${chamber.code} history`}
      description={`Demo band ${formatTenths(chamber.minTenths)} to ${formatTenths(chamber.maxTenths)}. The line is a sample, not a live probe.`}
    >
      {series.length === 0 ? (
        <EmptyState title="No readings for this chamber" description="Record a manual entry or add the next sample reading." />
      ) : (
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={series} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid stroke="var(--border)" vertical={false} />
              <XAxis dataKey="label" tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }} />
              <YAxis tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }} width={40} unit="°" />
              <Tooltip
                formatter={(value) => [`${Number(value).toFixed(1)}°C`, 'Reading']}
                contentStyle={{
                  background: 'var(--popover)',
                  border: '1px solid var(--border)',
                  borderRadius: 12,
                  color: 'var(--popover-foreground)',
                }}
              />
              <ReferenceLine y={chamber.minTenths / 10} stroke="var(--chart-4)" strokeDasharray="4 4" />
              <ReferenceLine y={chamber.maxTenths / 10} stroke="var(--chart-4)" strokeDasharray="4 4" />
              <Line type="monotone" dataKey="celsius" stroke="var(--chart-2)" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </ChartCard>
  )
}
