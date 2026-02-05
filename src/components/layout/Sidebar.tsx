import { NavLink, useLocation } from 'react-router-dom';
import { Home, Calendar, Target, BarChart3, Sun } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { to: '/', icon: Home, label: 'Home' },
  { to: '/today', icon: Sun, label: 'Today' },
  { to: '/calendar', icon: Calendar, label: 'Calendar' },
  { to: '/goals', icon: Target, label: 'Goals' },
  { to: '/performance', icon: BarChart3, label: 'Performance' },
];

export const Sidebar = () => {
  const location = useLocation();

  return (
    <aside className="w-64 min-h-screen bg-background border-r border-border flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-secondary border border-border flex items-center justify-center">
            <span className="text-lg font-bold text-foreground">F</span>
          </div>
          <div>
            <h1 className="font-semibold text-foreground">Focus OS</h1>
            <p className="text-xs text-muted-foreground">Personal Planner</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map(({ to, icon: Icon, label }) => {
          const isActive = location.pathname === to;
          return (
            <NavLink
              key={to}
              to={to}
              className={cn(
                isActive ? 'nav-item-active' : 'nav-item'
              )}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-border">
        <div className="p-4 rounded-2xl bg-secondary/50 border border-border">
          <p className="text-xs text-muted-foreground mb-1">Pro tip</p>
          <p className="text-sm text-foreground/80">
            Complete all daily tasks to achieve 100% execution score.
          </p>
        </div>
      </div>
    </aside>
  );
};
