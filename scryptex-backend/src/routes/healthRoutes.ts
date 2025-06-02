
import { Router } from 'express';
import { healthController } from '../controllers/HealthController';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Health
 *   description: Application health monitoring endpoints
 */

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Basic health check
 *     description: Returns basic application health status
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Application is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 status:
 *                   type: string
 *                   example: "healthy"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 uptime:
 *                   type: number
 *                 version:
 *                   type: string
 *                 environment:
 *                   type: string
 *       500:
 *         description: Application is unhealthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 status:
 *                   type: string
 *                   example: "unhealthy"
 *                 error:
 *                   type: string
 */
router.get('/', healthController.basic);

/**
 * @swagger
 * /health/detailed:
 *   get:
 *     summary: Detailed health check
 *     description: Returns detailed health status including database, Redis, memory, and disk checks
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: All systems are healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 status:
 *                   type: string
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 uptime:
 *                   type: number
 *                 version:
 *                   type: string
 *                 environment:
 *                   type: string
 *                 checks:
 *                   type: object
 *                   properties:
 *                     database:
 *                       type: object
 *                     redis:
 *                       type: object
 *                     memory:
 *                       type: object
 *                     disk:
 *                       type: object
 *       503:
 *         description: One or more systems are unhealthy
 */
router.get('/detailed', healthController.detailed);

/**
 * @swagger
 * /health/database:
 *   get:
 *     summary: Database health check
 *     description: Returns database connection status and statistics
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Database is healthy
 *       503:
 *         description: Database is unhealthy
 */
router.get('/database', healthController.database);

/**
 * @swagger
 * /health/redis:
 *   get:
 *     summary: Redis health check
 *     description: Returns Redis connection status
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Redis is healthy
 *       503:
 *         description: Redis is unhealthy
 */
router.get('/redis', healthController.redis);

/**
 * @swagger
 * /health/metrics:
 *   get:
 *     summary: Prometheus metrics
 *     description: Returns application metrics in Prometheus format
 *     tags: [Health]
 *     produces:
 *       - text/plain
 *     responses:
 *       200:
 *         description: Metrics data
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *       500:
 *         description: Failed to generate metrics
 */
router.get('/metrics', healthController.metrics);

export default router;
