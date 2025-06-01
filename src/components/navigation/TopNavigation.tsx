
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Menu, 
  X, 
  Bell, 
  Settings, 
  Users, 
  Gift,
  BarChart3,
  HelpCircle,
  FileText,
  LogIn,
  User
} from 'lucide-react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import ChainSelector from './ChainSelector';
import { useAppStore } from '@/stores/useAppStore';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { AuthModal } from '@/components/auth/AuthModal';
import { useUser } from '@supabase/auth-helpers-react';

const TopNavigation = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedChain, setSelectedChain] = useState(null);
  const { notifications } = useAppStore();
  const unreadNotifications = notifications.filter(n => !n.read).length;
  const user = useUser();

  const handleChainSelect = (chain) => {
    setSelectedChain(chain);
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
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-emerald-500 to-cyan-600 flex items-center justify-center">
              <span className="text-white font-bold text-lg">S</span>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              SCRYPTEX
            </span>
            <Badge variant="outline" className="border-emerald-500/50 text-emerald-400 text-xs">
              DEX
            </Badge>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
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

          {/* Right Actions */}
          <div className="flex items-center space-x-3">
            {/* Chain Selector */}
            <div className="hidden md:block">
              <ChainSelector 
                onChainSelect={handleChainSelect}
                selectedChain={selectedChain}
              />
            </div>

            {/* Faucet Button */}
            <Button
              variant="outline"
              size="sm"
              className="hidden md:flex border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10"
            >
              <Gift className="h-4 w-4 mr-2" />
              Faucet
            </Button>

            {/* Notifications */}
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="h-5 w-5" />
              {unreadNotifications > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center bg-red-500 text-xs">
                  {unreadNotifications}
                </Badge>
              )}
            </Button>

            {/* Wallet Connection */}
            <div className="flex items-center space-x-4">
              {!user && (
                <AuthModal>
                  <Button 
                    variant="outline" 
                    className="bg-gray-800 border-gray-700 text-white hover:bg-gray-700"
                  >
                    <LogIn className="h-4 w-4 mr-2" />
                    Sign In
                  </Button>
                </AuthModal>
              )}
              
              {user && (
                <AuthModal>
                  <Button 
                    variant="outline" 
                    className="bg-green-800 border-green-700 text-white hover:bg-green-700"
                  >
                    <User className="h-4 w-4 mr-2" />
                    {user.email?.split('@')[0] || 'User'}
                  </Button>
                </AuthModal>
              )}
            </div>

            {/* Hamburger Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Menu className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 bg-slate-900 border-slate-800">
                {menuItems.map((item) => (
                  <DropdownMenuItem key={item.href} asChild>
                    <Link to={item.href} className="flex items-center">
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
