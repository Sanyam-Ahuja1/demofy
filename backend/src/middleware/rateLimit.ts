import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import { createClient } from 'redis';
import { env } from '../config/env';
import { logger } from '../utils/logger';

/**
 * Rate limiting middleware with Redis support
 */

let redisClient: ReturnType<typeof createClient> | null = null;

// Initialize Redis client if REDIS_URL is provided
if (env.REDIS_URL) {
  redisClient = createClient({
    url: env.REDIS_URL,
    socket: {
      reconnectStrategy: (retries) => {
        // Give up after 20 retries
        if (retries > 20) {
          logger.error('Redis: Too many reconnection attempts, giving up');
          return new Error('Too many retries');
        }
        // Exponential backoff: 100ms, 200ms, 400ms... max 5s
        const delay = Math.min(Math.pow(2, retries) * 100, 5000);
        logger.info(`Redis: Reconnecting in ${delay}ms (attempt ${retries})`);
        return delay;
      },
    },
  });

  // CRITICAL: Error event listener is REQUIRED to prevent crashes
  redisClient.on('error', (err) => {
    logger.error('Redis Client Error:', err);
  });

  redisClient.on('connect', () => {
    logger.info('✅ Redis connected for rate limiting');
  });

  redisClient.on('ready', () => {
    logger.info('✅ Redis ready to accept commands');
  });

  redisClient.on('reconnecting', () => {
    logger.warn('⚠️ Redis reconnecting...');
  });

  // Connect to Redis
  redisClient.connect().catch((err) => {
    logger.error('Failed to connect to Redis for rate limiting:', err);
    logger.warn('⚠️ Rate limiting will fall back to memory store');
    redisClient = null;
  });
}

/**
 * Create rate limiter with optional Redis store
 */
const createRateLimiter = (options: {
  windowMs: number;
  max: number;
  message?: string;
}) => {
  const config: any = {
    windowMs: options.windowMs,
    max: options.max,
    message: {
      success: false,
      data: null,
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: options.message || 'Too many requests, please try again later',
      },
    },
    standardHeaders: true,
    legacyHeaders: false,
  };

  // Use Redis store if available
  if (redisClient) {
    config.store = new RedisStore({
      // @ts-ignore - RedisStore types are outdated
      sendCommand: (...args: string[]) => redisClient.sendCommand(args),
      prefix: 'rl:',
    });
  }

  return rateLimit(config);
};

/**
 * Strict rate limit for OTP requests
 * Development: 100 requests per 15 minutes
 * Production: Should be changed to 3 requests per 15 minutes
 */
export const otpRateLimit = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: env.NODE_ENV === 'production' ? 3 : 100, // Relaxed for development
  message: 'Too many OTP requests. Please try again after 15 minutes',
});

/**
 * Rate limit for auth endpoints
 * Development: 100 requests per hour
 * Production: 10 requests per hour
 */
export const authRateLimit = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: env.NODE_ENV === 'production' ? 10 : 100, // Relaxed for development
  message: 'Too many authentication attempts. Please try again later',
});

/**
 * General API rate limit (100 requests per 15 minutes)
 */
export const apiRateLimit = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
});
