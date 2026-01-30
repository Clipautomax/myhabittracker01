import { useState, useEffect } from 'react';
import { usePlanner } from '@/context/PlannerContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Moon, Sun, Clock, Save } from 'lucide-react';
import { format, differenceInMinutes, parseISO } from 'date-fns';

interface SleepTrackerProps {
  date?: string;
  compact?: boolean;
}

export const SleepTracker = ({ date, compact = false }: SleepTrackerProps) => {
  const { getDayRecord, updateDayRecord } = usePlanner();
  const targetDate = date || format(new Date(), 'yyyy-MM-dd');
  const dayRecord = getDayRecord(targetDate);

  const [sleepStart, setSleepStart] = useState('');
  const [wakeTime, setWakeTime] = useState('');

  useEffect(() => {
    if (dayRecord) {
      setSleepStart(dayRecord.sleepStartTime || '');
      setWakeTime(dayRecord.wakeUpTime || '');
    }
  }, [dayRecord]);

  const calculateDuration = (): number => {
    if (!sleepStart || !wakeTime) return 0;
    
    // Create date objects for calculation
    const sleepDate = new Date(`2000-01-01T${sleepStart}`);
    let wakeDate = new Date(`2000-01-01T${wakeTime}`);
    
    // If wake time is earlier than sleep time, assume next day
    if (wakeDate < sleepDate) {
      wakeDate = new Date(`2000-01-02T${wakeTime}`);
    }
    
    const minutes = differenceInMinutes(wakeDate, sleepDate);
    return Math.max(0, minutes / 60); // Return hours
  };

  const duration = calculateDuration();

  const handleSave = () => {
    updateDayRecord(targetDate, {
      sleepStartTime: sleepStart || undefined,
      wakeUpTime: wakeTime || undefined,
      sleepDuration: duration > 0 ? duration : undefined,
    });
  };

  const formatDuration = (hours: number): string => {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h}h ${m}m`;
  };

  if (compact) {
    return (
      <div className="flex items-center gap-4 p-3 rounded-lg bg-secondary/50">
        <Moon className="w-4 h-4 text-muted-foreground" />
        <div className="flex items-center gap-2 flex-1">
          <Input
            type="time"
            value={sleepStart}
            onChange={(e) => setSleepStart(e.target.value)}
            className="bg-background border-border h-8 w-24"
            placeholder="Sleep"
          />
          <span className="text-muted-foreground">→</span>
          <Input
            type="time"
            value={wakeTime}
            onChange={(e) => setWakeTime(e.target.value)}
            className="bg-background border-border h-8 w-24"
            placeholder="Wake"
          />
        </div>
        {duration > 0 && (
          <span className="text-sm font-medium text-foreground">
            {formatDuration(duration)}
          </span>
        )}
        <Button size="sm" variant="ghost" onClick={handleSave}>
          <Save className="w-4 h-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="dashboard-card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Moon className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-foreground">Sleep Tracking</h3>
        </div>
        {duration > 0 && (
          <div className="flex items-center gap-2 text-sm">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span className="font-medium text-foreground">{formatDuration(duration)}</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="text-sm text-muted-foreground mb-1.5 block flex items-center gap-1.5">
            <Moon className="w-3.5 h-3.5" />
            Sleep Time
          </label>
          <Input
            type="time"
            value={sleepStart}
            onChange={(e) => setSleepStart(e.target.value)}
            className="bg-secondary border-border"
          />
        </div>
        <div>
          <label className="text-sm text-muted-foreground mb-1.5 block flex items-center gap-1.5">
            <Sun className="w-3.5 h-3.5" />
            Wake Time
          </label>
          <Input
            type="time"
            value={wakeTime}
            onChange={(e) => setWakeTime(e.target.value)}
            className="bg-secondary border-border"
          />
        </div>
      </div>

      <Button onClick={handleSave} className="w-full" variant="secondary">
        <Save className="w-4 h-4 mr-2" />
        Save Sleep Data
      </Button>
    </div>
  );
};
