import { useState } from 'react';
import { usePlanner } from '@/context/PlannerContext';
import { GoalType } from '@/types/planner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { Plus } from 'lucide-react';
import { format, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns';

interface AddGoalDialogProps {
  trigger?: React.ReactNode;
}

export const AddGoalDialog = ({ trigger }: AddGoalDialogProps) => {
  const { addGoal } = usePlanner();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [type, setType] = useState<GoalType>('Monthly');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const now = new Date();
    const startDate = type === 'Monthly' 
      ? format(startOfMonth(now), 'yyyy-MM-dd')
      : format(startOfYear(now), 'yyyy-MM-dd');
    const endDate = type === 'Monthly'
      ? format(endOfMonth(now), 'yyyy-MM-dd')
      : format(endOfYear(now), 'yyyy-MM-dd');

    addGoal({
      title: title.trim(),
      type,
      startDate,
      endDate,
      progress: 0,
    });

    setTitle('');
    setType('Monthly');
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            Add Goal
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="bg-card border-border">
        <DialogHeader>
          <DialogTitle>Add New Goal</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm text-muted-foreground mb-1.5 block">Goal Title</label>
            <Input
              placeholder="What do you want to achieve?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-secondary border-border"
            />
          </div>
          <div>
            <label className="text-sm text-muted-foreground mb-1.5 block">Goal Type</label>
            <Select value={type} onValueChange={(v) => setType(v as GoalType)}>
              <SelectTrigger className="bg-secondary border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Monthly">Monthly Goal</SelectItem>
                <SelectItem value="Yearly">Yearly Goal</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Add Goal</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
