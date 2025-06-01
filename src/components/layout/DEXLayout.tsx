
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
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <TopNavigation />
      
      <main className="pt-14 sm:pt-16 pb-20 md:pb-6 min-h-screen">
        <div className="w-full px-3 sm:px-6 lg:px-8 max-w-none">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </div>
      </main>

      <BottomNavigation />
      <FloatingAIAnalyzer />
      <Toaster />
    </div>
  );
};

export default DEXLayout;
