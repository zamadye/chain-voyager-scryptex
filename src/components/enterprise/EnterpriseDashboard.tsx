
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Building2, Users, Shield, TrendingUp, AlertTriangle, 
  CheckCircle, DollarSign, Activity, BarChart3 
} from 'lucide-react';
import { enterpriseService } from '@/services/api';

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
    sharpeRatio: number;
    maxDrawdown: number;
  };
}

export const EnterpriseDashboard = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const response = await enterpriseService.getExecutiveDashboard('demo-account-id');
      if (response.success) {
        setDashboardData(response.data);
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400"></div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="text-center text-slate-400 py-8">
        Failed to load dashboard data
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Enterprise Dashboard</h1>
          <p className="text-slate-400 mt-2">Institutional trading platform overview</p>
        </div>
        <Badge variant="outline" className="border-green-500/50 text-green-400">
          <CheckCircle className="w-4 h-4 mr-1" />
          All Systems Operational
        </Badge>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-slate-900/50 border-slate-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Total AUM</p>
                <p className="text-2xl font-bold text-white">
                  ${(dashboardData.totalAUM / 1000000).toFixed(1)}M
                </p>
              </div>
              <Building2 className="h-8 w-8 text-cyan-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-slate-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Net P&L</p>
                <p className={`text-2xl font-bold ${dashboardData.netPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {dashboardData.netPnL >= 0 ? '+' : ''}${(dashboardData.netPnL / 1000).toFixed(1)}K
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-slate-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Compliance Score</p>
                <p className="text-2xl font-bold text-white">{dashboardData.complianceScore}%</p>
              </div>
              <Shield className="h-8 w-8 text-blue-400" />
            </div>
            <Progress value={dashboardData.complianceScore} className="mt-2 h-2" />
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-slate-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Active Users</p>
                <p className="text-2xl font-bold text-white">{dashboardData.activeUsers}</p>
              </div>
              <Users className="h-8 w-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Trading Volume & Risk Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <BarChart3 className="mr-2 h-5 w-5 text-cyan-400" />
              Trading Volume
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Daily</span>
              <span className="text-white font-medium">
                ${(dashboardData.tradingVolume.daily / 1000000).toFixed(2)}M
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Weekly</span>
              <span className="text-white font-medium">
                ${(dashboardData.tradingVolume.weekly / 1000000).toFixed(2)}M
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Monthly</span>
              <span className="text-white font-medium">
                ${(dashboardData.tradingVolume.monthly / 1000000).toFixed(2)}M
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Activity className="mr-2 h-5 w-5 text-red-400" />
              Risk Metrics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">VaR (95%)</span>
              <span className="text-white font-medium">
                {(dashboardData.riskMetrics.var95 * 100).toFixed(2)}%
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Sharpe Ratio</span>
              <span className="text-white font-medium">
                {dashboardData.riskMetrics.sharpeRatio.toFixed(2)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Max Drawdown</span>
              <span className="text-red-400 font-medium">
                -{(dashboardData.riskMetrics.maxDrawdown * 100).toFixed(2)}%
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Status */}
      <Card className="bg-slate-900/50 border-slate-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Activity className="mr-2 h-5 w-5 text-green-400" />
            System Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">{dashboardData.systemUptime}%</div>
              <div className="text-slate-400 text-sm">System Uptime</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">0</div>
              <div className="text-slate-400 text-sm">Critical Alerts</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-cyan-400">3</div>
              <div className="text-slate-400 text-sm">Active Strategies</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="bg-slate-900/50 border-slate-800">
        <CardHeader>
          <CardTitle className="text-white">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Button variant="outline" className="border-slate-700 text-white hover:bg-slate-800">
              Generate Report
            </Button>
            <Button variant="outline" className="border-slate-700 text-white hover:bg-slate-800">
              View Audit Trail
            </Button>
            <Button variant="outline" className="border-slate-700 text-white hover:bg-slate-800">
              Compliance Check
            </Button>
            <Button variant="outline" className="border-slate-700 text-white hover:bg-slate-800">
              Strategy Management
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
