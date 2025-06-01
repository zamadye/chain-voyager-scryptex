
# SCRYPTEX - Multichain DEX Platform

A comprehensive decentralized exchange (DEX) platform supporting multiple blockchain networks with AI-powered analysis, points system, referrals, and advanced trading features.

## 🚀 Project Overview

SCRYPTEX is a next-generation multichain DEX that combines traditional DeFi functionality with modern gamification elements, AI analysis, and comprehensive user engagement features.

### ✨ Key Features

#### Core Trading Features
- **Multichain Swap**: Trade tokens across multiple blockchain networks
- **Cross-Chain Bridge**: Seamlessly transfer assets between different chains
- **Token Creation**: Deploy custom tokens with built-in templates
- **Contract Deployment**: Deploy smart contracts across supported networks
- **Real-time Analytics**: Comprehensive trading statistics and performance metrics

#### AI-Powered Features
- **Floating AI Analyzer**: Real-time market analysis and project evaluation
- **Project Analysis**: Automated website and project assessment
- **Market Intelligence**: Live crypto market data and trends
- **News Integration**: Latest crypto market news and updates

#### Gamification & Rewards
- **Points System (STEX)**: Earn points for platform activities
- **Daily Tasks**: Complete challenges for bonus rewards
- **Streak System**: Maintain daily activity for multiplied rewards
- **Leaderboards**: Compete with other users for top rankings
- **Referral Program**: Invite friends and earn commissions

#### User Experience
- **Wallet Integration**: Connect with popular Web3 wallets
- **Chain Status Monitoring**: Real-time blockchain health indicators
- **Gas Optimization**: Smart gas estimation and optimization
- **Mobile Responsive**: Fully optimized for mobile devices

## 🔗 Supported Blockchain Networks

- **Ethereum Sepolia** - Testnet
- **Nexus Network** - EVM Compatible
- **0G Network (Galileo)** - High Performance
- **Somnia Shannon** - Gaming Focused
- **Aztec Testnet** - Privacy Layer
- **RiseChain** - Scalable Solution
- **R2 Testnet** - Layer 2
- **Pharos Network** - Developer Friendly
- **MegaETH** - High Throughput

## 🛠️ Technology Stack

### Frontend
- **React 18** - Modern React with hooks
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and development server
- **Tailwind CSS** - Utility-first styling
- **shadcn/ui** - Modern component library
- **Zustand** - State management
- **React Router** - Client-side routing

### Blockchain Integration
- **Wagmi** - React hooks for Ethereum
- **Viem** - TypeScript interface for Ethereum
- **RainbowKit** - Wallet connection interface
- **Web3 Modules** - Custom chain integrations

### Backend & Database
- **Supabase** - Backend as a Service
- **PostgreSQL** - Relational database
- **Row Level Security** - Data protection
- **Real-time subscriptions** - Live data updates
- **Edge Functions** - Serverless backend logic

### Additional Libraries
- **Recharts** - Data visualization
- **Lucide React** - Icon library
- **React Hook Form** - Form management
- **Zod** - Schema validation
- **date-fns** - Date manipulation

## 📊 Database Schema

### Core Tables
- **profiles** - User profile information
- **user_points** - Points and streak tracking
- **referrals** - Referral system management
- **user_activities** - Activity history logging
- **daily_tasks** - Gamification tasks

### Key Features
- **Row Level Security (RLS)** - Secure data access
- **Automatic triggers** - User registration handling
- **Database functions** - Point awarding system
- **Real-time updates** - Live data synchronization

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Git for version control
- Modern web browser with Web3 support

### Installation

1. **Clone the repository**
```bash
git clone <YOUR_GIT_URL>
cd scryptex-multichain-dex
```

2. **Install dependencies**
```bash
npm install
```

3. **Environment Setup**
```bash
cp .env.example .env.local
# Add your environment variables
```

4. **Start development server**
```bash
npm run dev
```

5. **Open your browser**
Navigate to `http://localhost:3000`

## 🔧 Environment Variables

Create a `.env.local` file with the following variables:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://mltbykgyncoxqyqwosyb.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Blockchain RPC URLs
VITE_ETHEREUM_SEPOLIA_RPC=https://sepolia.infura.io/v3/YOUR_PROJECT_ID
VITE_NEXUS_RPC=https://evm-rpc.nexus.xyz
VITE_ZEROXG_GALILEO_RPC=https://evmrpc-testnet.0g.ai
VITE_SOMNIA_SHANNON_RPC=https://testnet.somnia.network
VITE_AZTEC_TESTNET_RPC=https://rpc.aztec.network
VITE_RISECHAIN_RPC=https://rpc.testnet.risechain.io
VITE_R2_TESTNET_RPC=https://rpc.testnet.r2.co
VITE_PHAROS_RPC=https://rpc.testnet.pharos.sh
VITE_MEGAETH_RPC=https://rpc.testnet.megaeth.org

# External APIs (Optional)
VITE_COINGECKO_API_KEY=your_coingecko_key
VITE_DEXSCREENER_API=https://api.dexscreener.com/latest
```

## 📱 Application Structure

```
src/
├── components/          # Reusable UI components
│   ├── ai/             # AI analysis components
│   ├── create/         # Token creation interface
│   ├── dashboard/      # Analytics dashboard
│   ├── layout/         # App layout components
│   ├── navigation/     # Navigation components
│   ├── trading/        # Swap and trading UI
│   └── ui/             # Base UI components
├── hooks/              # Custom React hooks
├── lib/                # Utility libraries
│   ├── chain-modules/  # Blockchain integrations
│   └── web3-config.ts  # Web3 configuration
├── pages/              # Page components
├── stores/             # State management
├── types/              # TypeScript definitions
└── integrations/       # Third-party integrations
    └── supabase/       # Database integration
