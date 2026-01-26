import { usePlanner } from '@/context/PlannerContext';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Plus, Trash2, Clock } from 'lucide-react';
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { TaskPriority } from '@/types/planner';

export const FixedDailyTasksCard = () => {
  const { fixedDailyTasks, addFixedDailyTask, updateFixedDailyTask, deleteFixedDailyTask } = usePlanner();
  const [isOpen, setIsOpen] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    time: '',
    priority: 'Medium' as TaskPriority,
  });

  const handleAdd = () => {
    if (!newTask.title.trim()) return;
    addFixedDailyTask({
      ...newTask,
      isActive: true,
    });
    setNewTask({ title: '', description: '', time: '', priority: 'Medium' });
    setIsOpen(false);
  };

  return (
    <div className="dashboard-card">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-foreground">Fixed Daily Tasks</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Non-negotiable habits</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Plus className="w-4 h-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add Fixed Daily Task</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <Input
                placeholder="Task title"
                value={newTask.title}
                onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
              />
              <Input
                placeholder="Description (optional)"
                value={newTask.description}
                onChange={(e) => setNewTask(prev => ({ ...prev, description: e.target.value }))}
              />
              <div className="grid grid-cols-2 gap-3">
                <Input
                  type="time"
                  placeholder="Time"
                  value={newTask.time}
                  onChange={(e) => setNewTask(prev => ({ ...prev, time: e.target.value }))}
                />
                <Select
                  value={newTask.priority}
                  onValueChange={(value: TaskPriority) => setNewTask(prev => ({ ...prev, priority: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="Low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleAdd} className="w-full">Add Task</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-2">
        {fixedDailyTasks.map(task => (
          <div 
            key={task.id}
            className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 border border-border group"
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <Switch
                checked={task.isActive}
                onCheckedChange={(checked) => updateFixedDailyTask(task.id, { isActive: checked })}
              />
              <div className="flex-1 min-w-0">
                <p className={`font-medium text-sm truncate ${!task.isActive ? 'text-muted-foreground' : 'text-foreground'}`}>
                  {task.title}
                </p>
                {task.time && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    {task.time}
                  </div>
                )}
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => deleteFixedDailyTask(task.id)}
            >
              <Trash2 className="w-3 h-3 text-destructive" />
            </Button>
          </div>
        ))}
        
        {fixedDailyTasks.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">
            Add fixed daily tasks to build consistent habits
          </p>
        )}
      </div>
    </div>
  );
};
