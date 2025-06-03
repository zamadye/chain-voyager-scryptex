
import { Router } from 'express';
import { body, param, query } from 'express-validator';
import TokenCreationController from '../controllers/TokenCreationController';
import { authMiddleware } from '../middleware/authMiddleware';
import { validateRequest } from '../middleware/validation';

const router = Router();

// Apply authentication middleware to protected routes
router.use(authMiddleware.authenticate);

/**
 * @swagger
 * /api/v1/tokens/deployment-cost:
 *   get:
 *     summary: Calculate token deployment cost
 *     tags: [Token Creation]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: tokenType
 *         required: true
 *         schema:
 *           type: string
 *           enum: [standard, bonding_curve, deflationary, reflection, governance, rwa, memecoin, hft, streaming]
 *       - in: query
 *         name: chainName
 *         required: true
 *         schema:
 *           type: string
 *           enum: [risechain, pharos, megaeth]
 *       - in: query
 *         name: features
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *     responses:
 *       200:
 *         description: Deployment cost calculated successfully
 */
router.get('/deployment-cost',
  query('tokenType').isIn(['standard', 'bonding_curve', 'deflationary', 'reflection', 'governance', 'rwa', 'memecoin', 'hft', 'streaming']),
  query('chainName').isIn(['risechain', 'pharos', 'megaeth']),
  query('features').optional().isArray(),
  validateRequest,
  TokenCreationController.calculateDeploymentCost
);

/**
 * @swagger
 * /api/v1/tokens/deploy:
 *   post:
 *     summary: Deploy a new token
 *     tags: [Token Creation]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - tokenName
 *               - tokenSymbol
 *               - tokenType
 *               - totalSupply
 *               - chainName
 *             properties:
 *               tokenName:
 *                 type: string
 *                 maxLength: 100
 *               tokenSymbol:
 *                 type: string
 *                 maxLength: 20
 *               tokenDescription:
 *                 type: string
 *               tokenType:
 *                 type: string
 *                 enum: [standard, bonding_curve, deflationary, reflection, governance, rwa, memecoin, hft, streaming]
 *               totalSupply:
 *                 type: string
 *               decimals:
 *                 type: integer
 *                 minimum: 0
 *                 maximum: 18
 *               chainName:
 *                 type: string
 *                 enum: [risechain, pharos, megaeth]
 *               features:
 *                 type: array
 *                 items:
 *                   type: string
 *               advancedFeatures:
 *                 type: object
 *               bondingCurveType:
 *                 type: string
 *                 enum: [linear, exponential, logarithmic, sigmoid, polynomial]
 *               curveParameters:
 *                 type: object
 *     responses:
 *       201:
 *         description: Token deployment initiated successfully
 *       400:
 *         description: Invalid request data
 */
router.post('/deploy',
  [
    body('tokenName').isString().isLength({ min: 1, max: 100 }),
    body('tokenSymbol').isString().isLength({ min: 1, max: 20 }),
    body('tokenDescription').optional().isString(),
    body('tokenType').isIn(['standard', 'bonding_curve', 'deflationary', 'reflection', 'governance', 'rwa', 'memecoin', 'hft', 'streaming']),
    body('totalSupply').isString().matches(/^\d+$/),
    body('decimals').optional().isInt({ min: 0, max: 18 }),
    body('chainName').isIn(['risechain', 'pharos', 'megaeth']),
    body('features').optional().isArray(),
    body('advancedFeatures').optional().isObject(),
    body('bondingCurveType').optional().isIn(['linear', 'exponential', 'logarithmic', 'sigmoid', 'polynomial']),
    body('curveParameters').optional().isObject()
  ],
  validateRequest,
  TokenCreationController.deployToken
);

/**
 * @swagger
 * /api/v1/tokens/deployment/{deploymentId}/status:
 *   get:
 *     summary: Get deployment status
 *     tags: [Token Creation]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: deploymentId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Deployment status retrieved successfully
 *       404:
 *         description: Deployment not found
 */
router.get('/deployment/:deploymentId/status',
  param('deploymentId').isString().isLength({ min: 1 }),
  validateRequest,
  TokenCreationController.getDeploymentStatus
);

/**
 * @swagger
 * /api/v1/tokens/user/{address}:
 *   get:
 *     summary: Get user's token deployments
 *     tags: [Token Creation]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: address
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           minimum: 0
 *           default: 0
 *     responses:
 *       200:
 *         description: User tokens retrieved successfully
 */
