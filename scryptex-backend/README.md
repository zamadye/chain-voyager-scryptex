
# SCRYPTEX Backend - Phase 1

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3+-blue.svg)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-blue.svg)](https://www.postgresql.org/)
[![Redis](https://img.shields.io/badge/Redis-7+-red.svg)](https://redis.io/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A production-ready Node.js backend for SCRYPTEX - a multi-chain DEX and token creation platform. This is Phase 1 implementation focusing on core infrastructure, wallet-based authentication, and foundational architecture.

## 🚀 Features

### Phase 1 - Core Infrastructure
- ✅ **Wallet-based Authentication** with signature verification
- ✅ **Multi-wallet Account Management** (MetaMask, WalletConnect, Coinbase Wallet)
- ✅ **JWT Session Management** with refresh tokens
- ✅ **Scalable Database Architecture** with PostgreSQL and Redis
- ✅ **API Gateway** with rate limiting and security middleware
- ✅ **Comprehensive Logging** with Winston
- ✅ **Health Monitoring** with detailed system checks
- ✅ **API Documentation** with Swagger/OpenAPI 3.0
- ✅ **Docker Containerization** for development and production

### Security Features
- 🔒 **Helmet.js** security headers
- 🔒 **Rate limiting** per IP and user
- 🔒 **Input validation** with Joi schemas
- 🔒 **XSS protection** and input sanitization
- 🔒 **Suspicious activity detection**
- 🔒 **CORS** configuration
- 🔒 **Audit logging** for all user actions

### Developer Experience
- 📝 **TypeScript** with strict type checking
- 📝 **ESLint + Prettier** for code quality
- 📝 **Swagger UI** for API testing
- 📝 **Hot reload** in development
- 📝 **Comprehensive error handling**
- 📝 **Request/response logging**

## 📋 Prerequisites

- **Node.js** 18+ and npm 8+
- **PostgreSQL** 15+
- **Redis** 7+
- **Docker** (optional, for containerized development)

## 🛠️ Quick Start

### 1. Installation

```bash
# Clone the repository
git clone <repository-url>
cd scryptex-backend

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env
```

### 2. Environment Configuration

Edit `.env` file with your configuration:

```bash
# Required configurations
DATABASE_URL=postgresql://username:password@localhost:5432/scryptex_dev
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this-in-production
REDIS_URL=redis://localhost:6379

# Optional configurations
NODE_ENV=development
PORT=3000
LOG_LEVEL=info
```

### 3. Database Setup

```bash
# Create database and run migrations
npm run migrate

# Seed development data (optional)
npm run seed
```

### 4. Start Development Server

```bash
# Start with hot reload
npm run dev

# Or start with Docker Compose
npm run docker:dev
```

### 5. Access the Application

- **API Documentation**: http://localhost:3000/api/docs
- **Health Check**: http://localhost:3000/health
- **API Base URL**: http://localhost:3000/api/v1

## 🐳 Docker Development

### Quick Start with Docker Compose

```bash
# Start all services (PostgreSQL, Redis, App)
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Services Available

- **App**: http://localhost:3000 (Backend API)
- **PostgreSQL**: localhost:5432
- **Redis**: localhost:6379
- **pgAdmin** (dev): http://localhost:8080 (admin@scryptex.com / admin)
- **Redis Commander** (dev): http://localhost:8081

## 📊 API Documentation

### Swagger UI
Visit http://localhost:3000/api/docs for interactive API documentation.

### Authentication Flow

1. **Generate Challenge**
```bash
POST /api/v1/auth/challenge
{
  "walletAddress": "0x742d35Cc6542Cb23C68b68b6B6Bb6B3e1234abcd"
}
```

2. **Sign Challenge** with your wallet (MetaMask, etc.)

3. **Verify Signature**
```bash
POST /api/v1/auth/verify
{
  "walletAddress": "0x742d35Cc6542Cb23C68b68b6B6Bb6B3e1234abcd",
  "signature": "0x...",
  "challenge": "Sign this message to authenticate..."
}
```

4. **Use JWT Token**
```bash
Authorization: Bearer <your-jwt-token>
```

### Core Endpoints

#### Authentication
- `POST /api/v1/auth/challenge` - Generate signature challenge
- `POST /api/v1/auth/verify` - Verify signature and authenticate
- `POST /api/v1/auth/refresh` - Refresh access token
- `POST /api/v1/auth/logout` - Logout user
- `GET /api/v1/auth/profile` - Get user profile
- `PUT /api/v1/auth/profile` - Update user profile

#### Wallet Management
- `GET /api/v1/auth/wallets` - Get connected wallets
- `POST /api/v1/auth/wallets` - Add new wallet
- `DELETE /api/v1/auth/wallets/:address` - Remove wallet
- `PUT /api/v1/auth/wallets/:address/primary` - Set primary wallet

#### Health & Monitoring
- `GET /health` - Basic health check
- `GET /health/detailed` - Detailed system status
- `GET /health/database` - Database status
- `GET /health/redis` - Redis status
- `GET /health/metrics` - Prometheus metrics

## 🗄️ Database Schema

### Core Tables

- **users** - User accounts with referral system
- **user_wallets** - Multi-wallet support per user
- **user_sessions** - JWT session management
- **audit_logs** - Comprehensive audit trail
- **user_preferences** - Extensible user settings

### Key Features

- **UUID primary keys** for better scalability
- **Automatic referral code generation**
- **Audit triggers** for all data changes
- **Optimized indexes** for performance
- **Row Level Security** ready for multi-tenancy

## 📈 Monitoring & Health Checks

### Health Endpoints

```bash
# Basic health check
curl http://localhost:3000/health

# Detailed system status
curl http://localhost:3000/health/detailed

# Database specific check
curl http://localhost:3000/health/database

# Redis specific check
curl http://localhost:3000/health/redis

# Prometheus metrics
curl http://localhost:3000/health/metrics
```

### Logging

The application uses structured logging with different levels:

- **error** - System errors and exceptions
- **warn** - Warning conditions and rate limits
- **info** - General operational messages
- **debug** - Detailed debugging information

Logs are written to:
- Console (development)
- `logs/app.log` (all logs)
- `logs/error.log` (error logs only)

## 🔧 Development Scripts

```bash
# Development
npm run dev              # Start with hot reload
npm run build            # Build for production
npm run start            # Start production server

# Code Quality
npm run lint             # Run ESLint
npm run lint:check       # Check without fixing
npm run format           # Format with Prettier
npm run typecheck        # TypeScript type checking

# Testing
npm test                 # Run tests
npm run test:watch       # Run tests in watch mode
npm run test:coverage    # Run tests with coverage

# Database
npm run migrate          # Run database migrations
npm run migrate:rollback # Rollback last migration
npm run seed             # Seed development data
npm run db:reset         # Reset and reseed database

# Docker
npm run docker:build     # Build Docker image
npm run docker:run       # Run Docker container
npm run docker:dev       # Start development environment
npm run docker:down      # Stop development environment

# Utilities
npm run clean            # Clean build artifacts
npm run health:check     # Check application health
```

## 🏗️ Project Structure

```
scryptex-backend/
├── src/
│   ├── config/           # Configuration management
│   │   ├── environment.ts
│   │   └── database.ts
│   ├── controllers/      # API route controllers
│   │   ├── AuthController.ts
│   │   └── HealthController.ts
│   ├── middleware/       # Express middleware
│   │   ├── authMiddleware.ts
│   │   ├── validation.ts
│   │   ├── security.ts
│   │   └── errorHandler.ts
│   ├── services/         # Business logic services
│   │   ├── AuthService.ts
│   │   ├── UserService.ts
│   │   ├── DatabaseService.ts
│   │   └── RedisService.ts
│   ├── routes/           # API route definitions
│   │   ├── authRoutes.ts
│   │   └── healthRoutes.ts
│   ├── types/            # TypeScript type definitions
│   │   ├── auth.ts
│   │   └── config.ts
│   ├── utils/            # Utility functions
│   │   └── logger.ts
│   ├── validators/       # Request validation schemas
│   │   └── authValidators.ts
│   └── app.ts           # Express application setup
├── migrations/          # Database migration files
├── tests/              # Test files
├── logs/               # Application logs
├── uploads/            # File uploads
├── docker-compose.yml  # Docker services
├── Dockerfile         # Container definition
└── package.json       # Dependencies and scripts
```

## 🔐 Security Considerations

### Production Checklist

- [ ] Change all default passwords and secrets
- [ ] Use environment-specific JWT secrets (min 64 characters)
- [ ] Enable database SSL in production
- [ ] Configure proper CORS origins
- [ ] Set up proper rate limiting values
- [ ] Enable request size limits
- [ ] Configure proper logging levels
- [ ] Set up monitoring and alerts
- [ ] Use HTTPS in production
- [ ] Configure proper backup strategy

### Environment-Specific Configuration

```bash
# Development
NODE_ENV=development
LOG_LEVEL=debug
ENABLE_SWAGGER=true

# Production
NODE_ENV=production
LOG_LEVEL=warn
ENABLE_SWAGGER=false
DATABASE_SSL=true
```

## 🚦 Rate Limiting

Different endpoints have different rate limits:

- **General API**: 100 requests per 15 minutes
- **Authentication**: 5 attempts per 15 minutes
- **Challenge Generation**: 3 requests per 5 minutes
- **User-specific**: 60 requests per minute (authenticated users)

## 🎯 Phase 2+ Roadmap

The architecture is designed to support future phases:

### Phase 2 - Blockchain Integration
- Multi-chain wallet support
- Blockchain transaction monitoring
- Smart contract interaction
- Token creation and management

### Phase 3 - DEX Functionality
- Trading pair management
- Order book implementation
- Liquidity pool integration
- Price oracle services

### Phase 4 - Social Features
- User interactions and follows
- GM streak tracking
- Point systems and rewards
- Community features

### Phase 5 - Advanced Analytics
- Trading analytics
- AI-powered insights
- Performance metrics
- Market analysis

### Phase 6 - Enterprise Features
- Advanced admin dashboard
- Multi-tenant support
- Enterprise authentication
- Compliance reporting

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript strict mode
- Write comprehensive tests
- Update documentation
- Follow conventional commit messages
- Ensure all checks pass

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: http://localhost:3000/api/docs
- **Health Checks**: http://localhost:3000/health
- **Issues**: Create an issue in the repository
- **Email**: support@scryptex.com

## 🏆 Acknowledgments

- **Express.js** - Fast, unopinionated web framework
- **TypeScript** - Typed JavaScript at scale
- **PostgreSQL** - Advanced open-source database
- **Redis** - In-memory data structure store
- **JWT** - JSON Web Token implementation
- **Ethers.js** - Ethereum wallet implementation
- **Winston** - Universal logging library
- **Swagger** - API documentation framework

---

**SCRYPTEX Team** - Building the future of decentralized finance 🚀
