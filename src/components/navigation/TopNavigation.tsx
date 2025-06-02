
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Menu, 
  Bell, 
  Settings, 
  Users, 
  Gift,
  BarChart3,
  HelpCircle,
  FileText,
  Wallet,
  Activity,
  Home,
  ArrowUpDown,
  Plus,
  Bridge,
  TrendingUp
} from 'lucide-react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAppStore } from '@/stores/useAppStore';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { WalletAuthModal } from '@/components/auth/WalletAuthModal';
import { useSupabaseIntegration } from '@/hooks/useSupabaseIntegration';
import { useAccount } from 'wagmi';
import { getAllChains } from '@/lib/chains';
import { ChainConfig } from '@/types';
import ChainSelectorBottomSheet from './ChainSelectorBottomSheet';
import { cn } from '@/lib/utils';

const TopNavigation = () => {
  const [selectedChain, setSelectedChain] = useState<ChainConfig | null>(null);
  const [isChainSelectorOpen, setIsChainSelectorOpen] = useState(false);
  const { notifications } = useAppStore();
  const unreadNotifications = notifications.filter(n => !n.read).length;
  const { isAuthenticated } = useSupabaseIntegration();
  const { address, isConnected } = useAccount();
  const location = useLocation();

  const chains = getAllChains();

  const handleChainSelect = (chain: ChainConfig) => {
    setSelectedChain(chain);
  };

  const getChainLogo = (chainName: string) => {
    return `/chains/${chainName.toLowerCase().replace(/\s+/g, '-')}.svg`;
  };

  // Primary navigation items for desktop
  const primaryNavItems = [
    { icon: Home, label: 'Dashboard', href: '/', key: 'dashboard' },
    { icon: ArrowUpDown, label: 'Swap', href: '/swap', key: 'swap' },
    { icon: Plus, label: 'Create', href: '/create', key: 'create' },
    { icon: Bridge, label: 'Bridge', href: '/bridge', key: 'bridge' },
    { icon: BarChart3, label: 'Analytics', href: '/analytics', key: 'analytics' }
  ];

  // Secondary menu items (moved to profile dropdown)
  const secondaryMenuItems = [
    { icon: TrendingUp, label: 'STEX Points Dashboard', href: '/points' },
    { icon: Users, label: 'Referral System', href: '/referrals' },
    { icon: Settings, label: 'Settings', href: '/settings' },
    { icon: HelpCircle, label: 'Help & Support', href: '/support' },
    { icon: FileText, label: 'Documentation', href: '/docs' }
  ];

  const isActivePath = (href: string) => {
    if (href === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(href);
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-slate-950/95 via-slate-900/95 to-slate-950/95 backdrop-blur-sm border-b border-slate-800">
        <div className="w-full px-4 lg:px-6">
          <div className="flex h-14 sm:h-16 items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2 flex-shrink-0">
              <div className="h-6 w-6 sm:h-8 sm:w-8 rounded-lg bg-gradient-to-br from-emerald-500 to-cyan-600 flex items-center justify-center">
                <span className="text-white font-bold text-sm sm:text-lg">S</span>
              </div>
              <span className="hidden sm:block text-xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                SCRYPTEX
              </span>
              <Badge variant="outline" className="hidden lg:block border-emerald-500/50 text-emerald-400 text-xs">
                DEX
              </Badge>
            </Link>

            {/* Desktop Primary Navigation */}
            <nav className="hidden lg:flex items-center space-x-1">
              {primaryNavItems.map((item) => (
                <Link
                  key={item.key}
                  to={item.href}
                  className={cn(
                    "flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors",
                    isActivePath(item.href)
                      ? "text-emerald-400 bg-emerald-500/10 border border-emerald-500/20"
                      : "text-slate-300 hover:text-white hover:bg-slate-800/50"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              ))}
            </nav>

            {/* Right Actions */}
            <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
              {/* Chain Selector */}
              <div className="relative">
                <Button
                  variant="ghost"
                  size="sm"
                  className="relative p-2 hover:bg-slate-800"
                  onClick={() => setIsChainSelectorOpen(true)}
                >
                  {selectedChain ? (
                    <img
                      src={getChainLogo(selectedChain.name)}
                      alt={`${selectedChain.name} logo`}
                      className="h-5 w-5 rounded-full"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        target.nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                  ) : null}
                  <Activity className={selectedChain ? "hidden" : "h-5 w-5 text-blue-400"} />
                  
                  {selectedChain && (
                    <Badge className="absolute -top-1 -right-1 h-3 w-3 rounded-full p-0 bg-green-500 border-2 border-slate-900">
                      <span className="sr-only">Chain connected</span>
                    </Badge>
                  )}
                </Button>
              </div>

              {/* Faucet Button - Desktop Only */}
              <Button
                variant="outline"
                size="sm"
                className="hidden lg:flex border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10 text-xs px-3"
              >
                <Gift className="h-3 w-3 mr-1" />
                Faucet
              </Button>

              {/* Notifications */}
              <Button variant="ghost" size="sm" className="relative p-2">
                <Bell className="h-4 w-4" />
                {unreadNotifications > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-4 w-4 rounded-full p-0 flex items-center justify-center bg-red-500 text-xs">
                    {unreadNotifications}
                  </Badge>
                )}
              </Button>

              {/* Wallet Connection */}
              <div className="flex items-center space-x-2">
                <div className="scale-75 sm:scale-100">
                  <ConnectButton />
                </div>
                
                {isConnected && !isAuthenticated && (
                  <WalletAuthModal>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="hidden sm:flex bg-yellow-800 border-yellow-700 text-white hover:bg-yellow-700 text-xs px-2"
                    >
                      <Wallet className="h-3 w-3 mr-1" />
                      Auth
                    </Button>
                  </WalletAuthModal>
                )}
              </div>

              {/* Profile Menu (Desktop) / Hamburger Menu (Mobile) */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="p-2">
                    <Menu className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 bg-slate-900 border-slate-800" align="end">
                  {/* Mobile Navigation - Show primary items on mobile only */}
                  <div className="lg:hidden">
                    {primaryNavItems.map((item) => (
                      <DropdownMenuItem key={`mobile-${item.key}`} asChild>
                        <Link to={item.href} className="flex items-center text-sm">
                          <item.icon className="h-4 w-4 mr-2" />
                          {item.label}
                        </Link>
                      </DropdownMenuItem>
                    ))}
                    <DropdownMenuSeparator className="lg:hidden bg-slate-800" />
                  </div>
                  
                  {/* Secondary menu items (always visible) */}
                  {secondaryMenuItems.map((item) => (
                    <DropdownMenuItem key={item.href} asChild>
                      <Link to={item.href} className="flex items-center text-sm">
                        <item.icon className="h-4 w-4 mr-2" />
                        {item.label}
                      </Link>
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator className="bg-slate-800" />
                  <DropdownMenuItem>
                    <Gift className="h-4 w-4 mr-2" />
                    Earn STEX Points
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </nav>

      {/* Chain Selector Bottom Sheet */}
      <ChainSelectorBottomSheet
        isOpen={isChainSelectorOpen}
        onClose={() => setIsChainSelectorOpen(false)}
        onChainSelect={handleChainSelect}
        selectedChain={selectedChain}
      />
    </>
  );
};

export default TopNavigation;
