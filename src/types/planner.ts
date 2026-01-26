export type TaskStatus = 'Pending' | 'Completed' | 'Missed';
export type TaskPriority = 'High' | 'Medium' | 'Low';
export type TaskType = 'Daily' | 'Special' | 'Monthly';
export type EnergyLevel = 'Low' | 'Medium' | 'High';
export type GoalType = 'Monthly' | 'Yearly';
export type DayStatus = 'Completed' | 'Partial' | 'Missed' | 'Pending';

export interface Task {
  id: string;
  title: string;
  description: string;
  date: string; // ISO date string YYYY-MM-DD
  time?: string;
  status: TaskStatus;
  priority: TaskPriority;
  type: TaskType;
  migratedCount: number;
  lastMigratedDate?: string; // Track when task was last moved
  isFixed?: boolean; // Fixed daily tasks auto-appear each day
}

export interface FixedDailyTask {
  id: string;
  title: string;
  description: string;
  time?: string;
  priority: TaskPriority;
  isActive: boolean;
}

export interface Goal {
  id: string;
  title: string;
  type: GoalType;
  startDate: string;
  endDate: string;
  progress: number; // 0-100
}

export interface DayRecord {
  id: string;
  date: string;
  dayNumber: number;
  executionScore: number; // 0, 0.5, or 1
  energyLevel: EnergyLevel;
  monthId?: string; // Link to MonthRecord
  isArchived?: boolean;
  dayStatus?: DayStatus; // Auto-calculated from tasks
}

export interface MonthRecord {
  id: string;
  month: number; // 0-11
  year: number;
  monthName: string;
  averageScore: number;
  completedDays: number;
  partialDays: number;
  missedDays: number;
  totalDays: number;
  resetTimestamp?: string;
  isArchived?: boolean;
}

export interface ArchivedMonth {
  id: string;
  monthRecord: MonthRecord;
  days: DayRecord[];
  archivedAt: string;
}

export interface WeeklyInsight {
  weekStartDate: string;
  weekEndDate: string;
  completedDays: number;
  partialDays: number;
  missedDays: number;
  averageScore: number;
  mostDelayedTask?: { title: string; migratedCount: number };
  totalTasksCompleted: number;
  totalTasksMigrated: number;
}

export interface PlannerState {
  tasks: Task[];
  goals: Goal[];
  days: DayRecord[];
  months: MonthRecord[];
  archivedMonths: ArchivedMonth[];
  fixedDailyTasks: FixedDailyTask[];
  cycleStartDate: string; // For calculating "Day X / 120"
}

export interface PlannerState {
  tasks: Task[];
  goals: Goal[];
  days: DayRecord[];
  months: MonthRecord[];
  archivedMonths: ArchivedMonth[];
  cycleStartDate: string; // For calculating "Day X / 120"
}
