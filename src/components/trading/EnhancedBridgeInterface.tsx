
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ArrowDown, ArrowLeftRight, Shield, Clock, DollarSign, Zap } from 'lucide-react';
import { toast } from 'sonner';

export const EnhancedBridgeInterface = () => {
  const [fromChain, setFromChain] = useState('');
  const [toChain, setToChain] = useState('');
  const [fromToken, setFromToken] = useState('');
  const [toToken, setToToken] = useState('');
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const chains = [
    { id: 'ethereum', name: 'Ethereum', icon: '🔗' },
    { id: 'nexus', name: 'Nexus', icon: '⚡' },
    { id: 'zerog', name: '0G Network', icon: '🚀' },
    { id: 'somnia', name: 'Somnia', icon: '🌟' },
    { id: 'aztec', name: 'Aztec', icon: '🔮' },
    { id: 'risechain', name: 'RiseChain', icon: '📈' },
    { id: 'megaeth', name: 'MegaETH', icon: '⚡' },
  ];

  const tokens = [
    { symbol: 'ETH', name: 'Ethereum', icon: '💎' },
    { symbol: 'USDC', name: 'USD Coin', icon: '💰' },
    { symbol: 'USDT', name: 'Tether', icon: '💵' },
    { symbol: 'BTC', name: 'Bitcoin', icon: '₿' },
    { symbol: 'STEX', name: 'SCRYPTEX Token', icon: '🔥' },
  ];

  const handleBridge = async () => {
    if (!fromChain || !toChain || !fromToken || !toToken || !amount) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    
    try {
      // Simulate bridge process
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      toast.success('Bridge transaction initiated successfully!');
      
      // Reset form
      setFromChain('');
      setToChain('');
      setFromToken('');
      setToToken('');
      setAmount('');
    } catch (error) {
      toast.error('Bridge transaction failed');
    } finally {
      setIsLoading(false);
    }
  };

  const estimatedTime = '2-5 minutes';
  const bridgeFee = '0.1%';
  const gasEstimate = '$12.50';

  return (
    <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-white flex items-center">
          <ArrowLeftRight className="mr-2 h-5 w-5 text-cyan-400" />
          Enterprise Bridge Interface
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* From Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-slate-300">From</label>
            <Badge variant="outline" className="border-green-500/50 text-green-400">
              <Shield className="mr-1 h-3 w-3" />
              Compliant
            </Badge>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select value={fromChain} onValueChange={setFromChain}>
              <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                <SelectValue placeholder="Select source chain" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                {chains.map((chain) => (
                  <SelectItem key={chain.id} value={chain.id} className="text-white">
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
                  <SelectItem key={token.symbol} value={token.symbol} className="text-white">
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
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select value={toChain} onValueChange={setToChain}>
              <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                <SelectValue placeholder="Select destination chain" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                {chains.map((chain) => (
                  <SelectItem key={chain.id} value={chain.id} className="text-white">
                    <span className="flex items-center">
                      <span className="mr-2">{chain.icon}</span>
                      {chain.name}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={toToken} onValueChange={setToToken}>
              <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                <SelectValue placeholder="Select token" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                {tokens.map((token) => (
                  <SelectItem key={token.symbol} value={token.symbol} className="text-white">
                    <span className="flex items-center">
                      <span className="mr-2">{token.icon}</span>
                      {token.symbol}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Bridge Details */}
        {amount && fromChain && toChain && (
          <div className="bg-slate-800/50 rounded-lg p-4 space-y-3">
            <h3 className="text-white font-medium">Bridge Details</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">Estimated Time</span>
                <span className="text-white flex items-center">
                  <Clock className="mr-1 h-3 w-3" />
                  {estimatedTime}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Bridge Fee</span>
                <span className="text-white">{bridgeFee}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Gas Estimate</span>
                <span className="text-white flex items-center">
                  <DollarSign className="mr-1 h-3 w-3" />
                  {gasEstimate}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">You'll Receive</span>
                <span className="text-green-400 font-medium">
                  ~{(parseFloat(amount) * 0.999).toFixed(4)} {toToken}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Bridge Button */}
        <Button
          onClick={handleBridge}
          disabled={!fromChain || !toChain || !amount || isLoading}
          className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white"
        >
          {isLoading ? (
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Processing Bridge...</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Zap className="h-4 w-4" />
              <span>Initiate Bridge</span>
            </div>
          )}
        </Button>

        {/* Security Notice */}
        <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-3">
          <div className="flex items-start space-x-2">
            <Shield className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <p className="text-green-400 font-medium">Enterprise Security Active</p>
              <p className="text-green-300 text-xs">
                Real-time compliance monitoring, institutional custody, and SOC2 compliant infrastructure.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
