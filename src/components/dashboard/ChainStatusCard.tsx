
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { ExternalLink, Zap, Activity, DollarSign } from 'lucide-react';
import { ChainConfig, ChainStatus } from '@/types';

interface ChainStatusCardProps {
  chain: ChainConfig;
  status?: ChainStatus;
  onQuickAction: (action: 'deploy' | 'swap' | 'gm', chainId: number) => void;
}

const ChainStatusCard = ({ chain, status, onQuickAction }: ChainStatusCardProps) => {
  const isActive = status?.isActive ?? false;
  const gasPrice = status?.gasPrice ?? 'N/A';
  const blockHeight = status?.blockHeight ?? 0;

  return (
    <Card className={cn(
      "relative overflow-hidden transition-all duration-300 hover:scale-105",
      "bg-gray-900/50 border-gray-800 hover:border-purple-500/50",
      isActive && "border-green-500/30 shadow-green-500/10 shadow-lg"
    )}>
      {/* Status indicator */}
      <div className={cn(
        "absolute top-0 left-0 w-full h-1",
        isActive ? "bg-green-500" : "bg-red-500"
      )} />

      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-white">
            {chain.name}
          </CardTitle>
          <Badge 
            variant={isActive ? "default" : "secondary"}
            className={cn(
              isActive 
                ? "bg-green-500/20 text-green-400 border-green-500/50" 
                : "bg-red-500/20 text-red-400 border-red-500/50"
            )}
          >
            {isActive ? 'Active' : 'Inactive'}
          </Badge>
        </div>
        
        <div className="text-sm text-gray-400">
          Chain ID: {chain.id} • {chain.nativeCurrency.symbol}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="flex items-center text-xs text-gray-400">
              <Activity className="mr-1 h-3 w-3" />
              Block Height
            </div>
            <div className="text-sm font-medium text-white">
              {blockHeight.toLocaleString()}
            </div>
          </div>
          
          <div className="space-y-1">
            <div className="flex items-center text-xs text-gray-400">
              <DollarSign className="mr-1 h-3 w-3" />
              Gas Price
            </div>
            <div className="text-sm font-medium text-white">
              {gasPrice} gwei
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-3 gap-2">
          <Button
            size="sm"
            variant="outline"
            className="border-purple-500/50 text-purple-400 hover:bg-purple-500/10"
            onClick={() => onQuickAction('deploy', chain.id)}
            disabled={!isActive}
          >
            Deploy
          </Button>
          
          <Button
            size="sm"
            variant="outline"
            className="border-blue-500/50 text-blue-400 hover:bg-blue-500/10"
            onClick={() => onQuickAction('swap', chain.id)}
            disabled={!isActive}
          >
            Swap
          </Button>
          
          <Button
            size="sm"
            variant="outline"
            className="border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/10"
            onClick={() => onQuickAction('gm', chain.id)}
            disabled={!isActive}
          >
            GM
          </Button>
        </div>

        {/* External Links */}
        <div className="flex justify-between pt-2 border-t border-gray-800">
          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-gray-400 hover:text-white"
            onClick={() => window.open(chain.blockExplorer, '_blank')}
          >
            <ExternalLink className="mr-1 h-3 w-3" />
            Explorer
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-gray-400 hover:text-white"
            onClick={() => window.open(chain.faucetUrl, '_blank')}
          >
            <Zap className="mr-1 h-3 w-3" />
            Faucet
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ChainStatusCard;
