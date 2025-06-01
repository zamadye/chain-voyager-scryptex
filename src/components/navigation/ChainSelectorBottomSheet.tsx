
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { getAllChains } from '@/lib/chains';
import { ChainConfig } from '@/types';
import { Activity, Search, X, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerClose,
} from '@/components/ui/drawer';

interface ChainSelectorBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onChainSelect: (chain: ChainConfig) => void;
  selectedChain: ChainConfig | null;
}

const ChainSelectorBottomSheet = ({ 
  isOpen, 
  onClose, 
  onChainSelect, 
  selectedChain 
}: ChainSelectorBottomSheetProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const chains = getAllChains();
  
  const filteredChains = chains.filter(chain =>
    chain.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleChainSelect = (chain: ChainConfig) => {
    onChainSelect(chain);
    onClose();
  };

  const getChainLogo = (chainName: string) => {
    return `/chains/${chainName.toLowerCase().replace(/\s+/g, '-')}.svg`;
  };

  return (
    <Drawer open={isOpen} onOpenChange={onClose}>
      <DrawerContent className="bg-slate-900 border-slate-700 max-h-[85vh]">
        <DrawerHeader className="flex items-center justify-between p-4 border-b border-slate-700">
          <DrawerTitle className="text-white text-lg font-semibold">
            Select Blockchain
          </DrawerTitle>
          <DrawerClose className="text-slate-400 hover:text-white">
            <X className="h-5 w-5" />
          </DrawerClose>
        </DrawerHeader>
        
        <div className="p-4 space-y-4 overflow-y-auto">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search chains..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-slate-800 border-slate-700 text-white"
            />
          </div>

          {/* Chain Grid */}
          <div className="grid grid-cols-1 gap-3">
            {filteredChains.map((chain) => {
              const isSelected = selectedChain?.id === chain.id;
              
              return (
                <Card
                  key={chain.id}
                  className={cn(
                    "bg-slate-800 border-slate-700 hover:border-blue-500/50 transition-all cursor-pointer",
                    isSelected && "border-blue-500 bg-blue-500/10"
                  )}
                  onClick={() => handleChainSelect(chain)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <img
                          src={getChainLogo(chain.name)}
                          alt={`${chain.name} logo`}
                          className="h-8 w-8 rounded-full"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            target.nextElementSibling?.classList.remove('hidden');
                          }}
                        />
                        <Activity className="hidden h-8 w-8 text-blue-400" />
                        
                        <div>
                          <h3 className="text-white font-medium">{chain.name}</h3>
                          <p className="text-slate-400 text-sm">Chain ID: {chain.id}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Badge 
                          variant={chain.testnet ? "secondary" : "default"}
                          className="text-xs"
                        >
                          {chain.testnet ? 'Testnet' : 'Mainnet'}
                        </Badge>
                        
                        {isSelected && (
                          <div className="bg-blue-500 rounded-full p-1">
                            <Check className="h-3 w-3 text-white" />
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default ChainSelectorBottomSheet;
