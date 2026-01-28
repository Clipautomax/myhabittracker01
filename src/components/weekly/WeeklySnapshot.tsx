import { usePlanner } from '@/context/PlannerContext';
import { format, parseISO } from 'date-fns';
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

export const WeeklySnapshot = () => {
  const { getWeeklyInsight, getMostDelayedTasks, getAtRiskTasks } = usePlanner();
  const insight = getWeeklyInsight();
  const mostDelayedTasks = getMostDelayedTasks(3);
  const atRiskTasks = getAtRiskTasks();

  const totalDays = insight.completedDays + insight.partialDays + insight.missedDays;
  const performanceText = insight.averageScore >= 70 
    ? 'Strong execution' 
    : insight.averageScore >= 40 
    ? 'Room for improvement' 
    : 'Needs attention';

  return (
    <div className="dashboard-card">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-semibold text-foreground">Weekly Reality</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            {format(parseISO(insight.weekStartDate), 'MMM d')} - {format(parseISO(insight.weekEndDate), 'MMM d')}
          </p>
        </div>
        <div className={cn(
          "px-3 py-1 rounded-full text-xs font-medium",
          insight.averageScore >= 70 && "bg-[hsl(var(--status-completed))]/20 text-[hsl(var(--status-completed))]",
          insight.averageScore >= 40 && insight.averageScore < 70 && "bg-[hsl(var(--status-partial))]/20 text-[hsl(var(--status-partial))]",
          insight.averageScore < 40 && "bg-[hsl(var(--status-missed))]/20 text-[hsl(var(--status-missed))]"
        )}>
          {performanceText}
        </div>
      </div>

      {/* Performance Score */}
      <div className="mb-6">
        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-4xl font-bold text-foreground">{insight.averageScore}%</span>
          <span className="text-sm text-muted-foreground">avg. score</span>
        </div>
        <div className="h-2 rounded-full bg-muted overflow-hidden">
          <div 
            className={cn(
              "h-full rounded-full transition-all",
              insight.averageScore >= 70 && "bg-[hsl(var(--status-completed))]",
              insight.averageScore >= 40 && insight.averageScore < 70 && "bg-[hsl(var(--status-partial))]",
              insight.averageScore < 40 && "bg-[hsl(var(--status-missed))]"
            )}
            style={{ width: `${insight.averageScore}%` }}
          />
        </div>
      </div>

      {/* Day Distribution */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="p-3 rounded-xl bg-[hsl(var(--status-completed))]/10 border border-[hsl(var(--status-completed))]/20">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle2 className="w-4 h-4 text-[hsl(var(--status-completed))]" />
            <span className="text-xs text-muted-foreground">Completed</span>
          </div>
          <span className="text-2xl font-bold text-foreground">{insight.completedDays}</span>
        </div>
        
        <div className="p-3 rounded-xl bg-[hsl(var(--status-partial))]/10 border border-[hsl(var(--status-partial))]/20">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-4 h-4 text-[hsl(var(--status-partial))]" />
            <span className="text-xs text-muted-foreground">Partial</span>
          </div>
          <span className="text-2xl font-bold text-foreground">{insight.partialDays}</span>
        </div>
        
        <div className="p-3 rounded-xl bg-[hsl(var(--status-missed))]/10 border border-[hsl(var(--status-missed))]/20">
          <div className="flex items-center gap-2 mb-1">
            <XCircle className="w-4 h-4 text-[hsl(var(--status-missed))]" />
            <span className="text-xs text-muted-foreground">Missed</span>
          </div>
          <span className="text-2xl font-bold text-foreground">{insight.missedDays}</span>
        </div>
      </div>

      {/* Capacity Performance */}
      <div className="mb-4">
        <p className="text-sm text-muted-foreground mb-2">Performance by Capacity</p>
        <div className="space-y-2">
          {(['Low', 'Normal', 'High'] as const).map((cap) => {
            const stats = insight.performanceByCapacity[cap];
            if (stats.days === 0) return null;
            return (
              <div key={cap} className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{cap} capacity</span>
                <span className="font-medium text-foreground">
                  {stats.avgScore}% <span className="text-xs text-muted-foreground">({stats.days}d)</span>
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Overplanning Alert */}
      {insight.overplanningCount > 0 && (
        <div className="mb-4 p-3 rounded-lg bg-amber-400/10 border border-amber-400/20">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span className="text-sm text-amber-400">
              Overplanned {insight.overplanningCount} day{insight.overplanningCount > 1 ? 's' : ''} this week
            </span>
          </div>
        </div>
      )}

      {/* Tasks Summary */}
      <div className="flex items-center justify-between py-3 border-t border-border">
        <span className="text-sm text-muted-foreground">Tasks completed</span>
        <span className="font-medium text-foreground">{insight.totalTasksCompleted}</span>
      </div>
      <div className="flex items-center justify-between py-3 border-t border-border">
        <span className="text-sm text-muted-foreground">Tasks migrated</span>
        <span className="font-medium text-foreground">{insight.totalTasksMigrated}</span>
      </div>

      {/* Most Delayed Task */}
      {insight.mostDelayedTask && (
        <div className="mt-4 pt-4 border-t border-border">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-4 h-4 text-[hsl(var(--status-partial))]" />
            <span className="text-sm font-medium text-foreground">Most Delayed</span>
          </div>
          <div className="p-3 rounded-lg bg-[hsl(var(--status-partial))]/10 border border-[hsl(var(--status-partial))]/20">
            <p className="font-medium text-foreground truncate">{insight.mostDelayedTask.title}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Migrated {insight.mostDelayedTask.migratedCount} times
            </p>
          </div>
        </div>
      )}

      {/* At Risk Tasks */}
      {atRiskTasks.length > 0 && (
        <div className="mt-4 pt-4 border-t border-border">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-4 h-4 text-[hsl(var(--status-missed))]" />
            <span className="text-sm font-medium text-foreground">At Risk ({atRiskTasks.length})</span>
          </div>
          <div className="space-y-2">
            {atRiskTasks.slice(0, 3).map(task => (
              <div 
                key={task.id}
                className="p-2 rounded-lg bg-[hsl(var(--status-missed))]/10 border border-[hsl(var(--status-missed))]/20"
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-foreground truncate flex-1">{task.title}</p>
                  <span className="text-xs px-1.5 py-0.5 rounded bg-[hsl(var(--status-migrated))]/20 text-[hsl(var(--status-migrated))]">
                    ↻{task.migratedCount}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
