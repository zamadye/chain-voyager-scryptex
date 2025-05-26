
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAccount } from 'wagmi';
import Layout from '@/components/layout/Layout';
import StatsOverview from '@/components/dashboard/StatsOverview';
import ChainStatusCard from '@/components/dashboard/ChainStatusCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAppStore } from '@/stores/useAppStore';
import { useWeb3Status } from '@/hooks/useWeb3Status';
import { SUPPORTED_CHAINS, getAllChains } from '@/lib/chains';
import { Activity, AlertCircle } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();
  const { isConnected } = useAccount();
  
  // Initialize Web3 status monitoring
  useWeb3Status();
  
  const { 
    chainStatus, 
    wallet, 
    deployments, 
    swaps, 
    gmPosts,
    addNotification 
  } = useAppStore();

  const handleQuickAction = (action: 'deploy' | 'swap' | 'gm', chainId: number) => {
    if (!isConnected) {
      addNotification({
        type: 'warning',
        title: 'Wallet not connected',
        message: 'Please connect your wallet to perform this action.',
        read: false,
      });
      return;
    }

    // Navigate to appropriate page with pre-selected chain
    navigate(`/${action}?chain=${chainId}`);
  };

  const recentActivity = [
    ...deployments.slice(-3).map(d => ({
      type: 'deployment',
      chain: Object.values(SUPPORTED_CHAINS).find(c => c.id === d.chainId)?.name,
      status: d.status,
      timestamp: d.timestamp,
      txHash: d.txHash,
    })),
    ...swaps.slice(-3).map(s => ({
      type: 'swap',
      chain: Object.values(SUPPORTED_CHAINS).find(c => c.id === s.chainId)?.name,
      status: s.status,
      timestamp: s.timestamp,
      txHash: s.txHash,
    })),
    ...gmPosts.slice(-3).map(g => ({
      type: 'gm',
      chain: Object.values(SUPPORTED_CHAINS).find(c => c.id === g.chainId)?.name,
      status: g.status,
      timestamp: g.timestamp,
      txHash: g.txHash,
    })),
  ].sort((a, b) => b.timestamp - a.timestamp).slice(0, 5);

  return (
    <Layout>
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">
              Welcome to SCRYPTEX
            </h1>
            <p className="text-gray-400 mt-2">
              Your comprehensive multi-chain airdrop farming platform
            </p>
          </div>
          
          {!isConnected && (
            <Card className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border-purple-500/30">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <AlertCircle className="h-5 w-5 text-purple-400" />
                  <div>
                    <p className="text-sm font-medium text-white">Connect your wallet</p>
                    <p className="text-xs text-gray-400">Start farming airdrops across multiple chains</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Stats Overview */}
        <StatsOverview />

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Chain Status Grid */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">Chain Status</h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/chains')}
                className="border-purple-500/50 text-purple-400 hover:bg-purple-500/10"
              >
                View All Chains
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {getAllChains().map((chain) => (
                <ChainStatusCard
                  key={chain.id}
                  chain={chain}
                  status={chainStatus[Object.keys(SUPPORTED_CHAINS).find(key => SUPPORTED_CHAINS[key].id === chain.id) || '']}
                  onQuickAction={handleQuickAction}
                />
              ))}
            </div>
          </div>

          {/* Activity Sidebar */}
          <div className="space-y-6">
            {/* Recent Activity */}
            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center text-white">
                  <Activity className="mr-2 h-5 w-5" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {recentActivity.length > 0 ? (
                  recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-center justify-between py-2 border-b border-gray-800 last:border-0">
                      <div className="flex-1">
                        <div className="text-sm font-medium text-white capitalize">
                          {activity.type} on {activity.chain}
                        </div>
                        <div className="text-xs text-gray-400">
                          {new Date(activity.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                      <Badge
                        variant={
                          activity.status === 'confirmed' ? 'default' :
                          activity.status === 'pending' ? 'secondary' : 'destructive'
                        }
                        className="text-xs"
                      >
                        {activity.status}
                      </Badge>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    <Activity className="mx-auto h-8 w-8 mb-2 opacity-50" />
                    <p className="text-sm">No recent activity</p>
                    <p className="text-xs">Start by connecting your wallet</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 border-purple-500/30">
              <CardHeader>
                <CardTitle className="text-white">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  className="w-full bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700"
                  onClick={() => navigate('/deploy')}
                  disabled={!isConnected}
                >
                  Deploy Contracts
                </Button>
                
                <Button
                  variant="outline"
                  className="w-full border-blue-500/50 text-blue-400 hover:bg-blue-500/10"
                  onClick={() => navigate('/swap')}
                  disabled={!isConnected}
                >
                  Token Swap
                </Button>
                
                <Button
                  variant="outline"
                  className="w-full border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/10"
                  onClick={() => navigate('/gm')}
                  disabled={!isConnected}
                >
                  Daily GM Ritual
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Index;
