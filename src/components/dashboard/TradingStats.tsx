
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, DollarSign, Users, Zap, Activity } from 'lucide-react';

const TradingStats = () => {
  const stats = [
    {
      title: '24h Volume',
      value: '$2.4M',
      change: '+12.5%',
      trend: 'up',
      icon: DollarSign
    },
    {
      title: 'Total Users',
      value: '45.2K',
      change: '+8.3%',
      trend: 'up',
      icon: Users
    },
    {
      title: 'Active Chains',
      value: '8/10',
      status: 'healthy',
      icon: Zap
    },
    {
      title: 'Your STEX',
      value: '1,250',
      action: 'Earn More',
      icon: Activity
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.title} className="bg-slate-900/50 border-slate-800 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-slate-400">
                  {stat.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-slate-400" />
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold text-white">
                  {stat.value}
                </div>
                {stat.change && (
                  <Badge 
                    variant={stat.trend === 'up' ? 'default' : 'destructive'}
                    className={
                      stat.trend === 'up' 
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50' 
                        : 'bg-red-500/20 text-red-400 border-red-500/50'
                    }
                  >
                    {stat.trend === 'up' ? (
                      <TrendingUp className="h-3 w-3 mr-1" />
                    ) : (
                      <TrendingDown className="h-3 w-3 mr-1" />
                    )}
                    {stat.change}
                  </Badge>
                )}
                {stat.status && (
                  <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/50">
                    {stat.status}
                  </Badge>
                )}
                {stat.action && (
                  <Badge 
                    variant="outline" 
                    className="border-cyan-500/50 text-cyan-400 cursor-pointer hover:bg-cyan-500/10"
                  >
                    {stat.action}
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default TradingStats;
