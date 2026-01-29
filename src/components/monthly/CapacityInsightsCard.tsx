import { usePlanner } from '@/context/PlannerContext';
import { DailyCapacity, CAPACITY_LIMITS } from '@/types/planner';
import { Battery, BatteryLow, BatteryFull, AlertTriangle, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, getMonth, getYear, parseISO } from 'date-fns';

const capacityConfig: Record<DailyCapacity, { icon: typeof Battery; label: string; color: string }> = {
  Low: { icon: BatteryLow, label: 'Low', color: 'text-amber-400' },
  Normal: { icon: Battery, label: 'Normal', color: 'text-blue-400' },
  High: { icon: BatteryFull, label: 'High', color: 'text-emerald-400' },
};

interface CapacityInsightsCardProps {
  className?: string;
}

export const CapacityInsightsCard = ({ className }: CapacityInsightsCardProps) => {
  const { days, tasks } = usePlanner();
  
  const now = new Date();
  const currentMonth = getMonth(now);
  const currentYear = getYear(now);
  
  // Get all days for current month
  const monthDays = days.filter(d => {
    const dayDate = parseISO(d.date);
    return getMonth(dayDate) === currentMonth && 
           getYear(dayDate) === currentYear && 
           !d.isArchived;
  });

  // Calculate capacity distribution
  const capacityDistribution = {
    Low: { count: 0, totalScore: 0, overplanned: 0 },
    Normal: { count: 0, totalScore: 0, overplanned: 0 },
    High: { count: 0, totalScore: 0, overplanned: 0 },
  };

  let totalOverplannedDays = 0;

  monthDays.forEach(day => {
    const capacity = day.capacity || 'Normal';
    const dayTasks = tasks.filter(t => t.date === day.date);
    const capacityLimit = CAPACITY_LIMITS[capacity];
    
    capacityDistribution[capacity].count++;
    capacityDistribution[capacity].totalScore += day.executionScore;
    
    if (dayTasks.length > capacityLimit) {
      capacityDistribution[capacity].overplanned++;
      totalOverplannedDays++;
    }
  });

  // Calculate averages
  const capacityData = (Object.keys(capacityDistribution) as DailyCapacity[]).map(capacity => ({
    capacity,
    count: capacityDistribution[capacity].count,
    avgScore: capacityDistribution[capacity].count > 0 
      ? Math.round((capacityDistribution[capacity].totalScore / capacityDistribution[capacity].count) * 100)
      : 0,
    overplanned: capacityDistribution[capacity].overplanned,
    ...capacityConfig[capacity],
  }));

  const overplanningRate = monthDays.length > 0 
    ? Math.round((totalOverplannedDays / monthDays.length) * 100) 
    : 0;

  // Find best performing capacity level
  const bestCapacity = capacityData
    .filter(c => c.count > 0)
    .reduce((best, current) => 
      current.avgScore > best.avgScore ? current : best,
      { avgScore: 0, capacity: 'Normal' as DailyCapacity, label: 'None', count: 0, overplanned: 0, icon: Battery, color: 'text-blue-400' }
    );

  return (
    <div className={cn("p-6 rounded-xl bg-secondary/30 border border-border", className)}>
      <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
        <TrendingUp className="w-4 h-4 text-primary" />
        Capacity Trends
      </h3>

      {/* Capacity Performance Grid */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {capacityData.map(({ capacity, count, avgScore, icon: Icon, color, label }) => (
          <div 
            key={capacity}
            className={cn(
              "p-3 rounded-lg bg-background/50 border border-border text-center",
              count > 0 && avgScore >= 70 && "ring-1 ring-status-completed/30"
            )}
          >
            <Icon className={cn("w-5 h-5 mx-auto mb-2", color)} />
            <p className="text-xs text-muted-foreground mb-1">{label}</p>
            <p className="text-lg font-bold text-foreground">
              {count > 0 ? `${avgScore}%` : '—'}
            </p>
            <p className="text-xs text-muted-foreground">{count} days</p>
          </div>
        ))}
      </div>

      {/* Overplanning Alert */}
      {totalOverplannedDays > 0 && (
        <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <span className="text-sm font-medium text-amber-500">Overplanning Pattern</span>
          </div>
          <p className="text-xs text-muted-foreground">
            {totalOverplannedDays} of {monthDays.length} days ({overplanningRate}%) exceeded capacity limits
          </p>
        </div>
      )}

      {/* Best Performing Capacity */}
      {bestCapacity.count > 0 && (
        <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
          <p className="text-xs text-muted-foreground mb-1">Best performing capacity</p>
          <p className="text-sm font-medium text-foreground flex items-center gap-2">
            {(() => {
              const BestIcon = capacityConfig[bestCapacity.capacity].icon;
              return <BestIcon className={cn("w-4 h-4", capacityConfig[bestCapacity.capacity].color)} />;
            })()}
            {bestCapacity.label} ({bestCapacity.avgScore}% avg)
          </p>
        </div>
      )}

      {monthDays.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-4">
          No data for {format(now, 'MMMM')} yet
        </p>
      )}
    </div>
  );
};
