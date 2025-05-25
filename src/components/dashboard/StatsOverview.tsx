
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, Activity, Zap, Target, DollarSign, Clock } from 'lucide-react';
import { useAppStore } from '@/stores/useAppStore';

const StatsOverview = () => {
  const { analyticsOverview, deployments, swaps, gmPosts, chainStatus } = useAppStore();

  const totalTransactions = deployments.length + swaps.length + gmPosts.length;
  const activeChains = Object.values(chainStatus).filter(status => status.isActive).length;
  const pendingOperations = [...deployments, ...swaps, ...gmPosts].filter(op => op.status === 'pending').length;
  
  // Mock qualification score calculation (replace with real data)
  const qualificationScore = Math.min((totalTransactions * 10) + (activeChains * 15), 100);

  const stats = [
    {
      title: 'Total Transactions',
      value: totalTransactions.toString(),
      change: '+12%',
      icon: Activity,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
    },
    {
      title: 'Active Chains',
      value: `${activeChains}/8`,
      change: '+2',
      icon: Zap,
      color: 'text-green-400',
      bgColor: 'bg-green-500/10',
    },
    {
      title: 'Qualification Score',
      value: `${qualificationScore}%`,
      change: '+5%',
      icon: Target,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10',
    },
    {
      title: 'Pending Operations',
      value: pendingOperations.toString(),
      change: '-3',
      icon: Clock,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-500/10',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <Card key={index} className="bg-gray-900/50 border-gray-800 hover:border-gray-700 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">
              {stat.title}
            </CardTitle>
            <div className={`p-2 rounded-lg ${stat.bgColor}`}>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold text-white">
                {stat.value}
              </div>
              <Badge 
                variant="outline" 
                className={`${stat.color} border-current`}
              >
                {stat.change}
              </Badge>
            </div>
            {stat.title === 'Qualification Score' && (
              <Progress 
                value={qualificationScore} 
                className="mt-2 h-2"
              />
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default StatsOverview;
