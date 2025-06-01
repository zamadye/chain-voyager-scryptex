
import DEXLayout from '@/components/layout/DEXLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Trophy, 
  Target, 
  ArrowUpDown,
  Shuffle,
  Plus,
  Sun,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';
import { useAppStore } from '@/stores/useAppStore';
import { Link } from 'react-router-dom';

const EarnSTEX = () => {
  const { userPoints } = useAppStore();

  const tasks = [
    {
      id: 'daily_gm',
      title: 'Daily GM Ritual',
      description: 'Post GM on any chain',
      reward: 10,
      progress: userPoints?.gmToday ? 1 : 0,
      target: 1,
      icon: Sun,
      completed: userPoints?.gmToday || false,
      navTo: '/gm'
    },
    {
      id: 'swap_3x',
      title: 'Make 3 Swaps',
      description: 'Complete 3 token swaps today',
      reward: 30,
      progress: userPoints?.swapsToday || 0,
      target: 3,
      icon: ArrowUpDown,
      completed: (userPoints?.swapsToday || 0) >= 3,
      navTo: '/swap'
    },
    {
      id: 'bridge_2x',
      title: 'Bridge 2 Times',
      description: 'Complete 2 bridge transactions',
      reward: 50,
      progress: userPoints?.bridgesToday || 0,
      target: 2,
      icon: Shuffle,
      completed: (userPoints?.bridgesToday || 0) >= 2,
      navTo: '/bridge'
    },
    {
      id: 'create_token',
      title: 'Create Token',
      description: 'Deploy a new token',
      reward: 100,
      progress: userPoints?.tokensCreatedToday || 0,
      target: 1,
      icon: Plus,
      completed: (userPoints?.tokensCreatedToday || 0) >= 1,
      navTo: '/create'
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
              Earn STEX Points
            </h1>
            <p className="text-slate-400 mt-2">Complete daily tasks to earn STEX points and build your streak</p>
          </div>
          <Badge variant="outline" className="border-yellow-500/50 text-yellow-400 text-lg px-4 py-2">
            {earnedToday}/{totalPossibleToday} Today
          </Badge>
        </div>

        {/* Daily Progress */}
        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white">Today's Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-slate-400">
                <span>Daily Points Earned</span>
                <span>{Math.round((earnedToday / totalPossibleToday) * 100)}%</span>
              </div>
              <Progress value={(earnedToday / totalPossibleToday) * 100} className="h-3" />
            </div>
          </CardContent>
        </Card>

        {/* Daily Tasks */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-white">Daily Tasks</h2>
          
          {tasks.map((task) => {
            const Icon = task.icon;
            const progressPercent = (task.progress / task.target) * 100;
            
            return (
              <Card key={task.id} className="bg-slate-900/50 border-slate-800">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div className={`p-3 rounded-lg ${task.completed ? 'bg-green-500/20' : 'bg-slate-700'}`}>
                        <Icon className={`h-6 w-6 ${task.completed ? 'text-green-400' : 'text-slate-400'}`} />
                      </div>
                      <div>
                        <h3 className="font-bold text-white text-lg">{task.title}</h3>
                        <p className="text-slate-400">{task.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="text-right">
                        <Badge variant={task.completed ? "default" : "outline"} 
                               className={`${task.completed ? "bg-green-500/20 text-green-400" : ""} text-sm`}>
                          +{task.reward} STEX
                        </Badge>
                        {task.completed && (
                          <CheckCircle2 className="h-5 w-5 text-green-400 mt-1 ml-auto" />
                        )}
                      </div>
                      <Link to={task.navTo}>
                        <Button 
                          variant={task.completed ? "outline" : "default"}
                          size="sm"
                          className={task.completed ? "border-green-500/50 text-green-400" : "bg-emerald-600 hover:bg-emerald-700"}
                        >
                          {task.completed ? "Completed" : "Start Task"}
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm text-slate-400">
                      <span>Progress: {task.progress}/{task.target}</span>
                      <span>{Math.round(progressPercent)}%</span>
                    </div>
                    <Progress value={progressPercent} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Point System Explanation */}
        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white">How to Earn STEX Points</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <h4 className="font-semibold text-white">Daily Activities</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-300">GM Ritual</span>
                    <span className="text-yellow-400">+10 STEX</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-300">Token Swap</span>
                    <span className="text-yellow-400">+5 STEX each</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-300">Cross-chain Bridge</span>
                    <span className="text-yellow-400">+15 STEX each</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-300">Create Token</span>
                    <span className="text-yellow-400">+100 STEX</span>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <h4 className="font-semibold text-white">Bonus Rewards</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-300">Daily Task Completion</span>
                    <span className="text-green-400">Extra rewards</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-300">Streak Multiplier</span>
                    <span className="text-green-400">Up to 2x</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-300">Referral Bonus</span>
                    <span className="text-green-400">50 STEX</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DEXLayout>
  );
};

export default EarnSTEX;
