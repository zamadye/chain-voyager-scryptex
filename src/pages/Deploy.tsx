
import { useState } from 'react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useAppStore } from '@/stores/useAppStore';
import { SUPPORTED_CHAINS } from '@/lib/chains';
import { Rocket, Code, Settings, CheckCircle } from 'lucide-react';

const Deploy = () => {
  const { wallet, addDeployment, addNotification } = useAppStore();
  const [selectedChain, setSelectedChain] = useState('');
  const [contractName, setContractName] = useState('');
  const [contractCode, setContractCode] = useState('');
  const [constructorArgs, setConstructorArgs] = useState('');

  const handleDeploy = () => {
    if (!wallet.isConnected) {
      addNotification({
        type: 'warning',
        title: 'Wallet not connected',
        message: 'Please connect your wallet to deploy contracts.',
        read: false
      });
      return;
    }

    if (!selectedChain || !contractName || !contractCode) {
      addNotification({
        type: 'error',
        title: 'Missing information',
        message: 'Please fill in all required fields.',
        read: false
      });
      return;
    }

    const deployment = {
      id: `deploy-${Date.now()}`,
      chainId: parseInt(selectedChain),
      contractName,
      contractCode,
      constructorArgs,
      template: contractName,
      status: 'pending' as const,
      timestamp: Date.now(),
      txHash: null,
      contractAddress: null,
      gasUsed: null,
      deploymentCost: null
    };

    addDeployment(deployment);
    addNotification({
      type: 'success',
      title: 'Deployment started',
      message: `Contract ${contractName} deployment initiated on ${SUPPORTED_CHAINS[Object.keys(SUPPORTED_CHAINS).find(k => SUPPORTED_CHAINS[k].id === parseInt(selectedChain))]?.name}.`,
      read: false
    });

    // Reset form
    setContractName('');
    setContractCode('');
    setConstructorArgs('');
  };

  const contractTemplates = [
    { name: 'ERC20 Token', description: 'Standard fungible token contract' },
    { name: 'ERC721 NFT', description: 'Non-fungible token contract' },
    { name: 'Multisig Wallet', description: 'Multi-signature wallet contract' },
    { name: 'Custom Contract', description: 'Write your own contract' }
  ];

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center">
              <Rocket className="mr-3 h-8 w-8 text-purple-400" />
              Deploy Contracts
            </h1>
            <p className="text-gray-400 mt-2">Deploy smart contracts across multiple chains</p>
          </div>
          <Badge variant="outline" className="border-purple-500/50 text-purple-400">
            Multi-Chain Deployment
          </Badge>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Contract Templates */}
          <div className="lg:col-span-1">
            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Code className="mr-2 h-5 w-5" />
                  Templates
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {contractTemplates.map((template) => (
                  <div
                    key={template.name}
                    className="p-3 rounded-lg bg-gray-800/50 hover:bg-gray-800 cursor-pointer transition-colors border border-gray-700 hover:border-purple-500/50"
                    onClick={() => setContractName(template.name)}
                  >
                    <h3 className="text-white font-medium">{template.name}</h3>
                    <p className="text-gray-400 text-sm">{template.description}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Deployment Form */}
          <div className="lg:col-span-2">
            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Settings className="mr-2 h-5 w-5" />
                  Contract Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="chain" className="text-white">Target Chain</Label>
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
                  <div className="space-y-2">
                    <Label htmlFor="contractName" className="text-white">Contract Name</Label>
                    <Input
                      id="contractName"
                      value={contractName}
                      onChange={(e) => setContractName(e.target.value)}
                      placeholder="MyContract"
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contractCode" className="text-white">Contract Code</Label>
                  <Textarea
                    id="contractCode"
                    value={contractCode}
                    onChange={(e) => setContractCode(e.target.value)}
                    placeholder="pragma solidity ^0.8.0;..."
                    className="bg-gray-800 border-gray-700 text-white min-h-[200px] font-mono text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="constructorArgs" className="text-white">Constructor Arguments (optional)</Label>
                  <Input
                    id="constructorArgs"
                    value={constructorArgs}
                    onChange={(e) => setConstructorArgs(e.target.value)}
                    placeholder="arg1,arg2,arg3"
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>

                <Button
                  onClick={handleDeploy}
                  className="w-full bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700"
                  disabled={!wallet.isConnected}
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Deploy Contract
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Deploy;
