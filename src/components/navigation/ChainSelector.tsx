
import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getAllChains } from '@/lib/chains';
import { useAppStore } from '@/stores/useAppStore';
import { ChainConfig } from '@/types';
import { Activity, Zap, Search, Clock, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChainSelectorProps {
  onChainSelect: (chain: ChainConfig) => void;
  selectedChain: ChainConfig | null;
}

const ChainSelector = ({ onChainSelect, selectedChain }: ChainSelectorProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [recentChains, setRecentChains] = useState<ChainConfig[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { chainStatus } = useAppStore();
  
  const chains = getAllChains();
  
  useEffect(() => {
    // Load recent chains from localStorage
    const recent = localStorage.getItem('recentChains');
    if (recent) {
      const recentIds = JSON.parse(recent);
      const recentChainConfigs = recentIds.map((id: number) => 
        chains.find(c => c.id === id)
      ).filter(Boolean);
      setRecentChains(recentChainConfigs.slice(0, 3));
    }
  }, []);

  const saveRecentChain = (chain: ChainConfig) => {
    const recent = localStorage.getItem('recentChains');
    let recentIds = recent ? JSON.parse(recent) : [];
    recentIds = [chain.id, ...recentIds.filter((id: number) => id !== chain.id)].slice(0, 5);
    localStorage.setItem('recentChains', JSON.stringify(recentIds));
    
    const recentChainConfigs = recentIds.map((id: number) => 
      chains.find(c => c.id === id)
    ).filter(Boolean);
    setRecentChains(recentChainConfigs.slice(0, 3));
  };

  const filteredChains = chains.filter(chain =>
    chain.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleChainSelect = async (chain: ChainConfig) => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate loading
    onChainSelect(chain);
    saveRecentChain(chain);
    setIsLoading(false);
  };

  const getChainStatus = (chainId: number) => {
    const key = Object.keys(chainStatus).find(k => 
      chainStatus[k] && typeof chainStatus[k] === 'object' && 
      'chainId' in chainStatus[k] && chainStatus[k].chainId === chainId
    );
    return key ? chainStatus[key] : null;
  };

  const getChainLogo = (chainName: string) => {
    // Generate dynamic logo path - will fallback to placeholder if not exists
    const logoPath = `/chains/${chainName.toLowerCase().replace(/\s+/g, '-')}.svg`;
    return logoPath;
  };

  const ChainCard = ({ chain, isRecent = false }: { chain: ChainConfig; isRecent?: boolean }) => {
    const status = getChainStatus(chain.id);
    const isActive = status?.isActive ?? false;
    const isSelected = selectedChain?.id === chain.id;

    return (
      <Card
        className={cn(
          "bg-gray-900/50 border-gray-700 hover:border-blue-500/50 transition-all duration-300 cursor-pointer group",
          "hover:scale-105 hover:shadow-lg hover:shadow-blue-500/20",
          isSelected && "border-blue-500 bg-blue-500/10 scale-105 shadow-lg shadow-blue-500/30",
          isRecent && "ring-2 ring-purple-500/30"
        )}
        onClick={() => handleChainSelect(chain)}
      >
        <CardContent className={cn("p-4", isRecent ? "sm:p-3" : "sm:p-6")}>
          <div className="space-y-3 sm:space-y-4">
            <div className="flex items-center justify-between">
              <div className={cn(
                "h-3 w-3 sm:h-4 sm:w-4 rounded-full transition-all duration-300",
                isActive ? "bg-green-500 shadow-green-500/50 shadow-lg animate-pulse" : "bg-gray-600"
              )} />
              <Badge 
                variant={chain.testnet ? "secondary" : "default"}
                className="text-xs"
              >
                {chain.testnet ? 'Testnet' : 'Mainnet'}
              </Badge>
            </div>
            
            <div className="text-center space-y-2">
              {/* Chain Logo */}
              <div className="flex justify-center mb-2">
                <img
                  src={getChainLogo(chain.name)}
                  alt={`${chain.name} logo`}
                  className={cn(
                    "transition-all duration-300 group-hover:scale-110",
                    isRecent ? "h-6 w-6 sm:h-8 sm:w-8" : "h-8 w-8 sm:h-10 sm:w-10"
                  )}
                  onError={(e) => {
                    // Fallback to generic chain icon if logo doesn't exist
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    target.nextElementSibling?.classList.remove('hidden');
                  }}
                />
                <Activity 
                  className={cn(
                    "hidden text-blue-400 transition-all duration-300 group-hover:scale-110",
                    isRecent ? "h-6 w-6 sm:h-8 sm:w-8" : "h-8 w-8 sm:h-10 sm:w-10"
                  )} 
                />
              </div>
              
              <h3 className={cn(
                "text-white font-bold group-hover:text-blue-400 transition-colors",
                isRecent ? "text-sm sm:text-base" : "text-base sm:text-lg"
              )}>
                {chain.name}
              </h3>
              <p className="text-gray-400 text-xs sm:text-sm">
                Chain ID: {chain.id}
              </p>
            </div>

            <div className="flex items-center justify-center space-x-2 text-xs text-gray-400">
              <Zap className="h-3 w-3" />
              <span>{isActive ? 'Online' : 'Offline'}</span>
            </div>

            {isSelected && (
              <div className="flex justify-center">
                <Badge className="bg-blue-500 text-white text-xs">
                  Selected
                </Badge>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-blue-400 mx-auto" />
          <p className="text-gray-400">Switching blockchain...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8 px-4 sm:px-0">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-2xl sm:text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
          Select Blockchain
        </h1>
        <p className="text-gray-400 text-sm sm:text-lg px-4">
          Choose your blockchain to access chain-specific modules and tools
        </p>
      </div>

      {/* Search */}
      <div className="max-w-md mx-auto relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search chains..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 bg-gray-900/50 border-gray-700 text-white h-12 text-base"
        />
      </div>

      {/* Recent Chains */}
      {recentChains.length > 0 && !searchQuery && (
        <div className="space-y-4">
          <div className="flex items-center justify-center space-x-2 text-gray-400">
            <Clock className="h-4 w-4" />
            <span className="text-sm">Recent Chains</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
            {recentChains.map((chain) => (
              <ChainCard key={`recent-${chain.id}`} chain={chain} isRecent={true} />
            ))}
          </div>
        </div>
      )}

      {/* All Chains Grid */}
      <div className="space-y-4">
        <div className="text-center">
          <span className="text-gray-400 text-sm">
            {searchQuery ? `Search Results (${filteredChains.length})` : 'All Chains'}
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 max-w-7xl mx-auto">
          {filteredChains.map((chain) => (
            <ChainCard key={chain.id} chain={chain} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ChainSelector;
