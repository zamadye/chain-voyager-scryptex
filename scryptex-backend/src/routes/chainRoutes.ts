
import { Router } from 'express';
import { chainController } from '@/controllers/chainController';
import { authMiddleware } from '@/middleware/authMiddleware';
import { validateRequest } from '@/middleware/validation';
import { body, param, query } from 'express-validator';

const router = Router();

// Apply authentication middleware to all routes
router.use(authMiddleware.authenticate);

/**
 * @swagger
 * /api/chains:
 *   get:
 *     summary: Get all supported chains
 *     tags: [Chains]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: includeInactive
 *         schema:
 *           type: boolean
 *         description: Include inactive chains in response
 *     responses:
 *       200:
 *         description: List of supported chains with configurations
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     chains:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/ChainConfiguration'
 *                     totalCount:
 *                       type: integer
 *                     activeCount:
 *                       type: integer
 */
router.get('/', 
  query('includeInactive').optional().isBoolean(),
  validateRequest,
  chainController.getAllChains
);

/**
 * @swagger
 * /api/chains/{chainId}:
 *   get:
 *     summary: Get specific chain details
 *     tags: [Chains]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: chainId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Chain ID
 *     responses:
 *       200:
 *         description: Chain details with health and metrics
 *       404:
 *         description: Chain not found
 */
router.get('/:chainId',
  param('chainId').isInt({ min: 1 }),
  validateRequest,
  chainController.getChainById
);

/**
 * @swagger
 * /api/chains/{chainId}/status:
 *   get:
 *     summary: Get comprehensive chain status
 *     tags: [Chains]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: chainId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Comprehensive chain status and health information
 */
router.get('/:chainId/status',
  param('chainId').isInt({ min: 1 }),
  validateRequest,
  chainController.getChainStatus
);

/**
 * @swagger
 * /api/chains/{chainId}/gas-price:
 *   get:
 *     summary: Get current gas prices for chain
 *     tags: [Chains]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: chainId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: urgency
 *         schema:
 *           type: string
 *           enum: [slow, standard, fast, fastest]
 *         description: Gas price urgency level
 *     responses:
 *       200:
 *         description: Current gas prices for all urgency levels
 */
router.get('/:chainId/gas-price',
  param('chainId').isInt({ min: 1 }),
  query('urgency').optional().isIn(['slow', 'standard', 'fast', 'fastest']),
  validateRequest,
  chainController.getGasPrice
);

/**
 * @swagger
 * /api/chains/compare:
 *   post:
 *     summary: Compare performance across multiple chains
 *     tags: [Chains]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               chainIds:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 description: Array of chain IDs to compare
 *             required:
 *               - chainIds
 *     responses:
 *       200:
 *         description: Chain performance comparison results
 */
router.post('/compare',
  body('chainIds').isArray({ min: 2 }),
  body('chainIds.*').isInt({ min: 1 }),
  validateRequest,
  chainController.compareChains
);

/**
 * @swagger
 * /api/chains/optimal:
 *   post:
 *     summary: Get optimal chain recommendation for operation
 *     tags: [Chains]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               latency:
 *                 type: integer
 *                 description: Maximum acceptable latency in ms
 *               throughput:
 *                 type: integer
 *                 description: Required throughput in TPS
 *               cost:
 *                 type: string
 *                 enum: [low, medium, high]
 *                 description: Cost preference level
 *               features:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Required chain features
 *               compliance:
 *                 type: boolean
 *                 description: Requires compliance features
 *     responses:
 *       200:
 *         description: Optimal chain recommendation with analysis
 */
router.post('/optimal',
  body('latency').optional().isInt({ min: 100 }),
  body('throughput').optional().isInt({ min: 1 }),
  body('cost').optional().isIn(['low', 'medium', 'high']),
  body('features').optional().isArray(),
  body('compliance').optional().isBoolean(),
  validateRequest,
  chainController.getOptimalChain
);

/**
 * @swagger
 * /api/chains/metrics:
 *   get:
 *     summary: Get real-time metrics for all chains
 *     tags: [Chains]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Real-time performance metrics for all supported chains
 */
router.get('/metrics/all', chainController.getAllMetrics);

/**
 * @swagger
 * /api/chains/{chainId}/optimize:
 *   post:
 *     summary: Optimize chain configuration
 *     tags: [Chains]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: chainId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Chain optimization results
 */
router.post('/:chainId/optimize',
  param('chainId').isInt({ min: 1 }),
  validateRequest,
  chainController.optimizeChain
);

/**
 * @swagger
 * /api/chains/{chainId}/test:
 *   post:
 *     summary: Test chain connectivity and performance
 *     tags: [Chains]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: chainId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               operations:
 *                 type: array
 *                 items:
 *                   type: string
 *                   enum: [connectivity, gas, performance]
 *                 description: Test operations to perform
 *     responses:
 *       200:
 *         description: Chain test results
 */
router.post('/:chainId/test',
  param('chainId').isInt({ min: 1 }),
  body('operations').optional().isArray(),
  body('operations.*').optional().isIn(['connectivity', 'gas', 'performance']),
  validateRequest,
  chainController.testChain
);

export default router;
