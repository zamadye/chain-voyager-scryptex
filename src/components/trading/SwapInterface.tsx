
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ArrowUpDown, Settings, Zap, TrendingUp } from 'lucide-react';
import TokenSelector from './TokenSelector';

const SwapInterface = () => {
  const [fromToken, setFromToken] = useState('ETH');
  const [toToken, setToToken] = useState('USDC');
  const [fromAmount, setFromAmount] = useState('');
  const [toAmount, setToAmount] = useState('');
  const [slippage, setSlippage] = useState('0.5');

  const handleSwapTokens = () => {
    const tempToken = fromToken;
    const tempAmount = fromAmount;
    setFromToken(toToken);
    setToToken(tempToken);
    setFromAmount(toAmount);
    setToAmount(tempAmount);
  };

  return (
    <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Zap className="h-5 w-5 text-emerald-400" />
            <h3 className="text-lg font-semibold text-white">Swap</h3>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="border-emerald-500/50 text-emerald-400">
              Best Rate
            </Badge>
            <Button variant="ghost" size="sm">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* From Token */}
        <div className="space-y-2">
          <Label className="text-slate-300">From</Label>
          <Card className="bg-slate-800/50 border-slate-700 p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <Input
                  value={fromAmount}
                  onChange={(e) => setFromAmount(e.target.value)}
                  placeholder="0.0"
                  className="bg-transparent border-0 text-2xl font-bold text-white p-0 h-auto focus-visible:ring-0"
                />
                <p className="text-slate-400 text-sm mt-1">≈ $0.00</p>
              </div>
              <TokenSelector 
                selectedToken={fromToken}
                onTokenSelect={setFromToken}
              />
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
                <p className="text-slate-400 text-sm mt-1">≈ $0.00</p>
              </div>
              <TokenSelector 
                selectedToken={toToken}
                onTokenSelect={setToToken}
              />
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
              <span className="text-white">1 ETH = 2,450 USDC</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Price Impact</span>
              <span className="text-emerald-400">0.01%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Minimum Received</span>
              <span className="text-white">2,437.75 USDC</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Network Fee</span>
              <span className="text-white">~$12.50</span>
            </div>
          </div>
        </Card>

        {/* Swap Button */}
        <Button
          className="w-full bg-gradient-to-r from-emerald-500 to-cyan-600 hover:from-emerald-600 hover:to-cyan-700 text-white font-semibold py-3"
          size="lg"
        >
          Swap Tokens
        </Button>

        {/* Additional Info */}
        <div className="flex items-center justify-center space-x-4 text-xs text-slate-400">
          <span className="flex items-center">
            <TrendingUp className="h-3 w-3 mr-1" />
            Best Rate Guaranteed
          </span>
          <span>•</span>
          <span>Slippage: {slippage}%</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default SwapInterface;
