
import { useState } from 'react';
import { useAccount, useChainId } from 'wagmi';
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
import { Web3Service } from '@/lib/web3-service';
import { CONTRACT_TEMPLATES } from '@/lib/contract-templates';
import { Rocket, Code, Settings, CheckCircle, Loader2 } from 'lucide-react';

const Deploy = () => {
  const { isConnected } = useAccount();
  const currentChainId = useChainId();
  const { addDeployment, addNotification } = useAppStore();
  const [selectedChain, setSelectedChain] = useState(currentChainId?.toString() || '');
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [contractName, setContractName] = useState('');
  const [constructorArgs, setConstructorArgs] = useState('');
  const [isDeploying, setIsDeploying] = useState(false);

  const handleDeploy = async () => {
    if (!isConnected) {
      addNotification({
        type: 'warning',
        title: 'Wallet not connected',
        message: 'Please connect your wallet to deploy contracts.',
        read: false
      });
      return;
    }

    if (!selectedChain || !selectedTemplate || !contractName) {
      addNotification({
        type: 'error',
        title: 'Missing information',
        message: 'Please fill in all required fields.',
        read: false
      });
      return;
    }

    setIsDeploying(true);

    try {
      const args = constructorArgs ? constructorArgs.split(',').map(arg => arg.trim()) : [];
      
      const deployment = {
        id: `deploy-${Date.now()}`,
        chainId: parseInt(selectedChain),
        contractName,
        template: selectedTemplate,
        status: 'pending' as const,
        timestamp: Date.now(),
        txHash: null,
        contractAddress: null,
        gasUsed: null,
        deploymentCost: null,
        constructorArgs
      };

      addDeployment(deployment);

      const result = await Web3Service.deployContract(
        parseInt(selectedChain),
        selectedTemplate,
        contractName,
        args
      );

      // Update deployment with results
      addDeployment({
        ...deployment,
        status: 'confirmed',
        txHash: result.txHash,
        contractAddress: result.contractAddress,
        gasUsed: result.gasUsed,
      });

      addNotification({
        type: 'success',
        title: 'Contract deployed successfully!',
        message: `${contractName} deployed at ${result.contractAddress}`,
        read: false
      });

      // Reset form
      setContractName('');
      setConstructorArgs('');
      setSelectedTemplate('');

    } catch (error) {
      console.error('Deployment failed:', error);
      addNotification({
        type: 'error',
        title: 'Deployment failed',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        read: false
      });
    } finally {
      setIsDeploying(false);
    }
  };

  const contractTemplates = Object.keys(CONTRACT_TEMPLATES).map(key => ({
    name: key,
    description: `Deploy a ${key} contract`
  }));

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
                    className={`p-3 rounded-lg bg-gray-800/50 hover:bg-gray-800 cursor-pointer transition-colors border ${
                      selectedTemplate === template.name 
                        ? 'border-purple-500/50' 
                        : 'border-gray-700 hover:border-purple-500/50'
                    }`}
                    onClick={() => {
                      setSelectedTemplate(template.name);
                      setContractName(template.name);
                    }}
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
                  <Label htmlFor="constructorArgs" className="text-white">Constructor Arguments (comma separated)</Label>
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
                  disabled={!isConnected || isDeploying || !selectedTemplate}
                >
                  {isDeploying ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Deploying Contract...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Deploy Contract
                    </>
                  )}
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
