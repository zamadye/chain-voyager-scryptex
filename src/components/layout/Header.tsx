
import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Menu, X, Wallet, Bell } from 'lucide-react';
import { useAppStore } from '@/stores/useAppStore';

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { wallet, notifications } = useAppStore();
  
  const unreadNotifications = notifications.filter(n => !n.read).length;

  const navigation = [
    { name: 'Dashboard', href: '/' },
    { name: 'Deploy', href: '/deploy' },
    { name: 'Swap', href: '/swap' },
    { name: 'GM Ritual', href: '/gm' },
    { name: 'Analytics', href: '/analytics' },
    { name: 'Chains', href: '/chains' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-purple-900/20 bg-gray-950/80 backdrop-blur-lg">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center">
              <span className="text-white font-bold text-lg">S</span>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              SCRYPTEX
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-800 transition-colors"
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Right side actions */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <Button
              variant="ghost"
              size="sm"
              className="relative"
            >
              <Bell className="h-5 w-5" />
              {unreadNotifications > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center bg-red-500 text-xs">
                  {unreadNotifications}
                </Badge>
              )}
            </Button>

            {/* Wallet Connection */}
            <Button
              variant={wallet.isConnected ? "outline" : "default"}
              size="sm"
              className={cn(
                "font-medium",
                wallet.isConnected 
                  ? "border-purple-500/50 text-purple-400 hover:bg-purple-500/10" 
                  : "bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700"
              )}
            >
              <Wallet className="h-4 w-4 mr-2" />
              {wallet.isConnected 
                ? `${wallet.address?.slice(0, 6)}...${wallet.address?.slice(-4)}`
                : "Connect Wallet"
              }
            </Button>

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-800">
            <nav className="flex flex-col space-y-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-800 transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
