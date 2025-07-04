
import { Request, Response, NextFunction } from 'express';

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
  private readonly maxMetrics = 1000;

  addMetric(metric: PerformanceMetrics): void {
    this.metrics.push(metric);
    
    // Keep only the last N metrics to prevent memory leaks
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics);
    }
  }

  getAverageResponseTime(endpoint?: string): number {
    const relevantMetrics = endpoint 
      ? this.metrics.filter(m => m.endpoint === endpoint)
      : this.metrics;
    
    if (relevantMetrics.length === 0) return 0;
    
    const total = relevantMetrics.reduce((sum, metric) => sum + metric.duration, 0);
    return total / relevantMetrics.length;
  }

  getSlowEndpoints(threshold = 1000): PerformanceMetrics[] {
    return this.metrics.filter(m => m.duration > threshold);
  }

  getStats() {
    return {
      totalRequests: this.metrics.length,
      averageResponseTime: this.getAverageResponseTime(),
      slowRequests: this.getSlowEndpoints().length,
      endpointStats: this.getEndpointStats(),
    };
  }

  private getEndpointStats() {
    const stats: Record<string, { count: number; avgTime: number; maxTime: number }> = {};
    
    this.metrics.forEach(metric => {
      if (!stats[metric.endpoint]) {
        stats[metric.endpoint] = { count: 0, avgTime: 0, maxTime: 0 };
      }
      
      const stat = stats[metric.endpoint];
      stat.count++;
      stat.maxTime = Math.max(stat.maxTime, metric.duration);
      stat.avgTime = (stat.avgTime * (stat.count - 1) + metric.duration) / stat.count;
    });
    
    return stats;
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

// Rate limiting middleware
const requestCounts = new Map<string, { count: number; resetTime: number }>();

export function rateLimitMiddleware(windowMs = 60000, maxRequests = 100) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const clientId = req.ip || 'unknown';
    const now = Date.now();
    
    const clientData = requestCounts.get(clientId);
    
    if (!clientData || now > clientData.resetTime) {
      requestCounts.set(clientId, {
        count: 1,
        resetTime: now + windowMs,
      });
      return next();
    }
    
    if (clientData.count >= maxRequests) {
      res.status(429).json({
        error: 'Too many requests',
        retryAfter: Math.ceil((clientData.resetTime - now) / 1000),
      });
      return;
    }
    
    clientData.count++;
    next();
  };
}
