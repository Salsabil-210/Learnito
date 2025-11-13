import { Request, Response, NextFunction } from 'express';
import { createClient, RedisClientType } from 'redis';

/**
 * In-memory store for rate limiting when Redis is unavailable
 */
class InMemoryStore {
  private store: Map<string, { count: number; resetTime: number }> = new Map();

  /**
   * Increment the count for a given key using fixed-window approach
   */
  async increment(key: string, windowMs: number): Promise<{ count: number; resetTime: number }> {
    const now = Date.now();
    const existing = this.store.get(key);

    if (existing && now < existing.resetTime) {
      // Within current window, increment count
      existing.count++;
      return { count: existing.count, resetTime: existing.resetTime };
    } else {
      // Start new window
      const resetTime = now + windowMs;
      this.store.set(key, { count: 1, resetTime });
      
      // Cleanup if store gets too large
      if (this.store.size > 10000) {
        this.cleanup(now);
      }
      
      return { count: 1, resetTime };
    }
  }

  /**
   * Decrement the count for a given key (for skip requests feature)
   */
  async decrement(key: string): Promise<void> {
    const existing = this.store.get(key);
    if (existing && existing.count > 0) {
      existing.count--;
      if (existing.count === 0) {
        this.store.delete(key);
      }
    }
  }

  /**
   * Clean up expired entries
   */
  cleanup(now: number): void {
    for (const [key, value] of this.store.entries()) {
      if (now >= value.resetTime) {
        this.store.delete(key);
      }
    }
  }
}

// Singleton instance
const inMemoryStore = new InMemoryStore();

// Periodic cleanup every 5 minutes
setInterval(() => inMemoryStore.cleanup(Date.now()), 300000);

/**
 * Redis client instance
 */
let redisClient: RedisClientType | null = null;

/**
 * Initialize Redis client if REDIS_URL is provided
 */
async function initRedis(): Promise<void> {
  const redisUrl = process.env.REDIS_URL;
  if (!redisUrl) {
    console.log('No REDIS_URL provided, using in-memory rate limiting');
    return;
  }

  try {
    redisClient = createClient({ url: redisUrl });
    
    redisClient.on('error', (err) => {
      console.error('Redis Client Error:', err);
    });

    redisClient.on('ready', () => {
      console.log('Redis client connected and ready');
    });

    await redisClient.connect();
  } catch (error) {
    console.error('Failed to connect to Redis:', error);
    redisClient = null;
  }
}

// Initialize Redis on module load
initRedis().catch(console.error);

interface RateLimiterOptions {
  windowMs: number;
  maxRequests: number;
  message?: string;
  statusCode?: number;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
  keyGenerator?: (req: Request) => string;
}

/**
 * Get client IP address with proxy support
 */
function getClientIp(req: Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    const ips = forwarded.toString().split(',');
    return ips[0].trim();
  }
  return req.ip || req.socket.remoteAddress || 'unknown';
}

/**
 * Default key generator using IP and email (if available)
 */
function defaultKeyGenerator(req: Request): string {
  const ip = getClientIp(req);
  const email = req.body?.email || '';
  return `ratelimit:${ip}:${email}`;
}

/**
 * Create a rate limiter middleware
 */
export function createRateLimiter(options: RateLimiterOptions) {
  const {
    windowMs,
    maxRequests,
    message = 'Too many requests, please try again later.',
    statusCode = 429,
    skipSuccessfulRequests = false,
    skipFailedRequests = false,
    keyGenerator = defaultKeyGenerator,
  } = options;

  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const key = keyGenerator(req);
      const now = Date.now();
      const bucket = Math.floor(now / windowMs);
      const fullKey = `${key}:${bucket}`;

      let count: number;
      let resetTime: number;

      // Try Redis first
      if (redisClient && redisClient.isReady) {
        try {
          count = await redisClient.incr(fullKey);
          const windowSeconds = Math.ceil(windowMs / 1000);
          await redisClient.expire(fullKey, windowSeconds * 2); // Cover overlap
          resetTime = (bucket + 1) * windowMs;
        } catch (redisError) {
          console.error('Redis command error, falling back to in-memory:', redisError);
          // Fallback to in-memory on Redis command failure
          const result = await inMemoryStore.increment(fullKey, windowMs);
          count = result.count;
          resetTime = result.resetTime;
        }
      } else {
        // Use in-memory store
        const result = await inMemoryStore.increment(fullKey, windowMs);
        count = result.count;
        resetTime = result.resetTime;
      }

      // Set rate limit headers
      res.setHeader('X-RateLimit-Limit', maxRequests.toString());
      res.setHeader('X-RateLimit-Remaining', Math.max(0, maxRequests - count).toString());
      res.setHeader('X-RateLimit-Reset', new Date(resetTime).toISOString());

      // Check if limit exceeded
      if (count > maxRequests) {
        res.status(statusCode).json({ error: message });
        return;
      }

      // Handle skip requests if enabled
      if (skipSuccessfulRequests || skipFailedRequests) {
        res.on('finish', () => {
          const responseStatusCode = res.statusCode;
          const shouldSkip =
            (skipSuccessfulRequests && responseStatusCode < 400) ||
            (skipFailedRequests && responseStatusCode >= 400);

          if (shouldSkip) {
            if (redisClient && redisClient.isReady) {
              redisClient.decr(fullKey).catch(() => {});
            } else {
              inMemoryStore.decrement(fullKey).catch(() => {});
            }
          }
        });
      }

      next();
    } catch (error) {
      console.error('Rate limiting error:', error);
      // Fail-open: Allow request on unexpected errors
      next();
    }
  };
}

/**
 * Pre-configured rate limiters for common use cases
 */
export const authRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 5, // 5 requests per window
  message: 'Too many authentication attempts, please try again later.',
});

export const loginRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 5, // 5 login attempts per window
  message: 'Too many login attempts, please try again later.',
});

export const refreshTokenRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 10, // 10 refresh attempts per window
  message: 'Too many token refresh attempts, please try again later.',
});

export const signupRateLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  maxRequests: 3, // 3 signup attempts per hour
  message: 'Too many signup attempts, please try again later.',
});
