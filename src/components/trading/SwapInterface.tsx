
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowUpDown, Settings, Zap, TrendingUp, ChevronDown } from 'lucide-react';
import { swapService } from '@/services/api';

const SwapInterface = () => {
  const [fromToken, setFromToken] = useState('ETH');
  const [toToken, setToToken] = useState('USDC');
  const [fromAmount, setFromAmount] = useState('');
  const [toAmount, setToAmount] = useState('');
  const [selectedDEX, setSelectedDEX] = useState('clober');
  const [slippage, setSlippage] = useState('0.5');
  const [isLoading, setIsLoading] = useState(false);

  const handleSwapTokens = () => {
    const tempToken = fromToken;
    const tempAmount = fromAmount;
    setFromToken(toToken);
    setToToken(tempToken);
    setFromAmount(toAmount);
    setToAmount(tempAmount);
  };

  const handleGetQuote = async () => {
    if (!fromAmount || fromAmount === '0') return;
    
    setIsLoading(true);
    try {
      const response = await swapService.getSwapQuote({
        tokenIn: '0x0000000000000000000000000000000000000000',
        tokenOut: '0x1234567890123456789012345678901234567890',
        amountIn: (parseFloat(fromAmount) * 1e18).toString(),
        chainId: selectedDEX === 'clober' ? 6342 : selectedDEX === 'gte' ? 11155931 : 1,
        dex: selectedDEX as any,
        slippageTolerance: parseFloat(slippage)
      });

      if (response.success && response.data) {
        const amountOut = parseFloat(response.data.amountOut) / 1e6; // USDC has 6 decimals
        setToAmount(amountOut.toFixed(2));
      }
    } catch (error) {
      console.error('Failed to get quote:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExecuteSwap = async () => {
    if (!fromAmount || !toAmount) return;
    
    setIsLoading(true);
    try {
      const response = await swapService.executeSwap({
        tokenIn: '0x0000000000000000000000000000000000000000',
        tokenOut: '0x1234567890123456789012345678901234567890',
        amountIn: (parseFloat(fromAmount) * 1e18).toString(),
        minAmountOut: (parseFloat(toAmount) * 0.99 * 1e6).toString(), // 1% slippage
        chainId: selectedDEX === 'clober' ? 6342 : selectedDEX === 'gte' ? 11155931 : 1,
        dex: selectedDEX as any,
        slippageTolerance: parseFloat(slippage)
      });

      if (response.success) {
        console.log('Swap executed:', response.data?.txHash);
        // Reset form or show success message
        setFromAmount('');
        setToAmount('');
      }
    } catch (error) {
      console.error('Failed to execute swap:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getDEXInfo = (dex: string) => {
    const dexInfo = {
      clober: { name: 'Clober DEX', chain: 'RiseChain', icon: '📊', color: 'text-blue-400' },
      gte: { name: 'GTE DEX', chain: 'MegaETH', icon: '⚡', color: 'text-yellow-400' },
      pharos_dex: { name: 'Pharos DEX', chain: 'Ethereum', icon: '🏛️', color: 'text-purple-400' }
    };
    return dexInfo[dex as keyof typeof dexInfo] || dexInfo.clober;
  };

  return (
    <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Zap className="h-5 w-5 text-emerald-400" />
            <h3 className="text-lg font-semibold text-white">Multi-Chain Swap</h3>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="border-emerald-500/50 text-emerald-400">
              +5 Points
            </Badge>
            <Button variant="ghost" size="sm">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* DEX Selection */}
        <div className="space-y-2">
          <Label className="text-slate-300">DEX Platform</Label>
          <Select value={selectedDEX} onValueChange={setSelectedDEX}>
            <SelectTrigger className="bg-slate-800/50 border-slate-700">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700">
              <SelectItem value="clober">
                <div className="flex items-center space-x-2">
                  <span>📊</span>
                  <div>
                    <div className="font-medium">Clober DEX</div>
                    <div className="text-xs text-slate-400">RiseChain • CLOB</div>
                  </div>
                </div>
              </SelectItem>
              <SelectItem value="gte">
                <div className="flex items-center space-x-2">
                  <span>⚡</span>
                  <div>
                    <div className="font-medium">GTE DEX</div>
                    <div className="text-xs text-slate-400">MegaETH • Real-time</div>
                  </div>
                </div>
              </SelectItem>
              <SelectItem value="pharos_dex">
                <div className="flex items-center space-x-2">
                  <span>🏛️</span>
                  <div>
                    <div className="font-medium">Pharos DEX</div>
                    <div className="text-xs text-slate-400">Ethereum • RWA</div>
                  </div>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* From Token */}
        <div className="space-y-2">
          <Label className="text-slate-300">From</Label>
          <Card className="bg-slate-800/50 border-slate-700 p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <Input
                  value={fromAmount}
                  onChange={(e) => {
                    setFromAmount(e.target.value);
                    if (e.target.value) {
                      handleGetQuote();
                    }
                  }}
                  placeholder="0.0"
                  className="bg-transparent border-0 text-2xl font-bold text-white p-0 h-auto focus-visible:ring-0"
                />
                <p className="text-slate-400 text-sm mt-1">≈ ${(parseFloat(fromAmount || '0') * 2450).toFixed(2)}</p>
              </div>
              <div className="flex items-center space-x-2 bg-slate-700/50 rounded-lg px-3 py-2">
                <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full"></div>
                <span className="font-semibold text-white">{fromToken}</span>
                <ChevronDown className="h-4 w-4 text-slate-400" />
              </div>
            </div>
            <div className="flex justify-between items-center mt-2 text-sm text-slate-400">
              <span>Balance: 2.5847 {fromToken}</span>
              <Button variant="ghost" size="sm" className="text-emerald-400 hover:text-emerald-300 h-auto p-0">
                MAX
              </Button>
            </div>
          </Card>
        </div>

        {/* Swap Direction */}
        <div className="flex justify-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSwapTokens}
            className="rounded-full h-10 w-10 p-0 bg-slate-800 hover:bg-slate-700 border border-slate-700"
          >
            <ArrowUpDown className="h-4 w-4" />
          </Button>
        </div>

        {/* To Token */}
        <div className="space-y-2">
          <Label className="text-slate-300">To</Label>
          <Card className="bg-slate-800/50 border-slate-700 p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="text-2xl font-bold text-white">{toAmount || '0.0'}</div>
                <p className="text-slate-400 text-sm mt-1">≈ ${toAmount || '0.00'}</p>
              </div>
              <div className="flex items-center space-x-2 bg-slate-700/50 rounded-lg px-3 py-2">
                <div className="w-6 h-6 bg-gradient-to-br from-green-500 to-blue-600 rounded-full"></div>
                <span className="font-semibold text-white">{toToken}</span>
                <ChevronDown className="h-4 w-4 text-slate-400" />
              </div>
            </div>
            <div className="flex justify-between items-center mt-2 text-sm text-slate-400">
              <span>Balance: 1,250.00 {toToken}</span>
            </div>
          </Card>
        </div>

        {/* Trade Details */}
        <Card className="bg-slate-800/30 border-slate-700 p-3">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-400">Rate</span>
              <span className="text-white">1 {fromToken} = 2,450 {toToken}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Price Impact</span>
              <span className="text-emerald-400">0.05%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Trading Fee</span>
              <span className="text-white">0.25%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">DEX</span>
              <div className="flex items-center space-x-1">
                <span>{getDEXInfo(selectedDEX).icon}</span>
                <span className={getDEXInfo(selectedDEX).color}>{getDEXInfo(selectedDEX).name}</span>
              </div>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Points Reward</span>
              <span className="text-purple-400">+{selectedDEX === 'clober' ? '6' : selectedDEX === 'gte' ? '7' : '7'} Points</span>
            </div>
          </div>
        </Card>

        {/* Swap Button */}
        <Button
          onClick={handleExecuteSwap}
          disabled={!fromAmount || !toAmount || isLoading}
          className="w-full bg-gradient-to-r from-emerald-500 to-cyan-600 hover:from-emerald-600 hover:to-cyan-700 text-white font-semibold py-3 disabled:opacity-50"
          size="lg"
        >
          {isLoading ? 'Processing...' : 'Execute Swap'}
        </Button>

        {/* Additional Info */}
        <div className="flex items-center justify-center space-x-4 text-xs text-slate-400">
          <span className="flex items-center">
            <TrendingUp className="h-3 w-3 mr-1" />
            Optimal Route
          </span>
          <span>•</span>
          <span>Slippage: {slippage}%</span>
          <span>•</span>
          <span className="text-emerald-400">Points: +5</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default SwapInterface;
