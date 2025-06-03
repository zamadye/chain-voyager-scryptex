
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EnhancedBridgeInterface } from '@/components/trading/EnhancedBridgeInterface';
import { ArrowLeftRight, Trophy, Clock, TrendingUp, Star } from 'lucide-react';
import { bridgeService } from '@/services/api';

const BridgePage = () => {
  const [selectedTab, setSelectedTab] = useState('bridge');

  // Get user bridge data
  const { data: userPoints } = useQuery({
    queryKey: ['user-bridge-points'],
    queryFn: async () => {
      const response = await bridgeService.getUserPoints();
      return response.data;
    }
  });

  const { data: bridgeHistory } = useQuery({
    queryKey: ['user-bridge-history'],
    queryFn: async () => {
      const response = await bridgeService.getUserBridgeHistory();
      return response.data;
    }
  });

  const { data: dailyTasks } = useQuery({
    queryKey: ['daily-bridge-tasks'],
    queryFn: async () => {
      const response = await bridgeService.getDailyTasks();
      return response.data;
    }
  });

  const { data: leaderboard } = useQuery({
    queryKey: ['bridge-leaderboard'],
    queryFn: async () => {
      const response = await bridgeService.getBridgeLeaderboard(10);
      return response.data;
    }
  });

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-400 border-green-500/50';
      case 'pending': return 'text-yellow-400 border-yellow-500/50';
      case 'failed': return 'text-red-400 border-red-500/50';
      default: return 'text-gray-400 border-gray-500/50';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-2">
            Cross-Chain Bridge
          </h1>
          <p className="text-slate-300 text-lg">
            Bridge assets across chains and earn points for every transaction
          </p>
        </div>

        {/* User Stats */}
        {userPoints && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Trophy className="h-8 w-8 text-yellow-400" />
                  <div>
                    <p className="text-2xl font-bold text-white">{userPoints.totalPoints}</p>
                    <p className="text-sm text-slate-400">Total Points</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <ArrowLeftRight className="h-8 w-8 text-cyan-400" />
                  <div>
                    <p className="text-2xl font-bold text-white">{userPoints.totalBridges}</p>
                    <p className="text-sm text-slate-400">Total Bridges</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-8 w-8 text-green-400" />
                  <div>
                    <p className="text-2xl font-bold text-white">{userPoints.currentDailyStreak}</p>
                    <p className="text-sm text-slate-400">Daily Streak</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Star className="h-8 w-8 text-purple-400" />
                  <div>
                    <p className="text-2xl font-bold text-white">#{userPoints.rank || 'N/A'}</p>
                    <p className="text-sm text-slate-400">Global Rank</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
          <TabsList className="bg-slate-800 border-slate-700">
            <TabsTrigger value="bridge" className="data-[state=active]:bg-cyan-600">
              Bridge Assets
            </TabsTrigger>
            <TabsTrigger value="history" className="data-[state=active]:bg-cyan-600">
              History
            </TabsTrigger>
            <TabsTrigger value="tasks" className="data-[state=active]:bg-cyan-600">
              Daily Tasks
            </TabsTrigger>
            <TabsTrigger value="leaderboard" className="data-[state=active]:bg-cyan-600">
              Leaderboard
            </TabsTrigger>
          </TabsList>

          <TabsContent value="bridge" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <EnhancedBridgeInterface />
              </div>
              
              <div className="space-y-6">
                {/* Daily Tasks Preview */}
                {dailyTasks && dailyTasks.tasks && (
                  <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center">
                        <Clock className="mr-2 h-5 w-5 text-orange-400" />
                        Today's Tasks
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {dailyTasks.tasks.slice(0, 3).map((task) => (
                        <div key={task.taskId} className="bg-slate-800/50 rounded-lg p-3">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="text-white text-sm font-medium">{task.taskName}</h4>
                            <Badge className="bg-orange-500/20 text-orange-300 border-orange-500/50">
                              +{task.taskPoints}pts
                            </Badge>
                          </div>
                          <p className="text-slate-400 text-xs">{task.taskDescription}</p>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}

                {/* Top Performers */}
                {leaderboard && leaderboard.leaderboard && (
                  <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center">
                        <Trophy className="mr-2 h-5 w-5 text-yellow-400" />
                        Top Bridgers
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {leaderboard.leaderboard.slice(0, 5).map((entry, index) => (
                        <div key={entry.userAddress} className="flex justify-between items-center">
                          <div className="flex items-center space-x-3">
                            <div className="w-6 h-6 rounded-full bg-gradient-to-r from-yellow-400 to-orange-400 flex items-center justify-center text-black text-xs font-bold">
                              {index + 1}
                            </div>
                            <span className="text-white text-sm">
                              {entry.userAddress.slice(0, 6)}...{entry.userAddress.slice(-4)}
                            </span>
                          </div>
                          <div className="text-right">
                            <p className="text-yellow-400 text-sm font-medium">{entry.totalPoints}pts</p>
                            <p className="text-slate-400 text-xs">{entry.totalBridges} bridges</p>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">Bridge History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {bridgeHistory?.bridges && bridgeHistory.bridges.length > 0 ? (
                    bridgeHistory.bridges.map((bridge) => (
                      <div key={bridge.id} className="bg-slate-800/50 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <div className="flex items-center space-x-2 mb-1">
                              <span className="text-white font-medium">
                                {bridgeService.formatBridgeAmount(bridge.amount)} {bridge.tokenSymbol}
                              </span>
                              <Badge className={`${getStatusColor(bridge.bridgeStatus)}`}>
                                {bridge.bridgeStatus}
                              </Badge>
                            </div>
                            <p className="text-slate-400 text-sm">
                              Chain {bridge.sourceChainId} → Chain {bridge.targetChainId}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-yellow-400 font-medium">+{bridge.pointsAwarded}pts</p>
                            <p className="text-slate-400 text-xs">{formatTimeAgo(bridge.initiatedAt)}</p>
                          </div>
                        </div>
                        
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-slate-400">
                            via {bridgeService.getBridgeProviderName(bridge.bridgeProvider)}
                          </span>
                          <span className="text-slate-400">
                            Fee: {bridgeService.formatBridgeFee(bridge.bridgeFee)}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-slate-400">
                      No bridge transactions found
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tasks" className="space-y-6">
            <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">Daily Bridge Tasks</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {dailyTasks?.tasks && dailyTasks.tasks.length > 0 ? (
                    dailyTasks.tasks.map((task) => (
                      <div key={task.taskId} className="bg-slate-800/50 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="text-white font-medium">{task.taskName}</h3>
                          <Badge className="bg-orange-500/20 text-orange-300 border-orange-500/50">
                            +{task.taskPoints} points
                          </Badge>
                        </div>
                        <p className="text-slate-400 text-sm mb-3">{task.taskDescription}</p>
                        <div className="bg-slate-700/50 rounded-full h-2">
                          <div className="bg-gradient-to-r from-orange-400 to-yellow-400 h-2 rounded-full w-0"></div>
                        </div>
                        <p className="text-slate-400 text-xs mt-1">0 / {task.requiredProgress} completed</p>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-slate-400">
                      No daily tasks available
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="leaderboard" className="space-y-6">
            <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">Bridge Points Leaderboard</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {leaderboard?.leaderboard && leaderboard.leaderboard.length > 0 ? (
                    leaderboard.leaderboard.map((entry, index) => (
                      <div key={entry.userAddress} className="flex justify-between items-center bg-slate-800/50 rounded-lg p-4">
                        <div className="flex items-center space-x-4">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-black font-bold ${
                            index === 0 ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' :
                            index === 1 ? 'bg-gradient-to-r from-gray-300 to-gray-400' :
                            index === 2 ? 'bg-gradient-to-r from-amber-600 to-amber-700' :
                            'bg-slate-600 text-white'
                          }`}>
                            {index + 1}
                          </div>
                          <div>
                            <p className="text-white font-medium">
                              {entry.userAddress.slice(0, 6)}...{entry.userAddress.slice(-4)}
                            </p>
                            <p className="text-slate-400 text-sm">{entry.totalBridges} bridges</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-yellow-400 text-lg font-bold">{entry.totalPoints}</p>
                          <p className="text-slate-400 text-sm">points</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-slate-400">
                      No leaderboard data available
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default BridgePage;
