
import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { ReplitApiService } from "./replitApi";
import { insertProjectSchema } from "@shared/schema";
import { performanceMiddleware, rateLimitMiddleware, getPerformanceStats, securityHeaders } from "./middleware";
import { taskadeService } from "./taskadeService";
import { logger } from "./logger";
import { z } from "zod";
import AnalysisService from './analysisService';
import compression from 'compression';

// Request validation schemas
const searchSchema = z.object({
  query: z.string().min(1).max(1000),
  language: z.string().optional(),
  patternType: z.string().optional(),
  limit: z.number().min(1).max(100).optional(),
  offset: z.number().min(0).optional()
});

const analyzeProjectsSchema = z.object({
  projectIds: z.array(z.string()).min(1).max(50),
  options: z.object({
    duplicateThreshold: z.number().min(0).max(1).optional(),
    maxFileSize: z.number().min(1).max(10 * 1024 * 1024).optional(), // Max 10MB
    includeLanguages: z.array(z.string()).optional()
  }).optional()
});

const settingsSchema = z.object({
  profile: z.object({
    firstName: z.string().max(100).optional(),
    lastName: z.string().max(100).optional()
  }).optional(),
  notifications: z.object({
    emailNotifications: z.boolean().optional(),
    taskadeIntegration: z.boolean().optional(),
    analysisComplete: z.boolean().optional(),
    duplicatesFound: z.boolean().optional()
  }).optional(),
  analysis: z.object({
    autoAnalyze: z.boolean().optional(),
    duplicateThreshold: z.number().min(0).max(1).optional(),
    excludePatterns: z.array(z.string()).optional(),
    includeLanguages: z.array(z.string()).optional()
  }).optional(),
  privacy: z.object({
    profileVisibility: z.enum(['public', 'private']).optional(),
    shareAnalytics: z.boolean().optional(),
    dataRetention: z.number().min(1).max(365).optional()
  }).optional()
});

// Initialize analysis service
const analysisService = new AnalysisService();

