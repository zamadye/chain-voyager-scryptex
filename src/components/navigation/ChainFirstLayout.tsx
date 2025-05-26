
import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChainConfig } from '@/types';
import { getAllChains } from '@/lib/chains';
import ChainSelector from './ChainSelector';
import ModuleSelector from './ModuleSelector';
import { useAppStore } from '@/stores/useAppStore';
import { Search, Command, Bell } from 'lucide-react';

interface ChainFirstLayoutProps {
  children: React.ReactNode;
}

const ChainFirstLayout = ({ children }: ChainFirstLayoutProps) => {
  const [selectedChain, setSelectedChain] = useState<ChainConfig | null>(null);
  const [showChainSelector, setShowChainSelector] = useState(true);
  const { notifications } = useAppStore();
  const location = useLocation();
  const navigate = useNavigate();

  const unreadNotifications = notifications.filter(n => !n.read).length;

  useEffect(() => {
    // Check if we're on a specific page and should hide chain selector
    const isSpecificPage = ['/deploy', '/swap', '/gm', '/analytics', '/chains', '/profile', '/history'].includes(location.pathname);
    setShowChainSelector(!isSpecificPage);

    // Load saved chain from localStorage
    const savedChainId = localStorage.getItem('selectedChainId');
    if (savedChainId && !isSpecificPage) {
      const chain = getAllChains().find(c => c.id === parseInt(savedChainId));
      if (chain) {
        setSelectedChain(chain);
        setShowChainSelector(false);
      }
    }
  }, [location.pathname]);

  const handleChainSelect = (chain: ChainConfig) => {
    setSelectedChain(chain);
    setShowChainSelector(false);
    localStorage.setItem('selectedChainId', chain.id.toString());
  };

  const handleModuleSelect = (moduleId: string) => {
    if (!selectedChain) return;

    const routes: Record<string, string> = {
      deploy: '/deploy',
      templates: '/deploy',
      gm: '/gm',
      swap: '/swap',
      monitor: '/chains',
      analytics: '/analytics'
    };

    const route = routes[moduleId];
    if (route) {
      navigate(`${route}?chain=${selectedChain.id}`);
    }
  };

  const handleBackToChains = () => {
    setShowChainSelector(true);
    setSelectedChain(null);
    localStorage.removeItem('selectedChainId');
  };

  const handleQuickSearch = () => {
    // TODO: Implement quick search modal (CMD+K)
    console.log('Quick search triggered');
  };

  // If we're on a specific page, render the page content
  if (!showChainSelector && location.pathname !== '/') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black">
        {/* Top Header */}
        <header className="sticky top-0 z-50 w-full border-b border-purple-900/20 bg-gray-950/80 backdrop-blur-lg">
          <div className="container mx-auto px-4">
            <div className="flex h-16 items-center justify-between">
              {/* Logo */}
              <div className="flex items-center space-x-4">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center">
                  <span className="text-white font-bold text-lg">S</span>
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                  SCRYPTEX
                </span>
              </div>

              {/* Current Chain */}
              {selectedChain && (
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleBackToChains}
                    className="border-blue-500/50 text-blue-400 hover:bg-blue-500/10"
                  >
                    {selectedChain.name}
                  </Button>
                </div>
              )}

              {/* Right Actions */}
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleQuickSearch}
                  className="text-gray-400 hover:text-white"
                >
                  <Search className="h-4 w-4 mr-2" />
                  <Command className="h-3 w-3" />
                  <span className="ml-1 text-xs">K</span>
                </Button>

                <Button variant="ghost" size="sm" className="relative">
                  <Bell className="h-5 w-5" />
                  {unreadNotifications > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center bg-red-500 text-xs">
                      {unreadNotifications}
                    </Badge>
                  )}
                </Button>

                <ConnectButton />
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="container mx-auto p-6">
          {children}
        </main>
      </div>
    );
  }

  // Main chain-first interface
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black">
      {/* Top Header */}
      <header className="sticky top-0 z-50 w-full border-b border-purple-900/20 bg-gray-950/80 backdrop-blur-lg">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center">
                <span className="text-white font-bold text-lg">S</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                SCRYPTEX
              </span>
            </div>

            {/* Center - Current Chain */}
            {selectedChain && (
              <div className="flex items-center space-x-2">
                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-white font-medium">{selectedChain.name}</span>
                <Badge variant={selectedChain.testnet ? "secondary" : "default"}>
                  {selectedChain.testnet ? 'Testnet' : 'Mainnet'}
                </Badge>
              </div>
            )}

            {/* Right Actions */}
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleQuickSearch}
                className="text-gray-400 hover:text-white"
              >
                <Search className="h-4 w-4 mr-2" />
                <Command className="h-3 w-3" />
                <span className="ml-1 text-xs">K</span>
              </Button>

              <Button variant="ghost" size="sm" className="relative">
                <Bell className="h-5 w-5" />
                {unreadNotifications > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center bg-red-500 text-xs">
                    {unreadNotifications}
                  </Badge>
                )}
              </Button>

              <ConnectButton />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto p-6 min-h-[calc(100vh-4rem)]">
        <div className="flex items-center justify-center min-h-full">
          {showChainSelector ? (
            <div className="w-full max-w-7xl">
              <ChainSelector
                onChainSelect={handleChainSelect}
                selectedChain={selectedChain}
              />
            </div>
          ) : selectedChain ? (
            <div className="w-full max-w-6xl">
              <ModuleSelector
                selectedChain={selectedChain}
                onModuleSelect={handleModuleSelect}
                onBackToChains={handleBackToChains}
              />
            </div>
          ) : null}
        </div>
      </main>
    </div>
  );
};

export default ChainFirstLayout;
