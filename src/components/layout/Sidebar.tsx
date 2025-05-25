
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  Rocket, 
  ArrowLeftRight, 
  Sun, 
  BarChart3, 
  Link as ChainIcon,
  User,
  History,
  Zap
} from 'lucide-react';
import { useAppStore } from '@/stores/useAppStore';
import { SUPPORTED_CHAINS } from '@/lib/chains';

const Sidebar = ({ className }: { className?: string }) => {
  const location = useLocation();
  const { chainStatus, deployments, swaps, gmPosts } = useAppStore();

  const navigation = [
    {
      name: 'Dashboard',
      href: '/',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      name: 'Deploy',
      href: '/deploy',
      icon: Rocket,
      badge: deployments.filter(d => d.status === 'pending').length || null,
    },
    {
      name: 'Swap',
      href: '/swap',
      icon: ArrowLeftRight,
      badge: swaps.filter(s => s.status === 'pending').length || null,
    },
    {
      name: 'GM Ritual',
      href: '/gm',
      icon: Sun,
      badge: gmPosts.filter(g => g.status === 'pending').length || null,
    },
    {
      name: 'Analytics',
      href: '/analytics',
      icon: BarChart3,
      badge: null,
    },
    {
      name: 'Chains',
      href: '/chains',
      icon: ChainIcon,
      badge: null,
    },
    {
      name: 'Profile',
      href: '/profile',
      icon: User,
      badge: null,
    },
    {
      name: 'History',
      href: '/history',
      icon: History,
      badge: null,
    },
  ];

  const activeChains = Object.values(chainStatus).filter(status => status?.isActive).length;

  return (
    <div className={cn("flex h-full w-64 flex-col bg-gray-950/50 border-r border-purple-900/20", className)}>
      {/* Sidebar Header */}
      <div className="p-6 border-b border-gray-800">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Navigation</h2>
          <Badge variant="outline" className="border-green-500/50 text-green-400">
            {activeChains} Active
          </Badge>
        </div>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-2">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link key={item.name} to={item.href}>
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start font-medium transition-colors",
                    isActive 
                      ? "bg-purple-500/20 text-purple-400 border border-purple-500/30" 
                      : "text-gray-300 hover:text-white hover:bg-gray-800"
                  )}
                >
                  <item.icon className="mr-3 h-4 w-4" />
                  {item.name}
                  {item.badge && (
                    <Badge 
                      variant="destructive" 
                      className="ml-auto h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                    >
                      {item.badge}
                    </Badge>
                  )}
                </Button>
              </Link>
            );
          })}
        </nav>

        {/* Chain Status Quick View */}
        <div className="mt-8 p-4 rounded-lg bg-gray-900/50 border border-gray-800">
          <h3 className="text-sm font-medium text-gray-400 mb-3">Chain Status</h3>
          <div className="space-y-2">
            {Object.entries(SUPPORTED_CHAINS).slice(0, 4).map(([key, chain]) => {
              const status = chainStatus[key];
              const isActive = status?.isActive ?? false;
              
              return (
                <div key={key} className="flex items-center justify-between text-xs">
                  <span className="text-gray-300 truncate">{chain.name}</span>
                  <div className={cn(
                    "h-2 w-2 rounded-full",
                    isActive ? "bg-green-500" : "bg-gray-600"
                  )} />
                </div>
              );
            })}
            <Link to="/chains">
              <Button variant="ghost" size="sm" className="w-full mt-2 text-purple-400 hover:text-purple-300">
                <Zap className="mr-2 h-3 w-3" />
                View All Chains
              </Button>
            </Link>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};

export default Sidebar;
