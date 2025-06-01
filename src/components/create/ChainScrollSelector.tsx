
import { useState, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getAllChains } from '@/lib/chains';
import { ChainConfig } from '@/types';
import { Activity, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChainScrollSelectorProps {
  selectedChain: ChainConfig | null;
  onChainSelect: (chain: ChainConfig) => void;
}

const ChainScrollSelector = ({ selectedChain, onChainSelect }: ChainScrollSelectorProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeftButton, setShowLeftButton] = useState(false);
  const [showRightButton, setShowRightButton] = useState(true);
  
  const chains = getAllChains();

  const handleScroll = () => {
    if (!scrollRef.current) return;
    
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setShowLeftButton(scrollLeft > 0);
    setShowRightButton(scrollLeft < scrollWidth - clientWidth - 10);
  };

  const scrollLeft = () => {
    scrollRef.current?.scrollBy({ left: -200, behavior: 'smooth' });
  };

  const scrollRight = () => {
    scrollRef.current?.scrollBy({ left: 200, behavior: 'smooth' });
  };

  const ChainCard = ({ chain }: { chain: ChainConfig }) => {
    const isSelected = selectedChain?.id === chain.id;
    
    return (
      <Card
        className={cn(
          "min-w-[140px] h-[120px] cursor-pointer transition-all duration-300",
          "bg-gray-900/50 border-gray-700 hover:border-blue-500/50",
          "hover:scale-105 hover:shadow-lg hover:shadow-blue-500/20",
          "scroll-snap-align-start",
          isSelected && "border-blue-500 bg-blue-500/10 scale-105 shadow-lg shadow-blue-500/30"
        )}
        onClick={() => onChainSelect(chain)}
      >
        <CardContent className="p-3 h-full flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className={cn(
              "h-2 w-2 rounded-full transition-colors",
              "bg-green-500" // Assume healthy for demo
            )} />
            <Badge 
              variant={chain.testnet ? "secondary" : "default"}
              className="text-[10px] px-1 py-0"
            >
              {chain.testnet ? 'Test' : 'Main'}
            </Badge>
          </div>
          
          <div className="text-center space-y-1 flex-1 flex flex-col justify-center">
            <Activity className="h-6 w-6 text-blue-400 mx-auto mb-1" />
            <h3 className="text-white font-semibold text-sm leading-tight">
              {chain.name}
            </h3>
            <p className="text-gray-400 text-xs">
              ID: {chain.id}
            </p>
          </div>

          {isSelected && (
            <div className="flex justify-center">
              <Badge className="bg-blue-500 text-white text-[10px] px-2 py-0">
                Selected
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-white font-semibold">Select Deployment Chain</h3>
        {selectedChain && (
          <Badge variant="outline" className="border-emerald-500/50 text-emerald-400">
            {selectedChain.name}
          </Badge>
        )}
      </div>
      
      <div className="relative">
        {/* Left scroll button */}
        {showLeftButton && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 h-8 w-8 bg-gray-900/80 hover:bg-gray-800"
            onClick={scrollLeft}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        )}
        
        {/* Scroll container */}
        <div
          ref={scrollRef}
          className="flex overflow-x-auto gap-3 pb-2 scroll-smooth scrollbar-hide"
          style={{ scrollSnapType: 'x mandatory', WebkitOverflowScrolling: 'touch' }}
          onScroll={handleScroll}
        >
          {chains.map((chain) => (
            <ChainCard key={chain.id} chain={chain} />
          ))}
        </div>
        
        {/* Right scroll button */}
        {showRightButton && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 h-8 w-8 bg-gray-900/80 hover:bg-gray-800"
            onClick={scrollRight}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        )}
      </div>
      
      {/* Scroll indicators */}
      <div className="flex justify-center space-x-1">
        {Array.from({ length: Math.ceil(chains.length / 3) }).map((_, index) => (
          <div
            key={index}
            className="h-1 w-6 bg-gray-700 rounded-full opacity-50"
          />
        ))}
      </div>
    </div>
  );
};

export default ChainScrollSelector;
