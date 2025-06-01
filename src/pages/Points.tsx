
import DEXLayout from '@/components/layout/DEXLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Trophy, 
  Target, 
  Gift, 
  TrendingUp, 
  Calendar,
  ArrowUpDown,
  Shuffle,
  Plus,
  Sun,
  Users,
  CheckCircle2
} from 'lucide-react';
import { useAppStore } from '@/stores/useAppStore';

const Points = () => {
  const { userPoints, dailyTasks, referralStats } = useAppStore();

  const tasks = [
    {
      id: 'daily_gm',
      title: 'Daily GM Ritual',
      description: 'Post GM on any chain',
      reward: 10,
      progress: userPoints?.gmToday ? 1 : 0,
      target: 1,
      icon: Sun,
      completed: userPoints?.gmToday || false
    },
    {
      id: 'swap_3x',
      title: 'Make 3 Swaps',
      description: 'Complete 3 token swaps today',
      reward: 30,
      progress: userPoints?.swapsToday || 0,
      target: 3,
      icon: ArrowUpDown,
      completed: (userPoints?.swapsToday || 0) >= 3
    },
    {
      id: 'bridge_2x',
      title: 'Bridge 2 Times',
      description: 'Complete 2 bridge transactions',
      reward: 50,
      progress: userPoints?.bridgesToday || 0,
      target: 2,
      icon: Shuffle,
      completed: (userPoints?.bridgesToday || 0) >= 2
    },
    {
      id: 'create_token',
      title: 'Create Token',
      description: 'Deploy a new token',
      reward: 100,
      progress: userPoints?.tokensCreatedToday || 0,
      target: 1,
      icon: Plus,
      completed: (userPoints?.tokensCreatedToday || 0) >= 1
    }
  ];

  const totalPossibleToday = tasks.reduce((sum, task) => sum + task.reward, 0);
  const earnedToday = tasks.filter(task => task.completed).reduce((sum, task) => sum + task.reward, 0);

  return (
    <DEXLayout>
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center">
              <Trophy className="mr-3 h-8 w-8 text-yellow-400" />
              STEX Points Dashboard
            </h1>
            <p className="text-slate-400 mt-2">Earn points by completing daily tasks and activities</p>
          </div>
          <Badge variant="outline" className="border-yellow-500/50 text-yellow-400 text-lg px-4 py-2">
            {userPoints?.totalPoints || 0} STEX
          </Badge>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Daily Tasks */}
          <div className="lg:col-span-2 space-y-4">
            <Card className="bg-slate-900/50 border-slate-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Target className="mr-2 h-5 w-5 text-cyan-400" />
                  Daily Tasks
                  <Badge className="ml-auto bg-cyan-500/20 text-cyan-400">
                    {earnedToday}/{totalPossibleToday} STEX
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {tasks.map((task) => {
                  const Icon = task.icon;
                  const progressPercent = (task.progress / task.target) * 100;
                  
                  return (
                    <div key={task.id} className="bg-slate-800/50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded-lg ${task.completed ? 'bg-green-500/20' : 'bg-slate-700'}`}>
                            <Icon className={`h-4 w-4 ${task.completed ? 'text-green-400' : 'text-slate-400'}`} />
                          </div>
                          <div>
                            <h3 className="font-semibold text-white">{task.title}</h3>
                            <p className="text-sm text-slate-400">{task.description}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant={task.completed ? "default" : "outline"} 
                                 className={task.completed ? "bg-green-500/20 text-green-400" : ""}>
                            +{task.reward} STEX
                          </Badge>
                          {task.completed && (
                            <CheckCircle2 className="h-5 w-5 text-green-400 mt-1 ml-auto" />
                          )}
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm text-slate-400">
                          <span>Progress: {task.progress}/{task.target}</span>
                          <span>{Math.round(progressPercent)}%</span>
                        </div>
                        <Progress value={progressPercent} className="h-2" />
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* Points History */}
            <Card className="bg-slate-900/50 border-slate-800">
              <CardHeader>
                <CardTitle className="text-white">Recent Points Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {userPoints?.recentActivity?.map((activity, index) => (
                    <div key={index} className="flex items-center justify-between py-2 border-b border-slate-700 last:border-0">
                      <div className="flex items-center space-x-3">
                        <div className="h-2 w-2 bg-green-400 rounded-full" />
                        <span className="text-slate-300">{activity.description}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-green-400 font-semibold">+{activity.points} STEX</span>
                        <div className="text-xs text-slate-500">{activity.timestamp}</div>
                      </div>
                    </div>
                  )) || (
                    <div className="text-center text-slate-400 py-8">
                      No recent activity. Complete tasks to start earning!
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Stats Sidebar */}
          <div className="space-y-4">
            <Card className="bg-slate-900/50 border-slate-800">
              <CardHeader>
                <CardTitle className="text-white">Your Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-yellow-400">
                    {userPoints?.totalPoints || 0}
                  </div>
                  <div className="text-slate-400">Total STEX Points</div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-xl font-semibold text-white">
                      {userPoints?.currentStreak || 0}
                    </div>
                    <div className="text-xs text-slate-400">Day Streak</div>
                  </div>
                  <div>
                    <div className="text-xl font-semibold text-white">
                      {userPoints?.rank || '-'}
                    </div>
                    <div className="text-xs text-slate-400">Global Rank</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/50 border-slate-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Users className="mr-2 h-5 w-5 text-purple-400" />
                  Referrals
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-400">
                    {referralStats?.totalReferrals || 0}
                  </div>
                  <div className="text-slate-400">People Referred</div>
                </div>
                
                <div className="text-center">
                  <div className="text-xl font-semibold text-white">
                    {referralStats?.earnedFromReferrals || 0}
                  </div>
                  <div className="text-xs text-slate-400">STEX from Referrals</div>
                </div>

                <Button 
                  variant="outline" 
                  className="w-full border-purple-500/50 text-purple-400 hover:bg-purple-500/10"
                >
                  View Referral Program
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/50 border-slate-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Gift className="mr-2 h-5 w-5 text-green-400" />
                  Multipliers
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400">Streak Bonus</span>
                  <span className="text-green-400">x{1 + (userPoints?.currentStreak || 0) * 0.1}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Referral Bonus</span>
                  <span className="text-green-400">x1.2</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DEXLayout>
  );
};

export default Points;
