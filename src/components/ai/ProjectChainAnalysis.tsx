
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  TrendingUp, 
  Users, 
  DollarSign, 
  Zap, 
  Info, 
  ExternalLink,
  Shield,
  Coins,
  Building
} from 'lucide-react';

interface ProjectData {
  name: string;
  symbol: string;
  description: string;
  status: 'active' | 'testnet' | 'mainnet';
  category: string;
  marketCap?: string;
  tvl?: string;
  tokenomics: {
    totalSupply: string;
    circulatingSupply: string;
    allocation: Array<{
      category: string;
      percentage: number;
      amount: string;
      vesting?: string;
    }>;
  };
  team: Array<{
    name: string;
    role: string;
    background: string;
  }>;
  investors: Array<{
    name: string;
    type: 'vc' | 'angel' | 'strategic';
    amount?: string;
    round?: string;
  }>;
  technology: {
    consensus: string;
    tps: string;
    blockTime: string;
    features: string[];
  };
  risks: string[];
  opportunities: string[];
}

const ProjectChainAnalysis = () => {
  const [selectedProject, setSelectedProject] = useState<string | null>(null);

  const projects: Record<string, ProjectData> = {
    'risechain': {
      name: 'RiseChain',
      symbol: 'RISE',
      description: 'A high-performance blockchain focused on scalability and developer experience with EVM compatibility.',
      status: 'testnet',
      category: 'Layer 1 Blockchain',
      marketCap: 'TBD',
      tvl: '$2.5M (Testnet)',
      tokenomics: {
        totalSupply: '1,000,000,000 RISE',
        circulatingSupply: '100,000,000 RISE',
        allocation: [
          { category: 'Community & Ecosystem', percentage: 40, amount: '400M RISE', vesting: '4 years linear' },
          { category: 'Team & Advisors', percentage: 20, amount: '200M RISE', vesting: '4 years with 1 year cliff' },
          { category: 'Private Sale', percentage: 15, amount: '150M RISE', vesting: '2 years linear' },
          { category: 'Public Sale', percentage: 10, amount: '100M RISE', vesting: 'Immediate' },
          { category: 'Foundation Reserve', percentage: 15, amount: '150M RISE', vesting: '5 years linear' }
        ]
      },
      team: [
        { name: 'Alex Chen', role: 'CEO & Co-founder', background: 'Former Ethereum Core Developer, 8 years blockchain experience' },
        { name: 'Sarah Kim', role: 'CTO', background: 'Ex-Google Senior Engineer, distributed systems expert' },
        { name: 'Marcus Rodriguez', role: 'Head of Research', background: 'PhD in Cryptography, former Consensys researcher' }
      ],
      investors: [
        { name: 'Binance Labs', type: 'vc', amount: '$5M', round: 'Series A' },
        { name: 'Coinbase Ventures', type: 'vc', amount: '$3M', round: 'Series A' },
        { name: 'Polychain Capital', type: 'vc', amount: '$2M', round: 'Seed' },
        { name: 'Vitalik Buterin', type: 'angel', amount: 'Undisclosed', round: 'Seed' }
      ],
      technology: {
        consensus: 'Proof of Stake',
        tps: '10,000+ TPS',
        blockTime: '2 seconds',
        features: ['EVM Compatible', 'Fast Finality', 'Low Gas Fees', 'MEV Protection']
      },
      risks: [
        'Early testnet stage with limited battle testing',
        'High competition in Layer 1 space',
        'Team concentration risk',
        'Regulatory uncertainty'
      ],
      opportunities: [
        'Strong technical team with proven track record',
        'Growing developer ecosystem',
        'Significant VC backing',
        'Innovative MEV protection features'
      ]
    },
    'pharos': {
      name: 'Pharos Network',
      symbol: 'PHAR',
      description: 'A privacy-focused blockchain network designed for secure and anonymous transactions with zero-knowledge proofs.',
      status: 'testnet',
      category: 'Privacy Blockchain',
      marketCap: 'TBD',
      tvl: '$1.8M (Testnet)',
      tokenomics: {
        totalSupply: '500,000,000 PHAR',
        circulatingSupply: '50,000,000 PHAR',
        allocation: [
          { category: 'Mining Rewards', percentage: 45, amount: '225M PHAR', vesting: '10 years emission' },
          { category: 'Team & Development', percentage: 20, amount: '100M PHAR', vesting: '5 years with 1 year cliff' },
          { category: 'Community & Grants', percentage: 20, amount: '100M PHAR', vesting: '3 years linear' },
          { category: 'Private Sale', percentage: 10, amount: '50M PHAR', vesting: '2 years linear' },
          { category: 'Foundation', percentage: 5, amount: '25M PHAR', vesting: '4 years linear' }
        ]
      },
      team: [
        { name: 'Dr. Elena Vasquez', role: 'Founder & CEO', background: 'Former NSA cryptographer, 15 years in privacy tech' },
        { name: 'Ivan Petrov', role: 'Lead Developer', background: 'Core contributor to Zcash, cryptography expert' },
        { name: 'Rachel Wong', role: 'Head of Partnerships', background: 'Former ConsenSys BD, extensive DeFi network' }
      ],
      investors: [
        { name: 'a16z Crypto', type: 'vc', amount: '$8M', round: 'Series A' },
        { name: 'Electric Capital', type: 'vc', amount: '$4M', round: 'Series A' },
        { name: 'Naval Ravikant', type: 'angel', amount: 'Undisclosed', round: 'Seed' },
        { name: 'Placeholder VC', type: 'vc', amount: '$2M', round: 'Seed' }
      ],
      technology: {
        consensus: 'Proof of Work (Privacy-Enhanced)',
        tps: '1,000 TPS',
        blockTime: '5 seconds',
        features: ['Zero-Knowledge Proofs', 'Anonymous Transactions', 'Private Smart Contracts', 'Selective Disclosure']
      },
      risks: [
        'Regulatory scrutiny on privacy coins',
        'Technical complexity of ZK implementations',
        'Limited liquidity in early stages',
        'Potential network adoption challenges'
      ],
      opportunities: [
        'Growing demand for financial privacy',
        'Strong cryptographic foundations',
        'Tier-1 VC backing',
        'Experienced privacy tech team'
      ]
    },
    'megaeth': {
      name: 'MegaETH',
      symbol: 'METH',
      description: 'Ultra-high performance Ethereum Layer 2 solution focused on real-time applications and gaming.',
      status: 'testnet',
      category: 'Layer 2 Scaling',
      marketCap: 'TBD',
      tvl: '$12M (Testnet)',
      tokenomics: {
        totalSupply: '10,000,000,000 METH',
        circulatingSupply: '1,000,000,000 METH',
        allocation: [
          { category: 'Ecosystem & Rewards', percentage: 50, amount: '5B METH', vesting: '8 years emission' },
          { category: 'Team & Advisors', percentage: 20, amount: '2B METH', vesting: '4 years with 1 year cliff' },
          { category: 'Investors', percentage: 15, amount: '1.5B METH', vesting: '3 years with 6 month cliff' },
          { category: 'Foundation', percentage: 10, amount: '1B METH', vesting: '5 years linear' },
          { category: 'Public Sale', percentage: 5, amount: '500M METH', vesting: 'Immediate' }
        ]
      },
      team: [
        { name: 'David Park', role: 'CEO', background: 'Former Polygon co-founder, scaling solutions expert' },
        { name: 'Maria Santos', role: 'CTO', background: 'Ex-Arbitrum core developer, rollup technology specialist' },
        { name: 'James Liu', role: 'Head of Gaming', background: 'Former Unity Technologies, blockchain gaming pioneer' }
      ],
      investors: [
        { name: 'Paradigm', type: 'vc', amount: '$15M', round: 'Series A' },
        { name: 'Sequoia Capital', type: 'vc', amount: '$10M', round: 'Series A' },
        { name: 'Uniswap Labs Ventures', type: 'strategic', amount: '$5M', round: 'Strategic' },
        { name: 'Mark Cuban', type: 'angel', amount: '$1M', round: 'Angel' }
      ],
      technology: {
        consensus: 'Optimistic Rollup',
        tps: '100,000+ TPS',
        blockTime: '100ms',
        features: ['Ultra-Low Latency', 'Gaming Optimized', 'MEV Protection', 'Ethereum Security']
      },
      risks: [
        'High competition in L2 space',
        'Gaming adoption uncertainty',
        'Technical challenges at scale',
        'Ethereum dependency risks'
      ],
      opportunities: [
        'Massive gaming market opportunity',
        'Technical performance advantages',
        'Strong institutional backing',
        'Experienced scaling team'
      ]
    }
  };

  const projectButtons = [
    { key: 'risechain', name: 'RiseChain', color: 'bg-blue-500' },
    { key: 'pharos', name: 'Pharos Network', color: 'bg-purple-500' },
    { key: 'megaeth', name: 'MegaETH', color: 'bg-green-500' },
    { key: 'nexus', name: 'Nexus Testnet', color: 'bg-orange-500' },
    { key: 'zerog', name: '0G Network', color: 'bg-cyan-500' },
    { key: 'somnia', name: 'Somnia Testnet', color: 'bg-pink-500' }
  ];

  const renderProjectDetail = (project: ProjectData) => (
    <ScrollArea className="h-[450px] w-full">
      <div className="space-y-4 p-1">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white">{project.name}</h3>
            <Badge variant="outline" className={`
              ${project.status === 'mainnet' ? 'border-green-500 text-green-400' :
                project.status === 'testnet' ? 'border-yellow-500 text-yellow-400' :
                'border-blue-500 text-blue-400'}
            `}>
              {project.status.toUpperCase()}
            </Badge>
          </div>
          <p className="text-sm text-slate-300">{project.description}</p>
          <Badge variant="secondary" className="bg-slate-800 text-slate-300">
            {project.category}
          </Badge>
        </div>

        <Separator className="bg-slate-700" />

        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-3">
              <div className="flex items-center space-x-2">
                <DollarSign className="h-4 w-4 text-green-400" />
                <div>
                  <p className="text-xs text-slate-400">Market Cap</p>
                  <p className="text-sm font-semibold text-white">{project.marketCap}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-3">
              <div className="flex items-center space-x-2">
                <Zap className="h-4 w-4 text-blue-400" />
                <div>
                  <p className="text-xs text-slate-400">TVL</p>
                  <p className="text-sm font-semibold text-white">{project.tvl}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Technology */}
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-white flex items-center">
            <Zap className="h-4 w-4 mr-2 text-blue-400" />
            Technology
          </h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-slate-400">Consensus:</span>
              <span className="text-white ml-1">{project.technology.consensus}</span>
            </div>
            <div>
              <span className="text-slate-400">TPS:</span>
              <span className="text-white ml-1">{project.technology.tps}</span>
            </div>
            <div>
              <span className="text-slate-400">Block Time:</span>
              <span className="text-white ml-1">{project.technology.blockTime}</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-1 mt-2">
            {project.technology.features.map((feature, idx) => (
              <Badge key={idx} variant="outline" className="text-xs border-slate-600 text-slate-300">
                {feature}
              </Badge>
            ))}
          </div>
        </div>

        <Separator className="bg-slate-700" />

        {/* Tokenomics */}
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-white flex items-center">
            <Coins className="h-4 w-4 mr-2 text-yellow-400" />
            Tokenomics
          </h4>
          <div className="text-xs space-y-1">
            <div>
              <span className="text-slate-400">Total Supply:</span>
              <span className="text-white ml-1">{project.tokenomics.totalSupply}</span>
            </div>
            <div>
              <span className="text-slate-400">Circulating:</span>
              <span className="text-white ml-1">{project.tokenomics.circulatingSupply}</span>
            </div>
          </div>
          <div className="space-y-1">
            {project.tokenomics.allocation.map((alloc, idx) => (
              <div key={idx} className="flex justify-between items-center text-xs">
                <span className="text-slate-300">{alloc.category}</span>
                <span className="text-white font-semibold">{alloc.percentage}%</span>
              </div>
            ))}
          </div>
        </div>

        <Separator className="bg-slate-700" />

        {/* Team */}
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-white flex items-center">
            <Users className="h-4 w-4 mr-2 text-green-400" />
            Key Team
          </h4>
          <div className="space-y-2">
            {project.team.slice(0, 3).map((member, idx) => (
              <div key={idx} className="text-xs">
                <div className="font-semibold text-white">{member.name} - {member.role}</div>
                <div className="text-slate-400">{member.background}</div>
              </div>
            ))}
          </div>
        </div>

        <Separator className="bg-slate-700" />

        {/* Investors */}
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-white flex items-center">
            <Building className="h-4 w-4 mr-2 text-purple-400" />
            Key Investors
          </h4>
          <div className="space-y-1">
            {project.investors.map((investor, idx) => (
              <div key={idx} className="flex justify-between items-center text-xs">
                <span className="text-slate-300">{investor.name}</span>
                <div className="text-right">
                  <div className="text-white font-semibold">{investor.amount}</div>
                  <div className="text-slate-400">{investor.round}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <Separator className="bg-slate-700" />

        {/* Risk Analysis */}
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-white flex items-center">
            <Shield className="h-4 w-4 mr-2 text-red-400" />
            Risks & Opportunities
          </h4>
          <div className="space-y-2">
            <div>
              <p className="text-xs font-semibold text-red-400 mb-1">Risks:</p>
              <ul className="text-xs text-slate-300 space-y-1">
                {project.risks.map((risk, idx) => (
                  <li key={idx} className="flex items-start">
                    <span className="text-red-400 mr-1">•</span>
                    {risk}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs font-semibold text-green-400 mb-1">Opportunities:</p>
              <ul className="text-xs text-slate-300 space-y-1">
                {project.opportunities.map((opp, idx) => (
                  <li key={idx} className="flex items-start">
                    <span className="text-green-400 mr-1">•</span>
                    {opp}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </ScrollArea>
  );

  return (
    <div className="space-y-4 h-full flex flex-col">
      {!selectedProject ? (
        <>
          <div className="text-center space-y-2">
            <h3 className="text-lg font-bold text-white">Project Chain Analysis</h3>
            <p className="text-sm text-slate-400">
              Get comprehensive insights on blockchain projects, tokenomics, teams, and investment details.
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-2 flex-1">
            {projectButtons.map((project) => (
              <Button
                key={project.key}
                variant="outline"
                className={`h-20 border-slate-600 text-white hover:bg-slate-800 flex flex-col space-y-1 ${
                  projects[project.key] ? 'hover:border-emerald-500' : 'opacity-50 cursor-not-allowed'
                }`}
                onClick={() => projects[project.key] && setSelectedProject(project.key)}
                disabled={!projects[project.key]}
              >
                <div className={`h-3 w-3 rounded-full ${project.color}`} />
                <span className="text-xs font-medium">{project.name}</span>
                {projects[project.key] && (
                  <Badge variant="outline" className="text-xs border-green-500/50 text-green-400">
                    Available
                  </Badge>
                )}
              </Button>
            ))}
          </div>
          
          <div className="text-center">
            <Badge variant="outline" className="border-blue-500/50 text-blue-400">
              AI-Powered Analysis • Real-time Data
            </Badge>
          </div>
        </>
      ) : (
        <div className="space-y-2 h-full flex flex-col">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedProject(null)}
              className="text-slate-400 hover:text-white"
            >
              ← Back to Projects
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-slate-400 hover:text-white"
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex-1 overflow-hidden">
            {renderProjectDetail(projects[selectedProject])}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectChainAnalysis;
