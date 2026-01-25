import { Goal } from '@/types/planner';
import { usePlanner } from '@/context/PlannerContext';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Trash2, Target } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, differenceInDays, parseISO } from 'date-fns';

interface GoalCardProps {
  goal: Goal;
}

export const GoalCard = ({ goal }: GoalCardProps) => {
  const { updateGoal, deleteGoal } = usePlanner();
  const daysRemaining = differenceInDays(parseISO(goal.endDate), new Date());

  const progressColor = 
    goal.progress >= 75 ? 'bg-status-completed' :
    goal.progress >= 50 ? 'bg-status-partial' :
    'bg-status-missed';

  return (
    <div className="dashboard-card-hover group">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Target className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">{goal.title}</h3>
            <p className="text-sm text-muted-foreground">
              {goal.type} Goal • {daysRemaining > 0 ? `${daysRemaining} days left` : 'Ended'}
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => deleteGoal(goal.id)}
          className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Progress</span>
          <span className="font-semibold text-foreground">{goal.progress}%</span>
        </div>
        <div className="relative">
          <Progress 
            value={goal.progress} 
            className="h-2 bg-muted"
          />
          <div 
            className={cn("absolute top-0 left-0 h-2 rounded-full transition-all", progressColor)}
            style={{ width: `${goal.progress}%` }}
          />
        </div>
        <Slider
          value={[goal.progress]}
          onValueChange={([value]) => updateGoal(goal.id, { progress: value })}
          max={100}
          step={5}
          className="py-2"
        />
      </div>

      <div className="mt-4 pt-4 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
        <span>Started: {format(parseISO(goal.startDate), 'MMM dd, yyyy')}</span>
        <span>Due: {format(parseISO(goal.endDate), 'MMM dd, yyyy')}</span>
      </div>
    </div>
  );
};
