
import { ReactNode } from 'react';
import TopNavigation from '@/components/navigation/TopNavigation';
import BottomNavigation from '@/components/navigation/BottomNavigation';

interface DEXLayoutProps {
  children: ReactNode;
}

const DEXLayout = ({ children }: DEXLayoutProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <TopNavigation />
      
      <main className="pb-20 md:pb-0">
        {children}
      </main>

      <BottomNavigation />
    </div>
  );
};

export default DEXLayout;
