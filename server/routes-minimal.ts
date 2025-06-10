import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { ReplitApiService } from "./replitApi";
import { logger, AppError } from "./logger";

// Simplified authentication middleware for development
const isAuthenticated = (req: any, res: any, next: any) => {
  req.user = {
    claims: { sub: 'dev-user-id' },
    access_token: 'dev-token'
  };
  next();
};

export async function registerRoutes(app: Express): Promise<Server> {
  const replitApi = new ReplitApiService();

  // Health check endpoint
  app.get('/health', (req, res) => {
    res.json({ status: 'healthy', timestamp: new Date().toISOString() });
  });

  // Auth routes (simplified)
  app.get('/api/auth/user', isAuthenticated, async (req: any, res, next) => {
    try {
      const userId = req.user?.claims?.sub;
      if (!userId) {
        throw new AppError('User ID not found in token', 401);
      }

      const user = await storage.getUser(userId);
      if (!user) {
        // Create a default user for development
        const newUser = await storage.upsertUser({
          id: userId,
          email: 'dev@example.com',
          username: 'developer',
          displayName: 'Developer User'
        });
        return res.json(newUser);
      }

      res.json(user);
    } catch (error) {
      logger.error('Error fetching user', { 
        error: (error as Error).message, 
        userId: req.user?.claims?.sub 
      });
      next(error);
    }
  });

  app.post('/api/auth/logout', (req, res) => {
    res.json({ message: 'Logged out successfully' });
  });

  // Projects routes
  app.get('/api/projects', isAuthenticated, async (req: any, res, next) => {
    try {
      const userId = req.user?.claims?.sub;
      if (!userId) {
        throw new AppError('User ID not found', 401);
      }

      const projects = await storage.getUserProjects(userId);
      res.json(projects);
    } catch (error) {
      logger.error('Error fetching projects', { 
        error: (error as Error).message, 
        userId: req.user?.claims?.sub
      });
      next(error);
    }
  });

  app.get('/api/projects/stats', isAuthenticated, async (req: any, res, next) => {
    try {
      const userId = req.user?.claims?.sub;
      if (!userId) {
        throw new AppError('User ID not found', 401);
      }

      const stats = await storage.getUserProjectStats(userId);
      res.json(stats);
    } catch (error) {
      logger.error('Error fetching project stats', { 
        error: (error as Error).message, 
        userId: req.user?.claims?.sub 
      });
      next(error);
    }
  });

  // Duplicates routes
  app.get('/api/duplicates', isAuthenticated, async (req: any, res, next) => {
    try {
      const userId = req.user?.claims?.sub;
      if (!userId) {
        throw new AppError('User ID not found', 401);
      }

      const duplicates = await storage.getUserDuplicates(userId);
      res.json(duplicates);
    } catch (error) {
      logger.error('Error fetching duplicates', { 
        error: (error as Error).message, 
        userId: req.user?.claims?.sub 
      });
      next(error);
    }
  });

  app.get('/api/duplicates/:groupId', isAuthenticated, async (req: any, res, next) => {
    try {
      const userId = req.user?.claims?.sub;
      const { groupId } = req.params;
      
      if (!userId) {
        throw new AppError('User ID not found', 401);
      }

      const duplicate = await storage.getDuplicateGroup(userId, parseInt(groupId));
      if (!duplicate) {
        throw new AppError('Duplicate group not found', 404);
      }

      res.json(duplicate);
    } catch (error) {
      logger.error('Error fetching duplicate group', { 
        error: (error as Error).message, 
        userId: req.user?.claims?.sub,
        groupId: req.params.groupId
      });
      next(error);
    }
  });

  // Analytics route
  app.get('/api/analytics', isAuthenticated, async (req: any, res, next) => {
    try {
      const userId = req.user?.claims?.sub;
      if (!userId) {
        throw new AppError('User ID not found', 401);
      }

      const { timeRange = '30d' } = req.query;
      const analytics = await storage.getAnalytics(userId, timeRange as string);
      res.json(analytics);
    } catch (error) {
      logger.error('Error fetching analytics', { 
        error: (error as Error).message, 
        userId: req.user?.claims?.sub 
      });
      next(error);
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}