
import { useState } from 'react';
import { useAccount, useChainId } from 'wagmi';
import Layout from '@/components/layout/Layout';
import ChainSelector from '@/components/ui/chain-selector';
import GasEstimator from '@/components/ui/gas-estimator';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAppStore } from '@/stores/useAppStore';
import { Web3Service } from '@/lib/web3-service';
import { CONTRACT_TEMPLATES } from '@/lib/contract-templates';
import { Rocket, Code, Settings, CheckCircle, Loader2, AlertCircle, ExternalLink } from 'lucide-react';

const Deploy = () => {
  const { isConnected } = useAccount();
  const currentChainId = useChainId();
  const { addDeployment, addNotification } = useAppStore();
  const [selectedChain, setSelectedChain] = useState(currentChainId?.toString() || '');
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [contractName, setContractName] = useState('');
  const [parameters, setParameters] = useState<Record<string, string>>({});
  const [isDeploying, setIsDeploying] = useState(false);
  const [deploymentResult, setDeploymentResult] = useState<{
    txHash: string;
    contractAddress: string;
    blockExplorer: string;
  } | null>(null);

  const handleTemplateSelect = (templateName: string) => {
    setSelectedTemplate(templateName);
    setContractName(templateName);
    setParameters({});
    setDeploymentResult(null);
  };

  const handleParameterChange = (paramName: string, value: string) => {
    setParameters(prev => ({ ...prev, [paramName]: value }));
  };

  const getBlockExplorerUrl = (chainId: number, txHash: string) => {
    // Mock block explorer URLs - in real app, use chain config
    const explorers: Record<number, string> = {
      4242424: 'https://explorer.testnet.nexus.xyz',
      16600: 'https://explorer-testnet.0g.ai',
      50311: 'https://explorer.testnet.somnia.network',
    };
    return `${explorers[chainId] || 'https://etherscan.io'}/tx/${txHash}`;
  };

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
      const template = CONTRACT_TEMPLATES[selectedTemplate];
      const args = template.parameters?.map(param => parameters[param.name] || '') || [];
      
      const deployment = {
        id: `deploy-${Date.now()}`,
        chainId: parseInt(selectedChain),
        contractName,
        template: selectedTemplate,
        status: 'pending' as const,
        timestamp: Date.now(),
        txHash: '',
        contractAddress: '',
        gasUsed: '',
        deploymentCost: '',
        constructorArgs: args.join(','),
        contractCode: template.bytecode || ''
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
        contractAddress: result.contractAddress || '',
        gasUsed: result.gasUsed || '',
      });

      setDeploymentResult({
        txHash: result.txHash,
        contractAddress: result.contractAddress || '',
        blockExplorer: getBlockExplorerUrl(parseInt(selectedChain), result.txHash)
      });

      addNotification({
        type: 'success',
        title: 'Contract deployed successfully!',
        message: `${contractName} deployed at ${result.contractAddress}`,
        read: false
      });

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

  const contractTemplates = Object.values(CONTRACT_TEMPLATES);
  const selectedTemplateData = CONTRACT_TEMPLATES[selectedTemplate];
  const canDeploy = isConnected && selectedChain && selectedTemplate && contractName && 
    (!selectedTemplateData?.parameters || selectedTemplateData.parameters.every(param => parameters[param.name]));

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
            <p className="text-gray-400 mt-2">Deploy smart contracts across multiple blockchains</p>
          </div>
          <Badge variant="outline" className="border-purple-500/50 text-purple-400">
            Multi-Chain Deployment
          </Badge>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Contract Templates */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Code className="mr-2 h-5 w-5" />
                  Contract Templates
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {contractTemplates.map((template) => (
                  <div
                    key={template.name}
                    className={`p-4 rounded-lg bg-gray-800/50 hover:bg-gray-800 cursor-pointer transition-all duration-200 border ${
                      selectedTemplate === template.name 
                        ? 'border-purple-500/50 ring-2 ring-purple-500/20' 
                        : 'border-gray-700 hover:border-purple-500/30'
                    }`}
                    onClick={() => handleTemplateSelect(template.name)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-white font-medium">{template.name}</h3>
                      {selectedTemplate === template.name && (
                        <CheckCircle className="h-4 w-4 text-purple-400" />
                      )}
                    </div>
                    <p className="text-gray-400 text-sm">{template.description}</p>
                    {template.parameters && template.parameters.length > 0 && (
                      <div className="mt-2">
                        <Badge variant="secondary" className="text-xs">
                          {template.parameters.length} parameters
                        </Badge>
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Gas Estimator */}
            {selectedChain && selectedTemplate && (
              <GasEstimator 
                chainId={parseInt(selectedChain)} 
                operation="deploy" 
                className="animate-fade-in"
              />
            )}
          </div>

          {/* Deployment Form */}
          <div className="lg:col-span-2 space-y-6">
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
                    <Label htmlFor="chain" className="text-white">Target Blockchain</Label>
                    <ChainSelector
                      value={selectedChain}
                      onValueChange={setSelectedChain}
                      placeholder="Choose deployment chain"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contractName" className="text-white">Contract Name</Label>
                    <Input
                      id="contractName"
                      value={contractName}
                      onChange={(e) => setContractName(e.target.value)}
                      placeholder="MyAwesomeContract"
                      className="bg-gray-800 border-gray-700 text-white"
                      disabled={!selectedTemplate}
                    />
                  </div>
                </div>

                {/* Template Parameters */}
                {selectedTemplateData?.parameters && selectedTemplateData.parameters.length > 0 && (
                  <div className="space-y-4">
                    <Label className="text-white text-base">Template Parameters</Label>
                    <div className="grid gap-4">
                      {selectedTemplateData.parameters.map((param) => (
                        <div key={param.name} className="space-y-2">
                          <Label className="text-sm text-gray-300">{param.name}</Label>
                          <Input
                            value={parameters[param.name] || ''}
                            onChange={(e) => handleParameterChange(param.name, e.target.value)}
                            placeholder={param.description}
                            className="bg-gray-800 border-gray-700 text-white"
                          />
                          <p className="text-xs text-gray-500">{param.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Deployment Status */}
                {deploymentResult && (
                  <Alert className="border-green-500/50 bg-green-500/10">
                    <CheckCircle className="h-4 w-4 text-green-400" />
                    <AlertDescription className="text-green-300">
                      <div className="space-y-2">
                        <p>Contract deployed successfully!</p>
                        <div className="space-y-1 text-sm">
                          <p><strong>Contract Address:</strong> {deploymentResult.contractAddress}</p>
                          <p><strong>Transaction:</strong> 
                            <a 
                              href={deploymentResult.blockExplorer}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="ml-1 text-green-400 hover:text-green-300 inline-flex items-center"
                            >
                              View on Explorer <ExternalLink className="h-3 w-3 ml-1" />
                            </a>
                          </p>
                        </div>
                      </div>
                    </AlertDescription>
                  </Alert>
                )}

                {/* Deployment Button */}
                <Button
                  onClick={handleDeploy}
                  className="w-full bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed h-12"
                  disabled={!canDeploy || isDeploying}
                >
                  {isDeploying ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Deploying Contract...
                    </>
                  ) : (
                    <>
                      <Rocket className="mr-2 h-4 w-4" />
                      Deploy Contract
                    </>
                  )}
                </Button>

                {!canDeploy && !isDeploying && (
                  <div className="text-center text-sm text-gray-400">
                    {!isConnected && (
                      <div className="flex items-center justify-center space-x-2">
                        <AlertCircle className="h-4 w-4" />
                        <span>Connect your wallet to deploy contracts</span>
                      </div>
                    )}
                    {isConnected && !selectedChain && <span>Select a target blockchain</span>}
                    {isConnected && selectedChain && !selectedTemplate && <span>Choose a contract template</span>}
                    {isConnected && selectedChain && selectedTemplate && !contractName && <span>Enter a contract name</span>}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Deploy;
