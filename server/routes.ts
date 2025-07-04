import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { ReplitApiService } from "./replitApi";
import { insertProjectSchema } from "@shared/schema";
import { performanceMiddleware, rateLimitMiddleware, getPerformanceStats } from "./middleware";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Add performance monitoring
  app.use(performanceMiddleware);
  
  // Add rate limiting
  app.use('/api/', rateLimitMiddleware(60000, 100)); // 100 requests per minute
  
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
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Projects routes
  app.get('/api/projects', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { refresh } = req.query;
      
      if (refresh === 'true') {
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

  app.post('/api/projects/analyze', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { projectIds } = req.body;
      
      if (!Array.isArray(projectIds)) {
        return res.status(400).json({ message: "projectIds must be an array" });
      }

      // Trigger analysis of specified projects
      const results = await replitApi.analyzeProjects(req.user.access_token, projectIds);
      await storage.storeAnalysisResults(userId, results);
      
      res.json({ message: "Analysis completed", results });
    } catch (error) {
      console.error("Error analyzing projects:", error);
      res.status(500).json({ message: "Failed to analyze projects" });
    }
  });

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

  app.post('/api/search', isAuthenticated, async (req: any, res) => {
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
      console.error("Error searching code patterns:", error);
      res.status(500).json({ message: "Failed to search code patterns" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
