
import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { ResponseHelper } from '@/utils/response';
import { logger } from '@/utils/logger';

const router = Router();
const prisma = new PrismaClient();

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check endpoint
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Service is healthy
 *       503:
 *         description: Service is unhealthy
 */
router.get('/', async (req, res) => {
  try {
    const startTime = Date.now();
    
    // Check database connection
    await prisma.$queryRaw`SELECT 1`;
    
    const dbResponseTime = Date.now() - startTime;
    
    const healthData = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0',
      node: process.version,
      memory: process.memoryUsage(),
      database: {
        status: 'connected',
        responseTime: `${dbResponseTime}ms`,
      },
    };

    res.status(200).json(ResponseHelper.success(healthData));
  } catch (error) {
    logger.error('Health check failed:', error);
    
    const healthData = {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
    };

    res.status(503).json(ResponseHelper.error('HEALTH_CHECK_FAILED', 'Service unhealthy', healthData));
  }
});

/**
 * @swagger
 * /health/detailed:
 *   get:
 *     summary: Detailed health check
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Detailed health information
 */
router.get('/detailed', async (req, res) => {
  try {
    const startTime = Date.now();
    
    // Check database
    const dbStart = Date.now();
    const userCount = await prisma.user.count();
    const dbResponseTime = Date.now() - dbStart;
    
    // Check Redis (if available)
    let redisStatus = 'not_configured';
    let redisResponseTime = 0;
    
    // System metrics
    const totalTime = Date.now() - startTime;
    
    const detailedHealth = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      node: process.version,
      system: {
        memory: process.memoryUsage(),
        cpu: process.cpuUsage(),
        platform: process.platform,
        arch: process.arch,
      },
      database: {
        status: 'connected',
        responseTime: `${dbResponseTime}ms`,
        userCount,
      },
      redis: {
        status: redisStatus,
        responseTime: `${redisResponseTime}ms`,
      },
      responseTime: `${totalTime}ms`,
    };

    res.status(200).json(ResponseHelper.success(detailedHealth));
  } catch (error) {
    logger.error('Detailed health check failed:', error);
    res.status(503).json(
      ResponseHelper.error('HEALTH_CHECK_FAILED', 'Detailed health check failed')
    );
  }
});

export default router;
