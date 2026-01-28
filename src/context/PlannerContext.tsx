import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Task, Goal, DayRecord, PlannerState, TaskStatus, TaskPriority, TaskType, EnergyLevel, GoalType, MonthRecord, ArchivedMonth, DayStatus, FixedDailyTask, WeeklyInsight, DailyCapacity, CAPACITY_LIMITS } from '@/types/planner';
import { format, startOfYear, differenceInDays, parseISO, isToday, startOfMonth, endOfMonth, eachDayOfInterval, subDays, getMonth, getYear, getDaysInMonth, startOfWeek, endOfWeek } from 'date-fns';

export interface MonthStats {
  averageScore: number;
  completedDays: number;
  partialDays: number;
  missedDays: number;
  totalDays: number;
}

interface PlannerContextType extends PlannerState {
  // Task actions
  addTask: (task: Omit<Task, 'id' | 'migratedCount'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  completeTask: (id: string) => void;
  migrateTask: (id: string, newDate: string) => void;
  
  // Fixed Daily Task actions
  addFixedDailyTask: (task: Omit<FixedDailyTask, 'id'>) => void;
  updateFixedDailyTask: (id: string, updates: Partial<FixedDailyTask>) => void;
  deleteFixedDailyTask: (id: string) => void;
  
  // Goal actions
  addGoal: (goal: Omit<Goal, 'id'>) => void;
  updateGoal: (id: string, updates: Partial<Goal>) => void;
  deleteGoal: (id: string) => void;
  
  // Day actions
  updateDayRecord: (date: string, updates: Partial<Omit<DayRecord, 'id' | 'date'>>) => void;
  
  // Month actions
  getCurrentMonthStats: () => MonthStats;
  getCurrentMonthRecord: () => MonthRecord | undefined;
  getMonthlyChartData: () => { day: string; score: number }[];
  resetMonthProgress: () => void;
  
  // Execution Intelligence
  calculateDayStatus: (date: string) => DayStatus;
  getWeeklyInsight: () => WeeklyInsight;
  getMostDelayedTasks: (limit?: number) => Task[];
  getAtRiskTasks: () => Task[];
  
  // Capacity functions
  getTodayCapacity: () => DailyCapacity;
  setTodayCapacity: (capacity: DailyCapacity) => void;
  getCapacityLimit: (capacity: DailyCapacity) => number;
  isOverplanned: (date: string) => boolean;
  
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
      const parsed = JSON.parse(saved);
      // Migrate old data that doesn't have months/archivedMonths
      const currentMonth = getMonth(new Date());
      const currentYear = getYear(new Date());
      const monthId = `${currentYear}-${currentMonth}`;
      
      if (!parsed.months) {
        parsed.months = [{
          id: monthId,
          month: currentMonth,
          year: currentYear,
          monthName: format(new Date(), 'MMMM'),
          averageScore: 0,
          completedDays: 0,
          partialDays: 0,
          missedDays: 0,
          totalDays: 0,
        }];
      }
      if (!parsed.archivedMonths) {
        parsed.archivedMonths = [];
      }
      if (!parsed.fixedDailyTasks) {
        parsed.fixedDailyTasks = [];
      }
      // Migrate tasks to have lastMigratedDate
      if (parsed.tasks) {
        parsed.tasks = parsed.tasks.map((t: Task) => ({
          ...t,
          lastMigratedDate: t.lastMigratedDate || null,
        }));
      }
      // Migrate days to have capacity
      if (parsed.days) {
        parsed.days = parsed.days.map((d: DayRecord) => ({
          ...d,
          capacity: d.capacity || 'Normal',
        }));
      }
      return parsed;
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

  // Default fixed daily tasks
  const defaultFixedTasks: FixedDailyTask[] = [
    {
      id: generateId(),
      title: 'Morning routine',
      description: 'Start the day with discipline',
      time: '06:00',
      priority: 'High',
      isActive: true,
    },
    {
      id: generateId(),
      title: 'Deep work session',
      description: 'Focused work for 2+ hours',
      time: '09:00',
      priority: 'High',
      isActive: true,
    },
    {
      id: generateId(),
      title: 'Physical activity',
      description: '30 minutes exercise',
      time: '17:00',
      priority: 'Medium',
      isActive: true,
    },
  ];

  // Generate sample day records for the past week
  const sampleDays: DayRecord[] = [];
  const currentMonth = getMonth(new Date());
  const currentYear = getYear(new Date());
  const monthId = `${currentYear}-${currentMonth}`;
  
  for (let i = 7; i >= 1; i--) {
    const date = format(subDays(new Date(), i), 'yyyy-MM-dd');
    const scores = [0, 0.5, 1];
    const energies: EnergyLevel[] = ['Low', 'Medium', 'High'];
    const capacities: DailyCapacity[] = ['Low', 'Normal', 'High'];
    sampleDays.push({
      id: generateId(),
      date,
      dayNumber: differenceInDays(parseISO(date), parseISO(cycleStart)) + 1,
      executionScore: scores[Math.floor(Math.random() * 3)],
      energyLevel: energies[Math.floor(Math.random() * 3)],
      capacity: capacities[Math.floor(Math.random() * 3)],
      monthId,
    });
  }

  // Create initial month record
  const initialMonth: MonthRecord = {
    id: monthId,
    month: currentMonth,
    year: currentYear,
    monthName: format(new Date(), 'MMMM'),
    averageScore: 0,
    completedDays: 0,
    partialDays: 0,
    missedDays: 0,
    totalDays: 0,
  };

  return {
    tasks: sampleTasks,
    goals: sampleGoals,
    days: sampleDays,
    months: [initialMonth],
    archivedMonths: [],
    fixedDailyTasks: defaultFixedTasks,
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
        t.id === id ? { 
          ...t, 
          date: newDate, 
          migratedCount: t.migratedCount + 1,
          lastMigratedDate: format(new Date(), 'yyyy-MM-dd'),
        } : t
      ),
    }));
  };

  // Fixed Daily Task actions
  const addFixedDailyTask = (task: Omit<FixedDailyTask, 'id'>) => {
    const newTask: FixedDailyTask = { ...task, id: generateId() };
    setState(prev => ({ ...prev, fixedDailyTasks: [...prev.fixedDailyTasks, newTask] }));
  };

  const updateFixedDailyTask = (id: string, updates: Partial<FixedDailyTask>) => {
    setState(prev => ({
      ...prev,
      fixedDailyTasks: prev.fixedDailyTasks.map(t => t.id === id ? { ...t, ...updates } : t),
    }));
  };

  const deleteFixedDailyTask = (id: string) => {
    setState(prev => ({
      ...prev,
      fixedDailyTasks: prev.fixedDailyTasks.filter(t => t.id !== id),
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
          capacity: updates.capacity ?? 'Normal',
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

  // Month functions
  const getCurrentMonthStats = (): MonthStats => {
    const now = new Date();
    const currentMonth = getMonth(now);
    const currentYear = getYear(now);
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);
    const today = now > monthEnd ? monthEnd : now;
    
    // Get days in current month that are not archived
    const monthDays = state.days.filter(d => {
      const dayDate = parseISO(d.date);
      return getMonth(dayDate) === currentMonth && 
             getYear(dayDate) === currentYear && 
             !d.isArchived;
    });

    const completedDays = monthDays.filter(d => d.executionScore === 1).length;
    const partialDays = monthDays.filter(d => d.executionScore === 0.5).length;
    const missedDays = monthDays.filter(d => d.executionScore === 0).length;
    const totalDays = monthDays.length;
    
    const totalScore = monthDays.reduce((sum, d) => sum + d.executionScore, 0);
    const averageScore = totalDays > 0 ? Math.round((totalScore / totalDays) * 100) : 0;

    return {
      averageScore,
      completedDays,
      partialDays,
      missedDays,
      totalDays,
    };
  };

  const getCurrentMonthRecord = (): MonthRecord | undefined => {
    const currentMonth = getMonth(new Date());
    const currentYear = getYear(new Date());
    return state.months.find(m => m.month === currentMonth && m.year === currentYear);
  };

  const getMonthlyChartData = () => {
    const now = new Date();
    const currentMonth = getMonth(now);
    const currentYear = getYear(now);
    const daysInMonth = getDaysInMonth(now);
    const result: { day: string; score: number }[] = [];

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = format(new Date(currentYear, currentMonth, day), 'yyyy-MM-dd');
      const dayRecord = state.days.find(d => d.date === dateStr && !d.isArchived);
      
      // Only include days up to today
      if (new Date(currentYear, currentMonth, day) <= now) {
        result.push({
          day: day.toString(),
          score: dayRecord ? dayRecord.executionScore * 100 : 0,
        });
      }
    }

    return result;
  };

  const resetMonthProgress = () => {
    const now = new Date();
    const currentMonth = getMonth(now);
    const currentYear = getYear(now);
    const monthId = `${currentYear}-${currentMonth}`;

    setState(prev => {
      // Find days belonging to current month
      const monthDays = prev.days.filter(d => {
        const dayDate = parseISO(d.date);
        return getMonth(dayDate) === currentMonth && 
               getYear(dayDate) === currentYear && 
               !d.isArchived;
      });

      // Create archived month record
      const currentMonthRecord = prev.months.find(m => m.month === currentMonth && m.year === currentYear);
      const stats = getCurrentMonthStats();
      
      const archivedMonth: ArchivedMonth = {
        id: generateId(),
        monthRecord: {
          id: monthId,
          month: currentMonth,
          year: currentYear,
          monthName: format(now, 'MMMM'),
          averageScore: stats.averageScore,
          completedDays: stats.completedDays,
          partialDays: stats.partialDays,
          missedDays: stats.missedDays,
          totalDays: stats.totalDays,
          resetTimestamp: new Date().toISOString(),
          isArchived: true,
        },
        days: monthDays.map(d => ({ ...d, isArchived: true })),
        archivedAt: new Date().toISOString(),
      };

      // Mark current month days as archived
      const updatedDays = prev.days.map(d => {
        const dayDate = parseISO(d.date);
        if (getMonth(dayDate) === currentMonth && 
            getYear(dayDate) === currentYear && 
            !d.isArchived) {
          return { ...d, isArchived: true };
        }
        return d;
      });

      // Update or create new month record
      const newMonthRecord: MonthRecord = {
        id: monthId + '-' + generateId(),
        month: currentMonth,
        year: currentYear,
        monthName: format(now, 'MMMM'),
        averageScore: 0,
        completedDays: 0,
        partialDays: 0,
        missedDays: 0,
        totalDays: 0,
        resetTimestamp: new Date().toISOString(),
      };

      const updatedMonths = prev.months.map(m => 
        m.month === currentMonth && m.year === currentYear ? newMonthRecord : m
      );

      // Add month if not exists
      if (!updatedMonths.find(m => m.month === currentMonth && m.year === currentYear)) {
        updatedMonths.push(newMonthRecord);
      }

      return {
        ...prev,
        days: updatedDays,
        months: updatedMonths,
        archivedMonths: [...prev.archivedMonths, archivedMonth],
      };
    });
  };

  // Execution Intelligence - Capacity-aware day status calculation
  const calculateDayStatus = useCallback((date: string): DayStatus => {
    const tasks = state.tasks.filter(t => t.date === date);
    const dayRecord = state.days.find(d => d.date === date);
    const capacity = dayRecord?.capacity ?? 'Normal';
    const capacityLimit = CAPACITY_LIMITS[capacity];
    
    if (tasks.length === 0) return 'Pending';
    
    const completedTasks = tasks.filter(t => t.status === 'Completed').length;
    const totalTasks = tasks.length;
    
    // For fair evaluation: consider completion relative to capacity
    // If overplanned, evaluate based on capacity limit not total tasks
    const effectiveTarget = Math.min(totalTasks, capacityLimit);
    const completionRate = completedTasks / effectiveTarget;
    
    // Completed: met or exceeded capacity-adjusted target
    if (completionRate >= 1) return 'Completed';
    
    // Partial: completed at least 50% of capacity-adjusted target
    if (completionRate >= 0.5) return 'Partial';
    
    // Missed: completed less than 50%
    return 'Missed';
  }, [state.tasks, state.days]);

  const getWeeklyInsight = useCallback((): WeeklyInsight => {
    const now = new Date();
    const weekStart = startOfWeek(now, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
    const weekDays = eachDayOfInterval({ start: weekStart, end: now > weekEnd ? weekEnd : now });
    
    let completedDays = 0;
    let partialDays = 0;
    let missedDays = 0;
    let totalScore = 0;
    let totalTasksCompleted = 0;
    let totalTasksMigrated = 0;
    let overplanningCount = 0;
    
    // Track performance by capacity
    const capacityStats: Record<DailyCapacity, { days: number; totalScore: number }> = {
      Low: { days: 0, totalScore: 0 },
      Normal: { days: 0, totalScore: 0 },
      High: { days: 0, totalScore: 0 },
    };

    weekDays.forEach(day => {
      const dateStr = format(day, 'yyyy-MM-dd');
      const dayRecord = state.days.find(d => d.date === dateStr);
      const dayTasks = state.tasks.filter(t => t.date === dateStr);
      
      const score = dayRecord?.executionScore ?? 0;
      const capacity = dayRecord?.capacity ?? 'Normal';
      totalScore += score;
      
      if (score === 1) completedDays++;
      else if (score === 0.5) partialDays++;
      else if (dayTasks.length > 0) missedDays++;
      
      totalTasksCompleted += dayTasks.filter(t => t.status === 'Completed').length;
      totalTasksMigrated += dayTasks.filter(t => t.migratedCount > 0).length;
      
      // Track capacity-based performance
      if (dayRecord) {
        capacityStats[capacity].days++;
        capacityStats[capacity].totalScore += score;
      }
      
      // Check for overplanning
      const capacityLimit = CAPACITY_LIMITS[capacity];
      if (dayTasks.length > capacityLimit) {
        overplanningCount++;
      }
    });

    // Find most delayed task
    const migratedTasks = state.tasks.filter(t => t.migratedCount > 0);
    const mostDelayed = migratedTasks.length > 0 
      ? migratedTasks.reduce((max, t) => t.migratedCount > max.migratedCount ? t : max)
      : undefined;

    return {
      weekStartDate: format(weekStart, 'yyyy-MM-dd'),
      weekEndDate: format(weekEnd, 'yyyy-MM-dd'),
      completedDays,
      partialDays,
      missedDays,
      averageScore: weekDays.length > 0 ? Math.round((totalScore / weekDays.length) * 100) : 0,
      mostDelayedTask: mostDelayed ? { title: mostDelayed.title, migratedCount: mostDelayed.migratedCount } : undefined,
      totalTasksCompleted,
      totalTasksMigrated,
      performanceByCapacity: {
        Low: { 
          days: capacityStats.Low.days, 
          avgScore: capacityStats.Low.days > 0 ? Math.round((capacityStats.Low.totalScore / capacityStats.Low.days) * 100) : 0 
        },
        Normal: { 
          days: capacityStats.Normal.days, 
          avgScore: capacityStats.Normal.days > 0 ? Math.round((capacityStats.Normal.totalScore / capacityStats.Normal.days) * 100) : 0 
        },
        High: { 
          days: capacityStats.High.days, 
          avgScore: capacityStats.High.days > 0 ? Math.round((capacityStats.High.totalScore / capacityStats.High.days) * 100) : 0 
        },
      },
      overplanningCount,
    };
  }, [state.days, state.tasks]);

  const getMostDelayedTasks = useCallback((limit = 5): Task[] => {
    return [...state.tasks]
      .filter(t => t.migratedCount > 0)
      .sort((a, b) => b.migratedCount - a.migratedCount)
      .slice(0, limit);
  }, [state.tasks]);

  const getAtRiskTasks = useCallback((): Task[] => {
    // Tasks migrated 2+ times are "at risk"
    return state.tasks.filter(t => t.migratedCount >= 2 && t.status !== 'Completed');
  }, [state.tasks]);

  // Capacity functions
  const getTodayCapacity = useCallback((): DailyCapacity => {
    const today = format(new Date(), 'yyyy-MM-dd');
    const dayRecord = state.days.find(d => d.date === today);
    return dayRecord?.capacity ?? 'Normal';
  }, [state.days]);

  const setTodayCapacity = useCallback((capacity: DailyCapacity) => {
    const today = format(new Date(), 'yyyy-MM-dd');
    updateDayRecord(today, { capacity });
  }, []);

  const getCapacityLimit = useCallback((capacity: DailyCapacity): number => {
    return CAPACITY_LIMITS[capacity];
  }, []);

  const isOverplanned = useCallback((date: string): boolean => {
    const dayRecord = state.days.find(d => d.date === date);
    const capacity = dayRecord?.capacity ?? 'Normal';
    const tasks = state.tasks.filter(t => t.date === date);
    return tasks.length > CAPACITY_LIMITS[capacity];
  }, [state.days, state.tasks]);

  return (
    <PlannerContext.Provider
      value={{
        ...state,
        addTask,
        updateTask,
        deleteTask,
        completeTask,
        migrateTask,
        addFixedDailyTask,
        updateFixedDailyTask,
        deleteFixedDailyTask,
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
        getCurrentMonthStats,
        getCurrentMonthRecord,
        getMonthlyChartData,
        resetMonthProgress,
        calculateDayStatus,
        getWeeklyInsight,
        getMostDelayedTasks,
        getAtRiskTasks,
        getTodayCapacity,
        setTodayCapacity,
        getCapacityLimit,
        isOverplanned,
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
