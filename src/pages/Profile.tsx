
import { useState } from 'react';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useAppStore } from '@/stores/useAppStore';
import { User, Settings, Bell, Shield, Award, Copy } from 'lucide-react';

const Profile = () => {
  const { wallet, addNotification } = useAppStore();
  const [displayName, setDisplayName] = useState('Anonymous User');
  const [bio, setBio] = useState('');
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(false);

  const handleSaveSettings = () => {
    addNotification({
      type: 'success',
      title: 'Settings saved',
      message: 'Your profile settings have been updated successfully.',
      read: false
    });
  };

  const copyAddress = () => {
    if (wallet.address) {
      navigator.clipboard.writeText(wallet.address);
      addNotification({
        type: 'success',
        title: 'Address copied',
        message: 'Wallet address copied to clipboard.',
        read: false
      });
    }
  };

  const achievements = [
    { title: 'First Deployment', description: 'Deployed your first contract', earned: true },
    { title: 'Multi-Chain Explorer', description: 'Active on 5+ chains', earned: true },
    { title: 'GM Streak Master', description: '7+ day GM streak', earned: true },
    { title: 'Swap Master', description: '100+ successful swaps', earned: false },
    { title: 'DeFi Pioneer', description: 'Early adopter badge', earned: false },
    { title: 'Community Builder', description: 'Referred 10+ users', earned: false }
  ];

  const stats = [
    { label: 'Total Deployments', value: '42' },
    { label: 'Successful Swaps', value: '158' },
    { label: 'GM Streak', value: '7 days' },
    { label: 'Chains Active', value: '5' },
    { label: 'Total Volume', value: '$12.4K' },
    { label: 'Member Since', value: 'Jan 2024' }
  ];

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center">
              <User className="mr-3 h-8 w-8 text-blue-400" />
              Profile
            </h1>
            <p className="text-gray-400 mt-2">Manage your account and preferences</p>
          </div>
          <Badge variant="outline" className="border-blue-500/50 text-blue-400">
            {wallet.isConnected ? 'Connected' : 'Disconnected'}
          </Badge>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Profile Info */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <User className="mr-2 h-5 w-5" />
                  Profile Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="displayName" className="text-white">Display Name</Label>
                  <Input
                    id="displayName"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="walletAddress" className="text-white">Wallet Address</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="walletAddress"
                      value={wallet.address || 'Not connected'}
                      readOnly
                      className="bg-gray-800 border-gray-700 text-white font-mono text-sm"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={copyAddress}
                      disabled={!wallet.address}
                      className="border-gray-600 hover:border-gray-500"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio" className="text-white">Bio</Label>
                  <Textarea
                    id="bio"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Tell us about yourself..."
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>

                <Button
                  onClick={handleSaveSettings}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                >
                  Save Profile
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Settings className="mr-2 h-5 w-5" />
                  Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-white">Email Notifications</Label>
                    <p className="text-gray-400 text-sm">Receive updates via email</p>
                  </div>
                  <Switch
                    checked={emailNotifications}
                    onCheckedChange={setEmailNotifications}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-white">Push Notifications</Label>
                    <p className="text-gray-400 text-sm">Get real-time browser notifications</p>
                  </div>
                  <Switch
                    checked={pushNotifications}
                    onCheckedChange={setPushNotifications}
                  />
                </div>

                <div className="pt-4 border-t border-gray-700">
                  <Button
                    variant="outline"
                    className="border-red-600 hover:border-red-500 text-red-400 hover:text-red-300"
                  >
                    <Shield className="mr-2 h-4 w-4" />
                    Reset All Data
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Stats and Achievements */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Bell className="mr-2 h-5 w-5" />
                  Statistics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  {stats.map((stat) => (
                    <div key={stat.label} className="text-center">
                      <div className="text-lg font-bold text-white">{stat.value}</div>
                      <div className="text-xs text-gray-400">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Award className="mr-2 h-5 w-5" />
                  Achievements
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {achievements.map((achievement) => (
                  <div
                    key={achievement.title}
                    className={`p-3 rounded-lg border transition-colors ${
                      achievement.earned
                        ? 'bg-yellow-500/10 border-yellow-500/30'
                        : 'bg-gray-800/50 border-gray-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="text-white text-sm font-medium">{achievement.title}</h4>
                        <p className="text-gray-400 text-xs">{achievement.description}</p>
                      </div>
                      {achievement.earned ? (
                        <Award className="h-4 w-4 text-yellow-400" />
                      ) : (
                        <div className="h-4 w-4 rounded-full border border-gray-600" />
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;
