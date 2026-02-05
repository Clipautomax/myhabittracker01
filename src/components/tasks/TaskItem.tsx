import { Task } from '@/types/planner';
import { usePlanner } from '@/context/PlannerContext';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, ArrowRight, Trash2, AlertTriangle } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { format, addDays } from 'date-fns';

interface TaskItemProps {
  task: Task;
  showDate?: boolean;
  onClick?: (task: Task) => void;
}

export const TaskItem = ({ task, showDate = false, onClick }: TaskItemProps) => {
  const { completeTask, completeSkillTask, migrateTask, deleteTask, tasks } = usePlanner();

  const isSkillTask = task.id.startsWith('skill-');
  
  // For skill tasks, check if there's a matching completed regular task
  const isSkillTaskCompleted = () => {
    if (!isSkillTask) return task.status === 'Completed';
    const matchingTask = tasks.find(
      t => t.title === task.title && t.date === task.date && t.status === 'Completed'
    );
    return !!matchingTask;
  };

  const priorityClass = {
    High: 'priority-high',
    Medium: 'priority-medium',
    Low: 'priority-low',
  }[task.priority];

  const handleComplete = () => {
    if (isSkillTask) {
      completeSkillTask(task.id, task.date);
    } else {
      completeTask(task.id);
    }
  };

  const handleMigrate = () => {
    if (isSkillTask) return; // Can't migrate skill tasks
    const tomorrow = format(addDays(new Date(task.date), 1), 'yyyy-MM-dd');
    migrateTask(task.id, tomorrow);
  };

  const handleClick = (e: React.MouseEvent) => {
    // Don't trigger click when clicking checkbox or dropdown
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('[role="checkbox"]')) return;
    onClick?.(task);
  };

  const isCompleted = isSkillTaskCompleted();

  return (
    <div
      className={cn(
        'dashboard-card flex items-center gap-4 group cursor-pointer hover:border-muted-foreground/30 transition-colors',
        priorityClass,
        isCompleted && 'opacity-50'
      )}
      onClick={handleClick}
    >
      <Checkbox
        checked={isCompleted}
        onCheckedChange={handleComplete}
        className="data-[state=checked]:bg-foreground data-[state=checked]:border-foreground"
      />
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h4
            className={cn(
              'font-medium truncate',
              isCompleted && 'line-through text-muted-foreground'
            )}
          >
            {task.title}
          </h4>
          {task.migratedCount >= 2 && (
            <span className="flex items-center gap-1 text-xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
              <AlertTriangle className="w-3 h-3" />
              At Risk
            </span>
          )}
          {task.migratedCount > 0 && task.migratedCount < 2 && (
            <span className="text-xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
              ↻{task.migratedCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          {task.time && <span>{task.time}</span>}
          {showDate && <span>{format(new Date(task.date), 'MMM dd')}</span>}
          {task.lastMigratedDate && (
            <span className="text-xs text-muted-foreground">
              Moved {format(new Date(task.lastMigratedDate), 'MMM d')}
            </span>
          )}
          <span className="text-xs px-1.5 py-0.5 rounded bg-secondary">{task.type}</span>
        </div>
      </div>

      {!isSkillTask && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleMigrate}>
              <ArrowRight className="w-4 h-4 mr-2" />
              Move to tomorrow
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => deleteTask(task.id)} className="text-destructive">
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
};
