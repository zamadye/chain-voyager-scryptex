
import DEXLayout from '@/components/layout/DEXLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Users, 
  Copy, 
  Gift, 
  TrendingUp,
  Share2,
  Star,
  Trophy,
  ExternalLink
} from 'lucide-react';
import { useAppStore } from '@/stores/useAppStore';
import { useState } from 'react';

const Referrals = () => {
  const { referralStats, userPoints } = useAppStore();
  const [copied, setCopied] = useState(false);
  
  // Mock referral code - in real app, get from user data
  const referralCode = "SCXTX123ABC";
  const referralLink = `https://scryptex.io/ref/${referralCode}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const benefits = [
    {
      title: "50 STEX for You",
      description: "Earn 50 STEX points for each successful referral",
      icon: Gift
    },
    {
      title: "50 STEX for Friend",
      description: "Your friend gets 50 STEX when they join",
      icon: Star
    },
    {
      title: "Lifetime Bonus",
      description: "Earn 5% of your referrals' points forever",
      icon: TrendingUp
    },
    {
      title: "Exclusive Rewards",
      description: "Unlock special rewards for top referrers",
      icon: Trophy
    }
  ];

  return (
    <DEXLayout>
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center">
              <Users className="mr-3 h-8 w-8 text-purple-400" />
              Referral Program
            </h1>
            <p className="text-slate-400 mt-2">Invite friends and earn STEX points together</p>
          </div>
          <Badge variant="outline" className="border-purple-500/50 text-purple-400">
            {referralStats?.totalReferrals || 0} Referrals
          </Badge>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Referral Link */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-gradient-to-r from-purple-900/20 to-pink-900/20 border-purple-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Share2 className="mr-2 h-5 w-5 text-purple-400" />
                  Your Referral Link
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-slate-300">Referral Code</Label>
                  <div className="flex space-x-2">
                    <Input 
                      value={referralCode}
                      readOnly
                      className="bg-slate-800 border-slate-700 text-white"
                    />
                    <Button
                      onClick={handleCopyLink}
                      variant="outline"
                      className="border-purple-500/50 text-purple-400 hover:bg-purple-500/10"
                    >
                      {copied ? 'Copied!' : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-300">Referral Link</Label>
                  <div className="flex space-x-2">
                    <Input 
                      value={referralLink}
                      readOnly
                      className="bg-slate-800 border-slate-700 text-white"
                    />
                    <Button
                      onClick={handleCopyLink}
                      className="bg-purple-600 hover:bg-purple-700 text-white"
                    >
                      Share Link
                    </Button>
                  </div>
                </div>

                <div className="bg-slate-800/50 rounded-lg p-4">
                  <h3 className="font-semibold text-white mb-2">How it works:</h3>
                  <ol className="text-sm text-slate-300 space-y-1">
                    <li>1. Share your referral link with friends</li>
                    <li>2. They sign up and complete their first transaction</li>
                    <li>3. You both receive 50 STEX points!</li>
                    <li>4. Earn 5% of their future points as bonus</li>
                  </ol>
                </div>
              </CardContent>
            </Card>

            {/* Benefits Grid */}
            <div className="grid md:grid-cols-2 gap-4">
              {benefits.map((benefit, index) => {
                const Icon = benefit.icon;
                return (
                  <Card key={index} className="bg-slate-900/50 border-slate-800">
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-3">
                        <div className="p-2 bg-purple-500/20 rounded-lg">
                          <Icon className="h-5 w-5 text-purple-400" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-white">{benefit.title}</h3>
                          <p className="text-sm text-slate-400 mt-1">{benefit.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Referral History */}
            <Card className="bg-slate-900/50 border-slate-800">
              <CardHeader>
                <CardTitle className="text-white">Your Referrals</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {referralStats?.recentReferrals?.map((referral, index) => (
                    <div key={index} className="flex items-center justify-between py-3 border-b border-slate-700 last:border-0">
                      <div className="flex items-center space-x-3">
                        <div className="h-8 w-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm font-semibold">
                            {referral.username.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium text-white">{referral.username}</div>
                          <div className="text-sm text-slate-400">{referral.joinedDate}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant={referral.status === 'active' ? 'default' : 'outline'}>
                          {referral.status}
                        </Badge>
                        <div className="text-sm text-slate-400 mt-1">
                          +{referral.pointsEarned} STEX earned
                        </div>
                      </div>
                    </div>
                  )) || (
                    <div className="text-center text-slate-400 py-8">
                      No referrals yet. Start sharing your link!
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
                <CardTitle className="text-white">Referral Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-400">
                    {referralStats?.totalReferrals || 0}
                  </div>
                  <div className="text-slate-400">Total Referrals</div>
                </div>
                
                <div className="grid grid-cols-1 gap-4 text-center">
                  <div>
                    <div className="text-xl font-semibold text-white">
                      {referralStats?.activeReferrals || 0}
                    </div>
                    <div className="text-xs text-slate-400">Active Referrals</div>
                  </div>
                  <div>
                    <div className="text-xl font-semibold text-white">
                      {referralStats?.earnedFromReferrals || 0}
                    </div>
                    <div className="text-xs text-slate-400">STEX Earned</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/50 border-slate-800">
              <CardHeader>
                <CardTitle className="text-white">Leaderboard</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[1, 2, 3, 4, 5].map((rank) => (
                    <div key={rank} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                          rank <= 3 ? 'bg-yellow-500 text-black' : 'bg-slate-700 text-white'
                        }`}>
                          {rank}
                        </div>
                        <span className="text-slate-300">User{rank}***</span>
                      </div>
                      <span className="text-purple-400">{Math.max(0, 50 - rank * 5)} refs</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-yellow-900/20 to-orange-900/20 border-yellow-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Trophy className="mr-2 h-5 w-5 text-yellow-400" />
                  Next Milestone
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-400">10 Referrals</div>
                  <div className="text-slate-400 mb-4">Unlock Premium Rewards</div>
                  <Button 
                    variant="outline"
                    size="sm"
                    className="border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/10"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Learn More
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DEXLayout>
  );
};

export default Referrals;
