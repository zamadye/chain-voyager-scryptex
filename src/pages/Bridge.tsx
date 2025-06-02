
import DEXLayout from '@/components/layout/DEXLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shuffle, Shield } from 'lucide-react';
import { EnhancedBridgeInterface } from '@/components/trading/EnhancedBridgeInterface';

const Bridge = () => {
  const supportedChains = [
    { id: '1', name: 'Ethereum', icon: '🔗' },
    { id: '56', name: 'Nexus', icon: '⚡' },
    { id: '137', name: '0G Network', icon: '🚀' },
    { id: '250', name: 'Somnia', icon: '🌟' },
    { id: '43114', name: 'Aztec', icon: '🔮' },
    { id: '42161', name: 'RiseChain', icon: '📈' },
    { id: '10', name: 'MegaETH', icon: '⚡' },
  ];

  return (
    <DEXLayout>
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center">
              <Shuffle className="mr-3 h-8 w-8 text-cyan-400" />
              Enterprise Cross-Chain Bridge
            </h1>
            <p className="text-slate-400 mt-2">
              Institutional-grade asset bridging with compliance monitoring
            </p>
          </div>
          <Badge variant="outline" className="border-cyan-500/50 text-cyan-400">
            Enterprise Ready
          </Badge>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Enhanced Bridge Interface */}
          <div className="lg:col-span-2">
            <EnhancedBridgeInterface />
          </div>

          {/* Bridge Info Sidebar */}
          <div className="space-y-4">
            <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Shield className="mr-2 h-5 w-5 text-green-400" />
                  Enterprise Security
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-center text-green-400">
                  <div className="h-2 w-2 bg-green-400 rounded-full mr-2" />
                  SOC2 Type II Compliant
                </div>
                <div className="flex items-center text-green-400">
                  <div className="h-2 w-2 bg-green-400 rounded-full mr-2" />
                  Real-time Compliance Monitoring
                </div>
                <div className="flex items-center text-green-400">
                  <div className="h-2 w-2 bg-green-400 rounded-full mr-2" />
                  Institutional Grade Custody
                </div>
                <div className="flex items-center text-green-400">
                  <div className="h-2 w-2 bg-green-400 rounded-full mr-2" />
                  Multi-Signature Validation
                </div>
                <div className="flex items-center text-green-400">
                  <div className="h-2 w-2 bg-green-400 rounded-full mr-2" />
                  24/7 Risk Monitoring
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">Supported Networks</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {supportedChains.map((chain) => (
                  <div key={chain.id} className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-2">
                      <span>{chain.icon}</span>
                      <span className="text-slate-300">{chain.name}</span>
                    </div>
                    <div className="h-2 w-2 bg-green-500 rounded-full" />
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">Bridge Features</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="text-slate-300">
                  • Institutional liquidity pools
                </div>
                <div className="text-slate-300">
                  • MEV protection
                </div>
                <div className="text-slate-300">
                  • Slippage optimization
                </div>
                <div className="text-slate-300">
                  • Real-time compliance checks
                </div>
                <div className="text-slate-300">
                  • Automated reporting
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DEXLayout>
  );
};

export default Bridge;
