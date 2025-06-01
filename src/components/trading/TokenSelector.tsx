
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronDown } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface TokenSelectorProps {
  selectedToken: string;
  onTokenSelect: (token: string) => void;
}

const TokenSelector = ({ selectedToken, onTokenSelect }: TokenSelectorProps) => {
  const tokens = [
    { symbol: 'ETH', name: 'Ethereum', logo: '⟠' },
    { symbol: 'USDC', name: 'USD Coin', logo: '💵' },
    { symbol: 'USDT', name: 'Tether', logo: '₮' },
    { symbol: 'WBTC', name: 'Wrapped Bitcoin', logo: '₿' },
    { symbol: 'DAI', name: 'Dai Stablecoin', logo: '◈' },
    { symbol: 'STEX', name: 'Scryptex Token', logo: 'S' }
  ];

  const selectedTokenData = tokens.find(t => t.symbol === selectedToken);

  return (
    <Select value={selectedToken} onValueChange={onTokenSelect}>
      <SelectTrigger className="w-auto bg-slate-700 border-slate-600 text-white">
        <div className="flex items-center space-x-2">
          <span className="text-lg">{selectedTokenData?.logo}</span>
          <div className="text-left">
            <div className="font-semibold">{selectedToken}</div>
            <div className="text-xs text-slate-400">{selectedTokenData?.name}</div>
          </div>
          <ChevronDown className="h-4 w-4" />
        </div>
      </SelectTrigger>
      <SelectContent className="bg-slate-800 border-slate-700">
        {tokens.map((token) => (
          <SelectItem 
            key={token.symbol} 
            value={token.symbol}
            className="text-white hover:bg-slate-700"
          >
            <div className="flex items-center space-x-3">
              <span className="text-lg">{token.logo}</span>
              <div>
                <div className="font-semibold">{token.symbol}</div>
                <div className="text-xs text-slate-400">{token.name}</div>
              </div>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default TokenSelector;
