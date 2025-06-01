
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Upload, Plus, TrendingUp, Settings } from 'lucide-react';

const TokenCreator = () => {
  const [tokenName, setTokenName] = useState('');
  const [tokenSymbol, setTokenSymbol] = useState('');
  const [description, setDescription] = useState('');
  const [initialSupply, setInitialSupply] = useState('1000000');
  const [startPrice, setStartPrice] = useState('0.001');

  return (
    <div className="space-y-6">
      {/* Token Info Form */}
      <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Plus className="mr-2 h-5 w-5 text-emerald-400" />
            Create New Token
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

          {/* Logo Upload */}
          <div className="space-y-2">
            <Label className="text-slate-300">Token Logo</Label>
            <div className="border-2 border-dashed border-slate-700 rounded-lg p-8 text-center hover:border-slate-600 transition-colors">
              <Upload className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-400 mb-2">Drag & drop your logo here, or click to browse</p>
              <Button variant="outline" className="border-slate-600 text-slate-300">
                Upload Logo
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bonding Curve Configuration */}
      <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm">
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
              <p className="text-slate-400">Bonding curve visualization will appear here</p>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-slate-400">Price at 50%:</span>
                <div className="text-white font-semibold">0.005 ETH</div>
              </div>
              <div>
                <span className="text-slate-400">Price at 100%:</span>
                <div className="text-white font-semibold">0.01 ETH</div>
              </div>
              <div>
                <span className="text-slate-400">Liquidity Pool:</span>
                <div className="text-white font-semibold">80% of funds</div>
              </div>
            </div>
          </Card>
        </CardContent>
      </Card>

      {/* Deploy Section */}
      <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-white font-semibold">Ready to Deploy?</h3>
              <p className="text-slate-400 text-sm">Your token will be automatically listed for trading</p>
            </div>
            <Badge className="bg-emerald-500/20 text-emerald-400">
              Cost: ~0.05 ETH
            </Badge>
          </div>
          
          <Button 
            className="w-full bg-gradient-to-r from-emerald-500 to-cyan-600 hover:from-emerald-600 hover:to-cyan-700 text-white font-semibold py-3"
            size="lg"
            disabled={!tokenName || !tokenSymbol}
          >
            Deploy Token & Launch Trading
          </Button>
          
          <div className="flex items-center justify-center space-x-4 mt-4 text-xs text-slate-400">
            <span>✓ Auto-listed for trading</span>
            <span>•</span>
            <span>✓ Bonding curve activated</span>
            <span>•</span>
            <span>✓ Liquidity pool created</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TokenCreator;
