
import { ReactNode } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import { Toaster } from '@/components/ui/toaster';
import { useAppStore } from '@/stores/useAppStore';

interface LayoutProps {
  children: ReactNode;
  showSidebar?: boolean;
}

const Layout = ({ children, showSidebar = true }: LayoutProps) => {
  const { notifications } = useAppStore();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black">
      <Header />
      <div className="flex h-[calc(100vh-4rem)]">
        {showSidebar && <Sidebar />}
        <main className="flex-1 overflow-auto">
          <div className="container mx-auto p-6">
            {children}
          </div>
        </main>
      </div>
      
      {/* Toast notifications */}
      <Toaster />
      
      {/* Global loading overlay if needed */}
      {/* {isLoading && <LoadingOverlay />} */}
    </div>
  );
};

export default Layout;
