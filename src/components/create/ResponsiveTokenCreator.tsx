
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useIsMobile } from '@/hooks/use-mobile';
import { getAllChains } from '@/lib/chains';
import { ChainConfig } from '@/types';
import { Upload, Plus, TrendingUp, Settings, Rocket } from 'lucide-react';
import ChainScrollSelector from './ChainScrollSelector';

const ResponsiveTokenCreator = () => {
  const isMobile = useIsMobile();
  const [tokenName, setTokenName] = useState('');
  const [tokenSymbol, setTokenSymbol] = useState('');
  const [description, setDescription] = useState('');
  const [initialSupply, setInitialSupply] = useState('1000000');
  const [startPrice, setStartPrice] = useState('0.001');
  const [selectedChain, setSelectedChain] = useState<ChainConfig | null>(null);

  const chains = getAllChains();

  const handleChainSelect = (chain: ChainConfig) => {
    setSelectedChain(chain);
  };

  if (isMobile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <div className="container mx-auto px-4 py-6 max-w-md space-y-6">
          {/* Mobile Header */}
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold text-white flex items-center justify-center">
              <Rocket className="mr-2 h-6 w-6 text-emerald-400" />
              Create Token
            </h1>
            <p className="text-slate-400 text-sm">Launch your token with automated bonding curves</p>
          </div>

          {/* Token Basic Info */}
          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader className="pb-4">
              <CardTitle className="text-white text-lg flex items-center">
                <Plus className="mr-2 h-4 w-4 text-emerald-400" />
                Token Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="tokenName" className="text-slate-300 text-sm">Token Name</Label>
                <Input
                  id="tokenName"
                  value={tokenName}
                  onChange={(e) => setTokenName(e.target.value)}
                  placeholder="My Awesome Token"
                  className="bg-slate-800 border-slate-700 text-white h-12 text-base"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tokenSymbol" className="text-slate-300 text-sm">Symbol</Label>
                <Input
                  id="tokenSymbol"
                  value={tokenSymbol}
                  onChange={(e) => setTokenSymbol(e.target.value.toUpperCase())}
                  placeholder="MAT"
                  className="bg-slate-800 border-slate-700 text-white h-12 text-base"
                  maxLength={10}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description" className="text-slate-300 text-sm">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your token's purpose..."
                  className="bg-slate-800 border-slate-700 text-white min-h-[80px] text-base"
                />
              </div>
            </CardContent>
          </Card>

          {/* Chain Selection */}
          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader className="pb-4">
              <CardTitle className="text-white text-lg">Deployment Chain</CardTitle>
            </CardHeader>
            <CardContent>
              <ChainScrollSelector 
                selectedChain={selectedChain}
                onChainSelect={handleChainSelect}
              />
            </CardContent>
          </Card>

          {/* Logo Upload */}
          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader className="pb-4">
              <CardTitle className="text-white text-lg">Token Logo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border-2 border-dashed border-slate-700 rounded-lg p-6 text-center">
                <Upload className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                <p className="text-slate-400 text-sm mb-2">Upload your logo</p>
                <Button variant="outline" className="border-slate-600 text-slate-300 h-10">
                  Choose File
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Bonding Curve */}
          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader className="pb-4">
              <CardTitle className="text-white text-lg flex items-center">
                <TrendingUp className="mr-2 h-4 w-4 text-emerald-400" />
                Bonding Curve
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-slate-300 text-sm">Supply</Label>
                  <Input
                    value={initialSupply}
                    onChange={(e) => setInitialSupply(e.target.value)}
                    className="bg-slate-800 border-slate-700 text-white h-10 text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-300 text-sm">Start Price</Label>
                  <Input
                    value={startPrice}
                    onChange={(e) => setStartPrice(e.target.value)}
                    className="bg-slate-800 border-slate-700 text-white h-10 text-sm"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Fixed Bottom Deploy Button */}
          <div className="fixed bottom-0 left-0 right-0 p-4 bg-slate-950/90 backdrop-blur-sm border-t border-slate-800">
            <div className="max-w-md mx-auto">
              <Button 
                className="w-full bg-gradient-to-r from-emerald-500 to-cyan-600 hover:from-emerald-600 hover:to-cyan-700 text-white font-semibold h-12"
                disabled={!tokenName || !tokenSymbol || !selectedChain}
              >
                Deploy Token • ~0.05 ETH
              </Button>
            </div>
          </div>

          {/* Bottom spacing for fixed button */}
          <div className="h-20" />
        </div>
      </div>
    );
  }

  // Desktop Layout
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="container mx-auto px-6 py-8 max-w-7xl">
        {/* Desktop Header */}
        <div className="text-center space-y-4 mb-8">
          <h1 className="text-4xl font-bold text-white flex items-center justify-center">
            <Rocket className="mr-3 h-8 w-8 text-emerald-400" />
            Create Token
          </h1>
          <p className="text-slate-400 text-lg">Launch your token with automated bonding curves and instant trading</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Token Info Form */}
            <Card className="bg-slate-900/50 border-slate-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Plus className="mr-2 h-5 w-5 text-emerald-400" />
                  Token Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="tokenName" className="text-slate-300">Token Name</Label>
                    <Input
                      id="tokenName"
                      value={tokenName}
                      onChange={(e) => setTokenName(e.target.value)}
                      placeholder="My Awesome Token"
                      className="bg-slate-800 border-slate-700 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tokenSymbol" className="text-slate-300">Token Symbol</Label>
                    <Input
                      id="tokenSymbol"
                      value={tokenSymbol}
                      onChange={(e) => setTokenSymbol(e.target.value.toUpperCase())}
                      placeholder="MAT"
                      className="bg-slate-800 border-slate-700 text-white"
                      maxLength={10}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-slate-300">Description</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe your token's purpose and utility..."
                    className="bg-slate-800 border-slate-700 text-white min-h-[100px]"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Bonding Curve Configuration */}
            <Card className="bg-slate-900/50 border-slate-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center justify-between">
                  <div className="flex items-center">
                    <TrendingUp className="mr-2 h-5 w-5 text-emerald-400" />
                    Bonding Curve Setup
                  </div>
                  <Badge variant="outline" className="border-emerald-500/50 text-emerald-400">
                    Auto-Listing
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="initialSupply" className="text-slate-300">Initial Supply</Label>
                    <Input
                      id="initialSupply"
                      value={initialSupply}
                      onChange={(e) => setInitialSupply(e.target.value)}
                      placeholder="1000000"
                      className="bg-slate-800 border-slate-700 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="startPrice" className="text-slate-300">Starting Price (ETH)</Label>
                    <Input
                      id="startPrice"
                      value={startPrice}
                      onChange={(e) => setStartPrice(e.target.value)}
                      placeholder="0.001"
                      className="bg-slate-800 border-slate-700 text-white"
                    />
                  </div>
                </div>

                {/* Bonding Curve Preview */}
                <Card className="bg-slate-800/50 border-slate-700 p-4">
                  <h4 className="text-white font-semibold mb-3">Curve Preview</h4>
                  <div className="h-32 bg-slate-700/30 rounded-lg flex items-center justify-center">
                    <p className="text-slate-400">Bonding curve visualization</p>
                  </div>
                </Card>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Chain Selection & Actions */}
          <div className="space-y-6">
            {/* Chain Selection */}
            <Card className="bg-slate-900/50 border-slate-800">
              <CardHeader>
                <CardTitle className="text-white">Deployment Chain</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid gap-3 max-h-96 overflow-y-auto">
                    {chains.slice(0, 6).map((chain) => (
                      <Card
                        key={chain.id}
                        className={cn(
                          "cursor-pointer transition-all duration-200",
                          "bg-gray-800/50 border-gray-700 hover:border-blue-500/50",
                          selectedChain?.id === chain.id && "border-blue-500 bg-blue-500/10"
                        )}
                        onClick={() => handleChainSelect(chain)}
                      >
                        <CardContent className="p-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <Activity className="h-4 w-4 text-blue-400" />
                              <span className="text-white text-sm font-medium">{chain.name}</span>
                            </div>
                            <Badge variant="secondary" className="text-xs">
                              {chain.testnet ? 'Test' : 'Main'}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Logo Upload */}
            <Card className="bg-slate-900/50 border-slate-800">
              <CardHeader>
                <CardTitle className="text-white">Token Logo</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-dashed border-slate-700 rounded-lg p-6 text-center">
                  <Upload className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-slate-400 text-sm mb-2">Upload logo</p>
                  <Button variant="outline" className="border-slate-600 text-slate-300">
                    Choose File
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Deploy Section */}
            <Card className="bg-slate-900/50 border-slate-800 sticky top-6">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="text-center">
                    <h3 className="text-white font-semibold">Ready to Deploy?</h3>
                    <p className="text-slate-400 text-sm">Auto-listed for trading</p>
                  </div>
                  
                  <Button 
                    className="w-full bg-gradient-to-r from-emerald-500 to-cyan-600 hover:from-emerald-600 hover:to-cyan-700 text-white font-semibold"
                    size="lg"
                    disabled={!tokenName || !tokenSymbol || !selectedChain}
                  >
                    Deploy Token • ~0.05 ETH
                  </Button>
                  
                  <div className="text-center space-y-1">
                    <div className="text-xs text-slate-400">✓ Auto-listed • ✓ Bonding curve • ✓ Liquidity pool</div>
                    {selectedChain && (
                      <Badge className="bg-emerald-500/20 text-emerald-400 text-xs">
                        Deploying to {selectedChain.name}
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResponsiveTokenCreator;
