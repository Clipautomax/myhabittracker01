import { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { MobileNav } from './MobileNav';

interface DashboardLayoutProps {
  children: ReactNode;
}

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  return (
    <div className="flex min-h-screen w-full bg-background">
      {/* Desktop sidebar - hidden on mobile */}
      <div className="hidden md:block">
        <Sidebar />
      </div>
      
      <main className="flex-1 overflow-auto pb-safe">
        <div className="p-4 md:p-6 lg:p-8">
          {children}
        </div>
      </main>
      
      {/* Mobile bottom navigation */}
      <MobileNav />
    </div>
  );
};
