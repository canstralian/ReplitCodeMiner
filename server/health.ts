
import { Router } from 'express';
import { db } from './db';
import { logger } from './logger';

const router = Router();

// Health check endpoint
router.get('/health', async (req, res) => {
  try {
    const checks = {
      timestamp: new Date().toISOString(),
      service: 'replit-duplicate-detector',
      version: process.env.npm_package_version || '1.0.0',
      status: 'healthy',
      dependencies: {
        database: 'unknown',
        memory: process.memoryUsage(),
        uptime: process.uptime()
      }
    };

    // Check database connection
    try {
      await db.execute('SELECT 1');
      checks.dependencies.database = 'healthy';
    } catch (error) {
      checks.dependencies.database = 'unhealthy';
      checks.status = 'degraded';
      logger.error('Database health check failed:', error);
    }

    const statusCode = checks.status === 'healthy' ? 200 : 503;
    res.status(statusCode).json(checks);
  } catch (error) {
    logger.error('Health check failed:', error);
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Health check failed'
    });
  }
});

// Readiness check
router.get('/ready', async (req, res) => {
  try {
    await db.execute('SELECT 1');
    res.status(200).json({ status: 'ready' });
  } catch (error) {
    logger.error('Readiness check failed:', error);
    res.status(503).json({ status: 'not ready' });
  }
});

export { router as healthRouter };
