import { useState } from 'react';
import { usePlanner } from '@/context/PlannerContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { ProgressRing } from '@/components/ui/ProgressRing';
import { CheckCircle2, AlertCircle, XCircle, TrendingUp, RotateCcw, Calendar, Archive } from 'lucide-react';
import { format } from 'date-fns';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { useToast } from '@/hooks/use-toast';

interface MonthDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const MonthDetailDialog = ({ open, onOpenChange }: MonthDetailDialogProps) => {
  const { getCurrentMonthStats, getMonthlyChartData, resetMonthProgress, getCurrentMonthRecord } = usePlanner();
  const { toast } = useToast();
  const [isResetting, setIsResetting] = useState(false);

  const stats = getCurrentMonthStats();
  const chartData = getMonthlyChartData();
  const monthRecord = getCurrentMonthRecord();

  const handleReset = async () => {
    setIsResetting(true);
    try {
      resetMonthProgress();
      toast({
        title: "Month Reset Complete",
        description: `${format(new Date(), 'MMMM yyyy')} progress has been archived and reset.`,
      });
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Reset Failed",
        description: "There was an error resetting the month. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsResetting(false);
    }
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-lg font-semibold text-foreground">{payload[0].value}%</p>
        </div>
      );
    }
    return null;
  };

  // Distribution data for bar chart
  const distributionData = [
    { name: 'Completed', value: stats.completedDays, fill: 'hsl(var(--status-completed))' },
    { name: 'Partial', value: stats.partialDays, fill: 'hsl(var(--status-partial))' },
    { name: 'Missed', value: stats.missedDays, fill: 'hsl(var(--status-missed))' },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-background border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-xl">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-primary" />
            </div>
            {format(new Date(), 'MMMM yyyy')} Progress
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Stats Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-secondary/50 border border-border text-center">
              <TrendingUp className="w-6 h-6 text-primary mx-auto mb-2" />
              <p className="text-3xl font-bold text-foreground">{stats.averageScore}%</p>
              <p className="text-xs text-muted-foreground">Avg Score</p>
            </div>
            <div className="p-4 rounded-xl bg-secondary/50 border border-border text-center">
              <CheckCircle2 className="w-6 h-6 text-status-completed mx-auto mb-2" />
              <p className="text-3xl font-bold text-status-completed">{stats.completedDays}</p>
              <p className="text-xs text-muted-foreground">Completed</p>
            </div>
            <div className="p-4 rounded-xl bg-secondary/50 border border-border text-center">
              <AlertCircle className="w-6 h-6 text-status-partial mx-auto mb-2" />
              <p className="text-3xl font-bold text-status-partial">{stats.partialDays}</p>
              <p className="text-xs text-muted-foreground">Partial</p>
            </div>
            <div className="p-4 rounded-xl bg-secondary/50 border border-border text-center">
              <XCircle className="w-6 h-6 text-status-missed mx-auto mb-2" />
              <p className="text-3xl font-bold text-status-missed">{stats.missedDays}</p>
              <p className="text-xs text-muted-foreground">Missed</p>
            </div>
          </div>

          {/* Progress Ring & Distribution */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Progress Ring */}
            <div className="p-6 rounded-xl bg-secondary/30 border border-border">
              <h3 className="font-semibold text-foreground mb-4">Overall Progress</h3>
              <div className="flex justify-center">
                <ProgressRing progress={stats.averageScore} size={180} strokeWidth={14}>
                  <div className="text-center">
                    <span className="text-5xl font-bold text-foreground">{stats.averageScore}</span>
                    <span className="text-2xl text-muted-foreground">%</span>
                    <p className="text-sm text-muted-foreground mt-1">
                      {stats.totalDays} days tracked
                    </p>
                  </div>
                </ProgressRing>
              </div>
            </div>

            {/* Distribution Bar Chart */}
            <div className="p-6 rounded-xl bg-secondary/30 border border-border">
              <h3 className="font-semibold text-foreground mb-4">Day Distribution</h3>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={distributionData} layout="vertical">
                    <XAxis type="number" hide />
                    <YAxis 
                      type="category" 
                      dataKey="name" 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                      width={80}
                    />
                    <Tooltip content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-popover border border-border rounded-lg p-2 shadow-lg">
                            <p className="text-sm font-medium">{payload[0].payload.name}: {payload[0].value} days</p>
                          </div>
                        );
                      }
                      return null;
                    }} />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                      {distributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Daily Progress Line Chart */}
          <div className="p-6 rounded-xl bg-secondary/30 border border-border">
            <h3 className="font-semibold text-foreground mb-4">Daily Progress This Month</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="day" 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    domain={[0, 100]}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={{ fill: 'hsl(var(--primary))', strokeWidth: 0, r: 3 }}
                    activeDot={{ r: 6, fill: 'hsl(var(--primary))' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Last Reset Info */}
          {monthRecord?.resetTimestamp && (
            <div className="p-4 rounded-xl bg-muted/50 border border-border flex items-center gap-3">
              <Archive className="w-5 h-5 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Last reset: {format(new Date(monthRecord.resetTimestamp), 'PPpp')}
              </p>
            </div>
          )}

          {/* Reset Button */}
          <div className="pt-4 border-t border-border">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="destructive" 
                  className="w-full gap-2"
                  disabled={isResetting}
                >
                  <RotateCcw className="w-4 h-4" />
                  Reset Monthly Progress
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-background border-border">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-foreground">Reset {format(new Date(), 'MMMM yyyy')} Progress?</AlertDialogTitle>
                  <AlertDialogDescription className="text-muted-foreground">
                    This will:
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      <li>Archive all day records from this month</li>
                      <li>Reset all monthly counters to zero</li>
                      <li>Preserve data for yearly analytics</li>
                    </ul>
                    <p className="mt-3 font-medium">This action cannot be undone.</p>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="bg-secondary text-foreground hover:bg-secondary/80">Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleReset} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    Yes, Reset Month
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
