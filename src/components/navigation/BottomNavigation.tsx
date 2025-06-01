
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  Home, 
  ArrowUpDown, 
  Plus, 
  Sun, 
  Shuffle 
} from 'lucide-react';

const BottomNavigation = () => {
  const location = useLocation();

  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: Home,
      href: '/',
      active: location.pathname === '/'
    },
    {
      id: 'swap',
      label: 'Swap',
      icon: ArrowUpDown,
      href: '/swap',
      active: location.pathname === '/swap'
    },
    {
      id: 'create',
      label: 'Create',
      icon: Plus,
      href: '/create',
      active: location.pathname === '/create'
    },
    {
      id: 'gm',
      label: 'GM',
      icon: Sun,
      href: '/gm',
      active: location.pathname === '/gm'
    },
    {
      id: 'bridge',
      label: 'Bridge',
      icon: Shuffle,
      href: '/bridge',
      active: location.pathname === '/bridge'
    }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-lg border-t border-slate-800 md:hidden">
      <nav className="flex items-center justify-around px-2 py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.id}
              to={item.href}
              className={cn(
                "flex flex-col items-center justify-center min-w-0 flex-1 px-2 py-2 text-xs rounded-lg transition-colors",
                item.active
                  ? "text-emerald-400 bg-emerald-500/10"
                  : "text-slate-400 hover:text-slate-300 hover:bg-slate-800/50"
              )}
            >
              <Icon className="h-5 w-5 mb-1" />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export default BottomNavigation;
