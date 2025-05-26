
import Redis from 'redis';
import { config } from '@/config/config';
import { logger } from '@/utils/logger';

class RedisClient {
  private client: any;
  private isConnected = false;

  constructor() {
    this.init();
  }

  private async init() {
    try {
      this.client = Redis.createClient({
        url: config.redisUrl,
        retry_strategy: (options) => {
          if (options.error && options.error.code === 'ECONNREFUSED') {
            logger.error('Redis server refused connection');
            return new Error('Redis server refused connection');
          }
          if (options.total_retry_time > 1000 * 60 * 60) {
            logger.error('Redis retry time exhausted');
            return new Error('Retry time exhausted');
          }
          if (options.attempt > 10) {
            logger.error('Redis retry attempts exhausted');
            return undefined;
          }
          // Reconnect after
          return Math.min(options.attempt * 100, 3000);
        }
      });

      this.client.on('connect', () => {
        logger.info('Redis client connected');
        this.isConnected = true;
      });

      this.client.on('ready', () => {
        logger.info('Redis client ready');
      });

      this.client.on('error', (err: Error) => {
        logger.error('Redis client error', { error: err.message });
        this.isConnected = false;
      });

      this.client.on('end', () => {
        logger.info('Redis client disconnected');
        this.isConnected = false;
      });

      await this.client.connect();
    } catch (error) {
      logger.error('Failed to initialize Redis client', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async get(key: string): Promise<string | null> {
    try {
      if (!this.isConnected) {
        logger.warn('Redis not connected, skipping get operation');
        return null;
      }
      return await this.client.get(key);
    } catch (error) {
      logger.error('Redis get error', {
        key,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return null;
    }
  }

  async set(key: string, value: string, ttl?: number): Promise<boolean> {
    try {
      if (!this.isConnected) {
        logger.warn('Redis not connected, skipping set operation');
        return false;
      }
      
      if (ttl) {
        await this.client.setEx(key, ttl, value);
      } else {
        await this.client.set(key, value);
      }
      return true;
    } catch (error) {
      logger.error('Redis set error', {
        key,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return false;
    }
  }

  async setex(key: string, ttl: number, value: string): Promise<boolean> {
    return this.set(key, value, ttl);
  }

  async del(...keys: string[]): Promise<number> {
    try {
      if (!this.isConnected) {
        logger.warn('Redis not connected, skipping del operation');
        return 0;
      }
      return await this.client.del(keys);
    } catch (error) {
      logger.error('Redis del error', {
        keys,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return 0;
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      if (!this.isConnected) {
        return false;
      }
      const result = await this.client.exists(key);
      return result === 1;
    } catch (error) {
      logger.error('Redis exists error', {
        key,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return false;
    }
  }

  async keys(pattern: string): Promise<string[]> {
    try {
      if (!this.isConnected) {
        return [];
      }
      return await this.client.keys(pattern);
    } catch (error) {
      logger.error('Redis keys error', {
        pattern,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return [];
    }
  }

  async flushall(): Promise<boolean> {
    try {
      if (!this.isConnected) {
        return false;
      }
      await this.client.flushAll();
      return true;
    } catch (error) {
      logger.error('Redis flushall error', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return false;
    }
  }

  async ping(): Promise<boolean> {
    try {
      if (!this.isConnected) {
        return false;
      }
      const result = await this.client.ping();
      return result === 'PONG';
    } catch (error) {
      logger.error('Redis ping error', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return false;
    }
  }

  async disconnect(): Promise<void> {
    try {
      if (this.client) {
        await this.client.disconnect();
        this.isConnected = false;
        logger.info('Redis client disconnected gracefully');
      }
    } catch (error) {
      logger.error('Error disconnecting Redis client', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  isConnectedStatus(): boolean {
    return this.isConnected;
  }

  getClient() {
    return this.client;
  }
}

export const redis = new RedisClient();

// Graceful shutdown
process.on('SIGTERM', async () => {
  await redis.disconnect();
});

process.on('SIGINT', async () => {
  await redis.disconnect();
});
