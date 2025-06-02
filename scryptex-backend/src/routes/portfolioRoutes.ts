
import { Router } from 'express';
import { portfolioController } from '../controllers/PortfolioController';
import { authMiddleware } from '../middleware/authMiddleware';
import { validateRequest } from '../middleware/validation';
import { body, param, query } from 'express-validator';

const router = Router();

// Apply authentication middleware to all routes
router.use(authMiddleware.authenticate);

// Portfolio Overview
router.get('/',
  portfolioController.getPortfolioSummary.bind(portfolioController)
);

// Positions Management
router.get('/positions',
  query('chainId').optional().isInt(),
  validateRequest,
  portfolioController.getPositions.bind(portfolioController)
);

router.get('/positions/:tokenId',
  param('tokenId').isUUID(),
  validateRequest,
  portfolioController.getPosition.bind(portfolioController)
);

router.put('/positions/:tokenId',
  param('tokenId').isUUID(),
  body('stopLossPrice').optional().isString().matches(/^\d+(\.\d+)?$/),
  body('takeProfitPrice').optional().isString().matches(/^\d+(\.\d+)?$/),
  body('positionSizeLimit').optional().isString().matches(/^\d+(\.\d+)?$/),
  validateRequest,
  portfolioController.updatePositionSettings.bind(portfolioController)
);

// P&L Analysis
router.get('/pnl',
  query('period').optional().isIn(['1d', '7d', '30d', '90d', '1y']),
  validateRequest,
  portfolioController.getPnLAnalysis.bind(portfolioController)
);

// Performance Metrics
router.get('/performance',
  portfolioController.getPerformanceMetrics.bind(portfolioController)
);

// Portfolio Rebalancing
router.post('/rebalance',
  body('targetAllocation').isObject(),
  validateRequest,
  portfolioController.rebalancePortfolio.bind(portfolioController)
);

// Risk Management
router.get('/risk',
  portfolioController.getRiskMetrics.bind(portfolioController)
);

router.post('/risk/limits',
  body('maxPositionSize').optional().isString().matches(/^\d+(\.\d+)?$/),
  body('maxDailyLoss').optional().isString().matches(/^\d+(\.\d+)?$/),
  body('stopLossPercentage').optional().isFloat({ min: 0, max: 100 }),
  body('takeProfitPercentage').optional().isFloat({ min: 0, max: 1000 }),
  validateRequest,
  portfolioController.setRiskLimits.bind(portfolioController)
);

router.get('/risk/alerts',
  portfolioController.getRiskAlerts.bind(portfolioController)
);

// Analytics
router.get('/analytics',
  query('timeframe').optional().isIn(['7d', '30d', '90d', '1y']),
  validateRequest,
  portfolioController.getDetailedAnalytics.bind(portfolioController)
);

router.get('/history',
  query('timeframe').optional().isIn(['7d', '30d', '90d', '1y']),
  query('interval').optional().isIn(['1h', '4h', '1d', '1w']),
  validateRequest,
  portfolioController.getPortfolioHistory.bind(portfolioController)
);

// Strategy Simulation
router.post('/simulation',
  body('strategy').isString(),
  body('parameters').isObject(),
  validateRequest,
  portfolioController.simulateStrategy.bind(portfolioController)
);

export default router;
