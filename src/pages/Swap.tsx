
import DEXLayout from '@/components/layout/DEXLayout';
import SwapInterface from '@/components/trading/SwapInterface';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowUpDown, TrendingUp, Clock, BarChart3, Target, Trophy } from 'lucide-react';

const Swap = () => {
  const recentSwaps = [
    { pair: 'RISE/USDC', dex: 'Clober', amount: '2.5 RISE', price: '$2,450', time: '2m ago', type: 'buy', points: 6 },
    { pair: 'METH/USDC', dex: 'GTE', amount: '1.2 METH', price: '$2,445', time: '5m ago', type: 'sell', points: 7 },
    { pair: 'ETH/DAI', dex: 'Pharos', amount: '0.8 ETH', price: '$2,447', time: '8m ago', type: 'buy', points: 7 },
    { pair: 'USDC/USDT', dex: 'Clober', amount: '500 USDC', price: '$1.00', time: '12m ago', type: 'sell', points: 5 }
  ];

  const activeDEXs = [
    { 
      name: 'Clober DEX', 
      chain: 'RiseChain', 
      icon: '📊', 
      volume: '$2.1M', 
      pairs: 45,
      type: 'CLOB',
      color: 'text-blue-400',
      features: ['Market Orders', 'Limit Orders']
    },
    { 
      name: 'GTE DEX', 
      chain: 'MegaETH', 
      icon: '⚡', 
      volume: '$1.8M', 
      pairs: 38,
      type: 'AMM',
      color: 'text-yellow-400',
      features: ['Real-time', 'HFT Support']
    },
    { 
      name: 'Pharos DEX', 
      chain: 'Ethereum', 
      icon: '🏛️', 
      volume: '$3.2M', 
      pairs: 67,
      type: 'AMM',
      color: 'text-purple-400',
      features: ['RWA Tokens', 'Parallel Processing']
    }
  ];

  const dailyTasks = [
    { name: 'First Swap', progress: '1/1', completed: true, points: 5 },
    { name: 'Multi-DEX Trading', progress: '2/2', completed: true, points: 20 },
    { name: 'Volume Target', progress: '$250/$500', completed: false, points: 15 },
    { name: 'Active Trader', progress: '3/5', completed: false, points: 25 }
  ];

  return (
    <DEXLayout>
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center">
              <ArrowUpDown className="mr-3 h-8 w-8 text-emerald-400" />
              Multi-Chain Swap Hub
            </h1>
            <p className="text-slate-400 mt-2">Trade tokens across multiple DEXs with automatic point rewards</p>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="border-emerald-500/50 text-emerald-400">
              3 DEXs Active
            </Badge>
            <Badge variant="outline" className="border-purple-500/50 text-purple-400">
              +5 Points/Swap
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
            {/* Active DEXs */}
            <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center justify-between">
                  <div className="flex items-center">
                    <BarChart3 className="mr-2 h-5 w-5 text-emerald-400" />
                    Active DEX Platforms
                  </div>
                  <Button variant="ghost" size="sm" className="text-slate-400">
                    View All
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {activeDEXs.map((dex, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-slate-800/30 hover:bg-slate-800/50 transition-colors cursor-pointer">
                      <div className="flex items-center space-x-3">
                        <div className="text-2xl">{dex.icon}</div>
                        <div>
                          <div className={`font-semibold ${dex.color}`}>{dex.name}</div>
                          <div className="text-slate-400 text-sm">{dex.chain} • {dex.type}</div>
                          <div className="flex space-x-2 mt-1">
                            {dex.features.map((feature, i) => (
                              <Badge key={i} variant="outline" className="text-xs border-slate-600 text-slate-300">
                                {feature}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-white font-semibold">{dex.volume}</div>
                        <div className="text-slate-400 text-sm">{dex.pairs} pairs</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Daily Tasks */}
            <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Target className="mr-2 h-5 w-5 text-emerald-400" />
                  Daily Trading Tasks
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {dailyTasks.map((task, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-slate-800/30">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${task.completed ? 'bg-green-500' : 'bg-slate-600'}`}></div>
                        <div>
                          <div className={`font-medium ${task.completed ? 'text-green-400' : 'text-white'}`}>
                            {task.name}
                          </div>
                          <div className="text-slate-400 text-sm">{task.progress}</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge 
                          variant={task.completed ? 'default' : 'outline'}
                          className={task.completed ? 'bg-green-500/20 text-green-400' : 'border-slate-600 text-slate-300'}
                        >
                          +{task.points} pts
                        </Badge>
                        {task.completed && <Trophy className="h-4 w-4 text-yellow-400" />}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Swaps */}
            <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Clock className="mr-2 h-5 w-5 text-emerald-400" />
                  Recent Swaps
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentSwaps.map((swap, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-3">
                        <div className={`px-2 py-1 rounded text-xs font-semibold ${
                          swap.type === 'buy' 
                            ? 'bg-emerald-500/20 text-emerald-400' 
                            : 'bg-red-500/20 text-red-400'
                        }`}>
                          {swap.type.toUpperCase()}
                        </div>
                        <div>
                          <div className="text-white font-medium">{swap.pair}</div>
                          <div className="text-slate-400">{swap.amount} • {swap.dex}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-white">{swap.price}</div>
                        <div className="flex items-center space-x-2">
                          <span className="text-slate-400">{swap.time}</span>
                          <Badge variant="outline" className="border-purple-500/50 text-purple-400 text-xs">
                            +{swap.points}
                          </Badge>
                        </div>
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
