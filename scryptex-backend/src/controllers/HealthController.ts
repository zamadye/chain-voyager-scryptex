
import { Request, Response } from 'express';
import { databaseService } from '../services/DatabaseService';
import { redisService } from '../services/RedisService';
import { logger } from '../utils/logger';

export class HealthController {
  async basic(req: Request, res: Response): Promise<void> {
    try {
      res.json({
        success: true,
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        version: process.env.npm_package_version || '1.0.0',
        environment: process.env.NODE_ENV || 'development'
      });
    } catch (error) {
      logger.error('Basic health check failed', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      res.status(500).json({
        success: false,
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: 'Health check failed'
      });
    }
  }

  async detailed(req: Request, res: Response): Promise<void> {
    try {
      const checks = await Promise.allSettled([
        this.checkDatabase(),
        this.checkRedis(),
        this.checkMemory(),
        this.checkDisk()
      ]);

      const [database, redis, memory, disk] = checks.map(result => 
        result.status === 'fulfilled' ? result.value : { status: 'error', error: result.reason }
      );

      const overall = database.status === 'healthy' && 
                     redis.status === 'healthy' && 
                     memory.status === 'healthy' && 
                     disk.status === 'healthy' ? 'healthy' : 'unhealthy';

      const statusCode = overall === 'healthy' ? 200 : 503;

      res.status(statusCode).json({
        success: overall === 'healthy',
        status: overall,
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        version: process.env.npm_package_version || '1.0.0',
        environment: process.env.NODE_ENV || 'development',
        checks: {
          database,
          redis,
          memory,
          disk
        }
      });
    } catch (error) {
      logger.error('Detailed health check failed', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      res.status(500).json({
        success: false,
        status: 'error',
        timestamp: new Date().toISOString(),
        error: 'Health check failed'
      });
    }
  }

  async database(req: Request, res: Response): Promise<void> {
    try {
      const dbHealth = await this.checkDatabase();
      const statusCode = dbHealth.status === 'healthy' ? 200 : 503;

      res.status(statusCode).json({
        success: dbHealth.status === 'healthy',
        timestamp: new Date().toISOString(),
        ...dbHealth
      });
    } catch (error) {
      logger.error('Database health check failed', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      res.status(503).json({
        success: false,
        status: 'error',
        timestamp: new Date().toISOString(),
        error: 'Database health check failed'
      });
    }
  }

  async redis(req: Request, res: Response): Promise<void> {
    try {
      const redisHealth = await this.checkRedis();
      const statusCode = redisHealth.status === 'healthy' ? 200 : 503;

      res.status(statusCode).json({
        success: redisHealth.status === 'healthy',
        timestamp: new Date().toISOString(),
        ...redisHealth
      });
    } catch (error) {
      logger.error('Redis health check failed', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      res.status(503).json({
        success: false,
        status: 'error',
        timestamp: new Date().toISOString(),
        error: 'Redis health check failed'
      });
    }
  }

  private async checkDatabase(): Promise<any> {
    try {
      const start = Date.now();
      const isHealthy = await databaseService.healthCheck();
      const responseTime = Date.now() - start;

      if (!isHealthy) {
        return {
          status: 'unhealthy',
          service: 'postgresql',
          responseTime: `${responseTime}ms`,
          error: 'Database health check failed'
        };
      }

      const poolStats = databaseService.getPoolStats();

      return {
        status: 'healthy',
        service: 'postgresql',
        responseTime: `${responseTime}ms`,
        details: {
          totalConnections: poolStats.totalCount,
          idleConnections: poolStats.idleCount,
          waitingConnections: poolStats.waitingCount
        }
      };
    } catch (error) {
      return {
        status: 'error',
        service: 'postgresql',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private async checkRedis(): Promise<any> {
    try {
      const start = Date.now();
      const isHealthy = await redisService.healthCheck();
      const responseTime = Date.now() - start;

      if (!isHealthy) {
        return {
          status: 'unhealthy',
          service: 'redis',
          responseTime: `${responseTime}ms`,
          error: 'Redis health check failed'
        };
      }

      return {
        status: 'healthy',
        service: 'redis',
        responseTime: `${responseTime}ms`,
        details: {
          connected: redisService.isHealthy()
        }
      };
    } catch (error) {
      return {
        status: 'error',
        service: 'redis',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private async checkMemory(): Promise<any> {
    try {
      const memUsage = process.memoryUsage();
      const totalMem = require('os').totalmem();
      const freeMem = require('os').freemem();
      const usedMem = totalMem - freeMem;

      const memoryUsagePercent = (usedMem / totalMem) * 100;
      const heapUsagePercent = (memUsage.heapUsed / memUsage.heapTotal) * 100;

      const status = memoryUsagePercent > 90 || heapUsagePercent > 90 ? 'unhealthy' : 'healthy';

      return {
        status,
        service: 'memory',
        details: {
          systemMemoryUsage: `${memoryUsagePercent.toFixed(2)}%`,
          heapUsage: `${heapUsagePercent.toFixed(2)}%`,
          heapUsed: `${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`,
          heapTotal: `${Math.round(memUsage.heapTotal / 1024 / 1024)}MB`,
          external: `${Math.round(memUsage.external / 1024 / 1024)}MB`
        }
      };
    } catch (error) {
      return {
        status: 'error',
        service: 'memory',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private async checkDisk(): Promise<any> {
    try {
      const fs = require('fs');
      const path = require('path');

      const stats = fs.statSync(path.resolve('./'));
      
      // Simple disk check (this is basic, would need more sophisticated monitoring in production)
      return {
        status: 'healthy',
        service: 'disk',
        details: {
          available: true,
          path: process.cwd()
        }
      };
    } catch (error) {
      return {
        status: 'error',
        service: 'disk',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async metrics(req: Request, res: Response): Promise<void> {
    try {
      // Basic metrics in Prometheus format
      const uptime = process.uptime();
      const memUsage = process.memoryUsage();
      
      const metrics = [
        '# HELP scryptex_uptime_seconds Time the application has been running',
        '# TYPE scryptex_uptime_seconds counter',
        `scryptex_uptime_seconds ${uptime}`,
        '',
        '# HELP scryptex_memory_usage_bytes Memory usage by type',
        '# TYPE scryptex_memory_usage_bytes gauge',
        `scryptex_memory_usage_bytes{type="rss"} ${memUsage.rss}`,
        `scryptex_memory_usage_bytes{type="heapTotal"} ${memUsage.heapTotal}`,
        `scryptex_memory_usage_bytes{type="heapUsed"} ${memUsage.heapUsed}`,
        `scryptex_memory_usage_bytes{type="external"} ${memUsage.external}`,
        '',
        '# HELP scryptex_process_cpu_user_seconds_total Total user CPU time spent',
        '# TYPE scryptex_process_cpu_user_seconds_total counter',
        `scryptex_process_cpu_user_seconds_total ${process.cpuUsage().user / 1000000}`,
        '',
        '# HELP scryptex_process_cpu_system_seconds_total Total system CPU time spent',
        '# TYPE scryptex_process_cpu_system_seconds_total counter',
        `scryptex_process_cpu_system_seconds_total ${process.cpuUsage().system / 1000000}`,
      ].join('\n');

      res.set('Content-Type', 'text/plain; version=0.0.4; charset=utf-8');
      res.send(metrics);
    } catch (error) {
      logger.error('Metrics endpoint failed', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      res.status(500).json({
        success: false,
        error: 'Failed to generate metrics'
      });
    }
  }
}

export const healthController = new HealthController();
