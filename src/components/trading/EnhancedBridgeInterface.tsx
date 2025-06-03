
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ArrowDown, ArrowLeftRight, Shield, Clock, DollarSign, Zap, Star, Trophy } from 'lucide-react';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';
import { bridgeService, type BridgeRoute, type BridgeQuoteResponse } from '@/services/api';

interface Chain {
  id: number;
  name: string;
  icon: string;
}

interface Token {
  address: string;
  symbol: string;
  name: string;
  icon: string;
}

const chains: Chain[] = [
  { id: 1, name: 'Ethereum', icon: '🔗' },
  { id: 11155111, name: 'Ethereum Sepolia', icon: '🔗' },
  { id: 6342, name: 'MegaETH', icon: '⚡' },
  { id: 11155931, name: 'RiseChain', icon: '📈' }
];

const tokens: Token[] = [
  { address: '0x0000000000000000000000000000000000000000', symbol: 'ETH', name: 'Ethereum', icon: '💎' },
  { address: '0xA0b86a33E6411679C79F7c37a8CbAd19506e5d8b', symbol: 'USDC', name: 'USD Coin', icon: '💰' },
  { address: '0xdAC17F958D2ee523a2206206994597C13D831ec7', symbol: 'USDT', name: 'Tether', icon: '💵' }
];

