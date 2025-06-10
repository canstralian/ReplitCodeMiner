
import rateLimit from 'express-rate-limit';
import { logger } from './logger';

export const createRateLimiter = (windowMs: number, max: number, message: string) => {
  return rateLimit({
    windowMs,
    max,
    message: { message },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      logger.warn('Rate limit exceeded', {
        ip: req.ip,
        path: req.path,
        method: req.method,
        userAgent: req.get('User-Agent')
      });
      res.status(429).json({ message });
    }
  });
};

// Different rate limits for different endpoints
export const generalLimiter = createRateLimiter(
  15 * 60 * 1000, // 15 minutes
  100, // max 100 requests per windowMs
  'Too many requests from this IP, please try again later'
);

export const authLimiter = createRateLimiter(
  15 * 60 * 1000, // 15 minutes
  5, // max 5 auth attempts per windowMs
  'Too many authentication attempts, please try again later'
);

export const analysisLimiter = createRateLimiter(
  60 * 60 * 1000, // 1 hour
  10, // max 10 analysis requests per hour
  'Too many analysis requests, please try again later'
);
