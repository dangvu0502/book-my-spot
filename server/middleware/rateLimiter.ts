import { Request, Response, NextFunction } from 'express';

interface RateLimitStore {
  [ip: string]: {
    count: number;
    resetTime: number;
  };
}

const store: RateLimitStore = {};
const WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS = 100; // 100 requests per minute per IP
const CLEANUP_INTERVAL = 5 * 60 * 1000; // Clean up every 5 minutes
const MAX_STORE_SIZE = 10000; // Maximum number of IPs to track

// Function to get real client IP, handling proxies
function getClientIp(req: Request): string {
  // In production, trust the X-Forwarded-For header from trusted proxies
  // In development, use the direct connection IP
  if (process.env.NODE_ENV === 'production' && process.env.TRUST_PROXY === 'true') {
    const forwarded = req.headers['x-forwarded-for'];
    if (forwarded) {
      // Get the first IP in the chain (the real client IP)
      const ips = typeof forwarded === 'string' ? forwarded.split(',') : forwarded;
      return ips[0].trim();
    }
  }

  // Fallback to direct connection IP
  return req.ip || req.socket.remoteAddress || 'unknown';
}

// Periodic cleanup to prevent memory leaks
setInterval(() => {
  const now = Date.now();
  const keys = Object.keys(store);

  // Clean up expired entries
  for (const key of keys) {
    if (store[key] && store[key].resetTime < now) {
      delete store[key];
    }
  }

  // If store is too large, remove oldest entries
  if (Object.keys(store).length > MAX_STORE_SIZE) {
    const entries = Object.entries(store);
    entries.sort((a, b) => a[1].resetTime - b[1].resetTime);
    const toRemove = entries.slice(0, entries.length - MAX_STORE_SIZE);
    for (const [key] of toRemove) {
      delete store[key];
    }
  }
}, CLEANUP_INTERVAL);

export const rateLimiter = (req: Request, res: Response, next: NextFunction) => {
  const ip = getClientIp(req);
  const now = Date.now();

  // Don't rate limit unknown IPs (but log warning in production)
  if (ip === 'unknown') {
    if (process.env.NODE_ENV === 'production') {
      console.warn('Could not determine client IP for rate limiting');
    }
    next();
    return;
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
