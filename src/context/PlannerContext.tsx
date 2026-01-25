import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Task, Goal, DayRecord, PlannerState, TaskStatus, TaskPriority, TaskType, EnergyLevel, GoalType } from '@/types/planner';
import { format, startOfYear, differenceInDays, parseISO, isToday, startOfMonth, endOfMonth, eachDayOfInterval, subDays } from 'date-fns';

interface PlannerContextType extends PlannerState {
  // Task actions
  addTask: (task: Omit<Task, 'id' | 'migratedCount'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  completeTask: (id: string) => void;
  migrateTask: (id: string, newDate: string) => void;
  
  // Goal actions
  addGoal: (goal: Omit<Goal, 'id'>) => void;
  updateGoal: (id: string, updates: Partial<Goal>) => void;
  deleteGoal: (id: string) => void;
  
  // Day actions
  updateDayRecord: (date: string, updates: Partial<Omit<DayRecord, 'id' | 'date'>>) => void;
  
  // Computed values
  getTodayTasks: () => Task[];
  getTasksByDate: (date: string) => Task[];
  getCurrentDayNumber: () => number;
  getMonthlyProgress: () => number;
  getWeeklyConsistency: () => number[];
  getDayRecord: (date: string) => DayRecord | undefined;
  getPerformanceData: () => { date: string; score: number }[];
}

const PlannerContext = createContext<PlannerContextType | undefined>(undefined);

const generateId = () => Math.random().toString(36).substr(2, 9);

const getInitialState = (): PlannerState => {
  const saved = localStorage.getItem('plannerState');
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      // Fall through to default
    }
  }
  
  const today = format(new Date(), 'yyyy-MM-dd');
  const cycleStart = format(startOfYear(new Date()), 'yyyy-MM-dd');
  
  // Create some initial sample data
  const sampleTasks: Task[] = [
    {
      id: generateId(),
      title: 'Wake up on time (6:00 AM)',
      description: 'Start the day with discipline',
      date: today,
      time: '06:00',
      status: 'Pending',
      priority: 'High',
      type: 'Daily',
      migratedCount: 0,
    },
    {
      id: generateId(),
      title: 'Core work session',
      description: 'Deep focus work for 4 hours',
      date: today,
      time: '09:00',
      status: 'Pending',
      priority: 'High',
      type: 'Daily',
      migratedCount: 0,
    },
    {
      id: generateId(),
      title: 'Physical activity',
      description: '30 minutes exercise or walk',
      date: today,
      time: '17:00',
      status: 'Pending',
      priority: 'Medium',
      type: 'Daily',
      migratedCount: 0,
    },
    {
      id: generateId(),
      title: 'Evening reflection',
      description: 'Review the day and plan tomorrow',
      date: today,
      time: '21:00',
      status: 'Pending',
      priority: 'Medium',
      type: 'Daily',
      migratedCount: 0,
    },
    {
      id: generateId(),
      title: 'Monthly review',
      description: 'Review monthly goals and adjust plans',
      date: format(endOfMonth(new Date()), 'yyyy-MM-dd'),
      status: 'Pending',
      priority: 'High',
      type: 'Monthly',
      migratedCount: 0,
    },
  ];

  const sampleGoals: Goal[] = [
    {
      id: generateId(),
      title: 'Complete 100 deep work sessions',
      type: 'Yearly',
      startDate: cycleStart,
      endDate: format(new Date(new Date().getFullYear(), 11, 31), 'yyyy-MM-dd'),
      progress: 25,
    },
    {
      id: generateId(),
      title: 'Read 24 books',
      type: 'Yearly',
      startDate: cycleStart,
      endDate: format(new Date(new Date().getFullYear(), 11, 31), 'yyyy-MM-dd'),
      progress: 33,
    },
    {
      id: generateId(),
      title: 'Ship 3 projects',
      type: 'Monthly',
      startDate: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
      endDate: format(endOfMonth(new Date()), 'yyyy-MM-dd'),
      progress: 66,
    },
  ];

  // Generate sample day records for the past week
  const sampleDays: DayRecord[] = [];
  for (let i = 7; i >= 1; i--) {
    const date = format(subDays(new Date(), i), 'yyyy-MM-dd');
    const scores = [0, 0.5, 1];
    const energies: EnergyLevel[] = ['Low', 'Medium', 'High'];
    sampleDays.push({
      id: generateId(),
      date,
      dayNumber: differenceInDays(parseISO(date), parseISO(cycleStart)) + 1,
      executionScore: scores[Math.floor(Math.random() * 3)],
      energyLevel: energies[Math.floor(Math.random() * 3)],
    });
  }

  return {
    tasks: sampleTasks,
    goals: sampleGoals,
    days: sampleDays,
    cycleStartDate: cycleStart,
  };
};

