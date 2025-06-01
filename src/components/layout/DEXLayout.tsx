
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
      
      <main className="pt-14 sm:pt-16 pb-20 md:pb-4 min-h-screen">
        <div className="container mx-auto px-2 sm:px-4 lg:px-6 max-w-7xl">
          {children}
        </div>
      </main>

      <BottomNavigation />
      <FloatingAIAnalyzer />
      <Toaster />
    </div>
  );
};

export default DEXLayout;
