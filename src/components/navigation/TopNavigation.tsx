
import { useState } from 'react';
import { Link } from 'react-router-dom';
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
  ChevronDown
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { WalletAuthModal } from '@/components/auth/WalletAuthModal';
import { useSupabaseIntegration } from '@/hooks/useSupabaseIntegration';
import { useAccount } from 'wagmi';
import { getAllChains } from '@/lib/chains';
import { ChainConfig } from '@/types';

const TopNavigation = () => {
  const [selectedChain, setSelectedChain] = useState<ChainConfig | null>(null);
  const { notifications } = useAppStore();
  const unreadNotifications = notifications.filter(n => !n.read).length;
  const { isAuthenticated } = useSupabaseIntegration();
  const { address, isConnected } = useAccount();

  const chains = getAllChains();

  const handleChainSelect = (chainId: string) => {
    const chain = chains.find(c => c.id.toString() === chainId);
    setSelectedChain(chain || null);
  };

  const menuItems = [
    { icon: BarChart3, label: 'STEX Points Dashboard', href: '/points' },
    { icon: Users, label: 'Referral System (50 STEX)', href: '/referrals' },
    { icon: Settings, label: 'Settings', href: '/settings' },
    { icon: BarChart3, label: 'Personal Analytics', href: '/analytics' },
    { icon: HelpCircle, label: 'Help & Support', href: '/support' },
    { icon: FileText, label: 'Documentation', href: '/docs' }
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-slate-950/95 via-slate-900/95 to-slate-950/95 backdrop-blur-sm border-b border-slate-800">
      <div className="container mx-auto px-2 sm:px-4 lg:px-6">
        <div className="flex h-14 sm:h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 flex-shrink-0">
            <div className="h-6 w-6 sm:h-8 sm:w-8 rounded-lg bg-gradient-to-br from-emerald-500 to-cyan-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm sm:text-lg">S</span>
            </div>
            <span className="hidden sm:block text-xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              SCRYPTEX
            </span>
            <Badge variant="outline" className="hidden sm:block border-emerald-500/50 text-emerald-400 text-xs">
              DEX
            </Badge>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-6">
            <Link
              to="/"
              className="text-sm font-medium text-slate-300 hover:text-white transition-colors"
            >
              Dashboard
            </Link>
            <Link
              to="/swap"
              className="text-sm font-medium text-slate-300 hover:text-white transition-colors"
            >
              Trade
            </Link>
            <Link
              to="/create"
              className="text-sm font-medium text-slate-300 hover:text-white transition-colors"
            >
              Create
            </Link>
            <Link
              to="/bridge"
              className="text-sm font-medium text-slate-300 hover:text-white transition-colors"
            >
              Bridge
            </Link>
          </nav>

          {/* Chain Selector - Dropdown */}
          <div className="hidden md:flex items-center space-x-2 flex-1 max-w-xs mx-4">
            <Select value={selectedChain?.id.toString() || ""} onValueChange={handleChainSelect}>
              <SelectTrigger className="w-full bg-slate-800/50 border-slate-700 text-white">
                <div className="flex items-center space-x-2">
                  <Activity className="h-4 w-4 text-blue-400" />
                  <SelectValue placeholder="Select Chain" />
                </div>
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-slate-800 max-h-60">
                {chains.map((chain) => (
                  <SelectItem 
                    key={chain.id} 
                    value={chain.id.toString()}
                    className="text-white hover:bg-slate-800 focus:bg-slate-800"
                  >
                    <div className="flex items-center space-x-2">
                      <Activity className="h-3 w-3 text-blue-400" />
                      <span>{chain.name}</span>
                      {chain.testnet && (
                        <Badge variant="secondary" className="text-xs ml-2">Test</Badge>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Right Actions */}
          <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
            {/* Faucet Button */}
            <Button
              variant="outline"
              size="sm"
              className="hidden lg:flex border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10 text-xs px-2"
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

            {/* Hamburger Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="p-2">
                  <Menu className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 bg-slate-900 border-slate-800">
                {menuItems.map((item) => (
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
  );
};

export default TopNavigation;
