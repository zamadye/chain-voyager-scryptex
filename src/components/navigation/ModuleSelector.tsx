
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChainConfig } from '@/types';
import { useAppStore } from '@/stores/useAppStore';
import { 
  Rocket, 
  ArrowLeftRight, 
  Sun, 
  BarChart3, 
  Activity,
  FileCode,
  ArrowLeft
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

  return (
    <div className="space-y-8">
      {/* Chain Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBackToChains}
          className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Chains</span>
        </button>
        
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white">
            {selectedChain.name}
          </h1>
          <div className="flex items-center justify-center space-x-2 mt-2">
            <Badge variant={selectedChain.testnet ? "secondary" : "default"}>
              {selectedChain.testnet ? 'Testnet' : 'Mainnet'}
            </Badge>
            <Badge variant="outline" className="border-green-500/50 text-green-400">
              Chain ID: {selectedChain.id}
            </Badge>
          </div>
        </div>

        <div className="w-20" /> {/* Spacer for centering */}
      </div>

      {/* Modules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {modules.map((module) => (
          <Card
            key={module.id}
            className="bg-gray-900/50 border-gray-700 hover:border-gray-600 transition-all duration-300 cursor-pointer group hover:scale-105"
            onClick={() => onModuleSelect(module.id)}
          >
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className={cn(
                    "p-3 rounded-lg bg-gradient-to-r transition-all duration-300 group-hover:scale-110",
                    module.gradient
                  )}>
                    <module.icon className="h-6 w-6 text-white" />
                  </div>
                  {module.badge && (
                    <Badge variant="destructive" className="h-6 w-6 rounded-full p-0 flex items-center justify-center text-xs">
                      {module.badge}
                    </Badge>
                  )}
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-white font-bold text-lg group-hover:text-blue-400 transition-colors">
                    {module.name}
                  </h3>
                  <p className="text-gray-400 text-sm">
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
    </div>
  );
};

export default ModuleSelector;
