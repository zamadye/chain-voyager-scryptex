
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/sonner';
import { useWeb3Status } from '@/hooks/useWeb3Status';

// Import all pages
import Index from '@/pages/Index';
import Chains from '@/pages/Chains';
import Create from '@/pages/Create';
import Deploy from '@/pages/Deploy';
import Swap from '@/pages/Swap';
import Bridge from '@/pages/Bridge';
import Analytics from '@/pages/Analytics';
import History from '@/pages/History';
import Profile from '@/pages/Profile';
import Settings from '@/pages/Settings';
import Points from '@/pages/Points';
import Referrals from '@/pages/Referrals';
import EarnSTEX from '@/pages/EarnSTEX';
import GM from '@/pages/GM';
import Documentation from '@/pages/Documentation';
import Support from '@/pages/Support';
import NotFound from '@/pages/NotFound';
import Enterprise from '@/pages/Enterprise';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

function AppContent() {
  useWeb3Status();

  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/chains" element={<Chains />} />
      <Route path="/create" element={<Create />} />
      <Route path="/deploy" element={<Deploy />} />
      <Route path="/swap" element={<Swap />} />
      <Route path="/bridge" element={<Bridge />} />
      <Route path="/analytics" element={<Analytics />} />
      <Route path="/history" element={<History />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="/points" element={<Points />} />
      <Route path="/referrals" element={<Referrals />} />
      <Route path="/earn-stex" element={<EarnSTEX />} />
      <Route path="/gm" element={<GM />} />
      <Route path="/docs" element={<Documentation />} />
      <Route path="/support" element={<Support />} />
      <Route path="/enterprise" element={<Enterprise />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

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