```

## 🎮 User Journey & Features

### 1. Onboarding
- Connect Web3 wallet
- Automatic profile creation
- Initial points allocation
- Referral code generation

### 2. Trading Activities
- **Token Swaps**: Earn 10 STEX per swap
- **Cross-chain Bridges**: Earn 25 STEX per bridge
- **Token Creation**: Earn 100 STEX per deployment
- **Daily GM**: Earn 10 STEX for daily check-in

### 3. Gamification
- **Daily Tasks**: Complete for bonus rewards
- **Streak Multipliers**: Maintain activity for bonuses
- **Referral Rewards**: Earn from friend activities
- **Leaderboard Ranking**: Compete for top positions

### 4. AI Analysis
- **Project Evaluation**: Analyze DeFi projects
- **Market Intelligence**: Real-time market data
- **News Aggregation**: Latest crypto updates
- **Risk Assessment**: Smart contract analysis

## 🏗️ Backend Integration

### Supabase Features
- **Authentication**: Secure user management
- **Database**: PostgreSQL with RLS
- **Real-time**: Live data synchronization
- **Edge Functions**: Serverless backend logic
- **Storage**: File and media handling

### Key Functions
- `handle_new_user()` - Auto-setup for new users
- `award_points()` - Point allocation system
- `generate_referral_code()` - Referral management

## 📈 Points & Rewards System

### Point Earning Activities
| Activity | Points | Description |
|----------|--------|-------------|
| Daily GM | 10 STEX | Daily check-in ritual |
| Token Swap | 10 STEX | Each successful swap |
| Cross-chain Bridge | 25 STEX | Bridge between chains |
| Token Creation | 100 STEX | Deploy custom token |
| Referral Signup | 50 STEX | Friend joins platform |
| Daily Tasks | Variable | Complete daily challenges |

### Streak System
- **Consecutive Days**: Multiplier bonuses
- **Weekly Milestones**: Special rewards
- **Monthly Achievements**: Exclusive benefits

## 🤝 Referral Program

### How It Works
1. **Generate Code**: Each user gets unique referral code
2. **Share Link**: Invite friends to join platform
3. **Earn Rewards**: Get points for referral activities
4. **Track Progress**: Monitor referral performance

### Referral Rewards
- **Signup Bonus**: 50 STEX when friend joins
- **Activity Commission**: 10% of friend's earned points
- **Milestone Rewards**: Bonuses for multiple referrals

## 🔐 Security Features

### Smart Contract Security
- **Audited Templates**: Pre-verified contract templates
- **Gas Optimization**: Efficient transaction handling
- **Error Prevention**: Comprehensive validation

### Data Security
- **Row Level Security**: Database access control
- **Encrypted Storage**: Secure data handling
- **Real-time Monitoring**: Activity tracking

## 🚀 Deployment

### Development
```bash
npm run dev
```

### Build for Production
```bash
npm run build
```

### Deploy to Lovable
Click the "Publish" button in the Lovable interface

### Custom Domain
Configure custom domains in Project Settings

## 🧪 Testing

### Local Testing
```bash
npm run test
```

### Testnet Usage
- Use testnet tokens for all transactions
- Faucets available for supported networks
- No real value transactions in development

## 📚 API Documentation

### Supabase Integration
- **Profiles API**: User management
- **Points API**: Rewards tracking
- **Referrals API**: Invitation system
- **Activities API**: Action logging

### Blockchain APIs
- **Chain Status**: Network health monitoring
- **Gas Estimation**: Transaction cost calculation
- **Contract Deployment**: Smart contract creation
- **Transaction Tracking**: Operation monitoring

## 🛟 Support & Community

### Getting Help
- **Documentation**: Comprehensive guides
- **Discord Community**: Real-time support
- **GitHub Issues**: Bug reports and features
- **Email Support**: Direct assistance

### Contributing
1. Fork the repository
2. Create feature branch
3. Commit your changes
4. Push to the branch
5. Create Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔮 Roadmap

### Phase 1 (Current)
- ✅ Multichain swap interface
- ✅ Points and referral system
- ✅ AI analysis integration
- ✅ Database integration

### Phase 2 (Next)
- 🔄 Advanced trading features
- 🔄 Liquidity pool creation
- 🔄 NFT marketplace integration
- 🔄 Mobile app development

### Phase 3 (Future)
- 📋 DAO governance system
- 📋 Staking and yield farming
- 📋 Cross-chain liquidity
- 📋 Advanced AI features

## 🏆 Achievements & Metrics

### Platform Statistics
- **Total Users**: Real-time user count
- **Total Transactions**: Cross-chain activity
- **Points Distributed**: STEX token economics
- **Active Chains**: Network utilization

### User Achievements
- **Trading Volume**: Personal statistics
- **Referral Success**: Network building
- **Streak Records**: Consistency rewards
- **Leaderboard Position**: Competitive ranking

---

**Built with ❤️ by the SCRYPTEX Team**

*Empowering the future of decentralized finance through innovation, gamification, and community-driven development.*
