import { usePlanner } from '@/context/PlannerContext';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { TaskItem } from '@/components/tasks/TaskItem';
import { AddTaskDialog } from '@/components/tasks/AddTaskDialog';
import { Button } from '@/components/ui/button';
import { ProgressRing } from '@/components/ui/ProgressRing';
import { Sun, CheckCircle2, AlertCircle, XCircle } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const Today = () => {
  const { getTodayTasks, updateDayRecord, getDayRecord } = usePlanner();
  const today = format(new Date(), 'yyyy-MM-dd');
  const todayTasks = getTodayTasks();
  const dayRecord = getDayRecord(today);

  const completedCount = todayTasks.filter(t => t.status === 'Completed').length;
  const totalCount = todayTasks.length;
  const completionPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const dailyTasks = todayTasks.filter(t => t.type === 'Daily');
  const specialTasks = todayTasks.filter(t => t.type === 'Special' || t.type === 'Monthly');
  const highPriorityTasks = todayTasks.filter(t => t.priority === 'High');

  const handleEndDay = (status: 'Completed' | 'Partial' | 'Missed') => {
    const score = status === 'Completed' ? 1 : status === 'Partial' ? 0.5 : 0;
    updateDayRecord(today, { executionScore: score });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Sun className="w-7 h-7 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Today</h1>
              <p className="text-muted-foreground">
                {format(new Date(), 'EEEE, MMMM do, yyyy')}
              </p>
            </div>
          </div>
          <AddTaskDialog defaultDate={today} />
        </div>

        {/* Progress Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="dashboard-card lg:col-span-1">
            <h2 className="font-semibold text-foreground mb-6">Today's Progress</h2>
            <div className="flex justify-center py-4">
              <ProgressRing progress={completionPercentage} size={180} strokeWidth={14}>
                <div className="text-center">
                  <span className="text-5xl font-bold text-foreground">{completedCount}</span>
                  <span className="text-2xl text-muted-foreground">/{totalCount}</span>
                  <p className="text-sm text-muted-foreground mt-2">Tasks completed</p>
                </div>
              </ProgressRing>
            </div>

            {/* End Day Actions */}
            <div className="mt-6 pt-6 border-t border-border">
              <p className="text-sm text-muted-foreground mb-4">Mark today as:</p>
              <div className="grid grid-cols-3 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEndDay('Completed')}
                  className={cn(
                    'flex-col h-auto py-3 gap-1',
                    dayRecord?.executionScore === 1 && 'bg-status-completed/20 border-status-completed text-status-completed'
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
                    'flex-col h-auto py-3 gap-1',
                    dayRecord?.executionScore === 0.5 && 'bg-status-partial/20 border-status-partial text-status-partial'
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
                    'flex-col h-auto py-3 gap-1',
                    dayRecord?.executionScore === 0 && 'bg-status-missed/20 border-status-missed text-status-missed'
                  )}
                >
                  <XCircle className="w-5 h-5" />
                  <span className="text-xs">Missed</span>
                </Button>
              </div>
            </div>
          </div>

          {/* Tasks List */}
          <div className="lg:col-span-2 space-y-6">
            {/* High Priority Tasks */}
            {highPriorityTasks.length > 0 && (
              <div className="dashboard-card">
                <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-status-missed" />
                  Top Priority ({highPriorityTasks.length})
                </h3>
                <div className="space-y-3">
                  {highPriorityTasks.map(task => (
                    <TaskItem key={task.id} task={task} />
                  ))}
                </div>
              </div>
            )}

            {/* Daily Habits */}
            <div className="dashboard-card">
              <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary" />
                Daily Habits ({dailyTasks.length})
              </h3>
              {dailyTasks.length > 0 ? (
                <div className="space-y-3">
                  {dailyTasks.map(task => (
                    <TaskItem key={task.id} task={task} />
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm py-4">
                  No daily tasks set. Add recurring tasks to build habits.
                </p>
              )}
            </div>

            {/* Special / Monthly Tasks */}
            {specialTasks.length > 0 && (
              <div className="dashboard-card">
                <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-status-migrated" />
                  Special Tasks ({specialTasks.length})
                </h3>
                <div className="space-y-3">
                  {specialTasks.map(task => (
                    <TaskItem key={task.id} task={task} />
                  ))}
                </div>
              </div>
            )}

            {/* Empty State */}
            {todayTasks.length === 0 && (
              <div className="dashboard-card text-center py-12">
                <Sun className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
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
    </DashboardLayout>
  );
};

export default Today;
