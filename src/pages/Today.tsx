import { useState } from 'react';
import { usePlanner } from '@/context/PlannerContext';
import { Task } from '@/types/planner';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { TaskItem } from '@/components/tasks/TaskItem';
import { TaskEditDialog } from '@/components/tasks/TaskEditDialog';
import { AddTaskDialog } from '@/components/tasks/AddTaskDialog';
import { SleepTracker } from '@/components/sleep/SleepTracker';
import { Button } from '@/components/ui/button';
import { ProgressRing } from '@/components/ui/ProgressRing';
import { Sun, CheckCircle2, AlertCircle, XCircle, Target } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const Today = () => {
  const { getTodayTasks, updateDayRecord, getDayRecord, getSkillTasksForDate, tasks } = usePlanner();
  const today = format(new Date(), 'yyyy-MM-dd');
  const todayTasks = getTodayTasks();
  const dayRecord = getDayRecord(today);

  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  // Count completed including skill tasks that have been completed
  const getCompletedCount = () => {
    let count = 0;
    todayTasks.forEach(t => {
      if (t.id.startsWith('skill-')) {
        // Check if skill task has a matching completed regular task
        const matchingTask = tasks.find(
          rt => rt.title === t.title && rt.date === today && rt.status === 'Completed'
        );
        if (matchingTask) count++;
      } else if (t.status === 'Completed') {
        count++;
      }
    });
    return count;
  };

  const completedCount = getCompletedCount();
  const totalCount = todayTasks.length;
  const completionPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Group tasks
  const skillTasks = todayTasks.filter(t => t.id.startsWith('skill-'));
  const regularTasks = todayTasks.filter(t => !t.id.startsWith('skill-'));
  const dailyTasks = regularTasks.filter(t => t.type === 'Daily');
  const specialTasks = regularTasks.filter(t => t.type === 'Special' || t.type === 'Monthly');
  const highPriorityTasks = regularTasks.filter(t => t.priority === 'High');

  // Merged focus = skill tasks + high priority regular tasks
  const focusTasks = [...skillTasks, ...highPriorityTasks].slice(0, 6);

  const handleEndDay = (status: 'Completed' | 'Partial' | 'Missed') => {
    const score = status === 'Completed' ? 1 : status === 'Partial' ? 0.5 : 0;
    updateDayRecord(today, { executionScore: score });
  };

  const handleTaskClick = (task: Task) => {
    setEditingTask(task);
    setEditDialogOpen(true);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight">Today</h1>
            <p className="text-muted-foreground">
              {format(new Date(), 'EEEE, MMMM do')}
            </p>
          </div>
          <AddTaskDialog defaultDate={today} />
        </div>

        {/* Progress Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="dashboard-card lg:col-span-1 space-y-6">
            <div>
              <h2 className="font-semibold text-foreground mb-4">Today's Progress</h2>
              <div className="flex justify-center py-4">
                <ProgressRing progress={completionPercentage} size={160} strokeWidth={12}>
                  <div className="text-center">
                    <span className="text-4xl font-bold text-foreground">{completedCount}</span>
                    <span className="text-xl text-muted-foreground">/{totalCount}</span>
                    <p className="text-xs text-muted-foreground mt-1">completed</p>
                  </div>
                </ProgressRing>
              </div>
            </div>

            {/* End Day Actions */}
            <div className="pt-4 border-t border-border">
              <p className="text-sm text-muted-foreground mb-3">Mark today as:</p>
              <div className="grid grid-cols-3 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEndDay('Completed')}
                  className={cn(
                    'flex-col h-auto py-3 gap-1 border-border',
                    dayRecord?.executionScore === 1 && 'bg-foreground/10 border-foreground/30 text-foreground'
                  )}
                >
                  <CheckCircle2 className="w-5 h-5" />
                  <span className="text-xs">Complete</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEndDay('Partial')}
                  className={cn(
                    'flex-col h-auto py-3 gap-1 border-border',
                    dayRecord?.executionScore === 0.5 && 'bg-foreground/10 border-foreground/30 text-foreground'
                  )}
                >
                  <AlertCircle className="w-5 h-5" />
                  <span className="text-xs">Partial</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEndDay('Missed')}
                  className={cn(
                    'flex-col h-auto py-3 gap-1 border-border',
                    dayRecord?.executionScore === 0 && 'bg-foreground/10 border-foreground/30 text-foreground'
                  )}
                >
                  <XCircle className="w-5 h-5" />
                  <span className="text-xs">Missed</span>
                </Button>
              </div>
            </div>

            {/* Sleep Tracker */}
            <SleepTracker date={today} compact />
          </div>

          {/* Tasks List */}
          <div className="lg:col-span-2 space-y-4">
            {/* Today's Focus - Skill Tasks + High Priority merged */}
            <div className="dashboard-card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  Today's Focus ({focusTasks.length})
                </h3>
              </div>
              <div className="space-y-3">
                {focusTasks.map((task, index) => (
                  <div key={task.id} className="relative">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-muted-foreground">{index + 1}</span>
                      {task.id.startsWith('skill-') && (
                        <span className="text-xs px-1.5 py-0.5 rounded bg-secondary text-muted-foreground">
                          Skill
                        </span>
                      )}
                    </div>
                    <TaskItem task={task} onClick={handleTaskClick} />
                  </div>
                ))}

                {focusTasks.length === 0 && (
                  <p className="text-muted-foreground text-sm py-4 text-center">
                    No focus tasks for today
                  </p>
                )}
              </div>
            </div>

            {/* Daily Tasks */}
            {dailyTasks.length > 0 && (
              <div className="dashboard-card">
                <h3 className="font-semibold text-foreground mb-4">
                  Daily Tasks ({dailyTasks.length})
                </h3>
                <div className="space-y-3">
                  {dailyTasks.map(task => (
                    <TaskItem key={task.id} task={task} onClick={handleTaskClick} />
                  ))}
                </div>
              </div>
            )}

            {/* Special Tasks */}
            {specialTasks.length > 0 && (
              <div className="dashboard-card">
                <h3 className="font-semibold text-foreground mb-4">
                  Special Tasks ({specialTasks.length})
                </h3>
                <div className="space-y-3">
                  {specialTasks.map(task => (
                    <TaskItem key={task.id} task={task} onClick={handleTaskClick} />
                  ))}
                </div>
              </div>
            )}

            {/* Empty State */}
            {todayTasks.length === 0 && (
              <div className="dashboard-card text-center py-12">
                <Sun className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-30" />
                <h3 className="font-semibold text-foreground mb-2">No tasks for today</h3>
                <p className="text-muted-foreground mb-4">
                  Start planning your day by adding tasks
                </p>
                <AddTaskDialog defaultDate={today} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Task Edit Dialog */}
      <TaskEditDialog 
        task={editingTask} 
        open={editDialogOpen} 
        onOpenChange={setEditDialogOpen} 
      />
    </DashboardLayout>
  );
};

export default Today;
