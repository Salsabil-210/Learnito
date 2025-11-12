import { Request, Response, NextFunction } from 'express';
import redisClient from '../config/redis';

interface RateLimitOptions {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Max requests per window
  keyPrefix?: string; // Prefix for Redis keys
  skipSuccessfulRequests?: boolean; // Don't count successful requests
  skipFailedRequests?: boolean; // Don't count failed requests
}

// In-memory fallback when Redis is unavailable
class InMemoryStore {
  private store: Map<string, { count: number; resetTime: number }> = new Map();

  async increment(key: string, windowMs: number): Promise<{ count: number; resetTime: number }> {
    const now = Date.now();
    const existing = this.store.get(key);

    if (existing && existing.resetTime > now) {
      existing.count++;
      return existing;
    }

    const newEntry = { count: 1, resetTime: now + windowMs };
    this.store.set(key, newEntry);

    // Cleanup old entries periodically
    if (this.store.size > 10000) {
      this.cleanup(now);
    }

    return newEntry;
  }

  private cleanup(now: number) {
    for (const [key, value] of this.store.entries()) {
      if (value.resetTime <= now) {
        this.store.delete(key);
      }
    }
  }
}

const inMemoryStore = new InMemoryStore();

export function createRateLimiter(options: RateLimitOptions) {
  const {
    windowMs,
    maxRequests,
    keyPrefix = 'rate-limit',
    skipSuccessfulRequests = false,
    skipFailedRequests = false,
  } = options;

  return async (req: Request, res: Response, next: NextFunction) => {
    // Generate unique key based on IP and optional email
    const identifier = req.ip || req.socket.remoteAddress || 'unknown';
    const email = req.body?.email || '';
    const key = `${keyPrefix}:${identifier}:${email}`;

    try {
      let count: number;
      let resetTime: number;

      // Try Redis first
      if (redisClient.status === 'ready') {
        const windowSeconds = Math.ceil(windowMs / 1000);
        const multi = redisClient.multi();
        
        multi.incr(key);
        multi.expire(key, windowSeconds);
        
        const results = await multi.exec();
        
        if (results && results[0] && results[0][1]) {
          count = results[0][1] as number;
          resetTime = Date.now() + windowMs;
        } else {
          throw new Error('Redis command failed');
        }
      } else {
        // Fallback to in-memory store
        const result = await inMemoryStore.increment(key, windowMs);
        count = result.count;
        resetTime = result.resetTime;
      }

      // Set rate limit headers
      res.setHeader('X-RateLimit-Limit', maxRequests);
      res.setHeader('X-RateLimit-Remaining', Math.max(0, maxRequests - count));
      res.setHeader('X-RateLimit-Reset', new Date(resetTime).toISOString());

      if (count > maxRequests) {
        return res.status(429).json({
          message: 'Too many requests, please try again later.',
          retryAfter: Math.ceil((resetTime - Date.now()) / 1000),
        });
      }

      // If we need to conditionally count requests, wrap the response
      if (skipSuccessfulRequests || skipFailedRequests) {
        const originalSend = res.send;
        res.send = function (data) {
          const statusCode = res.statusCode;
          const shouldSkip =
            (skipSuccessfulRequests && statusCode < 400) ||
            (skipFailedRequests && statusCode >= 400);

          if (shouldSkip && redisClient.status === 'ready') {
            // Decrement the count if we should skip this request
            redisClient.decr(key).catch(() => {
              // Ignore errors when decrementing
            });
          }

          return originalSend.call(this, data);
        };
      }

      return next();
    } catch (error) {
      console.error('Rate limiting error:', error);
      // On error, allow the request through (fail open)
      return next();
    }
  };
}

// Pre-configured rate limiters for common use cases
export const loginRateLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 5, // 5 requests per minute
  keyPrefix: 'login-limit',
  skipSuccessfulRequests: false,
});

export const signupRateLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 5, // 5 requests per minute
  keyPrefix: 'signup-limit',
  skipSuccessfulRequests: false,
});
