
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart3, TrendingUp, Activity, DollarSign, Target, Award } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

const Analytics = () => {
  const statsData = [
    { name: 'Nexus', deployments: 12, swaps: 45, gm: 30 },
    { name: '0G', deployments: 8, swaps: 32, gm: 25 },
    { name: 'Somnia', deployments: 15, swaps: 28, gm: 28 },
    { name: 'Aztec', deployments: 6, swaps: 18, gm: 20 },
    { name: 'Rise', deployments: 10, swaps: 35, gm: 22 }
  ];

  const revenueData = [
    { month: 'Jan', revenue: 2400, fees: 240 },
    { month: 'Feb', revenue: 1398, fees: 140 },
    { month: 'Mar', revenue: 9800, fees: 980 },
    { month: 'Apr', revenue: 3908, fees: 390 },
    { month: 'May', revenue: 4800, fees: 480 },
    { month: 'Jun', revenue: 3800, fees: 380 }
  ];

  const chainDistribution = [
    { name: 'Nexus', value: 30, color: '#8B5CF6' },
    { name: '0G', value: 25, color: '#06B6D4' },
    { name: 'Somnia', value: 20, color: '#10B981' },
    { name: 'Aztec', value: 15, color: '#F59E0B' },
    { name: 'Others', value: 10, color: '#6B7280' }
  ];

  const overviewStats = [
    {
      title: 'Total Value Deployed',
      value: '$2.4M',
      change: '+12.5%',
      icon: DollarSign,
      color: 'text-green-400'
    },
    {
      title: 'Active Contracts',
      value: '342',
      change: '+8.2%',
      icon: Activity,
      color: 'text-blue-400'
    },
    {
      title: 'Successful Swaps',
      value: '1,247',
      change: '+23.1%',
      icon: TrendingUp,
      color: 'text-purple-400'
    },
    {
      title: 'GM Streak',
      value: '7 days',
      change: 'Personal best!',
      icon: Award,
      color: 'text-yellow-400'
    }
  ];

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center">
              <BarChart3 className="mr-3 h-8 w-8 text-green-400" />
              Analytics Dashboard
            </h1>
            <p className="text-gray-400 mt-2">Track your multi-chain activity and performance</p>
          </div>
          <Badge variant="outline" className="border-green-500/50 text-green-400">
            Real-time Data
          </Badge>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {overviewStats.map((stat) => (
            <Card key={stat.title} className="bg-gray-900/50 border-gray-800">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">{stat.title}</p>
                    <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
                    <p className={`text-sm mt-1 ${stat.color}`}>{stat.change}</p>
                  </div>
                  <div className={`p-3 rounded-lg bg-gray-800/50`}>
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Activity Chart */}
          <div className="lg:col-span-2">
            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Activity className="mr-2 h-5 w-5" />
                  Chain Activity Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={statsData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="name" stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1F2937', 
                        border: '1px solid #374151',
                        borderRadius: '8px'
                      }} 
                    />
                    <Bar dataKey="deployments" fill="#8B5CF6" name="Deployments" />
                    <Bar dataKey="swaps" fill="#06B6D4" name="Swaps" />
                    <Bar dataKey="gm" fill="#10B981" name="GM Posts" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Chain Distribution */}
          <div className="lg:col-span-1">
            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Target className="mr-2 h-5 w-5" />
                  Chain Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={chainDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {chainDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-4 space-y-2">
                  {chainDistribution.map((item) => (
                    <div key={item.name} className="flex items-center justify-between text-sm">
                      <div className="flex items-center">
                        <div 
                          className="w-3 h-3 rounded-full mr-2"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="text-gray-300">{item.name}</span>
                      </div>
                      <span className="text-white">{item.value}%</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Revenue Trend */}
        <Card className="bg-gray-900/50 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <TrendingUp className="mr-2 h-5 w-5" />
              Revenue & Fees Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="month" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px'
                  }} 
                />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#10B981" 
                  strokeWidth={3}
                  name="Revenue"
                />
                <Line 
                  type="monotone" 
                  dataKey="fees" 
                  stroke="#F59E0B" 
                  strokeWidth={3}
                  name="Fees"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Analytics;
