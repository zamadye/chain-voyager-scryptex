
import { useState } from 'react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { useAppStore } from '@/stores/useAppStore';
import { SUPPORTED_CHAINS } from '@/lib/chains';
import { Sun, Calendar, Target, Flame } from 'lucide-react';

const GM = () => {
  const { wallet, addGMPost, addNotification } = useAppStore();
  const [selectedChains, setSelectedChains] = useState<string[]>([]);

  const handleChainToggle = (chainKey: string, checked: boolean) => {
    if (checked) {
      setSelectedChains([...selectedChains, chainKey]);
    } else {
      setSelectedChains(selectedChains.filter(key => key !== chainKey));
    }
  };

  const handleBatchGM = () => {
    if (!wallet.isConnected) {
      addNotification({
        type: 'warning',
        title: 'Wallet not connected',
        message: 'Please connect your wallet to post GM messages.',
        read: false
      });
      return;
    }

    if (selectedChains.length === 0) {
      addNotification({
        type: 'error',
        title: 'No chains selected',
        message: 'Please select at least one chain to post GM.',
        read: false
      });
      return;
    }

    selectedChains.forEach(chainKey => {
      const chain = SUPPORTED_CHAINS[chainKey];
      const gmPost = {
        id: `gm-${Date.now()}-${chainKey}`,
        chainId: chain.id,
        message: 'GM! 🌅',
        status: 'pending' as const,
        timestamp: Date.now(),
        txHash: null,
        gasUsed: null
      };

      addGMPost(gmPost);
    });

    addNotification({
      type: 'success',
      title: 'GM posts initiated',
      message: `Posted GM to ${selectedChains.length} chains. Building that streak! 🔥`,
      read: false
    });

    setSelectedChains([]);
  };

  const streakData = {
    current: 7,
    longest: 15,
    total: 42
  };

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center">
              <Sun className="mr-3 h-8 w-8 text-yellow-400" />
              GM Ritual
            </h1>
            <p className="text-gray-400 mt-2">Say good morning and build your on-chain presence</p>
          </div>
          <Badge variant="outline" className="border-yellow-500/50 text-yellow-400">
            Daily Ritual
          </Badge>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* GM Posting Interface */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Target className="mr-2 h-5 w-5" />
                  Select Chains for GM
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  {Object.entries(SUPPORTED_CHAINS).map(([key, chain]) => (
                    <div
                      key={key}
                      className="flex items-center space-x-3 p-3 rounded-lg bg-gray-800/50 hover:bg-gray-800 transition-colors"
                    >
                      <Checkbox
                        id={key}
                        checked={selectedChains.includes(key)}
                        onCheckedChange={(checked) => handleChainToggle(key, checked as boolean)}
                        className="border-gray-600"
                      />
                      <label
                        htmlFor={key}
                        className="flex-1 text-white font-medium cursor-pointer"
                      >
                        {chain.name}
                      </label>
                      <Badge variant="secondary" className="text-xs">
                        {chain.testnet ? 'Testnet' : 'Mainnet'}
                      </Badge>
                    </div>
                  ))}
                </div>

                <div className="mt-6 p-4 rounded-lg bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/30">
                  <div className="flex items-center space-x-3">
                    <Sun className="h-6 w-6 text-yellow-400" />
                    <div>
                      <p className="text-white font-medium">GM Message Preview</p>
                      <p className="text-gray-300 text-sm">GM! 🌅 Starting another day in the blockchain space!</p>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={handleBatchGM}
                  className="w-full mt-6 bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700"
                  disabled={!wallet.isConnected || selectedChains.length === 0}
                >
                  Post GM to {selectedChains.length} Chain{selectedChains.length !== 1 ? 's' : ''}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Streak Stats */}
          <div className="lg:col-span-1 space-y-4">
            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Flame className="mr-2 h-5 w-5 text-orange-400" />
                  Streak Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-4xl font-bold text-orange-400">{streakData.current}</div>
                  <p className="text-gray-400 text-sm">Current Streak</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-700">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">{streakData.longest}</div>
                    <p className="text-gray-400 text-xs">Longest</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">{streakData.total}</div>
                    <p className="text-gray-400 text-xs">Total GMs</p>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-700">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Next Milestone</span>
                    <span className="text-yellow-400">10 days 🎯</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                    <div 
                      className="bg-gradient-to-r from-yellow-400 to-orange-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(streakData.current / 10) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Calendar className="mr-2 h-5 w-5" />
                  This Week
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-7 gap-1">
                  {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
                    <div key={index} className="text-center">
                      <div className="text-xs text-gray-400 mb-1">{day}</div>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs ${
                        index < 5 ? 'bg-green-500 text-white' : 'bg-gray-700 text-gray-400'
                      }`}>
                        {index < 5 ? '✓' : ''}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default GM;
