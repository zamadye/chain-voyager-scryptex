
import DEXLayout from '@/components/layout/DEXLayout';
import TradingStats from '@/components/dashboard/TradingStats';
import VolumeChart from '@/components/dashboard/VolumeChart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Activity, TrendingUp, Users, Zap, ArrowUpDown, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

const Index = () => {
  const recentActivity = [
    { type: 'swap', user: '0x1234...5678', from: 'ETH', to: 'USDC', amount: '2.5', time: '2m ago' },
    { type: 'create', user: '0x9876...5432', token: 'MYTOKEN', time: '5m ago' },
    { type: 'bridge', user: '0x1111...2222', asset: 'USDT', from: 'Ethereum', to: 'Nexus', time: '8m ago' },
    { type: 'gm', user: '0x3333...4444', chain: 'Somnia', time: '12m ago' }
  ];

  const topTokens = [
    { symbol: 'STEX', name: 'Scryptex', volume: '$145K', change: '+12.5%', trend: 'up' },
    { symbol: 'NEXUS', name: 'Nexus Token', volume: '$89K', change: '+8.3%', trend: 'up' },
    { symbol: 'ZG', name: '0G Token', volume: '$67K', change: '-2.1%', trend: 'down' },
    { symbol: 'RISE', name: 'RiseChain', volume: '$45K', change: '+15.7%', trend: 'up' }
  ];

  return (
    <DEXLayout>
      <div className="w-full min-h-[calc(100vh-8rem)] flex flex-col">
        {/* Hero Section - Full Height */}
        <div className="flex-1 flex flex-col justify-center px-4 py-8 md:py-12">
          <div className="text-center space-y-6 max-w-4xl mx-auto">
            <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold text-white leading-tight">
              Welcome to <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">SCRYPTEX</span>
            </h1>
            <p className="text-slate-400 text-base sm:text-lg lg:text-xl max-w-3xl mx-auto leading-relaxed">
              The ultimate multi-chain DEX for token creation, trading, and bridging across 10+ blockchain testnets
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
              <Link to="/swap" className="w-full sm:w-auto">
                <Button className="w-full sm:w-auto bg-gradient-to-r from-emerald-500 to-cyan-600 hover:from-emerald-600 hover:to-cyan-700 h-12 px-8 text-base font-semibold">
                  <ArrowUpDown className="h-5 w-5 mr-2" />
                  Start Trading
                </Button>
              </Link>
              <Link to="/create" className="w-full sm:w-auto">
                <Button variant="outline" className="w-full sm:w-auto border-slate-600 text-slate-300 hover:bg-slate-800 h-12 px-8 text-base font-semibold">
                  <Plus className="h-5 w-5 mr-2" />
                  Create Token
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="px-4 space-y-6 pb-8">
          {/* Trading Stats */}
          <TradingStats />

          {/* Charts and Activity */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Volume Chart */}
            <div className="lg:col-span-2">
              <VolumeChart />
            </div>

            {/* Recent Activity */}
            <div>
              <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Activity className="mr-2 h-5 w-5 text-emerald-400" />
                    Live Activity
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-2">
                        <div className={`h-2 w-2 rounded-full ${
                          activity.type === 'swap' ? 'bg-emerald-400' :
                          activity.type === 'create' ? 'bg-cyan-400' :
                          activity.type === 'bridge' ? 'bg-blue-400' :
                          'bg-yellow-400'
                        }`} />
                        <span className="text-slate-300">
                          {activity.user} {
                            activity.type === 'swap' ? `swapped ${activity.from} → ${activity.to}` :
                            activity.type === 'create' ? `created ${activity.token}` :
                            activity.type === 'bridge' ? `bridged ${activity.asset}` :
                            `posted GM on ${activity.chain}`
                          }
                        </span>
                      </div>
                      <span className="text-slate-400">{activity.time}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Top Tokens and Chain Health */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Top Tokens */}
            <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <TrendingUp className="mr-2 h-5 w-5 text-emerald-400" />
                  Top Tokens (24h)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {topTokens.map((token, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="h-8 w-8 bg-gradient-to-br from-emerald-500 to-cyan-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        {token.symbol[0]}
                      </div>
                      <div>
                        <div className="text-white font-semibold">{token.symbol}</div>
                        <div className="text-slate-400 text-sm">{token.name}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-white font-semibold">{token.volume}</div>
                      <Badge 
                        variant={token.trend === 'up' ? 'default' : 'destructive'}
                        className={
                          token.trend === 'up' 
                            ? 'bg-emerald-500/20 text-emerald-400' 
                            : 'bg-red-500/20 text-red-400'
                        }
                      >
                        {token.change}
                      </Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Chain Health */}
            <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Zap className="mr-2 h-5 w-5 text-emerald-400" />
                  Chain Health
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { name: 'Ethereum Sepolia', status: 'healthy', latency: '2.1s' },
                  { name: 'Nexus Testnet', status: 'healthy', latency: '1.8s' },
                  { name: '0G Testnet', status: 'healthy', latency: '3.2s' },
                  { name: 'Somnia Testnet', status: 'warning', latency: '5.1s' }
                ].map((chain, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-2">
                      <div className={`h-2 w-2 rounded-full ${
                        chain.status === 'healthy' ? 'bg-green-500' : 'bg-yellow-500'
                      }`} />
                      <span className="text-slate-300">{chain.name}</span>
                    </div>
                    <span className="text-slate-400">{chain.latency}</span>
                  </div>
                ))}
                <Link to="/chains">
                  <Button variant="ghost" size="sm" className="w-full text-emerald-400 hover:text-emerald-300 mt-2">
                    View All Chains
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DEXLayout>
  );
};

export default Index;