export const PlannerProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<PlannerState>(getInitialState);

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem('plannerState', JSON.stringify(state));
  }, [state]);

  const addTask = (task: Omit<Task, 'id' | 'migratedCount'>) => {
    const newTask: Task = {
      ...task,
      id: generateId(),
      migratedCount: 0,
    };
    setState(prev => ({ ...prev, tasks: [...prev.tasks, newTask] }));
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    setState(prev => ({
      ...prev,
      tasks: prev.tasks.map(t => t.id === id ? { ...t, ...updates } : t),
    }));
  };

  const deleteTask = (id: string) => {
    setState(prev => ({
      ...prev,
      tasks: prev.tasks.filter(t => t.id !== id),
    }));
  };

  const completeTask = (id: string) => {
    setState(prev => ({
      ...prev,
      tasks: prev.tasks.map(t => 
        t.id === id ? { ...t, status: t.status === 'Completed' ? 'Pending' : 'Completed' as TaskStatus } : t
      ),
    }));
  };

  const migrateTask = (id: string, newDate: string) => {
    setState(prev => ({
      ...prev,
      tasks: prev.tasks.map(t => 
        t.id === id ? { ...t, date: newDate, migratedCount: t.migratedCount + 1 } : t
      ),
    }));
  };

  const addGoal = (goal: Omit<Goal, 'id'>) => {
    const newGoal: Goal = { ...goal, id: generateId() };
    setState(prev => ({ ...prev, goals: [...prev.goals, newGoal] }));
  };

  const updateGoal = (id: string, updates: Partial<Goal>) => {
    setState(prev => ({
      ...prev,
      goals: prev.goals.map(g => g.id === id ? { ...g, ...updates } : g),
    }));
  };

  const deleteGoal = (id: string) => {
    setState(prev => ({
      ...prev,
      goals: prev.goals.filter(g => g.id !== id),
    }));
  };

  const updateDayRecord = (date: string, updates: Partial<Omit<DayRecord, 'id' | 'date'>>) => {
    setState(prev => {
      const existingDay = prev.days.find(d => d.date === date);
      if (existingDay) {
        return {
          ...prev,
          days: prev.days.map(d => d.date === date ? { ...d, ...updates } : d),
        };
      } else {
        const newDay: DayRecord = {
          id: generateId(),
          date,
          dayNumber: differenceInDays(parseISO(date), parseISO(prev.cycleStartDate)) + 1,
          executionScore: updates.executionScore ?? 0,
          energyLevel: updates.energyLevel ?? 'Medium',
        };
        return { ...prev, days: [...prev.days, newDay] };
      }
    });
  };

  const getTodayTasks = () => {
    const today = format(new Date(), 'yyyy-MM-dd');
    return state.tasks.filter(t => t.date === today);
  };

  const getTasksByDate = (date: string) => {
    return state.tasks.filter(t => t.date === date);
  };

  const getCurrentDayNumber = () => {
    return differenceInDays(new Date(), parseISO(state.cycleStartDate)) + 1;
  };

  const getMonthlyProgress = () => {
    const start = startOfMonth(new Date());
    const end = new Date();
    const daysInRange = eachDayOfInterval({ start, end });
    
    const completedDays = daysInRange.filter(day => {
      const dateStr = format(day, 'yyyy-MM-dd');
      const dayRecord = state.days.find(d => d.date === dateStr);
      return dayRecord && dayRecord.executionScore === 1;
    }).length;
    
    return Math.round((completedDays / daysInRange.length) * 100) || 0;
  };

  const getWeeklyConsistency = () => {
    const result: number[] = [];
    for (let i = 6; i >= 0; i--) {
      const date = format(subDays(new Date(), i), 'yyyy-MM-dd');
      const dayRecord = state.days.find(d => d.date === date);
      result.push(dayRecord?.executionScore ?? 0);
    }
    return result;
  };

  const getDayRecord = (date: string) => {
    return state.days.find(d => d.date === date);
  };

  const getPerformanceData = () => {
    const result: { date: string; score: number }[] = [];
    for (let i = 29; i >= 0; i--) {
      const date = format(subDays(new Date(), i), 'yyyy-MM-dd');
      const dayRecord = state.days.find(d => d.date === date);
      result.push({
        date: format(subDays(new Date(), i), 'MMM dd'),
        score: (dayRecord?.executionScore ?? 0) * 100,
      });
    }
    return result;
  };

  return (
    <PlannerContext.Provider
      value={{
        ...state,
        addTask,
        updateTask,
        deleteTask,
        completeTask,
        migrateTask,
        addGoal,
        updateGoal,
        deleteGoal,
        updateDayRecord,
        getTodayTasks,
        getTasksByDate,
        getCurrentDayNumber,
        getMonthlyProgress,
        getWeeklyConsistency,
        getDayRecord,
        getPerformanceData,
      }}
    >
      {children}
    </PlannerContext.Provider>
  );
};

export const usePlanner = () => {
  const context = useContext(PlannerContext);
  if (!context) {
    throw new Error('usePlanner must be used within a PlannerProvider');
  }
  return context;
};
