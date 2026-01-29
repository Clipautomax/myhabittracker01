import { useState, useEffect } from 'react';
import { usePlanner } from '@/context/PlannerContext';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ProgressRing } from '@/components/ui/ProgressRing';
import { TaskItem } from '@/components/tasks/TaskItem';
import { AddTaskDialog } from '@/components/tasks/AddTaskDialog';
import { MonthlyProgressCard } from '@/components/monthly/MonthlyProgressCard';
import { MonthDetailDialog } from '@/components/monthly/MonthDetailDialog';
import { WeeklySnapshot } from '@/components/weekly/WeeklySnapshot';
import { FixedDailyTasksCard } from '@/components/tasks/FixedDailyTasksCard';
import { CapacitySelector } from '@/components/capacity/CapacitySelector';
import { NotificationSettings, useNotificationScheduler } from '@/components/notifications/NotificationSettings';
import { WeeklySkillScheduleCard } from '@/components/skills/WeeklySkillScheduleCard';
import { TodaySkillTasksCard } from '@/components/skills/TodaySkillTasksCard';
import { CAPACITY_LIMITS } from '@/types/planner';
import { Calendar, CheckCircle2, Clock, TrendingUp, Zap, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const Home = () => {
  const [monthDetailOpen, setMonthDetailOpen] = useState(false);
  const { 
    getTodayTasks, 
    getCurrentDayNumber, 
    getMonthlyProgress, 
    getWeeklyConsistency,
    getCurrentMonthStats,
    getAtRiskTasks,
    getTodayCapacity,
    isOverplanned,
    goals,
  } = usePlanner();

  const today = format(new Date(), 'yyyy-MM-dd');
  const currentCapacity = getTodayCapacity();
  const capacityLimit = CAPACITY_LIMITS[currentCapacity];
  const overplanned = isOverplanned(today);

  const todayTasks = getTodayTasks();
  const dayNumber = getCurrentDayNumber();
  const monthlyProgress = getMonthlyProgress();
  const weeklyConsistency = getWeeklyConsistency();
  const monthStats = getCurrentMonthStats();
  const atRiskTasks = getAtRiskTasks();
  const completedToday = todayTasks.filter(t => t.status === 'Completed').length;
  const priorityTasks = todayTasks.filter(t => t.priority === 'High').slice(0, 3);

  // Schedule daily notification
  const { scheduleNotification } = useNotificationScheduler();
  const topTask = priorityTasks[0]?.title || todayTasks[0]?.title;
  const dayRecord = usePlanner().getDayRecord(today);
  const dayStatus = dayRecord?.dayStatus || 'Pending';
  
  useEffect(() => {
    scheduleNotification(topTask || 'No tasks today', dayStatus);
  }, [topTask, dayStatus]);

  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}
            </h1>
            <p className="text-muted-foreground mt-1">
              {format(new Date(), 'EEEE, MMMM do, yyyy')}
            </p>
          </div>
          <AddTaskDialog />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Day Counter */}
          <div className="dashboard-card-hover">
            <div className="flex items-center justify-between">
              <div>
                <p className="stat-label">Current Day</p>
                <p className="stat-value text-primary">
                  Day {dayNumber}
                  <span className="text-lg text-muted-foreground font-normal"> / 365</span>
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-primary" />
              </div>
            </div>
          </div>

          {/* Monthly Progress */}
          <div className="dashboard-card-hover">
            <div className="flex items-center justify-between">
              <div>
                <p className="stat-label">Monthly Progress</p>
                <p className="stat-value">{monthlyProgress}%</p>
              </div>
              <ProgressRing progress={monthlyProgress} size={48} strokeWidth={4}>
                <TrendingUp className="w-4 h-4 text-primary" />
              </ProgressRing>
            </div>
          </div>

          {/* Today's Completion with Capacity */}
          <div className={cn(
            "dashboard-card-hover",
            overplanned && "ring-1 ring-amber-400/50"
          )}>
            <div className="flex items-center justify-between">
              <div>
                <p className="stat-label">Today's Tasks</p>
                <p className="stat-value">
                  {completedToday}
                  <span className="text-lg text-muted-foreground font-normal"> / {todayTasks.length}</span>
                </p>
                {overplanned && (
                  <p className="text-xs text-amber-400 mt-1">
                    Exceeds {currentCapacity.toLowerCase()} capacity ({capacityLimit})
                  </p>
                )}
              </div>
              <div className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center",
                overplanned 
                  ? "bg-amber-400/10" 
                  : "bg-status-completed/10"
              )}>
                {overplanned ? (
                  <AlertTriangle className="w-6 h-6 text-amber-400" />
                ) : (
                  <CheckCircle2 className="w-6 h-6 text-status-completed" />
                )}
              </div>
            </div>
          </div>

          {/* Active Goals */}
          <div className="dashboard-card-hover">
            <div className="flex items-center justify-between">
              <div>
                <p className="stat-label">Active Goals</p>
                <p className="stat-value">{goals.length}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Zap className="w-6 h-6 text-primary" />
              </div>
            </div>
          </div>

          {/* At Risk Tasks */}
          {atRiskTasks.length > 0 && (
            <div className="dashboard-card-hover col-span-1 md:col-span-2 lg:col-span-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[hsl(var(--status-missed))]/10 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-[hsl(var(--status-missed))]" />
                </div>
                <div>
                  <p className="font-medium text-foreground">
                    {atRiskTasks.length} task{atRiskTasks.length > 1 ? 's' : ''} at risk
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Tasks migrated 2+ times need attention
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Monthly Progress Card - Now clickable with detail view */}
          <MonthlyProgressCard onClick={() => setMonthDetailOpen(true)} />

          {/* Today's Priority Tasks */}
          <div className="dashboard-card lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="font-semibold text-foreground">Today's Focus</h2>
                <p className="text-sm text-muted-foreground mt-0.5">High priority tasks for today</p>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="w-4 h-4" />
                {format(new Date(), 'h:mm a')}
              </div>
            </div>

            {priorityTasks.length > 0 ? (
              <div className="space-y-3">
                {priorityTasks.map(task => (
                  <TaskItem key={task.id} task={task} />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <CheckCircle2 className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No high priority tasks for today</p>
                <p className="text-sm mt-1">Add tasks to see them here</p>
              </div>
            )}

            {todayTasks.length > priorityTasks.length && (
              <div className="mt-4 pt-4 border-t border-border">
                <p className="text-sm text-muted-foreground">
                  + {todayTasks.length - priorityTasks.length} more tasks today
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Today's Skill Focus */}
        <TodaySkillTasksCard />

        {/* Capacity, Weekly & Fixed Tasks */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <CapacitySelector />
          <WeeklySnapshot />
          <FixedDailyTasksCard />
          <NotificationSettings />
        </div>

        {/* Weekly Skill Schedule */}
        <WeeklySkillScheduleCard />

        {/* Goals Preview */}
        <div className="dashboard-card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-semibold text-foreground">Active Goals</h2>
            <a href="/goals" className="text-sm text-primary hover:underline">View all →</a>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {goals.slice(0, 3).map(goal => (
              <div key={goal.id} className="p-4 rounded-xl bg-secondary/50 border border-border">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                    {goal.type}
                  </span>
                  <span className="text-sm font-semibold text-foreground">{goal.progress}%</span>
                </div>
                <h3 className="font-medium text-foreground truncate">{goal.title}</h3>
                <div className="mt-3 h-1.5 rounded-full bg-muted overflow-hidden">
                  <div 
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: `${goal.progress}%` }}
                  />
                </div>
              </div>
            ))}
            {goals.length === 0 && (
              <div className="col-span-3 text-center py-8 text-muted-foreground">
                <p>No goals set yet. Add goals to track your progress.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Month Detail Dialog */}
      <MonthDetailDialog open={monthDetailOpen} onOpenChange={setMonthDetailOpen} />
    </DashboardLayout>
  );
};

export default Home;
