import { NavLink, useLocation } from 'react-router-dom';
import { Home, Calendar, Target, BarChart3, Sun } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { to: '/', icon: Home, label: 'Home' },
  { to: '/today', icon: Sun, label: 'Today' },
  { to: '/calendar', icon: Calendar, label: 'Calendar' },
  { to: '/goals', icon: Target, label: 'Goals' },
  { to: '/performance', icon: BarChart3, label: 'Stats' },
];

export const MobileNav = () => {
  const location = useLocation();

  return (
    <nav className="bottom-nav">
      {navItems.map(({ to, icon: Icon, label }) => {
        const isActive = location.pathname === to;
        return (
          <NavLink
            key={to}
            to={to}
            className={cn(
              isActive ? 'bottom-nav-item-active' : 'bottom-nav-item'
            )}
          >
            <Icon className="w-5 h-5" />
            <span className="text-[10px] font-medium">{label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
};