export const EnhancedBridgeInterface = () => {
  const [fromChain, setFromChain] = useState<number>(1);
  const [toChain, setToChain] = useState<number>(6342);
  const [fromToken, setFromToken] = useState('0x0000000000000000000000000000000000000000');
  const [amount, setAmount] = useState('');
  const [strategy, setStrategy] = useState<'fastest' | 'cheapest' | 'most_secure' | 'most_points'>('fastest');
  const [isLoading, setIsLoading] = useState(false);

  // Get bridge quote when parameters change
  const { data: quoteData, isLoading: isQuoteLoading } = useQuery({
    queryKey: ['bridge-quote', fromChain, toChain, amount, strategy],
    queryFn: async () => {
      if (!amount || parseFloat(amount) <= 0) return null;
      
      const amountInWei = (parseFloat(amount) * Math.pow(10, 18)).toString();
      const response = await bridgeService.getBridgeQuote({
        fromChain,
        toChain,
        amount: amountInWei,
        strategy
      });
      return response.data;
    },
    enabled: Boolean(amount && parseFloat(amount) > 0 && fromChain !== toChain),
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  const handleBridge = async () => {
    if (!fromChain || !toChain || !fromToken || !amount) {
      toast.error('Please fill in all fields');
      return;
    }

    if (fromChain === toChain) {
      toast.error('Source and destination chains must be different');
      return;
    }

    setIsLoading(true);
    
    try {
      const amountInWei = (parseFloat(amount) * Math.pow(10, 18)).toString();
      
      const response = await bridgeService.initiateBridge({
        fromChain,
        toChain,
        tokenAddress: fromToken,
        amount: amountInWei,
        preferredRoute: strategy
      });

      if (response.data) {
        toast.success(
          `Bridge initiated successfully! 🎉 You earned ${response.data.pointsAwarded} points!`,
          {
            description: `Bridge ID: ${response.data.bridgeId}`
          }
        );
        
        // Reset form
        setAmount('');
      }
    } catch (error) {
      console.error('Bridge transaction failed:', error);
      toast.error('Bridge transaction failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getProviderIcon = (provider: string) => {
    switch (provider) {
      case 'risechain': return '📈';
      case 'pharos': return '🏛️';
      case 'megaeth': return '⚡';
      default: return '🌉';
    }
  };

  const getProviderName = (provider: string) => {
    switch (provider) {
      case 'risechain': return 'RiseChain';
      case 'pharos': return 'Pharos Network';
      case 'megaeth': return 'MegaETH';
      default: return provider;
    }
  };

  const getStrategyIcon = (strategy: string) => {
    switch (strategy) {
      case 'fastest': return <Zap className="h-4 w-4" />;
      case 'cheapest': return <DollarSign className="h-4 w-4" />;
      case 'most_secure': return <Shield className="h-4 w-4" />;
      case 'most_points': return <Trophy className="h-4 w-4" />;
      default: return <ArrowLeftRight className="h-4 w-4" />;
    }
  };

  return (
    <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-white flex items-center">
          <ArrowLeftRight className="mr-2 h-5 w-5 text-cyan-400" />
          Cross-Chain Bridge with Point Rewards
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Strategy Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-300">Bridge Strategy</label>
          <Select value={strategy} onValueChange={(value: any) => setStrategy(value)}>
            <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700">
              <SelectItem value="fastest" className="text-white">
                <div className="flex items-center">
                  <Zap className="mr-2 h-4 w-4 text-yellow-400" />
                  Fastest Route
                </div>
              </SelectItem>
              <SelectItem value="cheapest" className="text-white">
                <div className="flex items-center">
                  <DollarSign className="mr-2 h-4 w-4 text-green-400" />
                  Cheapest Route
                </div>
              </SelectItem>
              <SelectItem value="most_secure" className="text-white">
                <div className="flex items-center">
                  <Shield className="mr-2 h-4 w-4 text-blue-400" />
                  Most Secure
                </div>
              </SelectItem>
              <SelectItem value="most_points" className="text-white">
                <div className="flex items-center">
                  <Trophy className="mr-2 h-4 w-4 text-purple-400" />
                  Most Points
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* From Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-slate-300">From</label>
            <Badge variant="outline" className="border-green-500/50 text-green-400">
              <Shield className="mr-1 h-3 w-3" />
              Secure
            </Badge>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select value={fromChain.toString()} onValueChange={(value) => setFromChain(parseInt(value))}>
              <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                <SelectValue placeholder="Select source chain" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                {chains.map((chain) => (
                  <SelectItem key={chain.id} value={chain.id.toString()} className="text-white">
                    <span className="flex items-center">
                      <span className="mr-2">{chain.icon}</span>
                      {chain.name}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={fromToken} onValueChange={setFromToken}>
              <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                <SelectValue placeholder="Select token" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                {tokens.map((token) => (
                  <SelectItem key={token.address} value={token.address} className="text-white">
                    <span className="flex items-center">
                      <span className="mr-2">{token.icon}</span>
                      {token.symbol}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Input
            type="number"
            placeholder="Enter amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="bg-slate-800 border-slate-700 text-white text-lg"
          />
        </div>

        {/* Arrow Down */}
        <div className="flex justify-center">
          <div className="bg-slate-800 rounded-full p-2">
            <ArrowDown className="h-5 w-5 text-cyan-400" />
          </div>
        </div>

        {/* To Section */}
        <div className="space-y-4">
          <label className="text-sm font-medium text-slate-300">To</label>
          
          <Select value={toChain.toString()} onValueChange={(value) => setToChain(parseInt(value))}>
            <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
              <SelectValue placeholder="Select destination chain" />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700">
              {chains.map((chain) => (
                <SelectItem key={chain.id} value={chain.id.toString()} className="text-white">
                  <span className="flex items-center">
                    <span className="mr-2">{chain.icon}</span>
                    {chain.name}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Bridge Quote Details */}
        {quoteData && !isQuoteLoading && (
          <div className="bg-slate-800/50 rounded-lg p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-white font-medium">Bridge Route</h3>
              <div className="flex items-center space-x-2">
                {getStrategyIcon(strategy)}
                <span className="text-sm text-slate-300 capitalize">{strategy.replace('_', ' ')}</span>
              </div>
            </div>

            {/* Selected Route */}
            <div className="bg-gradient-to-r from-cyan-900/30 to-blue-900/30 rounded-lg p-3 border border-cyan-500/30">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{getProviderIcon(quoteData.selectedRoute.provider)}</span>
                  <span className="text-white font-medium">{getProviderName(quoteData.selectedRoute.provider)}</span>
                  <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-500/50">
                    Recommended
                  </Badge>
                </div>
                <div className="flex items-center space-x-1">
                  <Star className="h-4 w-4 text-yellow-400" />
                  <span className="text-white font-bold">{quoteData.selectedRoute.pointsReward} points</span>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-slate-400">Fee</span>
                  <div className="text-white font-medium">
                    {bridgeService.formatBridgeFee(quoteData.selectedRoute.estimatedFee)}
                  </div>
                </div>
                <div>
                  <span className="text-slate-400">Time</span>
                  <div className="text-white font-medium flex items-center">
                    <Clock className="mr-1 h-3 w-3" />
                    {quoteData.selectedRoute.estimatedTime}s
                  </div>
                </div>
                <div>
                  <span className="text-slate-400">Security</span>
                  <div className="text-white font-medium">
                    {quoteData.selectedRoute.securityScore}/100
                  </div>
                </div>
              </div>
            </div>

            {/* Alternative Routes */}
            {quoteData.alternativeRoutes.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-slate-300">Alternative Routes</h4>
                <div className="space-y-2">
                  {quoteData.alternativeRoutes.slice(0, 2).map((route, index) => (
                    <div key={index} className="bg-slate-800/50 rounded-lg p-3 border border-slate-600/30">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span>{getProviderIcon(route.provider)}</span>
                          <span className="text-white text-sm">{getProviderName(route.provider)}</span>
                        </div>
                        <div className="flex items-center space-x-4 text-xs">
                          <span className="text-slate-400">
                            {bridgeService.formatBridgeFee(route.estimatedFee)}
                          </span>
                          <span className="text-slate-400">{route.estimatedTime}s</span>
                          <span className="text-purple-400">{route.pointsReward}pts</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recommendation */}
            <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-3">
              <div className="text-sm">
                <p className="text-blue-400 font-medium">Why this route?</p>
                <p className="text-blue-300 text-xs">{quoteData.recommendation}</p>
              </div>
            </div>
          </div>
        )}

        {/* Bridge Button */}
        <Button
          onClick={handleBridge}
          disabled={!fromChain || !toChain || !amount || fromChain === toChain || isLoading || isQuoteLoading}
          className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white"
        >
          {isLoading ? (
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Processing Bridge...</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <ArrowLeftRight className="h-4 w-4" />
              <span>Initiate Bridge</span>
              {quoteData && (
                <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/50 ml-2">
                  +{quoteData.selectedRoute.pointsReward} points
                </Badge>
              )}
            </div>
          )}
        </Button>

        {/* Point System Info */}
        <div className="bg-gradient-to-r from-purple-900/20 to-pink-900/20 border border-purple-500/30 rounded-lg p-3">
          <div className="flex items-start space-x-2">
            <Trophy className="h-4 w-4 text-purple-400 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <p className="text-purple-400 font-medium">Earn Points for Every Bridge!</p>
              <p className="text-purple-300 text-xs">
                Get 10+ points per bridge, plus bonuses for volume, chain selection, and daily activity. 
                Complete daily tasks for extra rewards!
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
