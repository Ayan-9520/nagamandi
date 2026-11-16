import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { ChartCard } from '@/components/common/ChartCard'
import type { CommandSnapshot } from '@/services/command-snapshot'

const chartStyle = {
  background: 'var(--popover)',
  border: '1px solid var(--border)',
  borderRadius: 12,
  color: 'var(--popover-foreground)',
}

export function CommandCharts({ snapshot }: { snapshot: CommandSnapshot }) {
  const status = [
    { name: 'On track', count: snapshot.matrix.filter((row) => row.status === 'on-track').length },
    { name: 'Attention', count: snapshot.matrix.filter((row) => row.status === 'attention').length },
    { name: 'Exception', count: snapshot.matrix.filter((row) => row.status === 'exception').length },
  ]
  const departments = [...new Map(snapshot.matrix.map((row) => [row.department, 0])).keys()].map((name) => ({
    name: name.replace(' desk', ''),
    count: snapshot.matrix.filter((row) => row.department === name).reduce((total, row) => total + row.pending.length, 0),
  }))
  const occupancy = [
    { name: 'Warehouses', percent: snapshot.warehousePercent },
    { name: 'Cold storage', percent: snapshot.coldPercent },
    { name: 'Parking', percent: snapshot.parkingPercent },
  ]

  return (
    <div className="grid gap-4 xl:grid-cols-3">
      <ChartCard title="SOP status" description="Fifteen procedures in this browser. Separate from the yard-sample charts.">
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={status}>
              <CartesianGrid stroke="var(--border)" vertical={false} />
              <XAxis dataKey="name" tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }} />
              <YAxis allowDecimals={false} tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }} width={28} />
              <Tooltip contentStyle={chartStyle} />
              <Bar dataKey="count" fill="var(--chart-1)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>
      <ChartCard title="Pending tasks" description="Open tasks by department for the selected dates.">
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={departments}>
              <CartesianGrid stroke="var(--border)" vertical={false} />
              <XAxis dataKey="name" tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }} interval={0} angle={-20} height={48} />
              <YAxis allowDecimals={false} tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }} width={28} />
              <Tooltip contentStyle={chartStyle} />
              <Bar dataKey="count" fill="var(--chart-2)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>
      <ChartCard title="Occupancy" description="Current warehouse, cold storage and parking books. Not the yard-sample chart.">
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={occupancy}>
              <CartesianGrid stroke="var(--border)" vertical={false} />
              <XAxis dataKey="name" tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }} />
              <YAxis tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }} width={28} />
              <Tooltip formatter={(value) => [`${value}%`, 'Occupied']} contentStyle={chartStyle} />
              <Bar dataKey="percent" fill="var(--chart-3)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>
    </div>
  )
}
