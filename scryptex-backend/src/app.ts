
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

import { config } from './config/environment';
import { logger, loggers } from './utils/logger';
import { databaseService } from './services/DatabaseService';
import { redisService } from './services/RedisService';

// Middleware imports
import { 
  securityHeaders, 
  generalRateLimit, 
  requestId, 
  apiSecurityHeaders,
  sanitizeInput,
  suspiciousActivityDetection,
  corsHandler
} from './middleware/security';

// Route imports
import authRoutes from './routes/authRoutes';
import healthRoutes from './routes/healthRoutes';

// Error handling
import { errorHandler } from './middleware/errorHandler';

class ScryptexApp {
  public app: express.Application;

  constructor() {
    this.app = express();
    this.initializeServices();
    this.initializeSwagger();
    this.initializeMiddleware();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  private async initializeServices(): Promise<void> {
    try {
      // Initialize database connection
      await databaseService.initialize();
      logger.info('Database service initialized');

      // Initialize Redis connection
      await redisService.initialize();
      logger.info('Redis service initialized');

    } catch (error) {
      logger.error('Failed to initialize services', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      process.exit(1);
    }
  }

  private initializeSwagger(): void {
    const swaggerOptions = {
      definition: {
        openapi: '3.0.0',
        info: {
          title: 'SCRYPTEX API',
          version: '1.0.0',
          description: `
            SCRYPTEX Multi-Chain DEX and Token Creation Platform API
            
            This API provides wallet-based authentication, user management, and core infrastructure
            for a multi-chain decentralized exchange and token creation platform.
            
            ## Authentication
            
            This API uses wallet signature-based authentication:
            1. Generate a challenge using \`POST /auth/challenge\`
            2. Sign the challenge with your wallet
            3. Verify the signature using \`POST /auth/verify\`
            4. Use the returned JWT token in the Authorization header: \`Bearer <token>\`
            
            ## Rate Limiting
            
            - General API: 100 requests per 15 minutes
            - Authentication endpoints: 5 attempts per 15 minutes
            - Challenge generation: 3 requests per 5 minutes
            
            ## Error Handling
            
            All endpoints return consistent error responses:
            \`\`\`json
            {
              "success": false,
              "error": "Error message",
              "details": [...] // Optional validation details
            }
            \`\`\`
          `,
          contact: {
            name: 'SCRYPTEX Support',
            email: 'support@scryptex.com'
          },
          license: {
            name: 'MIT',
            url: 'https://opensource.org/licenses/MIT'
          }
        },
        servers: [
          {
            url: `http://localhost:${config.port}/api/v1`,
            description: 'Development server'
          },
          {
            url: 'https://api.scryptex.com/v1',
            description: 'Production server'
          }
        ],
        components: {
          securitySchemes: {
            bearerAuth: {
              type: 'http',
              scheme: 'bearer',
              bearerFormat: 'JWT',
              description: 'JWT token obtained from wallet signature verification'
            }
          }
        }
      },
      apis: [
        './src/routes/*.ts',
        './src/controllers/*.ts',
        './src/types/*.ts'
      ],
    };

    const specs = swaggerJsdoc(swaggerOptions);
    
    this.app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(specs, {
      explorer: true,
      swaggerOptions: {
        docExpansion: 'none',
        filter: true,
        showRequestDuration: true,
        tryItOutEnabled: true
      },
      customCss: '.swagger-ui .topbar { display: none }',
      customSiteTitle: 'SCRYPTEX API Documentation'
    }));

    // Serve OpenAPI spec as JSON
    this.app.get('/api/docs.json', (req, res) => {
      res.json(specs);
    });
  }

  private initializeMiddleware(): void {
    // Trust proxy (important for rate limiting and IP detection)
    this.app.set('trust proxy', 1);

    // Request ID for tracking
    this.app.use(requestId);

    // Security headers
    this.app.use(securityHeaders);

    // CORS handling
    this.app.use(corsHandler);
    this.app.use(cors({
      origin: config.cors.origin,
      credentials: config.cors.credentials,
      methods: config.cors.methods,
      optionsSuccessStatus: 200
    }));

    // Compression
    this.app.use(compression());

    // Body parsing
    this.app.use(express.json({ 
      limit: '10mb',
      strict: true,
      type: 'application/json'
    }));
    this.app.use(express.urlencoded({ 
      extended: true, 
      limit: '10mb',
      parameterLimit: 100
    }));

    // Cookie parsing
    this.app.use(cookieParser());

    // Request logging
    if (config.nodeEnv === 'development') {
      this.app.use(morgan('dev'));
    } else {
      this.app.use(morgan('combined', {
        stream: {
          write: (message: string) => {
            logger.info(message.trim(), { type: 'http_access' });
          }
        }
      }));
    }

    // Custom request logging
    this.app.use((req, res, next) => {
      const start = Date.now();

      res.on('finish', () => {
        const duration = Date.now() - start;
        loggers.request(
          req.method,
          req.url,
          res.statusCode,
          duration,
          req.get('User-Agent'),
          req.ip
        );
      });

      next();
    });

    // Rate limiting
    this.app.use(generalRateLimit);

    // Security middleware
    this.app.use(apiSecurityHeaders);
    this.app.use(sanitizeInput);
    this.app.use(suspiciousActivityDetection);
  }

  private initializeRoutes(): void {
    // Health check (no versioning)
    this.app.use('/health', healthRoutes);

    // API routes with versioning
    const apiRouter = express.Router();
    
    // Authentication routes
    apiRouter.use('/auth', authRoutes);

    // Mount API router with version prefix
    this.app.use(`/api/${config.apiVersion}`, apiRouter);

    // API documentation redirect
    this.app.get('/', (req, res) => {
      res.redirect('/api/docs');
    });

    // 404 handler for API routes
    this.app.use('/api/*', (req, res) => {
      res.status(404).json({
        success: false,
        error: 'API endpoint not found',
        path: req.path,
        method: req.method,
        availableEndpoints: [
          'GET /health',
          'GET /api/docs',
          'POST /api/v1/auth/challenge',
          'POST /api/v1/auth/verify',
          'POST /api/v1/auth/refresh',
          'POST /api/v1/auth/logout',
          'GET /api/v1/auth/profile',
          'PUT /api/v1/auth/profile',
          'GET /api/v1/auth/wallets',
          'POST /api/v1/auth/wallets',
          'DELETE /api/v1/auth/wallets/:address',
          'PUT /api/v1/auth/wallets/:address/primary'
        ]
      });
    });

    // General 404 handler
    this.app.use('*', (req, res) => {
      res.status(404).json({
        success: false,
        error: 'Resource not found',
        message: 'The requested resource could not be found',
        suggestion: 'Visit /api/docs for API documentation'
      });
    });
  }

  private initializeErrorHandling(): void {
    // Global error handler
    this.app.use(errorHandler);

    // Graceful shutdown handlers
    process.on('SIGTERM', this.gracefulShutdown.bind(this));
    process.on('SIGINT', this.gracefulShutdown.bind(this));

    // Unhandled promise rejection handler
    process.on('unhandledRejection', (reason, promise) => {
      logger.error('Unhandled Promise Rejection', {
        reason: reason instanceof Error ? reason.message : reason,
        stack: reason instanceof Error ? reason.stack : undefined,
        promise: promise.toString()
      });
    });

    // Uncaught exception handler
    process.on('uncaughtException', (error) => {
      logger.error('Uncaught Exception', {
        message: error.message,
        stack: error.stack
      });
      
      // Give time for logging then exit
      setTimeout(() => {
        process.exit(1);
      }, 1000);
    });
  }

  private async gracefulShutdown(signal: string): Promise<void> {
    logger.info(`Received ${signal}, starting graceful shutdown`);

    // Stop accepting new connections
    const server = this.app.listen();
    server.close(() => {
      logger.info('HTTP server closed');
    });

    try {
      // Close database connections
      await databaseService.close();
      logger.info('Database connections closed');

      // Close Redis connections
      await redisService.close();
      logger.info('Redis connections closed');

      logger.info('Graceful shutdown completed');
      process.exit(0);
    } catch (error) {
      logger.error('Error during graceful shutdown', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      process.exit(1);
    }
  }

  public listen(): void {
    const port = config.port;
    
    this.app.listen(port, () => {
      logger.info(`🚀 SCRYPTEX Backend Server running on port ${port}`, {
        environment: config.nodeEnv,
        version: process.env.npm_package_version || '1.0.0',
        nodeVersion: process.version,
        platform: process.platform,
        pid: process.pid
      });

      logger.info(`📚 API Documentation available at http://localhost:${port}/api/docs`);
      logger.info(`🏥 Health endpoint available at http://localhost:${port}/health`);
      
      if (config.nodeEnv === 'development') {
        logger.info(`🔧 Development mode: Hot reload enabled`);
      }
    });
  }
}

// Error handler middleware
const errorHandler = (
  error: Error,
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  logger.error('Unhandled application error', {
    message: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  if (res.headersSent) {
    return next(error);
  }

  res.status(500).json({
    success: false,
    error: config.nodeEnv === 'development' 
      ? error.message 
      : 'Internal server error',
    ...(config.nodeEnv === 'development' && { stack: error.stack })
  });
};

// Create and start the application
const app = new ScryptexApp();
app.listen();

export default app;
