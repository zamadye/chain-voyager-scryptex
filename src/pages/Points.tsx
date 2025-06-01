
import DEXLayout from '@/components/layout/DEXLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Trophy, 
  TrendingUp, 
  Users,
  Gift,
  Target,
  Calendar,
  Activity
} from 'lucide-react';
import { useAppStore } from '@/stores/useAppStore';
import { Link } from 'react-router-dom';

const Points = () => {
  const { userPoints, referralStats } = useAppStore();

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
            <p className="text-slate-400 mt-2">Track your points, activity, and rewards</p>
          </div>
          <Badge variant="outline" className="border-yellow-500/50 text-yellow-400 text-lg px-4 py-2">
            {userPoints?.totalPoints || 0} STEX
          </Badge>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Points Overview */}
          <div className="lg:col-span-2 space-y-6">
            {/* Point Values */}
            <Card className="bg-slate-900/50 border-slate-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Target className="mr-2 h-5 w-5 text-cyan-400" />
                  Point Values & Earning Opportunities
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold text-white text-lg">Daily Activities</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="h-2 w-2 bg-yellow-400 rounded-full"></div>
                          <span className="text-slate-300">Daily GM Ritual</span>
                        </div>
                        <Badge className="bg-yellow-500/20 text-yellow-400">+10 STEX</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="h-2 w-2 bg-emerald-400 rounded-full"></div>
                          <span className="text-slate-300">Token Swap</span>
                        </div>
                        <Badge className="bg-emerald-500/20 text-emerald-400">+5 STEX each</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="h-2 w-2 bg-blue-400 rounded-full"></div>
                          <span className="text-slate-300">Cross-chain Bridge</span>
                        </div>
                        <Badge className="bg-blue-500/20 text-blue-400">+15 STEX each</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="h-2 w-2 bg-purple-400 rounded-full"></div>
                          <span className="text-slate-300">Create Token</span>
                        </div>
                        <Badge className="bg-purple-500/20 text-purple-400">+100 STEX</Badge>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold text-white text-lg">Bonus Rewards</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="h-2 w-2 bg-green-400 rounded-full"></div>
                          <span className="text-slate-300">Complete 3 Swaps Daily</span>
                        </div>
                        <Badge className="bg-green-500/20 text-green-400">+30 STEX</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="h-2 w-2 bg-cyan-400 rounded-full"></div>
                          <span className="text-slate-300">Complete 2 Bridges Daily</span>
                        </div>
                        <Badge className="bg-cyan-500/20 text-cyan-400">+50 STEX</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="h-2 w-2 bg-pink-400 rounded-full"></div>
                          <span className="text-slate-300">Referral Program</span>
                        </div>
                        <Badge className="bg-pink-500/20 text-pink-400">+50 STEX</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="h-2 w-2 bg-orange-400 rounded-full"></div>
                          <span className="text-slate-300">Streak Multiplier</span>
                        </div>
                        <Badge className="bg-orange-500/20 text-orange-400">Up to 2x</Badge>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-700">
                  <Link to="/earn-stex">
                    <Button className="w-full bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700">
                      <Target className="h-4 w-4 mr-2" />
                      Start Earning Points
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Transaction History */}
            <Card className="bg-slate-900/50 border-slate-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Activity className="mr-2 h-5 w-5 text-emerald-400" />
                  Recent Points Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {userPoints?.recentActivity?.map((activity, index) => (
                    <div key={index} className="flex items-center justify-between py-3 border-b border-slate-700 last:border-0">
                      <div className="flex items-center space-x-3">
                        <div className="h-3 w-3 bg-green-400 rounded-full" />
                        <div>
                          <span className="text-slate-300 font-medium">{activity.description}</span>
                          <div className="text-xs text-slate-500">{activity.timestamp}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-green-400 font-bold text-lg">+{activity.points}</span>
                        <div className="text-xs text-slate-400">STEX</div>
                      </div>
                    </div>
                  )) || (
                    <div className="text-center text-slate-400 py-8">
                      <Activity className="h-12 w-12 mx-auto mb-3 text-slate-600" />
                      <p>No recent activity</p>
                      <p className="text-sm">Complete tasks to start earning points!</p>
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

                <Link to="/referrals">
                  <Button 
                    variant="outline" 
                    className="w-full border-purple-500/50 text-purple-400 hover:bg-purple-500/10"
                  >
                    View Referral Program
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/50 border-slate-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Gift className="mr-2 h-5 w-5 text-green-400" />
                  Active Multipliers
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400">Streak Bonus</span>
                  <span className="text-green-400">x{1 + (userPoints?.currentStreak || 0) * 0.1}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Daily Tasks</span>
                  <span className="text-green-400">x1.2</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Referral Bonus</span>
                  <span className="text-green-400">x1.1</span>
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
