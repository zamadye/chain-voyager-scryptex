
import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowUpDown } from 'lucide-react';

interface Token {
  symbol: string;
  name: string;
  balance?: string;
  decimals?: number;
  address?: string;
}

interface TokenInputProps {
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  selectedToken: string;
  onTokenChange: (token: string) => void;
  tokens: Token[];
  disabled?: boolean;
  readOnly?: boolean;
  showBalance?: boolean;
  showMaxButton?: boolean;
  placeholder?: string;
  className?: string;
}

const TokenInput = ({
  label,
  value,
  onValueChange,
  selectedToken,
  onTokenChange,
  tokens,
  disabled = false,
  readOnly = false,
  showBalance = true,
  showMaxButton = true,
  placeholder = "0.0",
  className = ""
}: TokenInputProps) => {
  const [usdValue, setUsdValue] = useState<string>('0.00');
  
  const selectedTokenData = tokens.find(t => t.symbol === selectedToken);

  useEffect(() => {
    // Mock USD value calculation - in real app, fetch from price API
    if (value && parseFloat(value) > 0) {
      const mockPrice = selectedToken === 'ETH' ? 2450 : selectedToken === 'USDC' ? 1 : 100;
      setUsdValue((parseFloat(value) * mockPrice).toFixed(2));
    } else {
      setUsdValue('0.00');
    }
  }, [value, selectedToken]);

  const handleMaxClick = () => {
    if (selectedTokenData?.balance) {
      onValueChange(selectedTokenData.balance);
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-white">{label}</label>
        {showBalance && selectedTokenData?.balance && (
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-400">
              Balance: {parseFloat(selectedTokenData.balance).toFixed(4)}
            </span>
            {showMaxButton && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMaxClick}
                className="h-6 px-2 text-xs text-purple-400 hover:text-purple-300 hover:bg-purple-500/10"
                disabled={disabled}
              >
                MAX
              </Button>
            )}
          </div>
        )}
      </div>
      
      <div className="relative">
        <div className="flex items-center bg-gray-800/50 border border-gray-700 rounded-lg p-4 space-x-4">
          <div className="flex-1">
            <Input
              value={value}
              onChange={(e) => onValueChange(e.target.value)}
              placeholder={placeholder}
              disabled={disabled}
              readOnly={readOnly}
              className="bg-transparent border-0 text-2xl font-bold text-white p-0 h-auto focus-visible:ring-0 placeholder:text-gray-500"
            />
            <p className="text-gray-400 text-sm mt-1">≈ ${usdValue}</p>
          </div>
          
          <div className="ml-4">
            <Select value={selectedToken} onValueChange={onTokenChange} disabled={disabled}>
              <SelectTrigger className="bg-gray-700 border-gray-600 text-white min-w-[120px] h-12">
                <SelectValue placeholder="Token">
                  {selectedToken && (
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center text-xs font-bold">
                        {selectedToken.charAt(0)}
                      </div>
                      <span className="font-medium">{selectedToken}</span>
                    </div>
                  )}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700 z-50">
                {tokens.map((token) => (
                  <SelectItem 
                    key={token.symbol} 
                    value={token.symbol}
                    className="text-white hover:bg-gray-700 focus:bg-gray-700"
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center text-sm font-bold">
                          {token.symbol.charAt(0)}
                        </div>
                        <div>
                          <div className="font-medium">{token.symbol}</div>
                          <div className="text-xs text-gray-400">{token.name}</div>
                        </div>
                      </div>
                      {token.balance && (
                        <div className="text-right">
                          <div className="text-sm">{parseFloat(token.balance).toFixed(4)}</div>
                        </div>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TokenInput;
