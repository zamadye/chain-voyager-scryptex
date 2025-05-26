
import { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ChainConfig } from '@/types';
import { getAllChains } from '@/lib/chains';
import { Activity } from 'lucide-react';

interface ChainSelectorProps {
  value?: string;
  onValueChange: (chainId: string) => void;
  disabled?: boolean;
  className?: string;
  placeholder?: string;
}

const ChainSelector = ({ 
  value, 
  onValueChange, 
  disabled = false, 
  className = "",
  placeholder = "Select chain"
}: ChainSelectorProps) => {
  const chains = getAllChains();

  return (
    <Select value={value} onValueChange={onValueChange} disabled={disabled}>
      <SelectTrigger className={`bg-gray-800 border-gray-700 text-white ${className}`}>
        <SelectValue placeholder={placeholder}>
          {value && chains.find(c => c.id.toString() === value) && (
            <div className="flex items-center space-x-2">
              <Activity className="h-4 w-4 text-green-400" />
              <span>{chains.find(c => c.id.toString() === value)?.name}</span>
              <Badge variant="secondary" className="text-xs">
                {chains.find(c => c.id.toString() === value)?.testnet ? 'Testnet' : 'Mainnet'}
              </Badge>
            </div>
          )}
        </SelectValue>
      </SelectTrigger>
      <SelectContent className="bg-gray-800 border-gray-700 z-50">
        {chains.map((chain: ChainConfig) => (
          <SelectItem 
            key={chain.id} 
            value={chain.id.toString()}
            className="text-white hover:bg-gray-700 focus:bg-gray-700"
          >
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center space-x-2">
                <Activity className="h-4 w-4 text-green-400" />
                <span>{chain.name}</span>
              </div>
              <Badge variant="secondary" className="text-xs ml-2">
                {chain.testnet ? 'Testnet' : 'Mainnet'}
              </Badge>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default ChainSelector;
