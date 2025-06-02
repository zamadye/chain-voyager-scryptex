
import Redis from 'ioredis';
import { config } from '../config/environment';
import { logger } from '../utils/logger';

export class RedisService {
  private client: Redis;
  private isConnected = false;

  constructor() {
    this.client = new Redis(config.redis.url, {
      maxRetriesPerRequest: config.redis.maxRetriesPerRequest,
      retryDelayOnFailover: config.redis.retryDelayOnFailover,
      enableReadyCheck: true,
      lazyConnect: true,
    });

    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    this.client.on('connect', () => {
      logger.info('Redis client connecting...');
    });

    this.client.on('ready', () => {
      this.isConnected = true;
      logger.info('Redis client connected and ready');
    });

    this.client.on('error', (error) => {
      this.isConnected = false;
      logger.error('Redis client error', { error: error.message });
    });

    this.client.on('close', () => {
      this.isConnected = false;
      logger.info('Redis client connection closed');
    });

    this.client.on('reconnecting', () => {
      logger.info('Redis client reconnecting...');
    });
  }

  async initialize(): Promise<void> {
    try {
      await this.client.connect();
      await this.client.ping();
      logger.info('Redis service initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize Redis service', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  // Basic operations
  async get(key: string): Promise<string | null> {
    try {
      return await this.client.get(key);
    } catch (error) {
      logger.error('Redis GET error', { key, error: error instanceof Error ? error.message : 'Unknown error' });
      return null;
    }
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<boolean> {
    try {
      if (ttlSeconds) {
        await this.client.setex(key, ttlSeconds, value);
      } else {
        await this.client.set(key, value);
      }
      return true;
    } catch (error) {
      logger.error('Redis SET error', { key, error: error instanceof Error ? error.message : 'Unknown error' });
      return false;
    }
  }

  async del(key: string): Promise<boolean> {
    try {
      const result = await this.client.del(key);
      return result > 0;
    } catch (error) {
      logger.error('Redis DEL error', { key, error: error instanceof Error ? error.message : 'Unknown error' });
      return false;
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      const result = await this.client.exists(key);
      return result === 1;
    } catch (error) {
      logger.error('Redis EXISTS error', { key, error: error instanceof Error ? error.message : 'Unknown error' });
      return false;
    }
  }

  // Hash operations
  async hget(key: string, field: string): Promise<string | null> {
    try {
      return await this.client.hget(key, field);
    } catch (error) {
      logger.error('Redis HGET error', { key, field, error: error instanceof Error ? error.message : 'Unknown error' });
      return null;
    }
  }

  async hset(key: string, field: string, value: string): Promise<boolean> {
    try {
      await this.client.hset(key, field, value);
      return true;
    } catch (error) {
      logger.error('Redis HSET error', { key, field, error: error instanceof Error ? error.message : 'Unknown error' });
      return false;
    }
  }

  async hgetall(key: string): Promise<Record<string, string> | null> {
    try {
      return await this.client.hgetall(key);
    } catch (error) {
      logger.error('Redis HGETALL error', { key, error: error instanceof Error ? error.message : 'Unknown error' });
      return null;
    }
  }

  // JSON operations (for complex objects)
  async setJSON(key: string, value: any, ttlSeconds?: number): Promise<boolean> {
    try {
      const jsonString = JSON.stringify(value);
      return await this.set(key, jsonString, ttlSeconds);
    } catch (error) {
      logger.error('Redis setJSON error', { key, error: error instanceof Error ? error.message : 'Unknown error' });
      return false;
    }
  }

  async getJSON<T = any>(key: string): Promise<T | null> {
    try {
      const jsonString = await this.get(key);
      return jsonString ? JSON.parse(jsonString) : null;
    } catch (error) {
      logger.error('Redis getJSON error', { key, error: error instanceof Error ? error.message : 'Unknown error' });
      return null;
    }
  }

  // Session management
  async setSession(sessionId: string, sessionData: any, ttlSeconds: number): Promise<boolean> {
    return await this.setJSON(`session:${sessionId}`, sessionData, ttlSeconds);
  }

  async getSession<T = any>(sessionId: string): Promise<T | null> {
    return await this.getJSON<T>(`session:${sessionId}`);
  }

  async deleteSession(sessionId: string): Promise<boolean> {
    return await this.del(`session:${sessionId}`);
  }

  // Challenge management for wallet authentication
  async setChallenge(walletAddress: string, challenge: string, ttlSeconds: number = 300): Promise<boolean> {
    return await this.set(`challenge:${walletAddress.toLowerCase()}`, challenge, ttlSeconds);
  }

  async getChallenge(walletAddress: string): Promise<string | null> {
    return await this.get(`challenge:${walletAddress.toLowerCase()}`);
  }

  async deleteChallenge(walletAddress: string): Promise<boolean> {
    return await this.del(`challenge:${walletAddress.toLowerCase()}`);
  }

  // Health check
  async healthCheck(): Promise<boolean> {
    try {
      const result = await this.client.ping();
      return result === 'PONG';
    } catch (error) {
      logger.error('Redis health check failed', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return false;
    }
  }

  // Get Redis info
  async getInfo(): Promise<any> {
    try {
      return await this.client.info();
    } catch (error) {
      logger.error('Redis info error', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return null;
    }
  }

  async close(): Promise<void> {
    if (this.client) {
      await this.client.quit();
      logger.info('Redis service closed');
    }
  }

  isHealthy(): boolean {
    return this.isConnected;
  }
}

export const redisService = new RedisService();
