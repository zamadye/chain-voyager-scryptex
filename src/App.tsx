import '@rainbow-me/rainbowkit/styles.css';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from 'wagmi';
import { RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { config } from './lib/web3-config';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Deploy from "./pages/Deploy";
import Swap from "./pages/Swap";
import GM from "./pages/GM";
import Analytics from "./pages/Analytics";
import Chains from "./pages/Chains";
import Profile from "./pages/Profile";
import HistoryPage from "./pages/History";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <WagmiProvider config={config}>
    <QueryClientProvider client={queryClient}>
      <RainbowKitProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/deploy" element={<Deploy />} />
              <Route path="/swap" element={<Swap />} />
              <Route path="/gm" element={<GM />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/chains" element={<Chains />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/history" element={<HistoryPage />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </RainbowKitProvider>
    </QueryClientProvider>
  </WagmiProvider>
);

export default App;
