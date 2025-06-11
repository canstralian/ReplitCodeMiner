import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./auth-clean";
import { ReplitApiService } from "./replitApi";
import { logger, AppError } from "./logger";

export async function registerRoutes(app: Express): Promise<Server> {
  await setupAuth(app);

  const replitApi = new ReplitApiService();

  // Health check endpoint
  app.get('/health', (req, res) => {
    res.json({ status: 'healthy', timestamp: new Date().toISOString() });
  });

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res, next) => {
    try {
      const userId = req.user?.claims?.sub;
      if (!userId) {
        throw new AppError('User ID not found in token', 401);
      }

      const user = await storage.getUser(userId);
      if (!user) {
        throw new AppError('User not found', 404);
      }

      res.json(user);
    } catch (error) {
      logger.error('Error fetching user', { error: (error as Error).message });
      next(error);
    }
  });

  app.post('/api/auth/logout', (req, res) => {
    req.logout((err) => {
      if (err) {
        logger.error('Logout error', { error: err.message });
        return res.status(500).json({ message: 'Logout failed' });
      }
      req.session.destroy((err) => {
        if (err) {
          logger.error('Session destroy error', { error: err.message });
          return res.status(500).json({ message: 'Session cleanup failed' });
        }
        res.clearCookie('connect.sid');
        res.json({ message: 'Logged out successfully' });
      });
    });
  });

  // Projects routes
  app.get('/api/projects', isAuthenticated, async (req: any, res, next) => {
    try {
      const userId = req.user?.claims?.sub;
      if (!userId) {
        throw new AppError('User ID not found', 401);
      }

      const { refresh } = req.query;

      if (refresh === 'true') {
        if (!req.user.access_token) {
          throw new AppError('Access token not found', 401);
        }

        const replitProjects = await replitApi.fetchUserProjects(req.user.access_token);
        await storage.syncUserProjects(userId, replitProjects);
      }

      const projects = await storage.getUserProjects(userId);
      res.json(projects);
    } catch (error) {
      logger.error('Error fetching projects', { error: (error as Error).message });
      next(error);
    }
  });

  app.get('/api/duplicates', isAuthenticated, async (req: any, res, next) => {
    try {
      const userId = req.user?.claims?.sub;
      if (!userId) {
        throw new AppError('User ID not found', 401);
      }

      const duplicates = await storage.getUserDuplicates(userId);
      res.json(duplicates);
    } catch (error) {
      logger.error('Error fetching duplicates', { error: (error as Error).message });
      next(error);
    }
  });

  app.get('/api/duplicates/:groupId', isAuthenticated, async (req: any, res, next) => {
    try {
      const userId = req.user?.claims?.sub;
      if (!userId) {
        throw new AppError('User ID not found', 401);
      }

      const groupId = parseInt(req.params.groupId, 10);
      if (isNaN(groupId) || groupId <= 0) {
        throw new AppError('Invalid group ID', 400);
      }

      const group = await storage.getDuplicateGroup(userId, groupId);
      if (!group) {
        throw new AppError('Duplicate group not found', 404);
      }

      res.json(group);
    } catch (error) {
      logger.error('Error fetching duplicate group', { error: (error as Error).message });
      next(error);
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}