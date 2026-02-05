import { useState, useEffect } from 'react';
import { usePlanner } from '@/context/PlannerContext';
import { Task } from '@/types/planner';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ProgressRing } from '@/components/ui/ProgressRing';
import { TaskItem } from '@/components/tasks/TaskItem';
import { TaskEditDialog } from '@/components/tasks/TaskEditDialog';
import { AddTaskDialog } from '@/components/tasks/AddTaskDialog';
import { MonthlyProgressCard } from '@/components/monthly/MonthlyProgressCard';
import { MonthDetailDialog } from '@/components/monthly/MonthDetailDialog';
import { WeeklySnapshot } from '@/components/weekly/WeeklySnapshot';
import { FixedDailyTasksCard } from '@/components/tasks/FixedDailyTasksCard';
import { CapacitySelector } from '@/components/capacity/CapacitySelector';
import { NotificationSettings, useNotificationScheduler } from '@/components/notifications/NotificationSettings';
import { WeeklySkillScheduleCard } from '@/components/skills/WeeklySkillScheduleCard';
import { SleepTracker } from '@/components/sleep/SleepTracker';
import { SleepChart } from '@/components/sleep/SleepChart';
import { CAPACITY_LIMITS } from '@/types/planner';
import { Calendar, CheckCircle2, Clock, TrendingUp, Target, AlertTriangle, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const Home = () => {
  const [monthDetailOpen, setMonthDetailOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  
  const { 
    getTodayTasks, 
    getCurrentDayNumber, 
    getMonthlyProgress, 
    getCurrentMonthStats,
    getAtRiskTasks,
    getTodayCapacity,
    isOverplanned,
    goals,
    getSkillTasksForDate,
    getDayRecord,
  } = usePlanner();

  const today = format(new Date(), 'yyyy-MM-dd');
  const currentCapacity = getTodayCapacity();
  const capacityLimit = CAPACITY_LIMITS[currentCapacity];
  const overplanned = isOverplanned(today);

  const todayTasks = getTodayTasks();
  const skillTasks = getSkillTasksForDate(today);
  const dayNumber = getCurrentDayNumber();
  const monthlyProgress = getMonthlyProgress();
  const monthStats = getCurrentMonthStats();
  const atRiskTasks = getAtRiskTasks();
  const completedToday = todayTasks.filter(t => t.status === 'Completed').length;
  
  // Merged focus tasks: high priority + skill tasks
  const highPriorityTasks = todayTasks.filter(t => t.priority === 'High' && !t.id.startsWith('skill-'));
  const focusTasks = [...skillTasks, ...highPriorityTasks].slice(0, 5);

  // Schedule daily notification
  const { scheduleNotification } = useNotificationScheduler();
  const topTask = focusTasks[0]?.title || todayTasks[0]?.title;
  const dayRecord = getDayRecord(today);
  const dayStatus = dayRecord?.dayStatus || 'Pending';
  
  useEffect(() => {
    scheduleNotification(topTask || 'No tasks today', dayStatus);
  }, [topTask, dayStatus]);

  const handleTaskClick = (task: Task) => {
    setEditingTask(task);
    setEditDialogOpen(true);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header - Large bold like reference */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight">
              Focus
            </h1>
            <p className="text-muted-foreground mt-1">
              {format(new Date(), 'EEEE, MMMM do')}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <AddTaskDialog />
          </div>
        </div>

        {/* Stats Grid - Card based like reference */}
        <div className="grid grid-cols-2 gap-3">
          {/* Day Progress Card */}
          <div className="dashboard-card">
            <div className="flex items-start justify-between">
              <div>
                <ProgressRing progress={monthlyProgress} size={48} strokeWidth={4}>
                  <span className="text-xs font-bold">{monthlyProgress}%</span>
                </ProgressRing>
              </div>
              <div className="w-8 h-8 rounded-xl bg-secondary flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-foreground/70" />
              </div>
            </div>
            <div className="mt-3">
              <p className="text-foreground font-semibold">Month Progress</p>
              <p className="text-sm text-muted-foreground">Day {dayNumber}</p>
            </div>
          </div>

          {/* Today's Completion */}
          <div className={cn(
            "dashboard-card",
            overplanned && "ring-1 ring-muted-foreground/30"
          )}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-3xl font-bold text-foreground">{completedToday}</p>
                <p className="text-sm text-muted-foreground">/ {todayTasks.length} tasks</p>
              </div>
              <div className={cn(
                "w-8 h-8 rounded-xl flex items-center justify-center",
                overplanned ? "bg-muted" : "bg-secondary"
              )}>
                {overplanned ? (
                  <AlertTriangle className="w-4 h-4 text-muted-foreground" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 text-foreground/70" />
                )}
              </div>
            </div>
            <div className="mt-3">
              <p className="text-foreground font-semibold">Today's Tasks</p>
              {overplanned && (
                <p className="text-xs text-muted-foreground">Exceeds {currentCapacity.toLowerCase()} capacity</p>
              )}
            </div>
          </div>
        </div>

        {/* At Risk Alert */}
        {atRiskTasks.length > 0 && (
          <div className="dashboard-card flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-muted-foreground" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-foreground">
                {atRiskTasks.length} task{atRiskTasks.length > 1 ? 's' : ''} at risk
              </p>
              <p className="text-sm text-muted-foreground">
                Tasks migrated 2+ times
              </p>
            </div>
          </div>
        )}

        {/* Today's Focus - Main section like reference */}
        <div className="dashboard-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-semibold text-foreground">Today's Focus</h2>
              <p className="text-sm text-muted-foreground">
                {format(new Date(), 'h:mm a')}
              </p>
            </div>
            <div className="w-8 h-8 rounded-xl bg-secondary flex items-center justify-center">
              <Target className="w-4 h-4 text-foreground/70" />
            </div>
          </div>

          {focusTasks.length > 0 ? (
            <div className="space-y-3">
              {focusTasks.map((task, index) => (
                <div key={task.id} className="relative">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-xs text-muted-foreground font-medium">
                      {index + 1}
                    </span>
                    {task.id.startsWith('skill-') && (
                      <span className="text-xs px-1.5 py-0.5 rounded bg-secondary text-muted-foreground">
                        Skill
                      </span>
                    )}
                  </div>
                  <TaskItem task={task} onClick={handleTaskClick} />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <CheckCircle2 className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>No focus tasks for today</p>
            </div>
          )}

          {todayTasks.length > focusTasks.length && (
            <div className="mt-4 pt-4 border-t border-border">
              <p className="text-sm text-muted-foreground">
                + {todayTasks.length - focusTasks.length} more tasks today
              </p>
            </div>
          )}
        </div>

        {/* Monthly Stats Card */}
        <div className="dashboard-card cursor-pointer" onClick={() => setMonthDetailOpen(true)}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-foreground">Monthly Stats</h3>
            <div className="w-8 h-8 rounded-xl bg-secondary flex items-center justify-center">
              <Calendar className="w-4 h-4 text-foreground/70" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">{monthStats.completedDays}</p>
              <p className="text-xs text-muted-foreground">Complete</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">{monthStats.partialDays}</p>
              <p className="text-xs text-muted-foreground">Partial</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">{monthStats.missedDays}</p>
              <p className="text-xs text-muted-foreground">Missed</p>
            </div>
          </div>
        </div>

        {/* Sleep Tracking Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <SleepTracker />
          <SleepChart days={7} />
        </div>

        {/* Capacity & Weekly */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <CapacitySelector />
          <WeeklySnapshot />
          <FixedDailyTasksCard />
          <NotificationSettings />
        </div>

        {/* Weekly Skill Schedule */}
        <WeeklySkillScheduleCard />

        {/* Goals Preview */}
        {goals.length > 0 && (
          <div className="dashboard-card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-foreground">Active Goals</h2>
              <a href="/goals" className="text-sm text-muted-foreground hover:text-foreground transition-colors">View all →</a>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {goals.slice(0, 3).map(goal => (
                <div key={goal.id} className="p-4 rounded-xl bg-secondary/50 border border-border">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">
                      {goal.type}
                    </span>
                    <span className="text-sm font-semibold text-foreground">{goal.progress}%</span>
                  </div>
                  <h3 className="font-medium text-foreground truncate">{goal.title}</h3>
                  <div className="mt-3 h-1.5 rounded-full bg-muted overflow-hidden">
                    <div 
                      className="h-full rounded-full bg-foreground/50 transition-all"
                      style={{ width: `${goal.progress}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Month Detail Dialog */}
      <MonthDetailDialog open={monthDetailOpen} onOpenChange={setMonthDetailOpen} />

      {/* Task Edit Dialog */}
      <TaskEditDialog 
        task={editingTask} 
        open={editDialogOpen} 
        onOpenChange={setEditDialogOpen} 
      />
    </DashboardLayout>
  );
};

export default Home;
