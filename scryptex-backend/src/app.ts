
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

import { config } from '@/config/config';
import { logger } from '@/utils/logger';
import { errorHandler } from '@/middleware/errorHandler';
import { authMiddleware } from '@/middleware/auth';
import { requestLogger } from '@/middleware/requestLogger';

// Import routes
import authRoutes from '@/routes/auth';
import chainRoutes from '@/routes/chains';
import deployRoutes from '@/routes/deploy';
import swapRoutes from '@/routes/swap';
import gmRoutes from '@/routes/gm';
import analyticsRoutes from '@/routes/analytics';
import userRoutes from '@/routes/user';
import adminRoutes from '@/routes/admin';
import healthRoutes from '@/routes/health';

const app = express();

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'SCRYPTEX API',
      version: '1.0.0',
      description: 'Multi-Chain Airdrop Farming Platform API',
    },
    servers: [
      {
        url: `http://localhost:${config.port}/api/${config.apiVersion}`,
        description: 'Development server',
      },
    ],
  },
  apis: ['./src/routes/*.ts', './src/controllers/*.ts'],
};

const specs = swaggerJsdoc(swaggerOptions);

// Rate limiting
const limiter = rateLimit({
  windowMs: config.rateLimitWindowMs,
  max: config.rateLimitMaxRequests,
  message: {
    error: 'Too many requests from this IP, please try again later.',
  },
});

// Middleware
app.use(helmet());
app.use(cors({
  origin: config.corsOrigin,
  credentials: true,
}));
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined', { stream: { write: (message) => logger.info(message.trim()) } }));
app.use(requestLogger);
app.use(limiter);

// API Documentation
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(specs));

// Health check
app.use('/health', healthRoutes);

// API Routes
app.use(`/api/${config.apiVersion}/auth`, authRoutes);
app.use(`/api/${config.apiVersion}/chains`, authMiddleware, chainRoutes);
app.use(`/api/${config.apiVersion}/deploy`, authMiddleware, deployRoutes);
app.use(`/api/${config.apiVersion}/swap`, authMiddleware, swapRoutes);
app.use(`/api/${config.apiVersion}/gm`, authMiddleware, gmRoutes);
app.use(`/api/${config.apiVersion}/analytics`, authMiddleware, analyticsRoutes);
app.use(`/api/${config.apiVersion}/user`, authMiddleware, userRoutes);
app.use(`/api/${config.apiVersion}/admin`, authMiddleware, adminRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: 'Endpoint not found',
    },
  });
});

// Error handling middleware
app.use(errorHandler);

// Start server
const PORT = config.port || 3000;

app.listen(PORT, () => {
  logger.info(`🚀 SCRYPTEX Backend server running on port ${PORT}`);
  logger.info(`📚 API Documentation available at http://localhost:${PORT}/api/docs`);
  logger.info(`🏥 Health check available at http://localhost:${PORT}/health`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT signal received: closing HTTP server');
  process.exit(0);
});

export default app;
