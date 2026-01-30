import { useState, useEffect } from 'react';
import { usePlanner } from '@/context/PlannerContext';
import { Task, TaskPriority, TaskType, TaskStatus } from '@/types/planner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Trash2, ArrowRight, Save } from 'lucide-react';
import { format, addDays } from 'date-fns';

interface TaskEditDialogProps {
  task: Task | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const TaskEditDialog = ({ task, open, onOpenChange }: TaskEditDialogProps) => {
  const { updateTask, deleteTask, migrateTask } = usePlanner();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('Medium');
  const [type, setType] = useState<TaskType>('Daily');
  const [status, setStatus] = useState<TaskStatus>('Pending');

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || '');
      setDate(task.date);
      setTime(task.time || '');
      setPriority(task.priority);
      setType(task.type);
      setStatus(task.status);
    }
  }, [task]);

  if (!task) return null;

  // Check if this is a skill task (has special ID format)
  const isSkillTask = task.id.startsWith('skill-');

  const handleSave = () => {
    if (!title.trim() || isSkillTask) return;

    updateTask(task.id, {
      title: title.trim(),
      description: description.trim(),
      date,
      time: time || undefined,
      priority,
      type,
      status,
    });

    onOpenChange(false);
  };

  const handleDelete = () => {
    if (isSkillTask) return;
    deleteTask(task.id);
    onOpenChange(false);
  };

  const handleMigrate = () => {
    if (isSkillTask) return;
    const tomorrow = format(addDays(new Date(task.date), 1), 'yyyy-MM-dd');
    migrateTask(task.id, tomorrow);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Task Details</span>
            {isSkillTask && (
              <span className="text-xs px-2 py-1 rounded bg-primary/10 text-primary font-normal">
                Skill Task
              </span>
            )}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <label className="text-sm text-muted-foreground mb-1.5 block">Title</label>
            <Input
              placeholder="Task title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-secondary border-border"
              disabled={isSkillTask}
            />
          </div>
          
          <div>
            <label className="text-sm text-muted-foreground mb-1.5 block">Description</label>
            <Textarea
              placeholder="Description (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="bg-secondary border-border resize-none"
              rows={2}
              disabled={isSkillTask}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-muted-foreground mb-1.5 block">Date</label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="bg-secondary border-border"
                disabled={isSkillTask}
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-1.5 block">Time</label>
              <Input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="bg-secondary border-border"
                disabled={isSkillTask}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-muted-foreground mb-1.5 block">Priority</label>
              <Select 
                value={priority} 
                onValueChange={(v) => setPriority(v as TaskPriority)}
                disabled={isSkillTask}
              >
                <SelectTrigger className="bg-secondary border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-1.5 block">Type</label>
              <Select 
                value={type} 
                onValueChange={(v) => setType(v as TaskType)}
                disabled={isSkillTask}
              >
                <SelectTrigger className="bg-secondary border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Daily">Daily</SelectItem>
                  <SelectItem value="Special">Special</SelectItem>
                  <SelectItem value="Monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <label className="text-sm text-muted-foreground mb-1.5 block">Status</label>
            <Select 
              value={status} 
              onValueChange={(v) => setStatus(v as TaskStatus)}
              disabled={isSkillTask}
            >
              <SelectTrigger className="bg-secondary border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
                <SelectItem value="Missed">Missed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Migration info */}
          {task.migratedCount > 0 && (
            <div className="p-3 rounded-lg bg-secondary/50 text-sm">
              <p className="text-muted-foreground">
                Migrated {task.migratedCount} time{task.migratedCount > 1 ? 's' : ''}
                {task.lastMigratedDate && (
                  <span> · Last moved {format(new Date(task.lastMigratedDate), 'MMM d')}</span>
                )}
              </p>
            </div>
          )}

          {/* Actions */}
          {!isSkillTask && (
            <div className="flex items-center justify-between pt-2 border-t border-border">
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDelete}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleMigrate}
                >
                  <ArrowRight className="w-4 h-4 mr-2" />
                  Tomorrow
                </Button>
              </div>
              <Button onClick={handleSave}>
                <Save className="w-4 h-4 mr-2" />
                Save
              </Button>
            </div>
          )}

          {isSkillTask && (
            <p className="text-sm text-muted-foreground text-center py-2">
              Skill tasks are managed from the Weekly Skill Schedule
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
