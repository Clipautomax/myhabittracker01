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
  const { completeTask, migrateTask, deleteTask } = usePlanner();

  const priorityClass = {
    High: 'priority-high',
    Medium: 'priority-medium',
    Low: 'priority-low',
  }[task.priority];

  const handleMigrate = () => {
    const tomorrow = format(addDays(new Date(task.date), 1), 'yyyy-MM-dd');
    migrateTask(task.id, tomorrow);
  };

  const handleClick = (e: React.MouseEvent) => {
    // Don't trigger click when clicking checkbox or dropdown
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('[role="checkbox"]')) return;
    onClick?.(task);
  };

  return (
    <div
      className={cn(
        'dashboard-card flex items-center gap-4 group cursor-pointer hover:border-primary/50 transition-colors',
        priorityClass,
        task.status === 'Completed' && 'opacity-60'
      )}
      onClick={handleClick}
    >
      <Checkbox
        checked={task.status === 'Completed'}
        onCheckedChange={() => completeTask(task.id)}
        className="data-[state=checked]:bg-status-completed data-[state=checked]:border-status-completed"
      />
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h4
            className={cn(
              'font-medium truncate',
              task.status === 'Completed' && 'line-through text-muted-foreground'
            )}
          >
            {task.title}
          </h4>
          {task.migratedCount >= 2 && (
            <span className="flex items-center gap-1 text-xs px-1.5 py-0.5 rounded bg-[hsl(var(--status-missed))]/20 text-[hsl(var(--status-missed))]">
              <AlertTriangle className="w-3 h-3" />
              At Risk
            </span>
          )}
          {task.migratedCount > 0 && task.migratedCount < 2 && (
            <span className="text-xs px-1.5 py-0.5 rounded bg-[hsl(var(--status-migrated))]/20 text-[hsl(var(--status-migrated))]">
              ↻{task.migratedCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          {task.time && <span>{task.time}</span>}
          {showDate && <span>{format(new Date(task.date), 'MMM dd')}</span>}
          {task.lastMigratedDate && (
            <span className="text-xs text-[hsl(var(--status-migrated))]">
              Moved {format(new Date(task.lastMigratedDate), 'MMM d')}
            </span>
          )}
          <span className="text-xs px-1.5 py-0.5 rounded bg-secondary">{task.type}</span>
        </div>
      </div>

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
    </div>
  );
};
