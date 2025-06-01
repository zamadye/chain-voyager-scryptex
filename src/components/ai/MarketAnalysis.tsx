
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, TrendingDown, Activity, DollarSign } from 'lucide-react';

interface MarketMetrics {
  totalMarketCap: string;
  volume24h: string;
  btcDominance: number;
  fearGreedIndex: number;
  trending: string[];
  topGainers: Array<{
    name: string;
    symbol: string;
    change: number;
  }>;
  topLosers: Array<{
    name: string;
    symbol: string;
    change: number;
  }>;
}

const MarketAnalysis = () => {
  const [metrics, setMetrics] = useState<MarketMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching market data
    setTimeout(() => {
      const mockMetrics: MarketMetrics = {
        totalMarketCap: '$2.31T',
        volume24h: '$84.2B',
        btcDominance: 52.3,
        fearGreedIndex: 67,
        trending: ['Bitcoin', 'Ethereum', 'Solana', 'Cardano', 'Polygon'],
        topGainers: [
          { name: 'Solana', symbol: 'SOL', change: 12.5 },
          { name: 'Polygon', symbol: 'MATIC', change: 8.3 },
          { name: 'Chainlink', symbol: 'LINK', change: 6.7 }
        ],
        topLosers: [
          { name: 'Dogecoin', symbol: 'DOGE', change: -5.2 },
          { name: 'Shiba Inu', symbol: 'SHIB', change: -3.8 },
          { name: 'Litecoin', symbol: 'LTC', change: -2.9 }
        ]
      };
      setMetrics(mockMetrics);
      setIsLoading(false);
    }, 1500);
  }, []);

  const getFearGreedColor = (index: number) => {
    if (index >= 75) return 'text-green-400';
    if (index >= 50) return 'text-yellow-400';
    if (index >= 25) return 'text-orange-400';
    return 'text-red-400';
  };

  const getFearGreedLabel = (index: number) => {
    if (index >= 75) return 'Extreme Greed';
    if (index >= 50) return 'Greed';
    if (index >= 25) return 'Fear';
    return 'Extreme Fear';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <Activity className="h-8 w-8 text-purple-400 animate-pulse mx-auto mb-2" />
          <p className="text-slate-400 text-sm">Loading market data...</p>
        </div>
      </div>
    );
  }

  if (!metrics) return null;

  return (
    <div className="space-y-4 h-full overflow-y-auto">
      {/* Market Overview */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader className="pb-2">
          <CardTitle className="text-white text-sm flex items-center">
            <DollarSign className="mr-2 h-4 w-4 text-green-400" />
            Market Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-slate-400 text-xs">Total Market Cap</p>
              <p className="text-white font-semibold">{metrics.totalMarketCap}</p>
            </div>
            <div>
              <p className="text-slate-400 text-xs">24h Volume</p>
              <p className="text-white font-semibold">{metrics.volume24h}</p>
            </div>
          </div>
          
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-slate-300">BTC Dominance</span>
              <span className="text-white">{metrics.btcDominance}%</span>
            </div>
            <Progress value={metrics.btcDominance} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Fear & Greed Index */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader className="pb-2">
          <CardTitle className="text-white text-sm flex items-center">
            <Activity className="mr-2 h-4 w-4 text-purple-400" />
            Fear & Greed Index
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            <div className={`text-2xl font-bold ${getFearGreedColor(metrics.fearGreedIndex)}`}>
              {metrics.fearGreedIndex}
            </div>
            <p className="text-slate-400 text-xs">{getFearGreedLabel(metrics.fearGreedIndex)}</p>
            <Progress value={metrics.fearGreedIndex} className="h-2 mt-2" />
          </div>
        </CardContent>
      </Card>

      {/* Top Gainers */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader className="pb-2">
          <CardTitle className="text-white text-sm flex items-center">
            <TrendingUp className="mr-2 h-4 w-4 text-green-400" />
            Top Gainers (24h)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {metrics.topGainers.map((coin, index) => (
            <div key={index} className="flex items-center justify-between">
              <div>
                <p className="text-white text-xs font-medium">{coin.name}</p>
                <p className="text-slate-400 text-xs">{coin.symbol}</p>
              </div>
              <Badge className="bg-green-500/20 text-green-400 border-green-500/50">
                +{coin.change}%
              </Badge>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Top Losers */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader className="pb-2">
          <CardTitle className="text-white text-sm flex items-center">
            <TrendingDown className="mr-2 h-4 w-4 text-red-400" />
            Top Losers (24h)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {metrics.topLosers.map((coin, index) => (
            <div key={index} className="flex items-center justify-between">
              <div>
                <p className="text-white text-xs font-medium">{coin.name}</p>
                <p className="text-slate-400 text-xs">{coin.symbol}</p>
              </div>
              <Badge className="bg-red-500/20 text-red-400 border-red-500/50">
                {coin.change}%
              </Badge>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Trending */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader className="pb-2">
          <CardTitle className="text-white text-sm">Trending</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-1">
            {metrics.trending.map((trend, index) => (
              <Badge key={index} variant="outline" className="text-xs border-slate-600 text-slate-300">
                {trend}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MarketAnalysis;
