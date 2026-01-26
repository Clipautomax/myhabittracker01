import { usePlanner } from '@/context/PlannerContext';
import { ProgressRing } from '@/components/ui/ProgressRing';
import { TrendingUp, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';

interface MonthlyProgressCardProps {
  onClick: () => void;
}

export const MonthlyProgressCard = ({ onClick }: MonthlyProgressCardProps) => {
  const { getCurrentMonthStats } = usePlanner();
  const stats = getCurrentMonthStats();

  return (
    <div 
      onClick={onClick}
      className="dashboard-card lg:col-span-1 cursor-pointer hover:border-primary/50 transition-all group"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-semibold text-foreground">Monthly Progress</h2>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">{format(new Date(), 'MMMM yyyy')}</span>
          <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
        </div>
      </div>
      
      <div className="flex justify-center py-4">
        <ProgressRing progress={stats.averageScore} size={160} strokeWidth={12}>
          <div className="text-center">
            <span className="text-4xl font-bold text-foreground">{stats.averageScore}</span>
            <span className="text-xl text-muted-foreground">%</span>
            <p className="text-xs text-muted-foreground mt-1">Avg Score</p>
          </div>
        </ProgressRing>
      </div>

      <div className="mt-6 pt-4 border-t border-border">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-status-completed">{stats.completedDays}</p>
            <p className="text-xs text-muted-foreground">Completed</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-status-partial">{stats.partialDays}</p>
            <p className="text-xs text-muted-foreground">Partial</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-status-missed">{stats.missedDays}</p>
            <p className="text-xs text-muted-foreground">Missed</p>
          </div>
        </div>
      </div>

      <p className="text-xs text-muted-foreground text-center mt-4">
        Click to view details & reset options
      </p>
    </div>
  );
};
