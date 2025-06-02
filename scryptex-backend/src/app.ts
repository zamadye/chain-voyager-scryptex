import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { v4 as uuidv4 } from 'uuid';
import { config } from './config/environment';
import { logger } from './utils/logger';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import authRoutes from './routes/auth';
import healthRoutes from './routes/health';

// Import new routes
import chainRoutes from '@/routes/chainRoutes';
import tradingRoutes from '@/routes/tradingRoutes';
import portfolioRoutes from '@/routes/portfolioRoutes';

const app = express();

// Enable CORS
app.use(cors({
  origin: config.cors.origin,
  credentials: config.cors.credentials,
  methods: config.cors.methods,
}));

// Set security HTTP headers
app.use(helmet());

// Request logger
app.use(morgan('dev'));

// Parse JSON request body
app.use(express.json({ limit: '5mb' }));

// Parse URL-encoded request body
app.use(express.urlencoded({ extended: true }));

// Add request ID
app.use((req: Request, res: Response, next: NextFunction) => {
  req.id = uuidv4();
  next();
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/health', healthRoutes);
app.use('/api/chains', chainRoutes);
app.use('/api/trading', tradingRoutes);
app.use('/api/portfolio', portfolioRoutes);

// Error handling middleware
app.use(errorHandler);

// Not found route
app.use(notFoundHandler);

export default app;
