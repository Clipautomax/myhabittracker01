import { usePlanner } from '@/context/PlannerContext';
import { DailyCapacity, CAPACITY_LIMITS } from '@/types/planner';
import { cn } from '@/lib/utils';
import { Battery, BatteryLow, BatteryFull, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

const capacityConfig: Record<DailyCapacity, { icon: typeof Battery; label: string; color: string }> = {
  Low: { icon: BatteryLow, label: 'Low', color: 'text-amber-400' },
  Normal: { icon: Battery, label: 'Normal', color: 'text-blue-400' },
  High: { icon: BatteryFull, label: 'High', color: 'text-emerald-400' },
};

export const CapacitySelector = () => {
  const { getTodayCapacity, setTodayCapacity, getTodayTasks, isOverplanned } = usePlanner();
  
  const currentCapacity = getTodayCapacity();
  const todayTasks = getTodayTasks();
  const today = format(new Date(), 'yyyy-MM-dd');
  const overplanned = isOverplanned(today);
  const limit = CAPACITY_LIMITS[currentCapacity];

  return (
    <div className="dashboard-card">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-foreground">Today's Capacity</h3>
          <p className="text-sm text-muted-foreground mt-0.5">
            {todayTasks.length} / {limit} tasks
          </p>
        </div>
        {overplanned && (
          <div className="flex items-center gap-2 text-amber-400 bg-amber-400/10 px-3 py-1.5 rounded-lg">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm">Overplanned</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-3 gap-2">
        {(Object.keys(capacityConfig) as DailyCapacity[]).map((capacity) => {
          const config = capacityConfig[capacity];
          const Icon = config.icon;
          const isSelected = currentCapacity === capacity;

          return (
            <button
              key={capacity}
              onClick={() => setTodayCapacity(capacity)}
              className={cn(
                "flex flex-col items-center gap-2 p-3 rounded-xl border transition-all",
                isSelected
                  ? "bg-primary/10 border-primary"
                  : "bg-secondary/50 border-border hover:bg-secondary hover:border-muted-foreground/30"
              )}
            >
              <Icon className={cn("w-5 h-5", isSelected ? config.color : "text-muted-foreground")} />
              <span className={cn(
                "text-sm font-medium",
                isSelected ? "text-foreground" : "text-muted-foreground"
              )}>
                {config.label}
              </span>
              <span className={cn(
                "text-xs",
                isSelected ? "text-muted-foreground" : "text-muted-foreground/60"
              )}>
                ≤{CAPACITY_LIMITS[capacity]} tasks
              </span>
            </button>
          );
        })}
      </div>

      {overplanned && (
        <p className="text-sm text-amber-400/80 mt-4 text-center">
          Consider reducing tasks or increasing capacity
        </p>
      )}
    </div>
  );
};
