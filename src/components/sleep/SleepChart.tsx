import { usePlanner } from '@/context/PlannerContext';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Moon, TrendingUp } from 'lucide-react';
import { format, subDays } from 'date-fns';

interface SleepChartProps {
  days?: number;
}

export const SleepChart = ({ days = 7 }: SleepChartProps) => {
  const { days: dayRecords } = usePlanner();

  // Get last N days of sleep data
  const chartData = [];
  let totalSleep = 0;
  let daysWithData = 0;

  for (let i = days - 1; i >= 0; i--) {
    const date = format(subDays(new Date(), i), 'yyyy-MM-dd');
    const dayRecord = dayRecords.find(d => d.date === date);
    const sleep = dayRecord?.sleepDuration || 0;
    
    if (sleep > 0) {
      totalSleep += sleep;
      daysWithData++;
    }

    chartData.push({
      day: format(subDays(new Date(), i), 'EEE'),
      date: format(subDays(new Date(), i), 'MMM d'),
      hours: sleep,
      fullDate: date,
    });
  }

  const weeklyAverage = daysWithData > 0 ? totalSleep / daysWithData : 0;
  const targetHours = 8;

  const formatHours = (hours: number): string => {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h}h ${m > 0 ? m + 'm' : ''}`;
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="text-sm text-muted-foreground">{data.date}</p>
          <p className="text-lg font-semibold text-foreground">
            {data.hours > 0 ? formatHours(data.hours) : 'No data'}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="dashboard-card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Moon className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-foreground">Sleep Overview</h3>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground">Avg:</span>
            <span className="font-medium text-foreground">
              {daysWithData > 0 ? formatHours(weeklyAverage) : '--'}
            </span>
          </div>
        </div>
      </div>

      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
            <XAxis 
              dataKey="day" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
              domain={[0, 12]}
              ticks={[0, 4, 8, 12]}
            />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine 
              y={targetHours} 
              stroke="hsl(var(--primary))" 
              strokeDasharray="3 3" 
              strokeOpacity={0.5}
            />
            <Bar 
              dataKey="hours" 
              fill="hsl(var(--primary))"
              radius={[4, 4, 0, 0]}
              maxBarSize={40}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-border mt-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-primary" />
          <span className="text-muted-foreground">Sleep hours</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-0.5 border-t-2 border-dashed border-primary opacity-50" />
          <span className="text-muted-foreground">8h target</span>
        </div>
      </div>
    </div>
  );
};
