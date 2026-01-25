import { usePlanner } from '@/context/PlannerContext';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { BarChart3, TrendingUp, CheckCircle2, AlertCircle, XCircle } from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { subDays, format, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns';

const Performance = () => {
  const { days, getPerformanceData, getWeeklyConsistency } = usePlanner();

  const performanceData = getPerformanceData();
  const weeklyConsistency = getWeeklyConsistency();

  // Calculate stats
  const completedDays = days.filter(d => d.executionScore === 1).length;
  const partialDays = days.filter(d => d.executionScore === 0.5).length;
  const missedDays = days.filter(d => d.executionScore === 0).length;
  const totalDays = days.length;

  const avgScore = totalDays > 0
    ? Math.round((days.reduce((sum, d) => sum + d.executionScore, 0) / totalDays) * 100)
    : 0;

  // Weekly bar chart data
  const weeklyData = [];
  for (let i = 3; i >= 0; i--) {
    const weekStart = startOfWeek(subDays(new Date(), i * 7), { weekStartsOn: 1 });
    const weekEnd = endOfWeek(subDays(new Date(), i * 7), { weekStartsOn: 1 });
    const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });
    
    let weekScore = 0;
    weekDays.forEach(day => {
      const dateStr = format(day, 'yyyy-MM-dd');
      const dayRecord = days.find(d => d.date === dateStr);
      if (dayRecord) {
        weekScore += dayRecord.executionScore;
      }
    });
    
    weeklyData.push({
      week: `Week ${4 - i}`,
      score: Math.round((weekScore / 7) * 100),
    });
  }

  // Pie chart data
  const distributionData = [
    { name: 'Completed', value: completedDays, color: 'hsl(var(--status-completed))' },
    { name: 'Partial', value: partialDays, color: 'hsl(var(--status-partial))' },
    { name: 'Missed', value: missedDays, color: 'hsl(var(--status-missed))' },
  ].filter(d => d.value > 0);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-lg font-semibold text-foreground">{payload[0].value}%</p>
        </div>
      );
    }
    return null;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
            <BarChart3 className="w-7 h-7 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Performance</h1>
            <p className="text-muted-foreground">Track your execution over time</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="dashboard-card-hover">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="stat-label">Avg Score</p>
                <p className="stat-value">{avgScore}%</p>
              </div>
            </div>
          </div>

          <div className="dashboard-card-hover">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-status-completed/10 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-status-completed" />
              </div>
              <div>
                <p className="stat-label">Completed Days</p>
                <p className="stat-value text-status-completed">{completedDays}</p>
              </div>
            </div>
          </div>

          <div className="dashboard-card-hover">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-status-partial/10 flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-status-partial" />
              </div>
              <div>
                <p className="stat-label">Partial Days</p>
                <p className="stat-value text-status-partial">{partialDays}</p>
              </div>
            </div>
          </div>

          <div className="dashboard-card-hover">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-status-missed/10 flex items-center justify-center">
                <XCircle className="w-6 h-6 text-status-missed" />
              </div>
              <div>
                <p className="stat-label">Missed Days</p>
                <p className="stat-value text-status-missed">{missedDays}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Line Chart - Daily Performance */}
          <div className="dashboard-card">
            <h2 className="font-semibold text-foreground mb-6">30-Day Performance</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="date" 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    domain={[0, 100]}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 6, fill: 'hsl(var(--primary))' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Bar Chart - Weekly Performance */}
          <div className="dashboard-card">
            <h2 className="font-semibold text-foreground mb-6">Weekly Performance</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="week" 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    domain={[0, 100]}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar 
                    dataKey="score" 
                    fill="hsl(var(--primary))"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Distribution Chart */}
        <div className="dashboard-card">
          <h2 className="font-semibold text-foreground mb-6">Day Distribution</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={distributionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {distributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--popover))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                    formatter={(value: number, name: string) => [`${value} days`, name]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/50">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full bg-status-completed" />
                  <span className="text-foreground">Completed Days</span>
                </div>
                <span className="font-semibold text-foreground">{completedDays}</span>
              </div>
              <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/50">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full bg-status-partial" />
                  <span className="text-foreground">Partial Days</span>
                </div>
                <span className="font-semibold text-foreground">{partialDays}</span>
              </div>
              <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/50">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full bg-status-missed" />
                  <span className="text-foreground">Missed Days</span>
                </div>
                <span className="font-semibold text-foreground">{missedDays}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Performance;