export async function registerRoutes(app: Express): Promise<Server> {
  // Add compression middleware for better performance
  app.use(compression({
    level: 6,
    threshold: 1024,
    filter: (req, res) => {
      if (req.headers['x-no-compression']) {
        return false;
      }
      return compression.filter(req, res);
    }
  }));

  // Add performance monitoring
  app.use(performanceMiddleware);

  // Add security headers
  app.use(securityHeaders);

  // Add rate limiting with different limits for different endpoints
  app.use('/api/auth', rateLimitMiddleware(60000, 20)); // 20 requests per minute for auth
  app.use('/api/projects/analyze', rateLimitMiddleware(300000, 5)); // 5 requests per 5 minutes for analysis
  app.use('/api/', rateLimitMiddleware(60000, 100)); // 100 requests per minute for general API

  // Health check endpoints (before auth)
  const { healthRouter } = await import('./health');
  app.use('/', healthRouter);

  // Auth middleware
  await setupAuth(app);

  const replitApi = new ReplitApiService();

  // Enhanced error handling wrapper
  const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };

  // Request validation middleware
  const validateRequest = (schema: z.ZodSchema) => (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = schema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({
          message: "Validation error",
          errors: result.error.errors.map(err => ({
            path: err.path.join('.'),
            message: err.message
          }))
        });
      }
      req.body = result.data;
      next();
    } catch (error) {
      logger.error('Validation error:', error);
      res.status(400).json({ message: "Invalid request data" });
    }
  };

  // Performance monitoring endpoint
  app.get('/api/performance', isAuthenticated, (req, res) => {
    const performanceStats = getPerformanceStats();
    const analysisStats = analysisService.getCacheStats();
    const storageStats = storage.getMetrics();
    
    res.json({
      performance: performanceStats,
      analysis: analysisStats,
      storage: storageStats,
      timestamp: new Date().toISOString()
    });
  });

  // Enhanced auth routes
  app.get('/api/auth/user', isAuthenticated, asyncHandler(async (req: any, res: Response) => {
    const userId = req.user?.claims?.sub;
    if (!userId) {
      return res.status(400).json({ message: "User ID not found" });
    }
    
    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Add user activity logging
    logger.info(`User ${userId} accessed profile`);
    
    res.json(user);
  }));

  // Enhanced profile endpoint
  app.get('/api/profile', isAuthenticated, asyncHandler(async (req: any, res: Response) => {
    const userId = req.user?.claims?.sub;
    if (!userId) {
      return res.status(400).json({ message: "User ID not found" });
    }
    
    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Return enhanced profile data with computed fields
    const profileData = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      profileImageUrl: user.profileImageUrl,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      // Computed fields
      fullName: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
      initials: `${user.firstName?.charAt(0) || ''}${user.lastName?.charAt(0) || ''}`.toUpperCase(),
    };
    
    res.json(profileData);
  }));

  // Enhanced projects routes with pagination and sorting
  app.get('/api/projects', isAuthenticated, asyncHandler(async (req: any, res: Response) => {
    const userId = req.user?.claims?.sub;
    const { refresh, limit = 20, offset = 0, sortBy = 'lastUpdated', sortOrder = 'desc' } = req.query;

    if (!userId) {
      return res.status(400).json({ message: "User ID not found" });
    }

    if (refresh === 'true') {
      if (!req.user?.access_token) {
        return res.status(401).json({ message: "Access token not found" });
      }
      
      try {
        // Fetch fresh data from Replit API
        const replitProjects = await replitApi.fetchUserProjects(req.user.access_token);
        await storage.syncUserProjects(userId, replitProjects);
        logger.info(`Refreshed ${replitProjects.length} projects for user ${userId}`);
      } catch (error) {
        logger.error(`Failed to refresh projects for user ${userId}:`, error);
        // Continue with cached data if refresh fails
      }
    }

    const projects = await storage.getUserProjects(userId, {
      limit: Math.min(parseInt(limit as string), 100),
      offset: Math.max(parseInt(offset as string), 0),
      sortBy: sortBy as any,
      sortOrder: sortOrder as any
    });
    
    res.json({
      projects,
      pagination: {
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
        hasMore: projects.length === parseInt(limit as string)
      }
    });
  }));

  app.get('/api/projects/stats', isAuthenticated, asyncHandler(async (req: any, res: Response) => {
    const userId = req.user.claims.sub;
    const stats = await storage.getUserProjectStats(userId);
    res.json(stats);
  }));

  // Enhanced analysis endpoint with validation and progress tracking
  app.post('/api/projects/analyze', 
    isAuthenticated,
    validateRequest(analyzeProjectsSchema),
    asyncHandler(async (req: any, res: Response) => {
      const userId = req.user.claims.sub;
      const { projectIds, options = {} } = req.body;

      logger.info(`Starting analysis for user ${userId} with ${projectIds.length} projects`);

      try {
        // Fetch project data
        const projects = await storage.getUserProjects(userId);
        const projectsToAnalyze = projects.filter(p => projectIds.includes(p.id.toString()));

        if (projectsToAnalyze.length === 0) {
          return res.status(400).json({ message: "No valid projects found for analysis" });
        }

        // Perform analysis with the enhanced service
        const results = await analysisService.analyzeProjects(userId, projectsToAnalyze);

        // Get updated stats
        const stats = await storage.getUserProjectStats(userId);

        // Notify Taskade asynchronously
        setImmediate(async () => {
          try {
            await taskadeService.notifyAnalysisComplete(userId, stats);
          } catch (error) {
            logger.error('Failed to notify Taskade:', error);
          }
        });

        logger.info(`Analysis completed for user ${userId} in ${results.processingTime}ms`);

        res.json({
          message: "Analysis completed successfully",
          results: {
            totalFiles: results.totalFiles,
            duplicatesFound: results.duplicatesFound,
            patternTypes: results.patternTypes,
            processingTime: results.processingTime,
            optimizationStats: results.optimizationStats
          },
          stats
        });
      } catch (error) {
        logger.error(`Analysis failed for user ${userId}:`, error);
        
        // Notify Taskade of error asynchronously
        setImmediate(async () => {
          try {
            await taskadeService.notifyError("Project analysis failed", { 
              userId, 
              error: error instanceof Error ? error.message : 'Unknown error' 
            });
          } catch (notifyError) {
            logger.error('Failed to notify Taskade of error:', notifyError);
          }
        });
        
        res.status(500).json({ 
          message: "Analysis failed", 
          error: error instanceof Error ? error.message : 'Unknown error' 
        });
      }
    })
  );

  // Enhanced duplicates endpoints with filtering
  app.get('/api/duplicates', isAuthenticated, asyncHandler(async (req: any, res: Response) => {
    const userId = req.user.claims.sub;
    const { limit = 50, offset = 0, minSimilarity = 0.7 } = req.query;
    
    const duplicates = await storage.getUserDuplicates(userId, {
      limit: Math.min(parseInt(limit as string), 100),
      offset: Math.max(parseInt(offset as string), 0),
      minSimilarity: Math.max(parseFloat(minSimilarity as string), 0.1)
    });
    
    res.json({
      duplicates,
      pagination: {
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
        hasMore: duplicates.length === parseInt(limit as string)
      }
    });
  }));

  app.get('/api/duplicates/:groupId', isAuthenticated, asyncHandler(async (req: any, res: Response) => {
    const userId = req.user.claims.sub;
    const { groupId } = req.params;

    const group = await storage.getDuplicateGroup(userId, parseInt(groupId));
    if (!group) {
      return res.status(404).json({ message: "Duplicate group not found" });
    }

    res.json(group);
  }));

  // Enhanced search endpoint with validation
  app.post('/api/search',
    isAuthenticated,
    validateRequest(searchSchema),
    asyncHandler(async (req: any, res: Response) => {
      const userId = req.user.claims.sub;
      const searchParams = req.body;

      const searchResults = await storage.searchCodePatterns(userId, searchParams);

      res.json({
        results: searchResults,
        pagination: {
          limit: searchParams.limit || 50,
          offset: searchParams.offset || 0,
          hasMore: searchResults.length === (searchParams.limit || 50)
        }
      });
    })
  );

  // Enhanced Taskade integration endpoints
  app.post('/api/taskade/notify', isAuthenticated, asyncHandler(async (req: any, res: Response) => {
    const { title, description, status, metadata } = req.body;
    
    if (!title) {
      return res.status(400).json({ message: "Title is required" });
    }
    
    const success = await taskadeService.sendNotification({
      title,
      description: description || '',
      status: status || 'info',
      metadata: metadata || {},
    });

    res.json({ 
      success, 
      message: success ? 'Notification sent successfully' : 'Failed to send notification' 
    });
  }));

  app.post('/api/taskade/task', isAuthenticated, asyncHandler(async (req: any, res: Response) => {
    const { title, description, assignee } = req.body;
    
    if (!title) {
      return res.status(400).json({ message: "Title is required" });
    }
    
    const success = await taskadeService.createTask(title, description || '', assignee);
    
    res.json({ 
      success, 
      message: success ? 'Task created successfully' : 'Failed to create task' 
    });
  }));

  // Enhanced settings endpoints with validation
  app.get('/api/settings', isAuthenticated, asyncHandler(async (req: any, res: Response) => {
    const userId = req.user.claims.sub;
    if (!userId) {
      return res.status(400).json({ message: "User ID not found" });
    }
    
    const settings = await storage.getUserSettings(userId);
    res.json(settings);
  }));

  app.post('/api/settings',
    isAuthenticated,
    validateRequest(settingsSchema),
    asyncHandler(async (req: any, res: Response) => {
      const userId = req.user.claims.sub;
      if (!userId) {
        return res.status(400).json({ message: "User ID not found" });
      }
      
      const settings = req.body;
      await storage.updateUserSettings(userId, settings);
      
      res.json({ message: "Settings updated successfully" });
    })
  );

  // Enhanced health check endpoint
  app.get('/api/health', (req, res) => {
    const performanceStats = getPerformanceStats();
    const analysisStats = analysisService.getCacheStats();
    const storageStats = storage.getMetrics();
    const health = performanceStats?.getHealthStatus?.() || { status: 'unknown', issues: [] };

    res.json({
      status: health.status,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      performance: {
        queries: storageStats.queriesExecuted,
        avgQueryTime: storageStats.queriesExecuted > 0 ? storageStats.queryTime / storageStats.queriesExecuted : 0,
        cacheHitRate: storageStats.cacheHits + storageStats.cacheMisses > 0 
          ? storageStats.cacheHits / (storageStats.cacheHits + storageStats.cacheMisses) 
          : 0
      },
      caches: {
        analysis: analysisStats,
        storage: { size: storageStats.cacheSize }
      },
      issues: health.issues
    });
  });

  // Global error handler with enhanced error reporting
  app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
    const errorId = Date.now().toString(36) + Math.random().toString(36).substr(2);
    
    logger.error('Unhandled error:', {
      errorId,
      error: error.message,
      stack: error.stack,
      path: req.path,
      method: req.method,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      body: req.method === 'POST' ? req.body : undefined
    });

    if (res.headersSent) {
      return next(error);
    }

    const isDevelopment = process.env.NODE_ENV !== 'production';
    
    res.status(500).json({
      message: isDevelopment ? error.message : 'Internal server error',
      errorId,
      ...(isDevelopment && { stack: error.stack })
    });
  });

  // Enhanced 404 handler for API routes
  app.use('/api/*', (req: Request, res: Response) => {
    logger.warn('404 Not Found:', {
      path: req.path,
      method: req.method,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });
    
    res.status(404).json({
      message: 'Resource not found',
      path: req.path,
      suggestion: 'Check the API documentation for available endpoints'
    });
  });

  const httpServer = createServer(app);
  return httpServer;
}
