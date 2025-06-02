
import { Router } from 'express';
import { tradingController } from '../controllers/TradingController';
import { portfolioController } from '../controllers/PortfolioController';
import { authMiddleware } from '../middleware/authMiddleware';
import { validateRequest } from '../middleware/validation';
import { body, param, query } from 'express-validator';

const router = Router();

// Apply authentication middleware to all routes
router.use(authMiddleware.authenticate);

// Order Management Routes
router.post('/orders',
  body('pairId').isUUID(),
  body('orderType').isIn(['market', 'limit', 'stop_loss', 'stop_limit', 'trailing_stop', 'iceberg', 'conditional']),
  body('side').isIn(['buy', 'sell']),
  body('quantity').isString().matches(/^\d+(\.\d+)?$/),
  body('price').optional().isString().matches(/^\d+(\.\d+)?$/),
  body('timeInForce').optional().isIn(['GTC', 'IOC', 'FOK', 'GTD', 'AON']),
  body('maxSlippage').optional().isFloat({ min: 0, max: 1 }),
  validateRequest,
  tradingController.placeOrder.bind(tradingController)
);

router.get('/orders',
  query('status').optional().isIn(['pending', 'open', 'partial', 'filled', 'cancelled', 'rejected', 'expired']),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('offset').optional().isInt({ min: 0 }),
  validateRequest,
  tradingController.getUserOrders.bind(tradingController)
);

router.get('/orders/:orderId',
  param('orderId').isUUID(),
  validateRequest,
  tradingController.getOrder.bind(tradingController)
);

router.delete('/orders/:orderId',
  param('orderId').isUUID(),
  validateRequest,
  tradingController.cancelOrder.bind(tradingController)
);

// Batch Operations
router.post('/orders/batch',
  body('orders').isArray({ min: 1, max: 10 }),
  body('orders.*.pairId').isUUID(),
  body('orders.*.orderType').isIn(['market', 'limit', 'stop_loss', 'stop_limit', 'trailing_stop']),
  body('orders.*.side').isIn(['buy', 'sell']),
  body('orders.*.quantity').isString().matches(/^\d+(\.\d+)?$/),
  validateRequest,
  tradingController.batchPlaceOrders.bind(tradingController)
);

router.delete('/orders/batch',
  body('orderIds').isArray({ min: 1, max: 20 }),
  body('orderIds.*').isUUID(),
  validateRequest,
  tradingController.batchCancelOrders.bind(tradingController)
);

// Trading Pairs and Market Data
router.get('/pairs',
  query('chainId').optional().isInt(),
  query('dex').optional().isString(),
  query('search').optional().isString(),
  validateRequest,
  tradingController.getTradingPairs.bind(tradingController)
);

router.get('/pairs/:pairId/orderbook',
  param('pairId').isUUID(),
  query('depth').optional().isInt({ min: 1, max: 100 }),
  validateRequest,
  tradingController.getOrderBook.bind(tradingController)
);

router.get('/pairs/:pairId/trades',
  param('pairId').isUUID(),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  validateRequest,
  tradingController.getRecentTrades.bind(tradingController)
);

router.get('/pairs/:pairId/stats',
  param('pairId').isUUID(),
  validateRequest,
  tradingController.getPairStats.bind(tradingController)
);

// Price Data
router.get('/prices',
  query('symbols').optional().isString(),
  query('chainId').optional().isInt(),
  validateRequest,
  tradingController.getCurrentPrices.bind(tradingController)
);

router.get('/prices/history',
  query('symbol').isString(),
  query('timeframe').optional().isIn(['1m', '5m', '15m', '1h', '4h', '1d', '1w']),
  query('limit').optional().isInt({ min: 1, max: 1000 }),
  validateRequest,
  tradingController.getPriceHistory.bind(tradingController)
);

// Swap Operations
router.post('/swap/quote',
  body('tokenIn').isString(),
  body('tokenOut').isString(),
  body('amountIn').isString().matches(/^\d+(\.\d+)?$/),
  body('chainId').isInt(),
  body('slippage').isFloat({ min: 0, max: 0.5 }),
  validateRequest,
  tradingController.getSwapQuote.bind(tradingController)
);

router.post('/swap',
  body('tokenIn').isString(),
  body('tokenOut').isString(),
  body('amountIn').isString().matches(/^\d+(\.\d+)?$/),
  body('minAmountOut').isString().matches(/^\d+(\.\d+)?$/),
  body('chainId').isInt(),
  body('slippage').isFloat({ min: 0, max: 0.5 }),
  body('mevProtection').optional().isBoolean(),
  validateRequest,
  tradingController.executeSwap.bind(tradingController)
);

router.post('/swap/crosschain',
  body('sourceChain').isInt(),
  body('targetChain').isInt(),
  body('tokenIn').isString(),
  body('tokenOut').isString(),
  body('amountIn').isString().matches(/^\d+(\.\d+)?$/),
  body('minAmountOut').isString().matches(/^\d+(\.\d+)?$/),
  body('slippage').isFloat({ min: 0, max: 0.5 }),
  validateRequest,
  tradingController.executeCrossChainSwap.bind(tradingController)
);

// Liquidity Management
router.get('/pools',
  query('chainId').optional().isInt(),
  query('dex').optional().isString(),
  query('search').optional().isString(),
  validateRequest,
  tradingController.getLiquidityPools.bind(tradingController)
);

router.post('/pools/add',
  body('poolId').isUUID(),
  body('token0Amount').isString().matches(/^\d+(\.\d+)?$/),
  body('token1Amount').isString().matches(/^\d+(\.\d+)?$/),
  body('minLiquidity').optional().isString().matches(/^\d+(\.\d+)?$/),
  validateRequest,
  tradingController.addLiquidity.bind(tradingController)
);

router.post('/pools/remove',
  body('poolId').isUUID(),
  body('liquidity').isString().matches(/^\d+(\.\d+)?$/),
  body('minToken0').optional().isString().matches(/^\d+(\.\d+)?$/),
  body('minToken1').optional().isString().matches(/^\d+(\.\d+)?$/),
  validateRequest,
  tradingController.removeLiquidity.bind(tradingController)
);

router.get('/pools/:poolId/stats',
  param('poolId').isUUID(),
  validateRequest,
  tradingController.getPoolStats.bind(tradingController)
);

export default router;
