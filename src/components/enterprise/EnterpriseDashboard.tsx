
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  DollarSign, 
  Shield, 
  Activity, 
  Users, 
  BarChart3, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Zap
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';

interface DashboardData {
  totalAUM: number;
  netPnL: number;
  complianceScore: number;
  systemUptime: number;
  activeUsers: number;
  tradingVolume: {
    daily: number;
    weekly: number;
    monthly: number;
  };
  riskMetrics: {
    var95: number;
    expectedShortfall: number;
    sharpeRatio: number;
    maxDrawdown: number;
  };
}

export const EnterpriseDashboard = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    totalAUM: 0,
    netPnL: 0,
    complianceScore: 0,
    systemUptime: 0,
    activeUsers: 0,
    tradingVolume: { daily: 0, weekly: 0, monthly: 0 },
    riskMetrics: { var95: 0, expectedShortfall: 0, sharpeRatio: 0, maxDrawdown: 0 }
  });

  const { data: executiveDashboard, isLoading } = useQuery({
    queryKey: ['executive-dashboard'],
    queryFn: async () => {
      const response = await api.enterprise.getExecutiveDashboard('demo-account');
      return response.data;
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  useEffect(() => {
    if (executiveDashboard) {
      setDashboardData({
        ...executiveDashboard,
        riskMetrics: {
          var95: 0.05,
          expectedShortfall: 0.08,
          sharpeRatio: 1.2,
          maxDrawdown: 0.15
        }
      });
    }
  }, [executiveDashboard]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${(value * 100).toFixed(2)}%`;
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <Card key={i} className="bg-slate-900/50 border-slate-800 animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-4 bg-slate-700 rounded w-3/4"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-slate-700 rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-slate-700 rounded w-full"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total AUM */}
        <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">Total AUM</CardTitle>
            <DollarSign className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{formatCurrency(dashboardData.totalAUM)}</div>
            <p className="text-xs text-green-400">+12.5% from last month</p>
          </CardContent>
        </Card>

        {/* Net P&L */}
        <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">Net P&L</CardTitle>
            <TrendingUp className="h-4 w-4 text-cyan-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{formatCurrency(dashboardData.netPnL)}</div>
            <p className="text-xs text-cyan-400">+8.2% this quarter</p>
          </CardContent>
        </Card>

        {/* Compliance Score */}
        <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">Compliance Score</CardTitle>
            <Shield className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{dashboardData.complianceScore}%</div>
            <div className="flex items-center space-x-1">
              <CheckCircle className="h-3 w-3 text-green-400" />
              <p className="text-xs text-green-400">All checks passing</p>
            </div>
          </CardContent>
        </Card>

        {/* System Uptime */}
        <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">System Uptime</CardTitle>
            <Activity className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{formatPercentage(dashboardData.systemUptime / 100)}</div>
            <p className="text-xs text-blue-400">Last 30 days</p>
          </CardContent>
        </Card>
      </div>

      {/* Trading Volume and Risk Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trading Volume */}
        <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <BarChart3 className="mr-2 h-5 w-5 text-purple-400" />
              Trading Volume
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-slate-300">Daily</span>
              <span className="text-white font-semibold">{formatCurrency(dashboardData.tradingVolume.daily)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-300">Weekly</span>
              <span className="text-white font-semibold">{formatCurrency(dashboardData.tradingVolume.weekly)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-300">Monthly</span>
              <span className="text-white font-semibold">{formatCurrency(dashboardData.tradingVolume.monthly)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Risk Metrics */}
        <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <AlertTriangle className="mr-2 h-5 w-5 text-yellow-400" />
              Risk Metrics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-slate-300">VaR (95%)</span>
              <span className="text-white font-semibold">{formatPercentage(dashboardData.riskMetrics.var95)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-300">Expected Shortfall</span>
              <span className="text-white font-semibold">{formatPercentage(dashboardData.riskMetrics.expectedShortfall)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-300">Sharpe Ratio</span>
              <span className="text-white font-semibold">{dashboardData.riskMetrics.sharpeRatio.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-300">Max Drawdown</span>
              <span className="text-white font-semibold">{formatPercentage(dashboardData.riskMetrics.maxDrawdown)}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="border-blue-500/50 text-blue-400 hover:bg-blue-500/10">
              <Users className="mr-2 h-4 w-4" />
              Manage Teams
            </Button>
            <Button variant="outline" className="border-green-500/50 text-green-400 hover:bg-green-500/10">
              <Shield className="mr-2 h-4 w-4" />
              Compliance Report
            </Button>
            <Button variant="outline" className="border-purple-500/50 text-purple-400 hover:bg-purple-500/10">
              <Zap className="mr-2 h-4 w-4" />
              Deploy Strategy
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Status Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm">
          <CardContent className="flex items-center space-x-3 p-4">
            <CheckCircle className="h-8 w-8 text-green-400" />
            <div>
              <p className="text-white font-semibold">All Systems Operational</p>
              <p className="text-xs text-slate-400">Last checked: 2 minutes ago</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm">
          <CardContent className="flex items-center space-x-3 p-4">
            <Clock className="h-8 w-8 text-blue-400" />
            <div>
              <p className="text-white font-semibold">Next Compliance Review</p>
              <p className="text-xs text-slate-400">Scheduled for tomorrow</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm">
          <CardContent className="flex items-center space-x-3 p-4">
            <Users className="h-8 w-8 text-purple-400" />
            <div>
              <p className="text-white font-semibold">{dashboardData.activeUsers} Active Users</p>
              <p className="text-xs text-slate-400">Currently online</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
