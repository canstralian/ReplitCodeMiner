import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth-simple";
import { ReplitApiService } from "./replitApi";
import { insertProjectSchema } from "@shared/schema";
import { z } from "zod";
import { logger, AppError } from "./logger";
import { validateRequest, projectAnalysisSchema, searchSchema, refreshProjectsSchema, duplicateGroupSchema } from "./validation";

export async function registerRoutes(app: Express): Promise<Server> {
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
  app.get('/api/projects', isAuthenticated, async (req: any, res, next) => {
    try {
      const userId = req.user?.claims?.sub;
      if (!userId) {
        throw new AppError('User ID not found', 401);
      }

      const { refresh, force } = req.query;

      if (refresh === 'true' || force === true) {
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

  app.post('/api/projects/analyze', isAuthenticated, async (req: any, res, next) => {
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

  app.get('/api/duplicates/:groupId', isAuthenticated, async (req: any, res, next) => {
    try {
      const userId = req.user?.claims?.sub;
      if (!userId) {
        throw new AppError('User ID not found', 401);
      }

      const { groupId } = req.params;
      const groupIdNum = parseInt(groupId, 10);

      if (isNaN(groupIdNum) || groupIdNum <= 0) {
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

      if (!query || typeof query !== 'string') {
        throw new AppError('Search query is required and must be a string', 400);
      }

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

      // Store search history
      await storage.addSearchHistory(userId, {
        query,
        filters: { language, patternType },
        resultCount: searchResults.length,
        executionTime: Date.now() - (req.startTime || Date.now())
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

  // Analytics routes
  app.get('/api/analytics', isAuthenticated, async (req: any, res, next) => {
    try {
      const userId = req.user?.claims?.sub;
      if (!userId) {
        throw new AppError('User ID not found', 401);
      }

      const { timeRange = '7d' } = req.query;
      const analytics = await storage.getAnalytics(userId, timeRange);

      logger.info('Analytics fetched successfully', { userId, timeRange });
      res.json(analytics);
    } catch (error) {
      logger.error('Error fetching analytics', { 
        error: (error as Error).message, 
        userId: req.user?.claims?.sub 
      });
      next(error);
    }
  });

  // AI Analysis routes
  app.post('/api/ai/analyze-similarity', isAuthenticated, async (req: any, res, next) => {
    try {
      const userId = req.user?.claims?.sub;
      if (!userId) {
        throw new AppError('User ID not found', 401);
      }

      const { code1, code2, context } = req.body;

      if (!code1 || !code2) {
        throw new AppError('Both code snippets are required', 400);
      }

      logger.info('Starting AI similarity analysis', { userId });

      const { aiAnalysisService } = await import('./aiAnalysis');
      const analysis = await aiAnalysisService.analyzeSemanticSimilarity(code1, code2, context);

      // Store AI analysis result
      await storage.storeAIAnalysis(userId, {
        analysisType: 'semantic_similarity',
        prompt: `Compare similarity between two code snippets`,
        response: JSON.stringify(analysis),
        confidence: analysis.similarity,
        metadata: { context }
      });

      logger.info('AI similarity analysis completed', { userId, similarity: analysis.similarity });
      res.json(analysis);
    } catch (error) {
      logger.error('Error in AI similarity analysis', { 
        error: (error as Error).message, 
        userId: req.user?.claims?.sub 
      });
      next(error);
    }
  });

  app.post('/api/ai/refactoring-suggestions', isAuthenticated, async (req: any, res, next) => {
    try {
      const userId = req.user?.claims?.sub;
      if (!userId) {
        throw new AppError('User ID not found', 401);
      }

      const { duplicateGroupId } = req.body;

      if (!duplicateGroupId) {
        throw new AppError('Duplicate group ID is required', 400);
      }

      logger.info('Generating refactoring suggestions', { userId, duplicateGroupId });

      const duplicateGroup = await storage.getDuplicateGroup(userId, duplicateGroupId);
      if (!duplicateGroup) {
        throw new AppError('Duplicate group not found', 404);
      }

      const { aiAnalysisService } = await import('./aiAnalysis');
      
      // Mock patterns data since duplicateGroup.patterns doesn't exist in the current schema
      const patterns = [{
        code: duplicateGroup.description || '',
        filePath: 'unknown',
        projectName: 'Project'
      }];

      const suggestions = await aiAnalysisService.generateRefactoringSuggestions(patterns);

      // Store suggestions in database
      for (const suggestion of suggestions) {
        await storage.storeRefactoringSuggestion(userId, {
          duplicateGroupId,
          suggestionsType: suggestion.type,
          title: suggestion.title,
          description: suggestion.description,
          beforeCode: suggestion.beforeCode,
          afterCode: suggestion.afterCode,
          estimatedEffort: suggestion.estimatedEffort,
          potentialSavings: suggestion.potentialSavings,
          priority: suggestion.priority
        });
      }

      logger.info('Refactoring suggestions generated', { 
        userId, 
        duplicateGroupId, 
        suggestionsCount: suggestions.length 
      });

      res.json(suggestions);
    } catch (error) {
      logger.error('Error generating refactoring suggestions', { 
        error: (error as Error).message, 
        userId: req.user?.claims?.sub 
      });
      next(error);
    }
  });

  // Code quality analysis
  app.post('/api/analyze/quality', isAuthenticated, async (req: any, res, next) => {
    try {
      const userId = req.user?.claims?.sub;
      if (!userId) {
        throw new AppError('User ID not found', 401);
      }

      const { code, language, filePath, projectId } = req.body;

      if (!code || !language) {
        throw new AppError('Code and language are required', 400);
      }

      logger.info('Starting code quality analysis', { userId, language });

      const { aiAnalysisService } = await import('./aiAnalysis');
      const qualityMetrics = await aiAnalysisService.analyzeCodeQuality(code, language);

      // Store quality metrics if projectId and filePath are provided
      if (projectId && filePath) {
        await storage.storeCodeMetrics(userId, {
          projectId: parseInt(projectId),
          filePath: filePath,
          complexity: qualityMetrics.complexity,
          linesOfCode: code.split('\n').length,
          maintainabilityIndex: qualityMetrics.maintainabilityIndex,
          technicalDebt: qualityMetrics.technicalDebt,
          codeSmells: qualityMetrics.codeSmells,
          securityIssues: qualityMetrics.securityIssues,
          performance: qualityMetrics.performance
        });
      }

      logger.info('Code quality analysis completed', { userId, complexity: qualityMetrics.complexity });
      res.json(qualityMetrics);
    } catch (error) {
      logger.error('Error in code quality analysis', { 
        error: (error as Error).message, 
        userId: req.user?.claims?.sub 
      });
      next(error);
    }
  });

  // Search history and saved searches
  app.get('/api/search/history', isAuthenticated, async (req: any, res, next) => {
    try {
      const userId = req.user?.claims?.sub;
      if (!userId) {
        throw new AppError('User ID not found', 401);
      }

      const history = await storage.getSearchHistory(userId);
      logger.info('Search history fetched', { userId, count: history.length });
      res.json(history);
    } catch (error) {
      logger.error('Error fetching search history', { 
        error: (error as Error).message, 
        userId: req.user?.claims?.sub 
      });
      next(error);
    }
  });

  app.post('/api/search/save', isAuthenticated, async (req: any, res, next) => {
    try {
      const userId = req.user?.claims?.sub;
      if (!userId) {
        throw new AppError('User ID not found', 401);
      }

      const { name, query, filters, isPublic = false } = req.body;

      if (!name || !query) {
        throw new AppError('Name and query are required', 400);
      }

      const savedSearch = await storage.saveSearch(userId, {
        name,
        query,
        filters,
        isPublic
      });

      logger.info('Search saved successfully', { userId, searchName: name });
      res.json(savedSearch);
    } catch (error) {
      logger.error('Error saving search', { 
        error: (error as Error).message, 
        userId: req.user?.claims?.sub 
      });
      next(error);
    }
  });

  app.get('/api/search/saved', isAuthenticated, async (req: any, res, next) => {
    try {
      const userId = req.user?.claims?.sub;
      if (!userId) {
        throw new AppError('User ID not found', 401);
      }

      const savedSearches = await storage.getSavedSearches(userId);
      logger.info('Saved searches fetched', { userId, count: savedSearches.length });
      res.json(savedSearches);
    } catch (error) {
      logger.error('Error fetching saved searches', { 
        error: (error as Error).message, 
        userId: req.user?.claims?.sub 
      });
      next(error);
    }
  });

  // Health check endpoint
  app.get('/health', (req, res) => {
    res.json({ status: 'healthy', timestamp: new Date().toISOString() });
  });

  // AI provider management endpoints
  app.get('/api/ai/providers', async (req: any, res) => {
    try {
      const { aiAnalysisService } = await import('./aiAnalysis');
      const providers = await aiAnalysisService.getAvailableProviders();
      res.json({ providers });
    } catch (error) {
      logger.error('Failed to get AI providers', { error: (error as Error).message });
      res.status(500).json({ error: 'Failed to get AI providers' });
    }
  });

  app.post('/api/ai/test/:provider', isAuthenticated, async (req: any, res, next) => {
    try {
      const { aiAnalysisService } = await import('./aiAnalysis');
      const { provider } = req.params;
      
      if (!provider || typeof provider !== 'string') {
        return res.status(400).json({ error: 'Invalid provider name' });
      }
      
      const result = await aiAnalysisService.testProvider(provider);
      res.json(result);
    } catch (error) {
      logger.error('Failed to test AI provider', { error: (error as Error).message });
      res.status(500).json({ error: 'Failed to test AI provider' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}