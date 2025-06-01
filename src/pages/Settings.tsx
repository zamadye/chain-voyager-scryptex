
import DEXLayout from '@/components/layout/DEXLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Settings as SettingsIcon, 
  User, 
  Bell, 
  Shield, 
  Moon,
  Sun,
  Globe,
  Wallet,
  Database,
  Trash2,
  Download,
  Upload
} from 'lucide-react';
import { useState } from 'react';

const Settings = () => {
  const [darkMode, setDarkMode] = useState(true);
  const [notifications, setNotifications] = useState({
    trading: true,
    rewards: true,
    security: false,
    marketing: false
  });
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');

  return (
    <DEXLayout>
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center">
              <SettingsIcon className="mr-3 h-8 w-8 text-slate-400" />
              Settings
            </h1>
            <p className="text-slate-400 mt-2">Manage your account preferences and security</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Settings */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Settings */}
            <Card className="bg-slate-900/50 border-slate-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <User className="mr-2 h-5 w-5 text-blue-400" />
                  Profile Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-slate-300">Username</Label>
                    <Input 
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Your username"
                      className="bg-slate-800 border-slate-700 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-300">Email</Label>
                    <Input 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      type="email"
                      className="bg-slate-800 border-slate-700 text-white"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-300">Bio</Label>
                  <textarea 
                    className="w-full h-20 px-3 py-2 bg-slate-800 border border-slate-700 rounded-md text-white placeholder-slate-400 resize-none"
                    placeholder="Tell us about yourself..."
                  />
                </div>

                <div className="flex space-x-2">
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                    Save Changes
                  </Button>
                  <Button variant="outline" className="border-slate-700 text-slate-300">
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Appearance Settings */}
            <Card className="bg-slate-900/50 border-slate-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  {darkMode ? <Moon className="mr-2 h-5 w-5 text-purple-400" /> : <Sun className="mr-2 h-5 w-5 text-yellow-400" />}
                  Appearance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-white font-medium">Dark Mode</div>
                    <div className="text-slate-400 text-sm">Use dark theme across the platform</div>
                  </div>
                  <Switch 
                    checked={darkMode}
                    onCheckedChange={setDarkMode}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-white font-medium">Compact Mode</div>
                    <div className="text-slate-400 text-sm">Reduce spacing for more information</div>
                  </div>
                  <Switch />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-white font-medium">Show Advanced Features</div>
                    <div className="text-slate-400 text-sm">Display technical trading options</div>
                  </div>
                  <Switch />
                </div>
              </CardContent>
            </Card>

            {/* Notification Settings */}
            <Card className="bg-slate-900/50 border-slate-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Bell className="mr-2 h-5 w-5 text-green-400" />
                  Notifications
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-white font-medium">Trading Alerts</div>
                    <div className="text-slate-400 text-sm">Get notified about your trades</div>
                  </div>
                  <Switch 
                    checked={notifications.trading}
                    onCheckedChange={(checked) => setNotifications(prev => ({...prev, trading: checked}))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-white font-medium">Reward Notifications</div>
                    <div className="text-slate-400 text-sm">STEX points and achievement alerts</div>
                  </div>
                  <Switch 
                    checked={notifications.rewards}
                    onCheckedChange={(checked) => setNotifications(prev => ({...prev, rewards: checked}))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-white font-medium">Security Alerts</div>
                    <div className="text-slate-400 text-sm">Important security notifications</div>
                  </div>
                  <Switch 
                    checked={notifications.security}
                    onCheckedChange={(checked) => setNotifications(prev => ({...prev, security: checked}))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-white font-medium">Marketing Updates</div>
                    <div className="text-slate-400 text-sm">Platform updates and promotions</div>
                  </div>
                  <Switch 
                    checked={notifications.marketing}
                    onCheckedChange={(checked) => setNotifications(prev => ({...prev, marketing: checked}))}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Privacy & Security */}
            <Card className="bg-slate-900/50 border-slate-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Shield className="mr-2 h-5 w-5 text-red-400" />
                  Privacy & Security
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-white font-medium">Two-Factor Authentication</div>
                    <div className="text-slate-400 text-sm">Add extra security to your account</div>
                  </div>
                  <Button variant="outline" size="sm" className="border-red-500/50 text-red-400">
                    Enable 2FA
                  </Button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-white font-medium">Session Management</div>
                    <div className="text-slate-400 text-sm">Manage active sessions</div>
                  </div>
                  <Button variant="outline" size="sm" className="border-slate-600 text-slate-300">
                    View Sessions
                  </Button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-white font-medium">Data Export</div>
                    <div className="text-slate-400 text-sm">Download your data</div>
                  </div>
                  <Button variant="outline" size="sm" className="border-blue-500/50 text-blue-400">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <Card className="bg-slate-900/50 border-slate-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Wallet className="mr-2 h-5 w-5 text-green-400" />
                  Wallet Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">Auto-approve</span>
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">Gas optimization</span>
                  <Switch defaultChecked />
                </div>
                <Button variant="outline" className="w-full border-green-500/50 text-green-400">
                  Manage Wallets
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/50 border-slate-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Globe className="mr-2 h-5 w-5 text-cyan-400" />
                  Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label className="text-slate-300">Language</Label>
                  <select className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-white">
                    <option>English</option>
                    <option>Spanish</option>
                    <option>French</option>
                    <option>German</option>
                  </select>
                </div>
                <div>
                  <Label className="text-slate-300">Currency</Label>
                  <select className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-white">
                    <option>USD</option>
                    <option>EUR</option>
                    <option>ETH</option>
                    <option>BTC</option>
                  </select>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-red-900/20 border-red-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Trash2 className="mr-2 h-5 w-5 text-red-400" />
                  Danger Zone
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full border-red-500/50 text-red-400 hover:bg-red-500/10"
                >
                  Clear All Data
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full border-red-500/50 text-red-400 hover:bg-red-500/10"
                >
                  Delete Account
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DEXLayout>
  );
};

export default Settings;
