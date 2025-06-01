
import DEXLayout from '@/components/layout/DEXLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Target, 
  Users, 
  Lightbulb,
  Rocket,
  Shield,
  Globe,
  TrendingUp,
  ArrowRight,
  ExternalLink,
  BookOpen,
  Star,
  Plus,
  ArrowUpDown,
  Shuffle,
  Gift
} from 'lucide-react';

const Documentation = () => {
  const platformFeatures = [
    {
      title: "Multi-Chain Token Creation",
      description: "Deploy tokens across 7+ testnets with bonding curve mechanisms",
      icon: Plus
    },
    {
      title: "DEX Trading Hub",
      description: "Professional trading interface with real-time charts and analytics",
      icon: ArrowUpDown
    },
    {
      title: "Cross-Chain Bridging",
      description: "Seamlessly move assets between supported blockchain networks",
      icon: Shuffle
    },
    {
      title: "Community Rewards",
      description: "Earn STEX points through daily activities and platform engagement",
      icon: Gift
    },
    {
      title: "Referral System",
      description: "Grow the community and earn rewards for successful referrals",
      icon: Users
    }
  ];

  const roadmapItems = [
    { phase: "Phase 1", title: "Core Platform", status: "completed", items: ["Multi-chain deployment", "Basic trading", "Wallet integration"] },
    { phase: "Phase 2", title: "DeFi Features", status: "completed", items: ["Bonding curves", "Cross-chain bridge", "Point system"] },
    { phase: "Phase 3", title: "Community", status: "active", items: ["GM ritual", "Referral system", "Social features"] },
    { phase: "Phase 4", title: "Advanced Trading", status: "planned", items: ["Limit orders", "Advanced charts", "Portfolio tracking"] },
    { phase: "Phase 5", title: "Ecosystem", status: "planned", items: ["Mobile app", "API access", "Third-party integrations"] }
  ];

  return (
    <DEXLayout>
      <div className="container mx-auto px-4 py-6 space-y-8">
        {/* Hero Section */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold text-white">
            Welcome to <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">SCRYPTEX</span>
          </h1>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto">
            The next-generation multi-chain DeFi platform empowering developers and traders with seamless token creation, trading, and cross-chain capabilities.
          </p>
          <div className="flex items-center justify-center space-x-4">
            <Badge variant="outline" className="border-emerald-500/50 text-emerald-400">
              Multi-Chain
            </Badge>
            <Badge variant="outline" className="border-cyan-500/50 text-cyan-400">
              DeFi Platform
            </Badge>
            <Badge variant="outline" className="border-purple-500/50 text-purple-400">
              Community Driven
            </Badge>
          </div>
        </div>

        {/* Mission & Vision */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="bg-gradient-to-br from-emerald-900/20 to-green-900/20 border-emerald-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Target className="mr-2 h-6 w-6 text-emerald-400" />
                Our Mission
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-300 leading-relaxed">
                To democratize DeFi by providing accessible, secure, and innovative multi-chain solutions that empower developers to create and traders to prosper in the decentralized economy.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-cyan-900/20 to-blue-900/20 border-cyan-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Lightbulb className="mr-2 h-6 w-6 text-cyan-400" />
                Our Vision
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-300 leading-relaxed">
                To become the leading multi-chain DeFi platform where innovation meets accessibility, fostering a vibrant ecosystem of creators, traders, and builders.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Core Values */}
        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white text-center">Our Core Values</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-6">
              <div className="text-center space-y-3">
                <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mx-auto">
                  <Shield className="h-6 w-6 text-blue-400" />
                </div>
                <h3 className="font-semibold text-white">Security First</h3>
                <p className="text-sm text-slate-400">Audited contracts and secure multi-chain infrastructure</p>
              </div>
              
              <div className="text-center space-y-3">
                <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mx-auto">
                  <Users className="h-6 w-6 text-green-400" />
                </div>
                <h3 className="font-semibold text-white">Community Driven</h3>
                <p className="text-sm text-slate-400">Built by the community, for the community</p>
              </div>
              
              <div className="text-center space-y-3">
                <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mx-auto">
                  <Rocket className="h-6 w-6 text-purple-400" />
                </div>
                <h3 className="font-semibold text-white">Innovation</h3>
                <p className="text-sm text-slate-400">Cutting-edge features and continuous improvement</p>
              </div>
              
              <div className="text-center space-y-3">
                <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center mx-auto">
                  <Globe className="h-6 w-6 text-orange-400" />
                </div>
                <h3 className="font-semibold text-white">Accessibility</h3>
                <p className="text-sm text-slate-400">Making DeFi accessible to everyone, everywhere</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Platform Features */}
        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white">Platform Features</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {platformFeatures.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <div key={index} className="bg-slate-800/50 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <div className="p-2 bg-cyan-500/20 rounded-lg">
                        <Icon className="h-5 w-5 text-cyan-400" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-white">{feature.title}</h3>
                        <p className="text-sm text-slate-400 mt-1">{feature.description}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Supported Chains */}
        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white">Supported Blockchain Networks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { name: "Ethereum Sepolia", status: "active" },
                { name: "Nexus Testnet", status: "active" },
                { name: "0G Network", status: "active" },
                { name: "Somnia Testnet", status: "active" },
                { name: "Aztec Network", status: "active" },
                { name: "RiseChain", status: "active" },
                { name: "MegaETH", status: "active" },
                { name: "More Networks", status: "coming" }
              ].map((chain, index) => (
                <div key={index} className="bg-slate-800/50 rounded-lg p-3 text-center">
                  <div className="font-medium text-white">{chain.name}</div>
                  <Badge 
                    variant={chain.status === 'active' ? 'default' : 'outline'} 
                    className={`mt-2 text-xs ${
                      chain.status === 'active' 
                        ? 'bg-green-500/20 text-green-400' 
                        : 'border-yellow-500/50 text-yellow-400'
                    }`}
                  >
                    {chain.status === 'active' ? 'Live' : 'Coming Soon'}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Roadmap */}
        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <TrendingUp className="mr-2 h-5 w-5 text-emerald-400" />
              Development Roadmap
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {roadmapItems.map((item, index) => (
                <div key={index} className="flex items-start space-x-4">
                  <div className={`w-3 h-3 rounded-full mt-2 ${
                    item.status === 'completed' ? 'bg-green-500' :
                    item.status === 'active' ? 'bg-yellow-500' : 'bg-slate-600'
                  }`} />
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <h3 className="font-semibold text-white">{item.phase}: {item.title}</h3>
                      <Badge 
                        variant={item.status === 'completed' ? 'default' : 'outline'}
                        className={
                          item.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                          item.status === 'active' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50' :
                          'border-slate-600 text-slate-400'
                        }
                      >
                        {item.status}
                      </Badge>
                    </div>
                    <ul className="text-sm text-slate-400 mt-1 space-y-1">
                      {item.items.map((feature, idx) => (
                        <li key={idx} className="flex items-center">
                          <div className="w-1 h-1 bg-slate-500 rounded-full mr-2" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Getting Started */}
        <Card className="bg-gradient-to-r from-emerald-900/20 to-cyan-900/20 border-emerald-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Rocket className="mr-2 h-6 w-6 text-emerald-400" />
              Get Started with SCRYPTEX
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-white mb-3">For Developers</h3>
                <ul className="space-y-2 text-slate-300">
                  <li className="flex items-center">
                    <ArrowRight className="h-4 w-4 mr-2 text-emerald-400" />
                    Deploy tokens across multiple chains
                  </li>
                  <li className="flex items-center">
                    <ArrowRight className="h-4 w-4 mr-2 text-emerald-400" />
                    Configure bonding curves for price discovery
                  </li>
                  <li className="flex items-center">
                    <ArrowRight className="h-4 w-4 mr-2 text-emerald-400" />
                    Access comprehensive deployment tools
                  </li>
                </ul>
                <Button className="mt-4 bg-emerald-600 hover:bg-emerald-700 text-white">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Developer Guide
                </Button>
              </div>
              
              <div>
                <h3 className="font-semibold text-white mb-3">For Traders</h3>
                <ul className="space-y-2 text-slate-300">
                  <li className="flex items-center">
                    <ArrowRight className="h-4 w-4 mr-2 text-cyan-400" />
                    Trade tokens with professional tools
                  </li>
                  <li className="flex items-center">
                    <ArrowRight className="h-4 w-4 mr-2 text-cyan-400" />
                    Bridge assets across chains
                  </li>
                  <li className="flex items-center">
                    <ArrowRight className="h-4 w-4 mr-2 text-cyan-400" />
                    Earn STEX points through activities
                  </li>
                </ul>
                <Button variant="outline" className="mt-4 border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Start Trading
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact & Links */}
        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white">Connect With Us</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <Button variant="outline" className="border-blue-500/50 text-blue-400 hover:bg-blue-500/10">
                <Users className="h-4 w-4 mr-2" />
                Discord Community
              </Button>
              <Button variant="outline" className="border-green-500/50 text-green-400 hover:bg-green-500/10">
                <ExternalLink className="h-4 w-4 mr-2" />
                GitHub Repository
              </Button>
              <Button variant="outline" className="border-purple-500/50 text-purple-400 hover:bg-purple-500/10">
                <FileText className="h-4 w-4 mr-2" />
                Whitepaper
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DEXLayout>
  );
};

export default Documentation;
