
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shuffle, ArrowRight, Clock, Shield, CheckCircle, AlertTriangle } from 'lucide-react';
import { tradingService } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

interface BridgeTransaction {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  estimatedTime: number;
  fromChain: string;
  toChain: string;
  amount: string;
  token: string;
}

export const EnhancedBridgeInterface = () => {
  const [amount, setAmount] = useState('');
  const [fromChain, setFromChain] = useState('');
  const [toChain, setToChain] = useState('');
  const [selectedToken, setSelectedToken] = useState('ETH');
  const [isLoading, setIsLoading] = useState(false);
  const [bridgeTransactions, setBridgeTransactions] = useState<BridgeTransaction[]>([]);
  const [complianceCheck, setComplianceCheck] = useState<any>(null);
  const { toast } = useToast();

  const supportedChains = [
    { id: '1', name: 'Ethereum', icon: '🔗', status: 'active' },
    { id: '56', name: 'Nexus', icon: '⚡', status: 'active' },
    { id: '137', name: '0G Network', icon: '🚀', status: 'active' },
    { id: '250', name: 'Somnia', icon: '🌟', status: 'active' },
    { id: '43114', name: 'Aztec', icon: '🔮', status: 'active' },
    { id: '42161', name: 'RiseChain', icon: '📈', status: 'active' },
    { id: '10', name: 'MegaETH', icon: '⚡', status: 'active' },
  ];

  const handleBridge = async () => {
    if (!amount || !fromChain || !toChain) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      // First check compliance for institutional accounts
      const complianceResult = await tradingService.checkTradeCompliance({
        type: 'bridge',
        amount: parseFloat(amount),
        fromChain,
        toChain,
        token: selectedToken
      });

      setComplianceCheck(complianceResult);

      if (!complianceResult.success || !complianceResult.data?.isCompliant) {
        toast({
          title: "Compliance Check Failed",
          description: "Transaction does not meet compliance requirements",
          variant: "destructive"
        });
        return;
      }

      // Execute bridge transaction
      const bridgeResult = await tradingService.bridgeAssets({
        fromChain,
        toChain,
        token: selectedToken,
        amount,
        recipient: 'user_wallet_address' // This would come from wallet connection
      });

      if (bridgeResult.success) {
        const newTransaction: BridgeTransaction = {
          id: `bridge_${Date.now()}`,
          status: 'processing',
          progress: 25,
          estimatedTime: 600, // 10 minutes
          fromChain: supportedChains.find(c => c.id === fromChain)?.name || fromChain,
          toChain: supportedChains.find(c => c.id === toChain)?.name || toChain,
          amount,
          token: selectedToken
        };

        setBridgeTransactions(prev => [newTransaction, ...prev]);

        toast({
          title: "Bridge Transaction Started",
          description: `Bridging ${amount} ${selectedToken} from ${newTransaction.fromChain} to ${newTransaction.toChain}`,
        });

        // Simulate progress updates
        simulateTransactionProgress(newTransaction.id);
      }
    } catch (error) {
      toast({
        title: "Bridge Failed",
        description: "Failed to initiate bridge transaction",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const simulateTransactionProgress = (transactionId: string) => {
    const intervals = [50, 75, 100];
    let currentStep = 0;

    const interval = setInterval(() => {
      setBridgeTransactions(prev => 
        prev.map(tx => 
          tx.id === transactionId 
            ? { ...tx, progress: intervals[currentStep] }
            : tx
        )
      );

      currentStep++;
      if (currentStep >= intervals.length) {
        clearInterval(interval);
        setBridgeTransactions(prev => 
          prev.map(tx => 
            tx.id === transactionId 
              ? { ...tx, status: 'completed', progress: 100 }
              : tx
          )
        );
      }
    }, 120000); // 2 minutes per step
  };

  return (
    <div className="space-y-6">
      {/* Main Bridge Interface */}
      <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Shuffle className="mr-2 h-5 w-5 text-cyan-400" />
            Enhanced Cross-Chain Bridge
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
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center space-x-2">
                          <span>{chain.icon}</span>
                          <span>{chain.name}</span>
                        </div>
                        <Badge 
                          variant={chain.status === 'active' ? 'default' : 'secondary'}
                          className="ml-2"
                        >
                          {chain.status}
                        </Badge>
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
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center space-x-2">
                          <span>{chain.icon}</span>
                          <span>{chain.name}</span>
                        </div>
                        <Badge 
                          variant={chain.status === 'active' ? 'default' : 'secondary'}
                          className="ml-2"
                        >
                          {chain.status}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Amount Input */}
          <div className="space-y-2">
            <Label className="text-slate-300">Amount</Label>
            <div className="flex space-x-2">
              <Input
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.0"
                className="bg-slate-800 border-slate-700 text-white flex-1"
                type="number"
              />
              <Select value={selectedToken} onValueChange={setSelectedToken}>
                <SelectTrigger className="bg-slate-800 border-slate-700 text-white w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  {['ETH', 'USDC', 'USDT', 'BTC', 'STEX'].map((token) => (
                    <SelectItem 
                      key={token} 
                      value={token}
                      className="text-white hover:bg-slate-700"
                    >
                      {token}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Compliance Check Result */}
          {complianceCheck && (
            <Alert className={complianceCheck.data?.isCompliant ? "border-green-500" : "border-red-500"}>
              <div className="flex items-center space-x-2">
                {complianceCheck.data?.isCompliant ? 
                  <CheckCircle className="h-4 w-4 text-green-500" /> : 
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                }
                <AlertDescription className="text-white">
                  {complianceCheck.data?.isCompliant ? 
                    "Transaction passes compliance checks" : 
                    `Compliance issues detected: ${complianceCheck.data?.violations?.length || 0} violations`
                  }
                </AlertDescription>
              </div>
            </Alert>
          )}

          {/* Bridge Button */}
          <Button
            onClick={handleBridge}
            disabled={isLoading || !amount || !fromChain || !toChain}
            className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-semibold py-3"
            size="lg"
          >
            {isLoading ? 'Processing...' : 'Bridge Assets'}
          </Button>
        </CardContent>
      </Card>

      {/* Recent Bridge Transactions */}
      {bridgeTransactions.length > 0 && (
        <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white">Recent Bridge Transactions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {bridgeTransactions.map((tx) => (
              <div key={tx.id} className="border border-slate-700 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-white font-medium">
                      {tx.amount} {tx.token}
                    </span>
                    <ArrowRight className="h-4 w-4 text-slate-400" />
                    <span className="text-slate-300">
                      {tx.fromChain} → {tx.toChain}
                    </span>
                  </div>
                  <Badge 
                    variant={
                      tx.status === 'completed' ? 'default' :
                      tx.status === 'failed' ? 'destructive' :
                      'secondary'
                    }
                  >
                    {tx.status}
                  </Badge>
                </div>
                
                {tx.status !== 'completed' && tx.status !== 'failed' && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm text-slate-400">
                      <span>Progress</span>
                      <span>{tx.progress}%</span>
                    </div>
                    <Progress value={tx.progress} className="h-2" />
                    <div className="flex items-center space-x-1 text-sm text-slate-400">
                      <Clock className="h-3 w-3" />
                      <span>Est. {Math.round(tx.estimatedTime / 60)} minutes remaining</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
