import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

class CacheService {
  private cache = new Map<string, { data: any; expiresAt: number }>();

  get(key: string): any {
    const cached = this.cache.get(key);
    if (!cached) return null;
    if (Date.now() > cached.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    return cached.data;
  }

  set(key: string, data: any, ttlSeconds: number): void {
    this.cache.set(key, {
      data,
      expiresAt: Date.now() + ttlSeconds * 1000,
    });
  }

  clearPattern(pattern: string): void {
    let clearedCount = 0;
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
        clearedCount++;
      }
    }
    if (clearedCount > 0) {
      logger.debug(`Cache cleared for pattern: "${pattern}" (${clearedCount} entries)`);
    }
  }

  clearAll(): void {
    this.cache.clear();
    logger.debug('All caches cleared');
  }
}

export const cacheService = new CacheService();

export const cacheMiddleware = (ttlSeconds = 300) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    const key = `${req.originalUrl || req.url}`;
    const cachedData = cacheService.get(key);

    if (cachedData) {
      logger.debug(`Cache hit for key: ${key}`);
      return res.status(200).json(cachedData);
    }

    // Intercept res.json to cache response body
    const originalJson = res.json;
    res.json = function (body: any) {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        cacheService.set(key, body, ttlSeconds);
      }
      return originalJson.call(this, body);
    };

    next();
  };
};

export const clearCacheMiddleware = (pattern: string) => {
  return (_req: Request, _res: Response, next: NextFunction) => {
    cacheService.clearPattern(pattern);
    next();
  };
};
