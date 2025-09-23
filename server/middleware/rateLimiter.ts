import { Request, Response, NextFunction } from 'express';

interface RateLimitStore {
  [ip: string]: {
    count: number;
    resetTime: number;
  };
}

const store: RateLimitStore = {};
const WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS = 10; // 10 requests per minute per IP

export const rateLimiter = (req: Request, res: Response, next: NextFunction) => {
  const ip = req.ip || req.connection.remoteAddress || 'unknown';
  const now = Date.now();
  
  // Clean up expired entries
  for (const [key, value] of Object.entries(store)) {
    if (value.resetTime < now) {
      delete store[key];
    }
  }
  
  // Initialize or get current count for IP
  if (!store[ip] || store[ip].resetTime < now) {
    store[ip] = {
      count: 1,
      resetTime: now + WINDOW_MS
    };
  } else {
    store[ip].count++;
  }
  
  // Check if limit exceeded
  if (store[ip].count > MAX_REQUESTS) {
    res.status(429).json({
      success: false,
      message: 'Too many requests. Please try again later.',
      retryAfter: Math.ceil((store[ip].resetTime - now) / 1000)
    });
    return;
  }
  
  // Add rate limit headers
  res.set({
    'X-RateLimit-Limit': MAX_REQUESTS.toString(),
    'X-RateLimit-Remaining': Math.max(0, MAX_REQUESTS - store[ip].count).toString(),
    'X-RateLimit-Reset': Math.ceil(store[ip].resetTime / 1000).toString()
  });
  
  next();
};
