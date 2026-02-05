import { usePlanner } from '@/context/PlannerContext';
import { Task } from '@/types/planner';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Target, SkipForward } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

export const TodaySkillTasksCard = () => {
  const { 
    getSkillTasksForDate, 
    weeklySkillSchedules,
    skipSkillTask,
    unskipSkillTask,
    isSkillTaskSkipped,
    completeSkillTask,
    tasks,
  } = usePlanner();

  const today = format(new Date(), 'yyyy-MM-dd');
  const skillTasks = getSkillTasksForDate(today);
  
  // Get the day's skill schedules to show skip option
  const getDayOfWeek = () => {
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return dayNames[new Date().getDay()];
  };
  
  const todaySchedules = weeklySkillSchedules.filter(
    s => s.isActive && s.dayOfWeek === getDayOfWeek()
  );

  // Track completion state in regular tasks
  const isSkillTaskCompleted = (skillTask: Task) => {
    const matchingTask = tasks.find(
      t => t.title === skillTask.title && t.date === today && t.status === 'Completed'
    );
    return !!matchingTask;
  };

  if (todaySchedules.length === 0) {
    return null;
  }

  return (
    <div className="dashboard-card">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-foreground">Today's Skill Focus</h3>
          <p className="text-sm text-muted-foreground">{getDayOfWeek()}</p>
        </div>
        <div className="w-8 h-8 rounded-xl bg-secondary flex items-center justify-center">
          <Target className="w-4 h-4 text-foreground/70" />
        </div>
      </div>

      <div className="space-y-3">
        {todaySchedules.map(schedule => {
          const isSkipped = isSkillTaskSkipped(schedule.id, today);
          const skillTask = skillTasks.find(t => t.id === `skill-${schedule.id}-${today}`);
          const isCompleted = skillTask ? isSkillTaskCompleted(skillTask) : false;

          return (
            <div
              key={schedule.id}
              className={cn(
                'flex items-center gap-3 p-3 rounded-xl bg-secondary/50 border border-border',
                isSkipped && 'opacity-50 line-through',
                isCompleted && 'opacity-60'
              )}
            >
              <Checkbox
                checked={isCompleted}
                disabled={isSkipped}
                onCheckedChange={() => {
                  if (skillTask) {
                    completeSkillTask(skillTask.id, today);
                  }
                }}
                className="data-[state=checked]:bg-foreground data-[state=checked]:border-foreground"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={cn(
                    'font-medium text-foreground',
                    isCompleted && 'line-through text-muted-foreground'
                  )}>
                    {schedule.skillName}
                  </span>
                  <span className="text-xs px-1.5 py-0.5 rounded bg-secondary text-muted-foreground">
                    {schedule.focusArea}
                  </span>
                </div>
                {schedule.description && (
                  <p className="text-sm text-muted-foreground truncate">{schedule.description}</p>
                )}
              </div>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => isSkipped ? unskipSkillTask(schedule.id, today) : skipSkillTask(schedule.id, today)}
                className={cn(
                  'shrink-0 rounded-xl',
                  isSkipped && 'text-muted-foreground'
                )}
                title={isSkipped ? 'Restore task' : 'Skip today'}
              >
                <SkipForward className="w-4 h-4" />
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
