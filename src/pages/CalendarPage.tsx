import { useState } from 'react';
import { usePlanner } from '@/context/PlannerContext';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { TaskItem } from '@/components/tasks/TaskItem';
import { AddTaskDialog } from '@/components/tasks/AddTaskDialog';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  isToday,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek,
} from 'date-fns';
import { cn } from '@/lib/utils';

const CalendarPage = () => {
  const { tasks, getTasksByDate, getDayRecord } = usePlanner();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');
  const selectedTasks = getTasksByDate(selectedDateStr);
  const selectedDayRecord = getDayRecord(selectedDateStr);

  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const getTaskCountForDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return tasks.filter(t => t.date === dateStr).length;
  };

  const getDayStatusColor = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const dayRecord = getDayRecord(dateStr);
    if (!dayRecord) return null;
    if (dayRecord.executionScore === 1) return 'bg-status-completed';
    if (dayRecord.executionScore === 0.5) return 'bg-status-partial';
    return 'bg-status-missed';
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">Calendar</h1>
          <AddTaskDialog defaultDate={selectedDateStr} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar */}
          <div className="dashboard-card lg:col-span-2">
            {/* Month Navigation */}
            <div className="flex items-center justify-between mb-6">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <h2 className="text-lg font-semibold text-foreground">
                {format(currentMonth, 'MMMM yyyy')}
              </h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              >
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>

            {/* Week Headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {weekDays.map(day => (
                <div key={day} className="text-center text-sm text-muted-foreground py-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map(day => {
                const isCurrentMonth = isSameMonth(day, currentMonth);
                const isSelected = isSameDay(day, selectedDate);
                const isTodayDate = isToday(day);
                const taskCount = getTaskCountForDate(day);
                const statusColor = getDayStatusColor(day);

                return (
                  <button
                    key={day.toISOString()}
                    onClick={() => setSelectedDate(day)}
                    className={cn(
                      'relative aspect-square p-1 rounded-xl transition-all hover:bg-secondary',
                      !isCurrentMonth && 'opacity-30',
                      isSelected && 'bg-primary text-primary-foreground hover:bg-primary',
                      isTodayDate && !isSelected && 'ring-2 ring-primary ring-offset-2 ring-offset-background'
                    )}
                  >
                    <span className="text-sm font-medium">{format(day, 'd')}</span>
                    
                    {/* Task indicator dots */}
                    {taskCount > 0 && (
                      <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5">
                        {Array.from({ length: Math.min(taskCount, 3) }).map((_, i) => (
                          <div
                            key={i}
                            className={cn(
                              'w-1 h-1 rounded-full',
                              isSelected ? 'bg-primary-foreground' : 'bg-primary'
                            )}
                          />
                        ))}
                      </div>
                    )}

                    {/* Status indicator */}
                    {statusColor && (
                      <div
                        className={cn(
                          'absolute top-1 right-1 w-2 h-2 rounded-full',
                          statusColor
                        )}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected Day Tasks */}
          <div className="dashboard-card">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-foreground">
                  {format(selectedDate, 'EEEE')}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {format(selectedDate, 'MMMM d, yyyy')}
                </p>
              </div>
              <AddTaskDialog 
                defaultDate={selectedDateStr}
                trigger={
                  <Button size="icon" variant="ghost">
                    <Plus className="w-5 h-5" />
                  </Button>
                }
              />
            </div>

            {/* Day Status */}
            {selectedDayRecord && (
              <div className="mb-4 p-3 rounded-lg bg-secondary/50">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Execution Score</span>
                  <span className={cn(
                    'font-semibold',
                    selectedDayRecord.executionScore === 1 && 'text-status-completed',
                    selectedDayRecord.executionScore === 0.5 && 'text-status-partial',
                    selectedDayRecord.executionScore === 0 && 'text-status-missed'
                  )}>
                    {selectedDayRecord.executionScore * 100}%
                  </span>
                </div>
              </div>
            )}

            {/* Tasks List */}
            <div className="space-y-3 max-h-96 overflow-y-auto scrollbar-thin">
              {selectedTasks.length > 0 ? (
                selectedTasks.map(task => (
                  <TaskItem key={task.id} task={task} />
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p className="mb-2">No tasks for this day</p>
                  <AddTaskDialog 
                    defaultDate={selectedDateStr}
                    trigger={
                      <Button variant="outline" size="sm">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Task
                      </Button>
                    }
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CalendarPage;
