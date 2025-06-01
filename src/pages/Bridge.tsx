
import DEXLayout from '@/components/layout/DEXLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Shuffle, ArrowRight, Clock, Shield } from 'lucide-react';
import TokenSelector from '@/components/trading/TokenSelector';
import { useState } from 'react';

const Bridge = () => {
  const [amount, setAmount] = useState('');
  const [fromChain, setFromChain] = useState('');
  const [toChain, setToChain] = useState('');
  const [selectedToken, setSelectedToken] = useState('ETH');

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
              Cross-Chain Bridge
            </h1>
            <p className="text-slate-400 mt-2">Transfer assets securely across multiple blockchains</p>
          </div>
          <Badge variant="outline" className="border-cyan-500/50 text-cyan-400">
            Multi-Chain
          </Badge>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Bridge Interface */}
          <div className="lg:col-span-2">
            <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Shuffle className="mr-2 h-5 w-5 text-cyan-400" />
                  Bridge Assets
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Chain Selection */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-slate-300">From Chain</Label>
                    <Select value={fromChain} onValueChange={setFromChain}>
                      <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                        <SelectValue placeholder="Select source chain" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        {supportedChains.map((chain) => (
                          <SelectItem 
                            key={chain.id} 
                            value={chain.id}
                            className="text-white hover:bg-slate-700 focus:bg-slate-700"
                          >
                            <div className="flex items-center space-x-2">
                              <span>{chain.icon}</span>
                              <span>{chain.name}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-slate-300">To Chain</Label>
                    <Select value={toChain} onValueChange={setToChain}>
                      <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                        <SelectValue placeholder="Select destination chain" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        {supportedChains
                          .filter(chain => chain.id !== fromChain)
                          .map((chain) => (
                          <SelectItem 
                            key={chain.id} 
                            value={chain.id}
                            className="text-white hover:bg-slate-700 focus:bg-slate-700"
                          >
                            <div className="flex items-center space-x-2">
                              <span>{chain.icon}</span>
                              <span>{chain.name}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Arrow Indicator */}
                <div className="flex justify-center">
                  <div className="bg-slate-800 rounded-full p-3 border border-slate-700">
                    <ArrowRight className="h-6 w-6 text-cyan-400" />
                  </div>
                </div>

                {/* Asset Selection */}
                <div className="space-y-2">
                  <Label className="text-slate-300">Asset & Amount</Label>
                  <Card className="bg-slate-800/50 border-slate-700 p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <Input
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          placeholder="0.0"
                          className="bg-transparent border-0 text-2xl font-bold text-white p-0 h-auto focus-visible:ring-0"
                        />
                        <p className="text-slate-400 text-sm mt-1">≈ $0.00</p>
                      </div>
                      <TokenSelector 
                        selectedToken={selectedToken}
                        onTokenSelect={setSelectedToken}
                      />
                    </div>
                    <div className="flex justify-between items-center mt-2 text-sm text-slate-400">
                      <span>Available: 2.5847 {selectedToken}</span>
                      <Button variant="ghost" size="sm" className="text-cyan-400 hover:text-cyan-300 h-auto p-0">
                        MAX
                      </Button>
                    </div>
                  </Card>
                </div>

                {/* Bridge Details */}
                <Card className="bg-slate-800/30 border-slate-700 p-4">
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Bridge Fee</span>
                      <span className="text-white">0.1% + Gas</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400 flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        Estimated Time
                      </span>
                      <span className="text-white">5-10 minutes</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">You'll Receive</span>
                      <span className="text-white">{amount || '0.0'} {selectedToken}</span>
                    </div>
                  </div>
                </Card>

                {/* Bridge Button */}
                <Button
                  className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-semibold py-3"
                  size="lg"
                  disabled={!amount || !fromChain || !toChain}
                >
                  Bridge Assets
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Bridge Info */}
          <div className="space-y-4">
            <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Shield className="mr-2 h-5 w-5 text-green-400" />
                  Security Features
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-center text-green-400">
                  <div className="h-2 w-2 bg-green-400 rounded-full mr-2" />
                  Audited Smart Contracts
                </div>
                <div className="flex items-center text-green-400">
                  <div className="h-2 w-2 bg-green-400 rounded-full mr-2" />
                  Multi-Signature Validation
                </div>
                <div className="flex items-center text-green-400">
                  <div className="h-2 w-2 bg-green-400 rounded-full mr-2" />
                  Decentralized Validators
                </div>
                <div className="flex items-center text-green-400">
                  <div className="h-2 w-2 bg-green-400 rounded-full mr-2" />
                  24/7 Monitoring
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
                <CardTitle className="text-white">Recent Bridges</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-center text-slate-400 py-4">
                  <Shuffle className="h-8 w-8 mx-auto mb-2 text-slate-600" />
                  <p className="text-sm">No recent bridges</p>
                  <p className="text-xs">Your bridge history will appear here</p>
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
