import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  Home,
  TrendingUp,
  Link as LinkIcon,
  ArrowUpDown,
  Trophy,
  Building2,
  Users,
  MessageSquare,
  Settings,
  ChevronLeft,
  ChevronRight,
  Zap
} from 'lucide-react';

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/', icon: Home },
    { name: 'Trading', href: '/trading', icon: TrendingUp },
    { name: 'Bridge', href: '/bridge', icon: LinkIcon },
    { name: 'Swap', href: '/swap', icon: ArrowUpDown },
    { name: 'Leaderboard', href: '/leaderboard', icon: Trophy },
    { name: 'Enterprise', href: '/enterprise', icon: Building2 },
    { name: 'Social', href: '/social', icon: Users },
    { name: 'Governance', href: '/governance', icon: MessageSquare },
  ];

  const bottomNavigation = [
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  return (
    <div className={cn(
      "bg-slate-900/95 backdrop-blur-sm border-r border-slate-800 flex flex-col transition-all duration-300",
      isCollapsed ? "w-16" : "w-64"
    )}>
      {/* Header */}
      <div className="p-4 border-b border-slate-800">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-cyan-600 rounded-lg flex items-center justify-center">
                <Zap className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">SCRYPTEX</span>
            </div>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                "flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                  : "text-slate-300 hover:text-white hover:bg-slate-800/50",
                isCollapsed && "justify-center"
              )}
            >
              <item.icon className={cn("h-5 w-5", isCollapsed ? "" : "mr-3")} />
              {!isCollapsed && <span>{item.name}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Navigation */}
      <div className="p-4 border-t border-slate-800 space-y-2">
        {bottomNavigation.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                "flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-slate-800 text-white"
                  : "text-slate-300 hover:text-white hover:bg-slate-800/50",
                isCollapsed && "justify-center"
              )}
            >
              <item.icon className={cn("h-5 w-5", isCollapsed ? "" : "mr-3")} />
              {!isCollapsed && <span>{item.name}</span>}
            </Link>
          );
        })}
      </div>

      {/* User Section */}
      {!isCollapsed && (
        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-bold">U</span>
            </div>
            <div className="flex-1">
              <div className="text-white text-sm font-medium">User</div>
              <div className="text-slate-400 text-xs">Trader Level 5</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
