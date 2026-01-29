import { useState } from 'react';
import { usePlanner } from '@/context/PlannerContext';
import { WeeklySkillSchedule, DayOfWeek } from '@/types/planner';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { Plus, Target, Trash2, Edit2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const DAYS_OF_WEEK: DayOfWeek[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export const WeeklySkillScheduleCard = () => {
  const { weeklySkillSchedules, addWeeklySkillSchedule, updateWeeklySkillSchedule, deleteWeeklySkillSchedule } = usePlanner();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<WeeklySkillSchedule | null>(null);
  const [newSchedule, setNewSchedule] = useState({
    skillName: '',
    dayOfWeek: 'Monday' as DayOfWeek,
    focusArea: '',
    description: '',
    isActive: true,
  });

  const handleAddSchedule = () => {
    if (!newSchedule.skillName.trim() || !newSchedule.focusArea.trim()) return;
    
    addWeeklySkillSchedule(newSchedule);
    setNewSchedule({
      skillName: '',
      dayOfWeek: 'Monday',
      focusArea: '',
      description: '',
      isActive: true,
    });
    setIsAddDialogOpen(false);
  };

  const handleUpdateSchedule = () => {
    if (!editingSchedule) return;
    updateWeeklySkillSchedule(editingSchedule.id, editingSchedule);
    setEditingSchedule(null);
  };

  const groupedSchedules = DAYS_OF_WEEK.reduce((acc, day) => {
    acc[day] = weeklySkillSchedules.filter(s => s.dayOfWeek === day);
    return acc;
  }, {} as Record<DayOfWeek, WeeklySkillSchedule[]>);

  return (
    <div className="dashboard-card">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-semibold text-foreground">Weekly Skill Schedule</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Fixed skill focus by day of week</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline" className="gap-2">
              <Plus className="w-4 h-4" />
              Add Skill
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Weekly Skill</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="skillName">Skill Name</Label>
                <Input
                  id="skillName"
                  placeholder="e.g., Football, Guitar, Coding"
                  value={newSchedule.skillName}
                  onChange={e => setNewSchedule(prev => ({ ...prev, skillName: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dayOfWeek">Day of Week</Label>
                <Select
                  value={newSchedule.dayOfWeek}
                  onValueChange={(v: DayOfWeek) => setNewSchedule(prev => ({ ...prev, dayOfWeek: v }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select day" />
                  </SelectTrigger>
                  <SelectContent>
                    {DAYS_OF_WEEK.map(day => (
                      <SelectItem key={day} value={day}>{day}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="focusArea">Focus Area</Label>
                <Input
                  id="focusArea"
                  placeholder="e.g., Passing, Chord progressions"
                  value={newSchedule.focusArea}
                  onChange={e => setNewSchedule(prev => ({ ...prev, focusArea: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description (optional)</Label>
                <Input
                  id="description"
                  placeholder="Additional details..."
                  value={newSchedule.description}
                  onChange={e => setNewSchedule(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>
              <Button onClick={handleAddSchedule} className="w-full">
                Add to Schedule
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {weeklySkillSchedules.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <Target className="w-10 h-10 mx-auto mb-3 opacity-50" />
          <p>No skills scheduled</p>
          <p className="text-sm mt-1">Add skills to build weekly mastery</p>
        </div>
      ) : (
        <div className="space-y-4">
          {DAYS_OF_WEEK.map(day => {
            const daySchedules = groupedSchedules[day];
            if (daySchedules.length === 0) return null;
            
            return (
              <div key={day} className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground">{day}</h3>
                {daySchedules.map(schedule => (
                  <div
                    key={schedule.id}
                    className={cn(
                      'flex items-center justify-between p-3 rounded-lg bg-secondary/50 border border-border',
                      !schedule.isActive && 'opacity-50'
                    )}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-foreground">{schedule.skillName}</span>
                        <span className="text-xs px-1.5 py-0.5 rounded bg-primary/10 text-primary">
                          {schedule.focusArea}
                        </span>
                      </div>
                      {schedule.description && (
                        <p className="text-sm text-muted-foreground mt-0.5">{schedule.description}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={schedule.isActive}
                        onCheckedChange={(checked) => updateWeeklySkillSchedule(schedule.id, { isActive: checked })}
                      />
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => setEditingSchedule(schedule)}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => deleteWeeklySkillSchedule(schedule.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={!!editingSchedule} onOpenChange={(open) => !open && setEditingSchedule(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Skill Schedule</DialogTitle>
          </DialogHeader>
          {editingSchedule && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-skillName">Skill Name</Label>
                <Input
                  id="edit-skillName"
                  value={editingSchedule.skillName}
                  onChange={e => setEditingSchedule(prev => prev ? { ...prev, skillName: e.target.value } : null)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-dayOfWeek">Day of Week</Label>
                <Select
                  value={editingSchedule.dayOfWeek}
                  onValueChange={(v: DayOfWeek) => setEditingSchedule(prev => prev ? { ...prev, dayOfWeek: v } : null)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DAYS_OF_WEEK.map(day => (
                      <SelectItem key={day} value={day}>{day}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-focusArea">Focus Area</Label>
                <Input
                  id="edit-focusArea"
                  value={editingSchedule.focusArea}
                  onChange={e => setEditingSchedule(prev => prev ? { ...prev, focusArea: e.target.value } : null)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-description">Description</Label>
                <Input
                  id="edit-description"
                  value={editingSchedule.description || ''}
                  onChange={e => setEditingSchedule(prev => prev ? { ...prev, description: e.target.value } : null)}
                />
              </div>
              <Button onClick={handleUpdateSchedule} className="w-full">
                Save Changes
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