router.get('/user/:address',
  [
    param('address').isEthereumAddress(),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('offset').optional().isInt({ min: 0 })
  ],
  validateRequest,
  TokenCreationController.getUserTokens
);

/**
 * @swagger
 * /api/v1/tokens/creator/{address}/stats:
 *   get:
 *     summary: Get user's creator statistics
 *     tags: [Token Creation]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: address
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Creator stats retrieved successfully
 */
router.get('/creator/:address/stats',
  param('address').isEthereumAddress(),
  validateRequest,
  TokenCreationController.getUserCreatorStats
);

/**
 * @swagger
 * /api/v1/tokens/tasks/daily:
 *   get:
 *     summary: Get daily creation tasks
 *     tags: [Token Creation]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Daily creation tasks retrieved successfully
 */
router.get('/tasks/daily',
  query('date').optional().isDate(),
  validateRequest,
  TokenCreationController.getDailyCreationTasks
);

/**
 * @swagger
 * /api/v1/tokens/tasks/{address}/progress:
 *   get:
 *     summary: Get user's task progress
 *     tags: [Token Creation]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: address
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: User task progress retrieved successfully
 */
router.get('/tasks/:address/progress',
  [
    param('address').isEthereumAddress(),
    query('date').optional().isDate()
  ],
  validateRequest,
  TokenCreationController.getUserTaskProgress
);

/**
 * @swagger
 * /api/v1/tokens/leaderboard/creators:
 *   get:
 *     summary: Get creation leaderboard
 *     tags: [Token Creation]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 50
 *     responses:
 *       200:
 *         description: Creation leaderboard retrieved successfully
 */
router.get('/leaderboard/creators',
  query('limit').optional().isInt({ min: 1, max: 100 }),
  validateRequest,
  TokenCreationController.getCreationLeaderboard
);

// Bonding Curve specific endpoints
/**
 * @swagger
 * /api/v1/tokens/bonding-curve/calculate-price:
 *   post:
 *     summary: Calculate bonding curve price
 *     tags: [Bonding Curve]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - supply
 *               - curveParameters
 *             properties:
 *               supply:
 *                 type: string
 *               curveParameters:
 *                 type: object
 *     responses:
 *       200:
 *         description: Bonding curve price calculated successfully
 */
router.post('/bonding-curve/calculate-price',
  [
    body('supply').isString().matches(/^\d+$/),
    body('curveParameters').isObject()
  ],
  validateRequest,
  TokenCreationController.calculateBondingCurvePrice
);

/**
 * @swagger
 * /api/v1/tokens/bonding-curve/price-impact:
 *   post:
 *     summary: Calculate price impact for bonding curve
 *     tags: [Bonding Curve]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - buyAmount
 *               - currentSupply
 *               - curveParameters
 *             properties:
 *               buyAmount:
 *                 type: string
 *               currentSupply:
 *                 type: string
 *               curveParameters:
 *                 type: object
 *     responses:
 *       200:
 *         description: Price impact calculated successfully
 */
router.post('/bonding-curve/price-impact',
  [
    body('buyAmount').isString().matches(/^\d+$/),
    body('currentSupply').isString().matches(/^\d+$/),
    body('curveParameters').isObject()
  ],
  validateRequest,
  TokenCreationController.calculatePriceImpact
);

/**
 * @swagger
 * /api/v1/tokens/bonding-curve/simulate:
 *   post:
 *     summary: Simulate bonding curve
 *     tags: [Bonding Curve]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - curveParameters
 *             properties:
 *               curveParameters:
 *                 type: object
 *               steps:
 *                 type: integer
 *                 minimum: 10
 *                 maximum: 1000
 *                 default: 100
 *     responses:
 *       200:
 *         description: Bonding curve simulation completed successfully
 */
router.post('/bonding-curve/simulate',
  [
    body('curveParameters').isObject(),
    body('steps').optional().isInt({ min: 10, max: 1000 })
  ],
  validateRequest,
  TokenCreationController.simulateBondingCurve
);

/**
 * @swagger
 * /api/v1/tokens/chains/{chainName}/info:
 *   get:
 *     summary: Get chain information
 *     tags: [Token Creation]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: chainName
 *         required: true
 *         schema:
 *           type: string
 *           enum: [risechain, pharos, megaeth]
 *     responses:
 *       200:
 *         description: Chain information retrieved successfully
 */
router.get('/chains/:chainName/info',
  param('chainName').isIn(['risechain', 'pharos', 'megaeth']),
  validateRequest,
  TokenCreationController.getChainInfo
);

export default router;
