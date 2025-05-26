
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChainConfig } from '@/types';
import { useAppStore } from '@/stores/useAppStore';
import { 
  Rocket, 
  ArrowLeftRight, 
  Sun, 
  BarChart3, 
  Activity,
  FileCode,
  ArrowLeft,
  ChevronLeft
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ModuleSelectorProps {
  selectedChain: ChainConfig;
  onModuleSelect: (module: string) => void;
  onBackToChains: () => void;
}

const ModuleSelector = ({ selectedChain, onModuleSelect, onBackToChains }: ModuleSelectorProps) => {
  const { deployments, swaps, gmPosts } = useAppStore();

  const modules = [
    {
      id: 'deploy',
      name: 'Deploy Contracts',
      description: 'Deploy smart contracts and templates',
      icon: Rocket,
      badge: deployments.filter(d => d.chainId === selectedChain.id && d.status === 'pending').length || null,
      gradient: 'from-purple-500 to-blue-600'
    },
    {
      id: 'templates',
      name: 'Templates Library',
      description: 'Browse contract templates',
      icon: FileCode,
      badge: null,
      gradient: 'from-green-500 to-teal-600'
    },
    {
      id: 'gm',
      name: 'GM Rituals',
      description: 'Daily automation rituals',
      icon: Sun,
      badge: gmPosts.filter(g => g.chainId === selectedChain.id && g.status === 'pending').length || null,
      gradient: 'from-yellow-500 to-orange-600'
    },
    {
      id: 'swap',
      name: 'Token Swap',
      description: 'Swap tokens on this chain',
      icon: ArrowLeftRight,
      badge: swaps.filter(s => s.chainId === selectedChain.id && s.status === 'pending').length || null,
      gradient: 'from-blue-500 to-cyan-600'
    },
    {
      id: 'monitor',
      name: 'Chain Monitor',
      description: 'Monitor chain activity',
      icon: Activity,
      badge: null,
      gradient: 'from-indigo-500 to-purple-600'
    },
    {
      id: 'analytics',
      name: 'Analytics',
      description: 'View chain analytics',
      icon: BarChart3,
      badge: null,
      gradient: 'from-pink-500 to-rose-600'
    }
  ];

  const getChainLogo = (chainName: string) => {
    const logoPath = `/chains/${chainName.toLowerCase().replace(/\s+/g, '-')}.svg`;
    return logoPath;
  };

  return (
    <div className="space-y-6 sm:space-y-8 px-4 sm:px-0">
      {/* Chain Header - Mobile Optimized */}
      <div className="space-y-4">
        {/* Back Button */}
        <Button
          onClick={onBackToChains}
          variant="ghost"
          className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors p-2 sm:p-3"
        >
          <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
          <span className="text-sm sm:text-base">Back to Chains</span>
        </Button>
        
        {/* Chain Info */}
        <div className="text-center space-y-3 sm:space-y-4">
          {/* Chain Logo */}
          <div className="flex justify-center">
            <img
              src={getChainLogo(selectedChain.name)}
              alt={`${selectedChain.name} logo`}
              className="h-12 w-12 sm:h-16 sm:w-16 transition-all duration-300"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                target.nextElementSibling?.classList.remove('hidden');
              }}
            />
            <Activity className="hidden h-12 w-12 sm:h-16 sm:w-16 text-blue-400" />
          </div>
          
          <h1 className="text-2xl sm:text-3xl font-bold text-white">
            {selectedChain.name}
          </h1>
          
          <div className="flex items-center justify-center flex-wrap gap-2">
            <Badge variant={selectedChain.testnet ? "secondary" : "default"} className="text-xs sm:text-sm">
              {selectedChain.testnet ? 'Testnet' : 'Mainnet'}
            </Badge>
            <Badge variant="outline" className="border-green-500/50 text-green-400 text-xs sm:text-sm">
              Chain ID: {selectedChain.id}
            </Badge>
          </div>
        </div>
      </div>

      {/* Mobile Tab Navigation - Horizontal Scroll */}
      <div className="block sm:hidden">
        <div className="flex space-x-3 overflow-x-auto pb-4 px-2 scrollbar-hide">
          {modules.map((module) => (
            <Button
              key={module.id}
              onClick={() => onModuleSelect(module.id)}
              variant="outline"
              className={cn(
                "min-w-max flex-shrink-0 border-gray-700 hover:border-gray-600 transition-all duration-300",
                "flex items-center space-x-2 px-4 py-3 relative"
              )}
            >
              <div className={cn(
                "p-2 rounded-lg bg-gradient-to-r transition-all duration-300",
                module.gradient
              )}>
                <module.icon className="h-4 w-4 text-white" />
              </div>
              <span className="text-white font-medium text-sm">{module.name}</span>
              {module.badge && (
                <Badge variant="destructive" className="h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                  {module.badge}
                </Badge>
              )}
            </Button>
          ))}
        </div>
      </div>

      {/* Desktop/Tablet Grid */}
      <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 max-w-6xl mx-auto">
        {modules.map((module) => (
          <Card
            key={module.id}
            className="bg-gray-900/50 border-gray-700 hover:border-gray-600 transition-all duration-300 cursor-pointer group hover:scale-105"
            onClick={() => onModuleSelect(module.id)}
          >
            <CardContent className="p-4 sm:p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className={cn(
                    "p-3 rounded-lg bg-gradient-to-r transition-all duration-300 group-hover:scale-110",
                    module.gradient
                  )}>
                    <module.icon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                  </div>
                  {module.badge && (
                    <Badge variant="destructive" className="h-6 w-6 rounded-full p-0 flex items-center justify-center text-xs">
                      {module.badge}
                    </Badge>
                  )}
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-white font-bold text-base sm:text-lg group-hover:text-blue-400 transition-colors">
                    {module.name}
                  </h3>
                  <p className="text-gray-400 text-xs sm:text-sm">
                    {module.description}
                  </p>
                </div>

                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Click to access</span>
                  <div className="h-2 w-2 rounded-full bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Mobile Grid - Alternative view */}
      <div className="block sm:hidden">
        <div className="grid grid-cols-2 gap-3">
          {modules.map((module) => (
            <Card
              key={module.id}
              className="bg-gray-900/50 border-gray-700 hover:border-gray-600 transition-all duration-300 cursor-pointer group"
              onClick={() => onModuleSelect(module.id)}
            >
              <CardContent className="p-3">
                <div className="space-y-3 text-center">
                  <div className="flex justify-center relative">
                    <div className={cn(
                      "p-2 rounded-lg bg-gradient-to-r transition-all duration-300 group-hover:scale-110",
                      module.gradient
                    )}>
                      <module.icon className="h-5 w-5 text-white" />
                    </div>
                    {module.badge && (
                      <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                        {module.badge}
                      </Badge>
                    )}
                  </div>
                  
                  <div>
                    <h3 className="text-white font-bold text-sm group-hover:text-blue-400 transition-colors line-clamp-2">
                      {module.name}
                    </h3>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ModuleSelector;
