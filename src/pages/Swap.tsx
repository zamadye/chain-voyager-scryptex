
import DEXLayout from '@/components/layout/DEXLayout';
import SwapInterface from '@/components/trading/SwapInterface';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowUpDown, TrendingUp, Clock, BarChart3 } from 'lucide-react';

const Swap = () => {
  const recentTrades = [
    { pair: 'ETH/USDC', amount: '2.5 ETH', price: '$2,450', time: '2m ago', type: 'buy' },
    { pair: 'STEX/ETH', amount: '1,000 STEX', price: '0.001 ETH', time: '5m ago', type: 'sell' },
    { pair: 'USDC/USDT', amount: '500 USDC', price: '$1.00', time: '8m ago', type: 'buy' },
    { pair: 'ETH/DAI', amount: '1.2 ETH', price: '$2,445', time: '12m ago', type: 'sell' }
  ];

  const tradingPairs = [
    { pair: 'ETH/USDC', price: '$2,450.25', change: '+2.5%', volume: '$1.2M', trend: 'up' },
    { pair: 'STEX/ETH', price: '0.001055', change: '+12.8%', volume: '$145K', trend: 'up' },
    { pair: 'USDC/USDT', price: '$1.0002', change: '+0.02%', volume: '$890K', trend: 'up' },
    { pair: 'ETH/DAI', price: '$2,447.10', change: '-0.8%', volume: '$567K', trend: 'down' }
  ];

  return (
    <DEXLayout>
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center">
              <ArrowUpDown className="mr-3 h-8 w-8 text-emerald-400" />
              Trading Hub
            </h1>
            <p className="text-slate-400 mt-2">Trade tokens with the best rates across multiple chains</p>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="border-emerald-500/50 text-emerald-400">
              Live Trading
            </Badge>
            <Badge variant="outline" className="border-cyan-500/50 text-cyan-400">
              Best Rates
            </Badge>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Swap Interface */}
          <div className="lg:col-span-1">
            <SwapInterface />
          </div>

          {/* Trading Data */}
          <div className="lg:col-span-2 space-y-6">
            {/* Trading Pairs */}
            <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center justify-between">
                  <div className="flex items-center">
                    <BarChart3 className="mr-2 h-5 w-5 text-emerald-400" />
                    Active Trading Pairs
                  </div>
                  <Button variant="ghost" size="sm" className="text-slate-400">
                    View All
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {tradingPairs.map((pair, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-slate-800/30 hover:bg-slate-800/50 transition-colors cursor-pointer">
                      <div className="flex items-center space-x-3">
                        <div className="h-8 w-8 bg-gradient-to-br from-emerald-500 to-cyan-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                          {pair.pair.split('/')[0][0]}
                        </div>
                        <div>
                          <div className="text-white font-semibold">{pair.pair}</div>
                          <div className="text-slate-400 text-sm">Vol: {pair.volume}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-white font-semibold">{pair.price}</div>
                        <Badge 
                          variant={pair.trend === 'up' ? 'default' : 'destructive'}
                          className={
                            pair.trend === 'up' 
                              ? 'bg-emerald-500/20 text-emerald-400' 
                              : 'bg-red-500/20 text-red-400'
                          }
                        >
                          {pair.change}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Trades */}
            <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Clock className="mr-2 h-5 w-5 text-emerald-400" />
                  Recent Trades
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentTrades.map((trade, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-3">
                        <div className={`px-2 py-1 rounded text-xs font-semibold ${
                          trade.type === 'buy' 
                            ? 'bg-emerald-500/20 text-emerald-400' 
                            : 'bg-red-500/20 text-red-400'
                        }`}>
                          {trade.type.toUpperCase()}
                        </div>
                        <div>
                          <div className="text-white font-medium">{trade.pair}</div>
                          <div className="text-slate-400">{trade.amount}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-white">{trade.price}</div>
                        <div className="text-slate-400">{trade.time}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DEXLayout>
  );
};

export default Swap;
