
import { Router } from 'express';
import { bridgeController } from '../controllers/BridgeController';
import { authMiddleware } from '../middleware/authMiddleware';
import { validateRequest } from '../middleware/validation';
import { body, param, query } from 'express-validator';

const router = Router();

// Apply authentication middleware to protected routes
router.use(authMiddleware.authenticate);

// Bridge Operations
router.post('/initiate',
  body('fromChain').isInt({ min: 1 }),
  body('toChain').isInt({ min: 1 }),
  body('tokenAddress').isEthereumAddress(),
  body('amount').isString().matches(/^\d+$/),
  body('recipient').optional().isEthereumAddress(),
  body('userAddress').optional().isEthereumAddress(),
  body('preferredRoute').optional().isIn(['fastest', 'cheapest', 'most_secure', 'most_points']),
  validateRequest,
  bridgeController.initiateBridge.bind(bridgeController)
);

router.get('/status/:bridgeId',
  param('bridgeId').isString().isLength({ min: 1 }),
  validateRequest,
  bridgeController.getBridgeStatus.bind(bridgeController)
);

router.get('/quote',
  query('fromChain').isInt({ min: 1 }),
  query('toChain').isInt({ min: 1 }),
  query('amount').isString().matches(/^\d+$/),
  query('strategy').optional().isIn(['fastest', 'cheapest', 'most_secure', 'most_points']),
  validateRequest,
  bridgeController.getBridgeQuote.bind(bridgeController)
);

router.get('/history/:address?',
  param('address').optional().isEthereumAddress(),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('offset').optional().isInt({ min: 0 }),
  validateRequest,
  bridgeController.getUserBridgeHistory.bind(bridgeController)
);

// Point System APIs
router.get('/points/:address?',
  param('address').optional().isEthereumAddress(),
  validateRequest,
  bridgeController.getUserPoints.bind(bridgeController)
);

router.get('/leaderboard',
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('period').optional().isIn(['daily', 'weekly', 'monthly', 'all_time']),
  validateRequest,
  bridgeController.getBridgeLeaderboard.bind(bridgeController)
);

// Analytics APIs
router.get('/analytics/user/:address?',
  param('address').optional().isEthereumAddress(),
  query('timeframe').optional().isIn(['7d', '30d', '90d', '1y', 'all']),
  validateRequest,
  bridgeController.getBridgeAnalytics.bind(bridgeController)
);

router.get('/analytics/global',
  query('timeframe').optional().isIn(['7d', '30d', '90d', '1y', 'all']),
  validateRequest,
  bridgeController.getGlobalBridgeAnalytics.bind(bridgeController)
);

// Daily Tasks APIs
router.get('/tasks/daily',
  validateRequest,
  bridgeController.getDailyTasks.bind(bridgeController)
);

router.get('/tasks/progress/:address?',
  param('address').optional().isEthereumAddress(),
  validateRequest,
  bridgeController.getUserTaskProgress.bind(bridgeController)
);

export default router;
