
import { ReactNode } from 'react';
import TopNavigation from '@/components/navigation/TopNavigation';
import BottomNavigation from '@/components/navigation/BottomNavigation';
import FloatingAIAnalyzer from '@/components/ai/FloatingAIAnalyzer';
import { Toaster } from '@/components/ui/toaster';

interface DEXLayoutProps {
  children: ReactNode;
}

const DEXLayout = ({ children }: DEXLayoutProps) => {
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <TopNavigation />
      
      <main className="pt-16 pb-16 md:pb-0 min-h-screen w-full">
        {children}
      </main>

      <BottomNavigation />
      <FloatingAIAnalyzer />
      <Toaster />
    </div>
  );
};

export default DEXLayout;
