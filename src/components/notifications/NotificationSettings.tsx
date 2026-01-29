import { useState, useEffect } from 'react';
import { Bell, BellOff, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface NotificationConfig {
  enabled: boolean;
  time: string; // HH:MM format
}

const STORAGE_KEY = 'plannerNotificationConfig';

const getStoredConfig = (): NotificationConfig => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      // Fall through
    }
  }
  return { enabled: false, time: '08:00' };
};

export const NotificationSettings = () => {
  const [config, setConfig] = useState<NotificationConfig>(getStoredConfig);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const { toast } = useToast();

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  }, [config]);

  const requestPermission = async () => {
    if (!('Notification' in window)) {
      toast({
        title: 'Not Supported',
        description: 'Your browser does not support notifications.',
        variant: 'destructive',
      });
      return;
    }

    const result = await Notification.requestPermission();
    setPermission(result);
    
    if (result === 'granted') {
      setConfig(prev => ({ ...prev, enabled: true }));
      toast({
        title: 'Notifications Enabled',
        description: `You'll receive a daily reminder at ${config.time}.`,
      });
    } else {
      toast({
        title: 'Permission Denied',
        description: 'Enable notifications in your browser settings.',
        variant: 'destructive',
      });
    }
  };

  const toggleEnabled = async (enabled: boolean) => {
    if (enabled && permission !== 'granted') {
      await requestPermission();
    } else {
      setConfig(prev => ({ ...prev, enabled }));
    }
  };

  const handleTimeChange = (time: string) => {
    setConfig(prev => ({ ...prev, time }));
  };

  const testNotification = () => {
    if (permission !== 'granted') {
      requestPermission();
      return;
    }

    new Notification('Focus Reminder', {
      body: 'This is a test notification from your planner.',
      icon: '/favicon.ico',
      badge: '/favicon.ico',
    });
  };

  return (
    <div className="dashboard-card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center",
            config.enabled ? "bg-primary/10" : "bg-muted"
          )}>
            {config.enabled ? (
              <Bell className="w-5 h-5 text-primary" />
            ) : (
              <BellOff className="w-5 h-5 text-muted-foreground" />
            )}
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Daily Reminder</h3>
            <p className="text-sm text-muted-foreground">
              {config.enabled ? 'Active' : 'Disabled'}
            </p>
          </div>
        </div>
        <Switch
          checked={config.enabled}
          onCheckedChange={toggleEnabled}
        />
      </div>

      {config.enabled && (
        <div className="space-y-4 pt-4 border-t border-border">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 flex-1">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <Label htmlFor="reminder-time" className="text-sm text-muted-foreground">
                Reminder time
              </Label>
            </div>
            <Input
              id="reminder-time"
              type="time"
              value={config.time}
              onChange={(e) => handleTimeChange(e.target.value)}
              className="w-32 bg-secondary border-border"
            />
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={testNotification}
            className="w-full"
          >
            Test Notification
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            Shows today's top task and current status
          </p>
        </div>
      )}

      {permission === 'denied' && (
        <p className="text-xs text-amber-400 mt-3">
          Notifications blocked. Enable in browser settings.
        </p>
      )}
    </div>
  );
};

// Hook to manage notification scheduling
export const useNotificationScheduler = () => {
  const getConfig = (): NotificationConfig => getStoredConfig();

  const scheduleNotification = (topTask: string, dayStatus: string) => {
    const config = getConfig();
    if (!config.enabled || Notification.permission !== 'granted') return;

    const [hours, minutes] = config.time.split(':').map(Number);
    const now = new Date();
    const scheduledTime = new Date();
    scheduledTime.setHours(hours, minutes, 0, 0);

    // If time has passed, schedule for tomorrow
    if (scheduledTime <= now) {
      scheduledTime.setDate(scheduledTime.getDate() + 1);
    }

    const delay = scheduledTime.getTime() - now.getTime();

    setTimeout(() => {
      if (Notification.permission === 'granted') {
        new Notification('Focus Reminder', {
          body: topTask 
            ? `Today's focus: ${topTask}\nStatus: ${dayStatus}`
            : `Status: ${dayStatus}`,
          icon: '/favicon.ico',
          badge: '/favicon.ico',
        });
      }
    }, delay);
  };

  return { scheduleNotification, getConfig };
};
