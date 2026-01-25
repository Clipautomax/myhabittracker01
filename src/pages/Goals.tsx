import { usePlanner } from '@/context/PlannerContext';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { GoalCard } from '@/components/goals/GoalCard';
import { AddGoalDialog } from '@/components/goals/AddGoalDialog';
import { Target, Trophy, Calendar } from 'lucide-react';

const Goals = () => {
  const { goals } = usePlanner();

  const yearlyGoals = goals.filter(g => g.type === 'Yearly');
  const monthlyGoals = goals.filter(g => g.type === 'Monthly');

  const avgProgress = goals.length > 0 
    ? Math.round(goals.reduce((sum, g) => sum + g.progress, 0) / goals.length)
    : 0;

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Target className="w-7 h-7 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Goals</h1>
              <p className="text-muted-foreground">Track your progress and ambitions</p>
            </div>
          </div>
          <AddGoalDialog />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="dashboard-card-hover">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Target className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="stat-label">Total Goals</p>
                <p className="stat-value">{goals.length}</p>
              </div>
            </div>
          </div>

          <div className="dashboard-card-hover">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-status-completed/10 flex items-center justify-center">
                <Trophy className="w-6 h-6 text-status-completed" />
              </div>
              <div>
                <p className="stat-label">Average Progress</p>
                <p className="stat-value">{avgProgress}%</p>
              </div>
            </div>
          </div>

          <div className="dashboard-card-hover">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-status-migrated/10 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-status-migrated" />
              </div>
              <div>
                <p className="stat-label">This Month</p>
                <p className="stat-value">{monthlyGoals.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Yearly Goals */}
        <div className="dashboard-card">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-semibold text-foreground text-lg">Yearly Goals</h2>
              <p className="text-sm text-muted-foreground">Max 3 big goals for the year</p>
            </div>
            <span className="text-sm text-muted-foreground">{yearlyGoals.length}/3</span>
          </div>

          {yearlyGoals.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {yearlyGoals.map(goal => (
                <GoalCard key={goal.id} goal={goal} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Trophy className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="mb-2">No yearly goals yet</p>
              <p className="text-sm">Set your big ambitions for the year</p>
            </div>
          )}
        </div>

        {/* Monthly Goals */}
        <div className="dashboard-card">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-semibold text-foreground text-lg">Monthly Goals</h2>
              <p className="text-sm text-muted-foreground">Max 3 focused goals for this month</p>
            </div>
            <span className="text-sm text-muted-foreground">{monthlyGoals.length}/3</span>
          </div>

          {monthlyGoals.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {monthlyGoals.map(goal => (
                <GoalCard key={goal.id} goal={goal} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="mb-2">No monthly goals yet</p>
              <p className="text-sm">Break down your yearly goals into monthly milestones</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Goals;
