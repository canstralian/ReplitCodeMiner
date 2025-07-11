import { Request, Response, NextFunction } from 'express';
import { LRUCache } from 'lru-cache';
import { logger } from './logger';
import { z } from 'zod';

interface PerformanceMetrics {
  endpoint: string;
  method: string;
  duration: number;
  timestamp: number;
  statusCode: number;
  userAgent?: string;
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics[] = [];
  private readonly MAX_METRICS = 1000;
  private endpointStats: Map<string, {
    count: number;
    totalTime: number;
    errors: number;
    lastAccess: number;
  }> = new Map();

  addMetric(metric: PerformanceMetrics) {
    this.metrics.push(metric);
    if (this.metrics.length > this.MAX_METRICS) {
      this.metrics.shift();
    }

    // Track per-endpoint statistics
    const key = `${metric.method}:${metric.endpoint}`;
    const stats = this.endpointStats.get(key) || {
      count: 0,
      totalTime: 0,
      errors: 0,
      lastAccess: 0
    };

    stats.count++;
    stats.totalTime += metric.duration;
    stats.lastAccess = metric.timestamp;

    if (metric.statusCode >= 400) {
      stats.errors++;
    }

    this.endpointStats.set(key, stats);
  }

  getStats() {
    if (this.metrics.length === 0) return null;

    const durations = this.metrics.map(m => m.duration);
    const avg = durations.reduce((a, b) => a + b, 0) / durations.length;
    const min = Math.min(...durations);
    const max = Math.max(...durations);

    // Calculate percentiles
    const sorted = [...durations].sort((a, b) => a - b);
    const p95 = sorted[Math.floor(sorted.length * 0.95)];
    const p99 = sorted[Math.floor(sorted.length * 0.99)];

    // Get endpoint performance breakdown
    const endpointBreakdown = Array.from(this.endpointStats.entries())
      .map(([endpoint, stats]) => ({
        endpoint,
        averageTime: Math.round(stats.totalTime / stats.count),
        requestCount: stats.count,
        errorRate: Math.round((stats.errors / stats.count) * 100),
        lastAccess: stats.lastAccess
      }))
      .sort((a, b) => b.averageTime - a.averageTime);

    return {
      totalRequests: this.metrics.length,
      averageResponseTime: Math.round(avg),
      minResponseTime: min,
      maxResponseTime: max,
      p95ResponseTime: p95,
      p99ResponseTime: p99,
      slowRequests: this.metrics.filter(m => m.duration > 1000).length,
      errorRate: Math.round((this.metrics.filter(m => m.statusCode >= 400).length / this.metrics.length) * 100),
      endpointBreakdown: endpointBreakdown.slice(0, 10), // Top 10 slowest endpoints
      memoryUsage: process.memoryUsage(),
      uptime: process.uptime()
    };
  }

  getHealthStatus() {
    const stats = this.getStats();
    if (!stats) return { status: 'unknown', issues: [] };

    const issues = [];
    let status = 'healthy';

    // Check for performance issues
    if (stats.averageResponseTime > 500) {
      issues.push('High average response time');
      status = 'degraded';
    }

    if (stats.errorRate > 5) {
      issues.push('High error rate');
      status = 'unhealthy';
    }

    if (stats.slowRequests > stats.totalRequests * 0.1) {
      issues.push('Too many slow requests');
      status = 'degraded';
    }

    // Check memory usage
    const memoryUsage = stats.memoryUsage.heapUsed / stats.memoryUsage.heapTotal;
    if (memoryUsage > 0.9) {
      issues.push('High memory usage');
      status = 'degraded';
    }

    return { status, issues };
  }
}

const performanceMonitor = new PerformanceMonitor();

export function performanceMiddleware(req: Request, res: Response, next: NextFunction): void {
  const startTime = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - startTime;

    performanceMonitor.addMetric({
      endpoint: req.path,
      method: req.method,
      duration,
      timestamp: startTime,
      statusCode: res.statusCode,
      userAgent: req.get('User-Agent'),
    });

    // Log slow requests
    if (duration > 1000) {
      console.warn(`Slow request detected: ${req.method} ${req.path} took ${duration}ms`);
    }
  });

  next();
}

export function getPerformanceStats() {
  return performanceMonitor.getStats();
}

// Rate limiting using LRU cache
const rateLimitStore = new LRUCache<string, number[]>({
  max: 10000,
  ttl: 60000 // 1 minute
});

// Rate limiting middleware
export function rateLimitMiddleware(windowMs: number, maxRequests: number) {
  return (req: Request, res: Response, next: NextFunction) => {
    const key = req.ip || 'unknown';
    const now = Date.now();
    const windowStart = now - windowMs;
    
    let requests = rateLimitStore.get(key) || [];
    
    // Filter out old requests
    requests = requests.filter(timestamp => timestamp > windowStart);
    
    if (requests.length >= maxRequests) {
      logger.warn('Rate limit exceeded', {
        ip: req.ip,
        path: req.path,
        requestCount: requests.length
      });
      return res.status(429).json({
        message: 'Too many requests. Please try again later.',
        retryAfter: Math.ceil(windowMs / 1000)
      });
    }
    
    // Add current request
    requests.push(now);
    rateLimitStore.set(key, requests);
    
    next();
  };
}

// Input validation middleware
export function validateInput(schema: z.ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = schema.safeParse(req.body);
      if (!result.success) {
        logger.warn('Input validation failed', {
          path: req.path,
          errors: result.error.issues,
          ip: req.ip
        });
        return res.status(400).json({
          message: 'Invalid input',
          errors: result.error.issues
        });
      }
      req.body = result.data;
      next();
    } catch (error) {
      logger.error('Validation middleware error:', error);
      res.status(500).json({ message: 'Validation error' });
    }
  };
}

// Security headers middleware
export function securityHeaders(req: Request, res: Response, next: NextFunction) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
}