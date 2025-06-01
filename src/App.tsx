
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/sonner';
import { useSupabaseIntegration } from '@/hooks/useSupabaseIntegration';

// Import all pages
import Index from '@/pages/Index';
import Swap from '@/pages/Swap';
import Bridge from '@/pages/Bridge';
import Create from '@/pages/Create';
import Deploy from '@/pages/Deploy';
import Analytics from '@/pages/Analytics';
import Points from '@/pages/Points';
import Referrals from '@/pages/Referrals';
import EarnSTEX from '@/pages/EarnSTEX';
import GM from '@/pages/GM';
import History from '@/pages/History';
import Profile from '@/pages/Profile';
import Settings from '@/pages/Settings';
import Support from '@/pages/Support';
import Documentation from '@/pages/Documentation';
import Chains from '@/pages/Chains';
import NotFound from '@/pages/NotFound';

import DEXLayout from '@/components/layout/DEXLayout';
import './App.css';

const queryClient = new QueryClient();

// App content component to use hooks
const AppContent = () => {
  const { isAuthenticated } = useSupabaseIntegration();
  
  return (
    <DEXLayout>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/swap" element={<Swap />} />
        <Route path="/bridge" element={<Bridge />} />
        <Route path="/create" element={<Create />} />
        <Route path="/deploy" element={<Deploy />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/points" element={<Points />} />
        <Route path="/referrals" element={<Referrals />} />
        <Route path="/earn" element={<EarnSTEX />} />
        <Route path="/gm" element={<GM />} />
        <Route path="/history" element={<History />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/support" element={<Support />} />
        <Route path="/docs" element={<Documentation />} />
        <Route path="/chains" element={<Chains />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </DEXLayout>
  );
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AppContent />
        <Toaster />
      </Router>
    </QueryClientProvider>
  );
}

export default App;
