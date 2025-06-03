
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { config } from './config/environment';
import { logger } from './utils/logger';
import { databaseService } from './services/DatabaseService';

// Import route handlers
import authRoutes from './routes/authRoutes';
import chainRoutes from './routes/chainRoutes';
import bridgeRoutes from './routes/bridgeRoutes';
import swapRoutes from './routes/swapRoutes';
import enterpriseRoutes from './routes/enterpriseRoutes';

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: config.cors.origin,
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// Body parsing middleware
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
app.use((req, res, next) => {
  logger.info('HTTP Request', {
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });
  next();
});

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    const dbHealth = await databaseService.healthCheck();
    
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      services: {
        database: dbHealth ? 'healthy' : 'unhealthy',
        api: 'healthy'
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// API routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/chains', chainRoutes);
app.use('/api/v1/bridge', bridgeRoutes);
app.use('/api/v1/swap', swapRoutes);
app.use('/api/v1/enterprise', enterpriseRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    path: req.originalUrl
  });
});

// Global error handler
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Unhandled error', {
    error: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method
  });

  res.status(error.status || 500).json({
    success: false,
    error: config.node.env === 'production' ? 'Internal server error' : error.message,
    ...(config.node.env !== 'production' && { stack: error.stack })
  });
});

const PORT = config.server.port || 3000;

// Initialize database and start server
async function startServer() {
  try {
    await databaseService.initialize();
    
    app.listen(PORT, () => {
      logger.info(`SCRYPTEX Backend Phase 4 server running on port ${PORT}`);
      logger.info(`Environment: ${config.node.env}`);
      logger.info('Multi-Chain DEX Swap Platform with Point Rewards - Ready');
    });
  } catch (error) {
    logger.error('Failed to start server', {
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully');
  await databaseService.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully');
  await databaseService.close();
  process.exit(0);
});

startServer();

export default app;
