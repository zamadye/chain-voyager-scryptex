
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAppStore } from '@/stores/useAppStore';
import { SUPPORTED_CHAINS } from '@/lib/chains';
import { Link as ChainIcon, ExternalLink, Zap, Globe, TestTube, Activity } from 'lucide-react';

const Chains = () => {
  const { chainStatus } = useAppStore();

  const getStatusColor = (isActive: boolean) => {
    return isActive ? 'text-green-400' : 'text-gray-400';
  };

  const getStatusBadge = (isActive: boolean) => {
    return isActive ? (
      <Badge className="bg-green-500/20 text-green-400 border-green-500/50">Active</Badge>
    ) : (
      <Badge variant="secondary" className="bg-gray-700 text-gray-400">Inactive</Badge>
    );
  };

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center">
              <ChainIcon className="mr-3 h-8 w-8 text-cyan-400" />
              Supported Chains
            </h1>
            <p className="text-gray-400 mt-2">Monitor and interact with multiple blockchain networks</p>
          </div>
          <Badge variant="outline" className="border-cyan-500/50 text-cyan-400">
            {Object.keys(SUPPORTED_CHAINS).length} Networks
          </Badge>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-gray-900/50 border-gray-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Active Chains</p>
                  <p className="text-2xl font-bold text-green-400 mt-1">
                    {Object.values(chainStatus).filter(status => status?.isActive).length}
                  </p>
                </div>
                <Activity className="h-8 w-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 border-gray-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Testnet Chains</p>
                  <p className="text-2xl font-bold text-orange-400 mt-1">
                    {Object.values(SUPPORTED_CHAINS).filter(chain => chain.testnet).length}
                  </p>
                </div>
                <TestTube className="h-8 w-8 text-orange-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 border-gray-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total Networks</p>
                  <p className="text-2xl font-bold text-cyan-400 mt-1">
                    {Object.keys(SUPPORTED_CHAINS).length}
                  </p>
                </div>
                <Globe className="h-8 w-8 text-cyan-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Chains Grid */}
        <div className="grid lg:grid-cols-2 gap-6">
          {Object.entries(SUPPORTED_CHAINS).map(([key, chain]) => {
            const status = chainStatus[key];
            const isActive = status?.isActive ?? false;

            return (
              <Card key={key} className="bg-gray-900/50 border-gray-800 hover:border-gray-700 transition-colors">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white flex items-center">
                      <div className={`w-3 h-3 rounded-full mr-3 ${isActive ? 'bg-green-500' : 'bg-gray-500'}`} />
                      {chain.name}
                    </CardTitle>
                    {getStatusBadge(isActive)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-400">Chain ID:</span>
                      <p className="text-white font-mono">{chain.id}</p>
                    </div>
                    <div>
                      <span className="text-gray-400">Network:</span>
                      <p className="text-white">{chain.testnet ? 'Testnet' : 'Mainnet'}</p>
                    </div>
                    <div>
                      <span className="text-gray-400">Currency:</span>
                      <p className="text-white">{chain.nativeCurrency.symbol}</p>
                    </div>
                    <div>
                      <span className="text-gray-400">Status:</span>
                      <p className={getStatusColor(isActive)}>
                        {isActive ? 'Connected' : 'Disconnected'}
                      </p>
                    </div>
                  </div>

                  {status && (
                    <div className="p-3 rounded-lg bg-gray-800/50 border border-gray-700">
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div>
                          <span className="text-gray-400">Block Height:</span>
                          <p className="text-white font-mono">{status.blockHeight || 'N/A'}</p>
                        </div>
                        <div>
                          <span className="text-gray-400">Gas Price:</span>
                          <p className="text-white">{status.gasPrice || 'N/A'} gwei</p>
                        </div>
                        <div>
                          <span className="text-gray-400">Last Updated:</span>
                          <p className="text-white">
                            {status.lastUpdated ? new Date(status.lastUpdated).toLocaleTimeString() : 'N/A'}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-400">Ping:</span>
                          <p className="text-white">{status.latency || 'N/A'}ms</p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                      className="border-gray-600 hover:border-gray-500"
                    >
                      <a href={chain.blockExplorer} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="mr-1 h-3 w-3" />
                        Explorer
                      </a>
                    </Button>
                    
                    {chain.faucetUrl && (
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                        className="border-blue-600 hover:border-blue-500 text-blue-400"
                      >
                        <a href={chain.faucetUrl} target="_blank" rel="noopener noreferrer">
                          <Zap className="mr-1 h-3 w-3" />
                          Faucet
                        </a>
                      </Button>
                    )}

                    <Button
                      variant="outline"
                      size="sm"
                      className="border-purple-600 hover:border-purple-500 text-purple-400"
                      disabled={!isActive}
                    >
                      <Activity className="mr-1 h-3 w-3" />
                      Add Network
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </Layout>
  );
};

export default Chains;
