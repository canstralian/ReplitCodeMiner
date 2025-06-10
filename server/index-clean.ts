import express, { type Request, Response, NextFunction } from "express";
import { createServer } from "http";
import { storage } from "./storage";
import { setupVite, serveStatic, log } from "./vite";
import { logger, AppError, logRequest } from "./logger";
import { securityHeaders, corsHeaders } from "./security";
import config from "./config";

const app = express();

// Security middleware
app.use(securityHeaders);
app.use(corsHeaders);

// Request size limits for security
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false, limit: '10mb' }));

// Request tracking middleware
app.use((req: any, res, next) => {
  req.startTime = Date.now();
  req.requestId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  next();
});

// Mock authentication for development
const mockAuth = (req: any, res: Response, next: NextFunction) => {
  req.user = {
    claims: { sub: 'dev-user-123' },
    access_token: 'dev-token'
  };
  next();
};

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// API Routes
app.get('/api/auth/user', mockAuth, async (req: any, res, next) => {
  try {
    const userId = req.user?.claims?.sub;
    let user = await storage.getUser(userId);
    
    if (!user) {
      user = await storage.upsertUser({
        id: userId,
        email: 'dev@example.com',
        firstName: 'Developer',
        lastName: 'User'
      });
    }
    
    res.json(user);
  } catch (error) {
    next(error);
  }
});

app.get('/api/projects', mockAuth, async (req: any, res, next) => {
  try {
    const userId = req.user?.claims?.sub;
    const projects = await storage.getUserProjects(userId);
    res.json(projects);
  } catch (error) {
    next(error);
  }
});

app.get('/api/projects/stats', mockAuth, async (req: any, res, next) => {
  try {
    const userId = req.user?.claims?.sub;
    const stats = await storage.getUserProjectStats(userId);
    res.json(stats);
  } catch (error) {
    next(error);
  }
});

app.get('/api/duplicates', mockAuth, async (req: any, res, next) => {
  try {
    const userId = req.user?.claims?.sub;
    const duplicates = await storage.getUserDuplicates(userId);
    res.json(duplicates);
  } catch (error) {
    next(error);
  }
});

app.get('/api/duplicates/:groupId', mockAuth, async (req: any, res, next) => {
  try {
    const userId = req.user?.claims?.sub;
    const { groupId } = req.params;
    const duplicate = await storage.getDuplicateGroup(userId, parseInt(groupId));
    
    if (!duplicate) {
      res.status(404).json({ message: 'Duplicate group not found' });
      return;
    }
    
    res.json(duplicate);
  } catch (error) {
    next(error);
  }
});

app.get('/api/analytics', mockAuth, async (req: any, res, next) => {
  try {
    const userId = req.user?.claims?.sub;
    const { timeRange = '30d' } = req.query;
    const analytics = await storage.getAnalytics(userId, timeRange as string);
    res.json(analytics);
  } catch (error) {
    next(error);
  }
});

// Error handling middleware
app.use((err: any, req: Request, res: Response, _next: NextFunction) => {
  logger.error('Unhandled error', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    requestId: (req as any).requestId
  });

  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      message: err.message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
    return;
  }

  const status = err.status || err.statusCode || 500;
  const message = process.env.NODE_ENV === 'development' 
    ? err.message || "Internal Server Error"
    : "Internal Server Error";

  res.status(status).json({
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

const server = createServer(app);

(async () => {
  try {
    if (config.nodeEnv === "development") {
      await setupVite(app, server);
    } else {
      serveStatic(app);
    }

    const port = config.port;
    server.listen(port, "0.0.0.0", () => {
      log(`Server running on port ${port}`);
    });
  } catch (error) {
    logger.error('Failed to start server', { error: (error as Error).message });
    process.exit(1);
  }
})();