import type { NextFunction, Request, Response } from 'express';

interface RateLimitOptions {
  key: string;
  maxRequests: number;
  windowMs: number;
}

interface Bucket {
  resetAt: number;
  requestCount: number;
}

const buckets = new Map<string, Bucket>();

function getClientKey(request: Request) {
  return request.ip || request.socket.remoteAddress || 'unknown';
}

export function createRateLimit(options: RateLimitOptions) {
  return function rateLimit(
    request: Request,
    response: Response,
    next: NextFunction
  ) {
    const now = Date.now();
    const bucketKey = `${options.key}:${getClientKey(request)}`;
    const existing = buckets.get(bucketKey);

    if (!existing || existing.resetAt <= now) {
      buckets.set(bucketKey, {
        resetAt: now + options.windowMs,
        requestCount: 1,
      });
      next();
      return;
    }

    if (existing.requestCount >= options.maxRequests) {
      const retryAfterSeconds = Math.ceil((existing.resetAt - now) / 1000);
      response.setHeader('Retry-After', retryAfterSeconds.toString());
      response.status(429).json({ message: 'Too many requests' });
      return;
    }

    existing.requestCount += 1;
    next();
  };
}
