
import { useState } from 'react';
import ChainFirstLayout from '@/components/navigation/ChainFirstLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useAppStore } from '@/stores/useAppStore';
import { SUPPORTED_CHAINS } from '@/lib/chains';
import { ArrowLeftRight, ArrowUpDown, Zap, TrendingUp } from 'lucide-react';

const Swap = () => {
  const { wallet, addSwap, addNotification } = useAppStore();
  const [selectedChain, setSelectedChain] = useState('');
  const [fromToken, setFromToken] = useState('');
  const [toToken, setToToken] = useState('');
  const [amount, setAmount] = useState('');
  const [slippage, setSlippage] = useState('0.5');

  const handleSwap = () => {
    if (!wallet.isConnected) {
      addNotification({
        type: 'warning',
        title: 'Wallet not connected',
        message: 'Please connect your wallet to perform swaps.',
        read: false
      });
      return;
    }

    if (!selectedChain || !fromToken || !toToken || !amount) {
      addNotification({
        type: 'error',
        title: 'Missing information',
        message: 'Please fill in all required fields.',
        read: false
      });
      return;
    }

    const swap = {
      id: `swap-${Date.now()}`,
      chainId: parseInt(selectedChain),
      fromToken,
      toToken,
      amount: amount,
      slippage: parseFloat(slippage),
      status: 'pending' as const,
      timestamp: Date.now(),
      txHash: '',
      amountOut: '0',
      gasUsed: '0',
      priceImpact: '0'
    };

    addSwap(swap);
    addNotification({
      type: 'success',
      title: 'Swap initiated',
      message: `Swapping ${amount} ${fromToken} to ${toToken} on ${SUPPORTED_CHAINS[Object.keys(SUPPORTED_CHAINS).find(k => SUPPORTED_CHAINS[k].id === parseInt(selectedChain))]?.name}.`,
      read: false
    });

    // Reset form
    setAmount('');
  };

  const swapTokens = () => {
    const temp = fromToken;
    setFromToken(toToken);
    setToToken(temp);
  };

  const popularTokens = ['ETH', 'USDC', 'USDT', 'DAI', 'WBTC'];

  return (
    <ChainFirstLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center">
              <ArrowLeftRight className="mr-3 h-8 w-8 text-blue-400" />
              Token Swap
            </h1>
            <p className="text-gray-400 mt-2">Swap tokens across multiple chains with best rates</p>
          </div>
          <Badge variant="outline" className="border-blue-500/50 text-blue-400">
            Cross-Chain DEX
          </Badge>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Swap Interface */}
          <div className="lg:col-span-2">
            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center justify-between">
                  <span className="flex items-center">
                    <Zap className="mr-2 h-5 w-5" />
                    Swap Tokens
                  </span>
                  <Badge variant="secondary">Best Rate</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="chain" className="text-white">Chain</Label>
                  <Select value={selectedChain} onValueChange={setSelectedChain}>
                    <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                      <SelectValue placeholder="Select chain" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      {Object.entries(SUPPORTED_CHAINS).map(([key, chain]) => (
                        <SelectItem key={key} value={chain.id.toString()}>
                          {chain.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* From Token */}
                <div className="space-y-2">
                  <Label className="text-white">From</Label>
                  <Card className="bg-gray-800/50 border-gray-700 p-4">
                    <div className="flex justify-between items-center">
                      <div className="flex-1">
                        <Input
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          placeholder="0.0"
                          className="bg-transparent border-0 text-2xl font-bold text-white p-0 h-auto focus-visible:ring-0"
                        />
                        <p className="text-gray-400 text-sm mt-1">≈ $0.00</p>
                      </div>
                      <div className="ml-4">
                        <Select value={fromToken} onValueChange={setFromToken}>
                          <SelectTrigger className="bg-gray-700 border-gray-600 text-white min-w-[100px]">
                            <SelectValue placeholder="Token" />
                          </SelectTrigger>
                          <SelectContent className="bg-gray-800 border-gray-700">
                            {popularTokens.map((token) => (
                              <SelectItem key={token} value={token}>
                                {token}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </Card>
                </div>

                {/* Swap Button */}
                <div className="flex justify-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={swapTokens}
                    className="rounded-full h-10 w-10 p-0 hover:bg-gray-700"
                  >
                    <ArrowUpDown className="h-4 w-4" />
                  </Button>
                </div>

                {/* To Token */}
                <div className="space-y-2">
                  <Label className="text-white">To</Label>
                  <Card className="bg-gray-800/50 border-gray-700 p-4">
                    <div className="flex justify-between items-center">
                      <div className="flex-1">
                        <div className="text-2xl font-bold text-white">0.0</div>
                        <p className="text-gray-400 text-sm mt-1">≈ $0.00</p>
                      </div>
                      <div className="ml-4">
                        <Select value={toToken} onValueChange={setToToken}>
                          <SelectTrigger className="bg-gray-700 border-gray-600 text-white min-w-[100px]">
                            <SelectValue placeholder="Token" />
                          </SelectTrigger>
                          <SelectContent className="bg-gray-800 border-gray-700">
                            {popularTokens.map((token) => (
                              <SelectItem key={token} value={token}>
                                {token}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </Card>
                </div>

                {/* Slippage Settings */}
                <div className="space-y-2">
                  <Label htmlFor="slippage" className="text-white">Slippage Tolerance (%)</Label>
                  <Select value={slippage} onValueChange={setSlippage}>
                    <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      <SelectItem value="0.1">0.1%</SelectItem>
                      <SelectItem value="0.5">0.5%</SelectItem>
                      <SelectItem value="1.0">1.0%</SelectItem>
                      <SelectItem value="3.0">3.0%</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  onClick={handleSwap}
                  className="w-full bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700"
                  disabled={!wallet.isConnected}
                >
                  Swap Tokens
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Market Info */}
          <div className="lg:col-span-1 space-y-4">
            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <TrendingUp className="mr-2 h-5 w-5" />
                  Market Info
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Rate</span>
                    <span className="text-white">1 ETH = 2,450 USDC</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Price Impact</span>
                    <span className="text-green-400">0.01%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Minimum Received</span>
                    <span className="text-white">2,437.75 USDC</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Network Fee</span>
                    <span className="text-white">~$12.50</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </ChainFirstLayout>
  );
};

export default Swap;
