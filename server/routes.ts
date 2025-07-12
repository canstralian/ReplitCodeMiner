import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { ReplitApiService } from "./replitApi";
import { insertProjectSchema } from "@shared/schema";
import { 
  performanceMiddleware, 
  rateLimitMiddleware, 
  getPerformanceStats, 
  securityHeaders,
  validateInput 
} from "./middleware";
import { taskadeService } from "./taskadeService";
import { logger } from "./logger";
import { z } from "zod";
import AnalysisService from './analysisService';

export async function registerRoutes(app: Express): Promise<Server> {
  // Add performance monitoring
  app.use(performanceMiddleware);

  // Add security headers
  app.use(securityHeaders);

  // Add rate limiting
  app.use('/api/', rateLimitMiddleware(60000, 100)); // 100 requests per minute

  // Health check endpoints (before auth)
  const { healthRouter } = await import('./health');
  app.use('/', healthRouter);

  // Auth middleware
  await setupAuth(app);

  const replitApi = new ReplitApiService();

  // Performance monitoring endpoint
  app.get('/api/performance', isAuthenticated, (req, res) => {
    res.json(getPerformanceStats());
  });

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      if (!userId) {
        return res.status(400).json({ message: "User ID not found" });
      }
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Profile endpoint for secure user data retrieval
  app.get('/api/profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      if (!userId) {
        return res.status(400).json({ message: "User ID not found" });
      }
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Return sanitized profile data
      const profileData = {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        profileImageUrl: user.profileImageUrl,
        createdAt: user.createdAt,
        // Add computed fields
        fullName: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
        initials: `${user.firstName?.charAt(0) || ''}${user.lastName?.charAt(0) || ''}`.toUpperCase(),
      };
      
      res.json(profileData);
    } catch (error) {
      console.error("Error fetching profile:", error);
      res.status(500).json({ message: "Failed to fetch profile" });
    }
  });

  // Projects routes
  app.get('/api/projects', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const { refresh } = req.query;

      if (!userId) {
        return res.status(400).json({ message: "User ID not found" });
      }

      if (refresh === 'true') {
        if (!req.user?.access_token) {
          return res.status(401).json({ message: "Access token not found" });
        }
        // Fetch fresh data from Replit API
        const replitProjects = await replitApi.fetchUserProjects(req.user.access_token);
        await storage.syncUserProjects(userId, replitProjects);
      }

      const projects = await storage.getUserProjects(userId);
      res.json(projects);
    } catch (error) {
      console.error("Error fetching projects:", error);
      res.status(500).json({ message: "Failed to fetch projects" });
    }
  });

  app.get('/api/projects/stats', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const stats = await storage.getUserProjectStats(userId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching project stats:", error);
      res.status(500).json({ message: "Failed to fetch project stats" });
    }
  });

  // Input validation schemas
  const analyzeProjectsSchema = z.object({
    projectIds: z.array(z.string()).min(1).max(50)
  });

  const searchSchema = z.object({
    query: z.string().min(1).max(500),
    language: z.string().optional(),
    patternType: z.string().optional()
  });

  const taskadeNotificationSchema = z.object({
    title: z.string().min(1).max(200),
    description: z.string().min(1).max(1000),
    status: z.string().optional(),
    metadata: z.record(z.any()).optional()
  });

  app.post('/api/projects/analyze', 
    isAuthenticated, 
    validateInput(analyzeProjectsSchema),
    async (req: any, res) => {
      try {
        const userId = req.user.claims.sub;
        const { projectIds } = req.body;

        // Trigger analysis of specified projects
        const results = await replitApi.analyzeProjects(req.user.access_token, projectIds);
        await storage.storeAnalysisResults(userId, results);

        // Get stats and notify Taskade
        const stats = await storage.getUserProjectStats(userId);
        await taskadeService.notifyAnalysisComplete(userId, stats);

        res.json({ message: "Analysis completed", results });
      } catch (error) {
        logger.error("Error analyzing projects:", {
          error: error instanceof Error ? error.message : String(error),
          userId: req.user?.claims?.sub,
          projectIds: req.body?.projectIds
        });
        
        await taskadeService.notifyError("Project analysis failed", { 
          userId: req.user?.claims?.sub, 
          error: error instanceof Error ? error.message : String(error)
        });
        
        res.status(500).json({ message: "Failed to analyze projects" });
      }
    }
  );

  // Get duplicates
  app.get('/api/duplicates', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const duplicates = await storage.getUserDuplicates(userId);
      res.json(duplicates);
    } catch (error) {
      console.error("Error fetching duplicates:", error);
      res.status(500).json({ message: "Failed to fetch duplicates" });
    }
  });

  app.get('/api/duplicates/:groupId', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { groupId } = req.params;

      const group = await storage.getDuplicateGroup(userId, parseInt(groupId));
      if (!group) {
        return res.status(404).json({ message: "Duplicate group not found" });
      }

      res.json(group);
    } catch (error) {
      console.error("Error fetching duplicate group:", error);
      res.status(500).json({ message: "Failed to fetch duplicate group" });
    }
  });

  app.post('/api/search', 
    isAuthenticated, 
    validateInput(searchSchema),
    async (req: any, res) => {
      try {
        const userId = req.user.claims.sub;
        const { query, language, patternType } = req.body;

        const searchResults = await storage.searchCodePatterns(userId, {
          query,
          language,
          patternType
        });

        res.json(searchResults);
      } catch (error) {
        logger.error("Error searching code patterns:", {
          error: error instanceof Error ? error.message : String(error),
          userId: req.user?.claims?.sub,
          query: req.body?.query
        });
        res.status(500).json({ message: "Failed to search code patterns" });
      }
    }
  );

  // Taskade integration endpoints
  app.post('/api/taskade/notify', 
    isAuthenticated, 
    validateInput(taskadeNotificationSchema),
    async (req: any, res) => {
      try {
        const { title, description, status, metadata } = req.body;
        
        const success = await taskadeService.sendNotification({
          title,
          description,
          status,
          metadata,
        });

        res.json({ success, message: success ? 'Notification sent' : 'Failed to send notification' });
      } catch (error) {
        logger.error("Error sending Taskade notification:", {
          error: error instanceof Error ? error.message : String(error),
          userId: req.user?.claims?.sub
        });
        res.status(500).json({ message: "Failed to send notification" });
      }
    }
  );

  app.post('/api/taskade/task', isAuthenticated, async (req: any, res) => {
    try {
      const { title, description, assignee } = req.body;
      
      const success = await taskadeService.createTask(title, description, assignee);
      
      res.json({ success, message: success ? 'Task created' : 'Failed to create task' });
    } catch (error) {
      console.error("Error creating Taskade task:", error);
      res.status(500).json({ message: "Failed to create task" });
    }
  });

  // Settings endpoints
  app.get('/api/settings', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      if (!userId) {
        return res.status(400).json({ message: "User ID not found" });
      }
      
      const settings = await storage.getUserSettings(userId);
      res.json(settings);
    } catch (error) {
      console.error("Error fetching user settings:", error);
      if (error.message === 'User not found') {
        return res.status(404).json({ message: "User not found" });
      }
      res.status(500).json({ message: "Failed to fetch settings" });
    }
  });

  app.post('/api/settings', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      if (!userId) {
        return res.status(400).json({ message: "User ID not found" });
      }
      
      const settings = req.body;
      
      // Basic validation
      if (!settings || typeof settings !== 'object') {
        return res.status(400).json({ message: "Invalid settings data" });
      }
      
      await storage.updateUserSettings(userId, settings);
      res.json({ message: "Settings updated successfully" });
    } catch (error) {
      console.error("Error updating user settings:", error);
      res.status(500).json({ message: "Failed to update settings" });
    }
  });

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    const stats = getPerformanceStats();
    const health = stats?.getHealthStatus?.() || { status: 'unknown', issues: [] };

    res.json({
      status: health.status,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      issues: health.issues
    });
  });

  // Global error handler
  app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
    logger.error('Unhandled error:', {
      error: error.message,
      stack: error.stack,
      path: req.path,
      method: req.method,
      ip: req.ip
    });

    if (res.headersSent) {
      return next(error);
    }

    res.status(500).json({
      message: process.env.NODE_ENV === 'production' 
        ? 'Internal server error' 
        : error.message,
      ...(process.env.NODE_ENV !== 'production' && { stack: error.stack })
    });
  });

  // 404 handler
  app.use('*', (req: Request, res: Response) => {
    logger.warn('404 Not Found:', {
      path: req.path,
      method: req.method,
      ip: req.ip
    });
    
    res.status(404).json({
      message: 'Resource not found',
      path: req.path
    });
  });

  const httpServer = createServer(app);
  return httpServer;
}