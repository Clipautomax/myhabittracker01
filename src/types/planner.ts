export type TaskStatus = 'Pending' | 'Completed' | 'Missed';
export type TaskPriority = 'High' | 'Medium' | 'Low';
export type TaskType = 'Daily' | 'Special' | 'Monthly';
export type EnergyLevel = 'Low' | 'Medium' | 'High';
export type GoalType = 'Monthly' | 'Yearly';

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
}

export interface PlannerState {
  tasks: Task[];
  goals: Goal[];
  days: DayRecord[];
  cycleStartDate: string; // For calculating "Day X / 120"
}
