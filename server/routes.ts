import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { ReplitApiService } from "./replitApi";
import { insertProjectSchema } from "@shared/schema";
import { z } from "zod";
import { logger, AppError } from "./logger";
import { 
  validateRequest, 
  projectAnalysisSchema, 
  searchSchema, 
  refreshProjectsSchema,
  duplicateGroupSchema 
} from "./validation";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  const replitApi = new ReplitApiService();

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

      logger.info('User fetched successfully', { userId });
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
  app.get('/api/projects', isAuthenticated, validateRequest(refreshProjectsSchema), async (req: any, res, next) => {
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

        logger.info('Refreshing projects from Replit API', { userId });
        const replitProjects = await replitApi.fetchUserProjects(req.user.access_token);
        await storage.syncUserProjects(userId, replitProjects);
        logger.info('Projects synced successfully', { userId, count: replitProjects.length });
      }
      
      const projects = await storage.getUserProjects(userId);
      logger.info('Projects fetched successfully', { userId, count: projects.length });
      res.json(projects);
    } catch (error) {
      logger.error('Error fetching projects', { 
        error: (error as Error).message, 
        userId: req.user?.claims?.sub,
        refresh: req.query.refresh
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
      logger.info('Project stats fetched successfully', { userId });
      res.json(stats);
    } catch (error) {
      logger.error('Error fetching project stats', { 
        error: (error as Error).message, 
        userId: req.user?.claims?.sub 
      });
      next(error);
    }
  });

  app.post('/api/projects/analyze', isAuthenticated, validateRequest(projectAnalysisSchema), async (req: any, res, next) => {
    try {
      const userId = req.user?.claims?.sub;
      if (!userId) {
        throw new AppError('User ID not found', 401);
      }

      if (!req.user.access_token) {
        throw new AppError('Access token not found', 401);
      }

      const { projectIds } = req.body;
      logger.info('Starting project analysis', { userId, projectCount: projectIds.length });

      // Trigger analysis of specified projects
      const results = await replitApi.analyzeProjects(req.user.access_token, projectIds);
      await storage.storeAnalysisResults(userId, results);
      
      logger.info('Project analysis completed', { 
        userId, 
        projectCount: projectIds.length,
        resultsCount: results.length 
      });
      
      res.json({ message: "Analysis completed", results });
    } catch (error) {
      logger.error('Error analyzing projects', { 
        error: (error as Error).message, 
        userId: req.user?.claims?.sub,
        projectIds: req.body?.projectIds 
      });
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
      logger.info('Duplicates fetched successfully', { userId, count: duplicates.length });
      res.json(duplicates);
    } catch (error) {
      logger.error('Error fetching duplicates', { 
        error: (error as Error).message, 
        userId: req.user?.claims?.sub 
      });
      next(error);
    }
  });

  app.get('/api/duplicates/:groupId', isAuthenticated, validateRequest(duplicateGroupSchema), async (req: any, res, next) => {
    try {
      const userId = req.user?.claims?.sub;
      if (!userId) {
        throw new AppError('User ID not found', 401);
      }

      const { groupId } = req.params;
      const groupIdNum = parseInt(groupId);
      
      if (isNaN(groupIdNum)) {
        throw new AppError('Invalid group ID', 400);
      }
      
      const group = await storage.getDuplicateGroup(userId, groupIdNum);
      if (!group) {
        throw new AppError('Duplicate group not found', 404);
      }
      
      logger.info('Duplicate group fetched successfully', { userId, groupId: groupIdNum });
      res.json(group);
    } catch (error) {
      logger.error('Error fetching duplicate group', { 
        error: (error as Error).message, 
        userId: req.user?.claims?.sub,
        groupId: req.params.groupId 
      });
      next(error);
    }
  });

  app.post('/api/search', isAuthenticated, validateRequest(searchSchema), async (req: any, res, next) => {
    try {
      const userId = req.user?.claims?.sub;
      if (!userId) {
        throw new AppError('User ID not found', 401);
      }

      const { query, language, patternType } = req.body;
      
      logger.info('Starting code pattern search', { 
        userId, 
        query: query.slice(0, 50), 
        language, 
        patternType 
      });
      
      const searchResults = await storage.searchCodePatterns(userId, {
        query,
        language,
        patternType
      });
      
      logger.info('Code pattern search completed', { 
        userId, 
        resultsCount: searchResults.length 
      });
      
      res.json(searchResults);
    } catch (error) {
      logger.error('Error searching code patterns', { 
        error: (error as Error).message, 
        userId: req.user?.claims?.sub,
        searchParams: req.body 
      });
      next(error);
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
