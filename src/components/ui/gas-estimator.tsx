
import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Fuel, TrendingUp, TrendingDown } from 'lucide-react';

interface GasEstimatorProps {
  chainId?: number;
  operation: 'deploy' | 'swap' | 'gm' | 'transfer';
  className?: string;
}

const GasEstimator = ({ chainId, operation, className = "" }: GasEstimatorProps) => {
  const [gasData, setGasData] = useState({
    gasPrice: '0',
    gasLimit: '0',
    totalCost: '0',
    usdCost: '0',
    trend: 'stable' as 'up' | 'down' | 'stable'
  });

  useEffect(() => {
    // Mock gas estimation - in real app, fetch from chain RPCs
    const mockGasData = {
      deploy: { gasLimit: '2100000', gasPrice: '20' },
      swap: { gasLimit: '150000', gasPrice: '25' },
      gm: { gasLimit: '50000', gasPrice: '15' },
      transfer: { gasLimit: '21000', gasPrice: '20' }
    };

    const data = mockGasData[operation] || mockGasData.transfer;
    const totalGas = (parseInt(data.gasLimit) * parseInt(data.gasPrice)) / 1e9;
    const usdValue = totalGas * 2450; // Mock ETH price

    setGasData({
      gasPrice: data.gasPrice,
      gasLimit: data.gasLimit,
      totalCost: totalGas.toFixed(6),
      usdCost: usdValue.toFixed(2),
      trend: Math.random() > 0.5 ? 'up' : 'down'
    });
  }, [chainId, operation]);

  const getTrendIcon = () => {
    switch (gasData.trend) {
      case 'up':
        return <TrendingUp className="h-3 w-3 text-red-400" />;
      case 'down':
        return <TrendingDown className="h-3 w-3 text-green-400" />;
      default:
        return <div className="h-3 w-3 rounded-full bg-yellow-400" />;
    }
  };

  return (
    <Card className={`bg-gray-800/50 border-gray-700 ${className}`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Fuel className="h-4 w-4 text-orange-400" />
            <span className="text-sm font-medium text-white">Gas Estimate</span>
          </div>
          <div className="flex items-center space-x-1">
            {getTrendIcon()}
            <Badge 
              variant="secondary" 
              className={`text-xs ${
                gasData.trend === 'up' ? 'bg-red-500/10 text-red-400' :
                gasData.trend === 'down' ? 'bg-green-500/10 text-green-400' :
                'bg-yellow-500/10 text-yellow-400'
              }`}
            >
              {gasData.gasPrice} Gwei
            </Badge>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Gas Limit</span>
            <span className="text-white">{parseInt(gasData.gasLimit).toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Max Fee</span>
            <span className="text-white">{gasData.totalCost} ETH</span>
          </div>
          <div className="flex justify-between text-sm border-t border-gray-700 pt-2">
            <span className="text-gray-400">USD Cost</span>
            <span className="text-green-400 font-medium">${gasData.usdCost}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default GasEstimator;
