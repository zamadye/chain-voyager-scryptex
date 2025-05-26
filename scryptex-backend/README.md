
# SCRYPTEX Backend

A comprehensive backend system for the SCRYPTEX multi-chain airdrop farming platform.

## Features

- 🔐 Wallet-based authentication with signature verification
- ⛓️ Multi-chain blockchain integration
- 📊 Real-time analytics and metrics
- 🚀 Contract deployment across multiple chains
- 💱 Cross-chain swap functionality
- 📈 GM posting and streak tracking
- 🔄 Background job processing
- 📝 Comprehensive API documentation
- 🛡️ Security-first approach
- 📦 Docker containerization

## Tech Stack

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL with Prisma ORM
- **Cache**: Redis
- **Queue**: Bull Queue
- **Authentication**: JWT with wallet signatures
- **Web3**: Viem for blockchain interactions
- **Validation**: Zod
- **Logging**: Winston
- **Documentation**: Swagger/OpenAPI

## Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL 15+
- Redis 7+
- Docker (optional)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd scryptex-backend
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Set up the database:
```bash
npm run db:generate
npm run db:push
npm run db:seed
```

5. Start development server:
```bash
npm run dev
```

### Docker Setup

1. Start with Docker Compose:
```bash
docker-compose up -d
```

2. Run database migrations:
```bash
docker-compose exec app npm run db:push
```

## API Documentation

Once the server is running, visit:
- API Documentation: http://localhost:3000/api/docs
- Health Check: http://localhost:3000/health

## Project Structure

```
src/
├── controllers/          # Route controllers
├── services/            # Business logic services
├── middleware/          # Custom middleware
├── routes/              # API route definitions
├── jobs/                # Background job processors
├── utils/               # Utility functions
├── config/              # Configuration files
├── validators/          # Request validators
├── types/               # TypeScript definitions
└── app.ts               # Application entry point
```

## Environment Variables

Key environment variables to configure:

```bash
# Application
NODE_ENV=development
PORT=3000

# Database
DATABASE_URL=postgresql://username:password@localhost:5432/scryptex_db

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-refresh-secret

# Blockchain RPCs
NEXUS_RPC=https://evm-rpc.nexus.xyz
ZEROXG_GALILEO_RPC=https://evmrpc-testnet.0g.ai
# ... (add other chain RPCs)
```

## API Endpoints

### Authentication
- `POST /api/v1/auth/connect-wallet` - Connect wallet and get nonce
- `POST /api/v1/auth/verify-signature` - Verify signature and authenticate
- `POST /api/v1/auth/refresh-token` - Refresh access token
- `POST /api/v1/auth/logout` - Logout user

### Chains
- `GET /api/v1/chains` - Get all supported chains
- `GET /api/v1/chains/:chainId` - Get chain details
- `GET /api/v1/chains/:chainId/status` - Get chain status

### Deployment
- `GET /api/v1/deploy/templates` - Get contract templates
- `POST /api/v1/deploy/execute` - Deploy contract
- `GET /api/v1/deploy/history` - Get deployment history

### Analytics
- `GET /api/v1/analytics/overview` - Get analytics overview
- `GET /api/v1/analytics/qualification-score` - Get qualification score

## Development

### Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm test             # Run tests
npm run db:generate  # Generate Prisma client
npm run db:push      # Push database schema
npm run db:migrate   # Run migrations
npm run db:seed      # Seed database
```

### Testing

```bash
npm test             # Run all tests
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Run tests with coverage
```

## Deployment

### Production Build

```bash
npm run build
npm start
```

### Docker Deployment

```bash
docker build -t scryptex-backend .
docker run -p 3000:3000 scryptex-backend
```

## Monitoring

The application includes:
- Health check endpoints
- Prometheus metrics
- Structured logging with Winston
- Request/response logging
- Error tracking

## Security

- JWT-based authentication
- Wallet signature verification
- Rate limiting
- Input validation with Zod
- CORS configuration
- Security headers with Helmet
- SQL injection prevention with Prisma

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Run linting and tests
6. Submit a pull request

## License

This project is licensed under the MIT License.
