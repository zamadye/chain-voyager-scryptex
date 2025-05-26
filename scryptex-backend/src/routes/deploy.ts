
import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { DeployController } from '@/controllers/deployController';
import { authMiddleware } from '@/middleware/auth';

const router = Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

/**
 * @swagger
 * /api/v1/deploy/templates:
 *   get:
 *     summary: Get all contract templates
 *     tags: [Deploy]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Templates retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ContractTemplate'
 */
router.get('/templates', DeployController.getTemplates);

/**
 * @swagger
 * /api/v1/deploy/templates/{templateId}:
 *   get:
 *     summary: Get specific template by ID
 *     tags: [Deploy]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: templateId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Template retrieved successfully
 *       404:
 *         description: Template not found
 */
router.get(
  '/templates/:templateId',
  param('templateId').isUUID().withMessage('Invalid template ID'),
  DeployController.getTemplate
);

/**
 * @swagger
 * /api/v1/deploy/execute:
 *   post:
 *     summary: Deploy a contract
 *     tags: [Deploy]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - chainId
 *               - templateId
 *               - parameters
 *             properties:
 *               chainId:
 *                 type: integer
 *               templateId:
 *                 type: string
 *               parameters:
 *                 type: object
 *               gasSettings:
 *                 type: object
 *                 properties:
 *                   gasLimit:
 *                     type: string
 *                   gasPrice:
 *                     type: string
 *     responses:
 *       201:
 *         description: Contract deployment initiated
 *       400:
 *         description: Invalid request data
 */
router.post(
  '/execute',
  [
    body('chainId').isInt({ min: 1 }).withMessage('Valid chain ID is required'),
    body('templateId').isUUID().withMessage('Valid template ID is required'),
    body('parameters').isObject().withMessage('Parameters must be an object'),
    body('gasSettings').optional().isObject().withMessage('Gas settings must be an object')
  ],
  DeployController.deployContract
);

/**
 * @swagger
 * /api/v1/deploy/status/{deploymentId}:
 *   get:
 *     summary: Get deployment status
 *     tags: [Deploy]
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
 *         description: Deployment status retrieved
 *       404:
 *         description: Deployment not found
 */
router.get(
  '/status/:deploymentId',
  param('deploymentId').isUUID().withMessage('Invalid deployment ID'),
  DeployController.getDeploymentStatus
);

/**
 * @swagger
 * /api/v1/deploy/history:
 *   get:
 *     summary: Get deployment history
 *     tags: [Deploy]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *       - in: query
 *         name: chainId
 *         schema:
 *           type: integer
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, PROCESSING, SUCCESS, FAILED]
 *     responses:
 *       200:
 *         description: Deployment history retrieved
 */
router.get(
  '/history',
  [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    query('chainId').optional().isInt({ min: 1 }).withMessage('Chain ID must be a positive integer'),
    query('status').optional().isIn(['PENDING', 'PROCESSING', 'SUCCESS', 'FAILED']).withMessage('Invalid status')
  ],
  DeployController.getDeploymentHistory
);

/**
 * @swagger
 * /api/v1/deploy/batch:
 *   post:
 *     summary: Batch deploy contracts
 *     tags: [Deploy]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - deployments
 *             properties:
 *               deployments:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     chainId:
 *                       type: integer
 *                     templateId:
 *                       type: string
 *                     parameters:
 *                       type: object
 *     responses:
 *       201:
 *         description: Batch deployment initiated
 */
router.post(
  '/batch',
  [
    body('deployments').isArray({ min: 1, max: 10 }).withMessage('Deployments must be an array with 1-10 items'),
    body('deployments.*.chainId').isInt({ min: 1 }).withMessage('Valid chain ID is required'),
    body('deployments.*.templateId').isUUID().withMessage('Valid template ID is required'),
    body('deployments.*.parameters').isObject().withMessage('Parameters must be an object')
  ],
  DeployController.batchDeploy
);

/**
 * @swagger
 * /api/v1/deploy/verify/{deploymentId}:
 *   post:
 *     summary: Verify deployed contract
 *     tags: [Deploy]
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
 *         description: Contract verification completed
 *       404:
 *         description: Deployment not found
 */
router.post(
  '/verify/:deploymentId',
  param('deploymentId').isUUID().withMessage('Invalid deployment ID'),
  DeployController.verifyContract
);

export default router;
