
import { Router } from 'express';
import { swapController } from '../controllers/SwapController';
import { authMiddleware } from '../middleware/authMiddleware';
import { validateRequest } from '../middleware/validation';
import { body, param, query } from 'express-validator';

const router = Router();

// Apply authentication middleware to protected routes
router.use(authMiddleware.authenticate);

// Swap operations
router.get('/quote',
  query('tokenIn').isString().isLength({ min: 1 }),
  query('tokenOut').isString().isLength({ min: 1 }),
  query('amountIn').isString().matches(/^\d+$/),
  query('chainId').isInt({ min: 1 }),
  query('dex').optional().isIn(['clober', 'gte', 'pharos_dex']),
  query('swapType').optional().isIn(['standard', 'realtime', 'rwa', 'hft', 'arbitrage']),
  query('slippageTolerance').optional().isFloat({ min: 0, max: 50 }),
  validateRequest,
  swapController.getSwapQuote.bind(swapController)
);

router.post('/execute',
  body('tokenIn').isString().isLength({ min: 1 }),
  body('tokenOut').isString().isLength({ min: 1 }),
  body('amountIn').isString().matches(/^\d+$/),
  body('minAmountOut').isString().matches(/^\d+$/),
  body('chainId').isInt({ min: 1 }),
  body('dex').isIn(['clober', 'gte', 'pharos_dex']),
  body('swapType').optional().isIn(['standard', 'realtime', 'rwa', 'hft', 'arbitrage']),
  body('recipient').optional().isEthereumAddress(),
  body('deadline').optional().isInt({ min: 1 }),
  body('slippageTolerance').isFloat({ min: 0, max: 50 }),
  validateRequest,
  swapController.executeSwap.bind(swapController)
);

router.get('/status/:txHash',
  param('txHash').isString().isLength({ min: 1 }),
  validateRequest,
  swapController.getSwapStatus.bind(swapController)
);

router.get('/history/:address?',
  param('address').optional().isEthereumAddress(),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('offset').optional().isInt({ min: 0 }),
  query('dex').optional().isIn(['clober', 'gte', 'pharos_dex']),
  query('status').optional().isIn(['pending', 'confirmed', 'completed', 'failed', 'cancelled']),
  validateRequest,
  swapController.getSwapHistory.bind(swapController)
);

router.get('/routes/optimal',
  query('tokenIn').isString().isLength({ min: 1 }),
  query('tokenOut').isString().isLength({ min: 1 }),
  query('amountIn').isString().matches(/^\d+$/),
  query('preferredDEX').optional().isIn(['clober', 'gte', 'pharos_dex']),
  query('optimization').optional().isIn(['price', 'gas', 'time', 'points']),
  validateRequest,
  swapController.getOptimalRoute.bind(swapController)
);

// DEX-specific endpoints
router.get('/dex/clober/orderbook/:pair',
  param('pair').isString().isLength({ min: 1 }),
  validateRequest,
  swapController.getCloberOrderBook.bind(swapController)
);

router.get('/dex/gte/realtime-price/:pair',
  param('pair').isString().isLength({ min: 1 }),
  validateRequest,
  swapController.getGTERealtimePrice.bind(swapController)
);

router.get('/dex/pharos/rwa-tokens',
  validateRequest,
  swapController.getPharosRWATokens.bind(swapController)
);

// Point system APIs
router.get('/trading/points/:address?',
  param('address').optional().isEthereumAddress(),
  validateRequest,
  swapController.getTradingPoints.bind(swapController)
);

router.get('/trading/leaderboard',
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('period').optional().isIn(['daily', 'weekly', 'monthly', 'all_time']),
  validateRequest,
  swapController.getTradingLeaderboard.bind(swapController)
);

router.get('/trading/achievements/:address?',
  param('address').optional().isEthereumAddress(),
  validateRequest,
  swapController.getTradingAchievements.bind(swapController)
);

// Daily tasks APIs
router.get('/trading/tasks/daily',
  validateRequest,
  swapController.getDailyTradingTasks.bind(swapController)
);

router.get('/trading/tasks/:address?/progress',
  param('address').optional().isEthereumAddress(),
  validateRequest,
  swapController.getUserTaskProgress.bind(swapController)
);

// Analytics APIs
router.get('/trading/analytics/:address?',
  param('address').optional().isEthereumAddress(),
  query('timeframe').optional().isIn(['7d', '30d', '90d', '1y', 'all']),
  validateRequest,
  swapController.getTradingAnalytics.bind(swapController)
);

export default router;
