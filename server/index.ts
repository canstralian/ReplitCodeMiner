import express, { type Request, Response, NextFunction } from "express";
import { createServer } from "http";
import { log } from "./vite";
import { logger, AppError } from "./logger";
import { securityHeaders, corsHeaders } from "./security";
import { storage } from "./storage";
import session from "express-session";
import MemoryStore from "memorystore";
import fs from "fs";
import path from "path";

const app = express();

// Security middleware
app.use(securityHeaders);
app.use(corsHeaders);

// Request size limits
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false, limit: '10mb' }));

// Session setup
const sessionTtl = 7 * 24 * 60 * 60 * 1000;
const memoryStore = MemoryStore(session);

app.use(session({
  secret: process.env.SESSION_SECRET || 'dev-secret-key-' + Math.random().toString(36),
  store: new memoryStore({ checkPeriod: sessionTtl }),
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true, secure: false, maxAge: sessionTtl },
}));

// Request tracking
app.use((req: any, res, next) => {
  req.startTime = Date.now();
  req.requestId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  next();
});

// Mock authentication for development
const isAuthenticated = (req: any, res: any, next: any) => {
  if (process.env.NODE_ENV === 'development') {
    req.user = {
      claims: { sub: 'dev-user-id', email: 'dev@example.com' },
      access_token: 'dev-token'
    };
    return next();
  }
  res.status(401).json({ message: "Authentication required" });
};

// API Routes (registered BEFORE Vite middleware)
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

app.get('/api/auth/user', isAuthenticated, async (req: any, res, next) => {
  try {
    const userId = req.user?.claims?.sub;
    if (!userId) {
      throw new AppError('User ID not found', 401);
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
  req.session.destroy((err) => {
    if (err) {
      logger.error('Session destroy error', { error: err.message });
      return res.status(500).json({ message: 'Session cleanup failed' });
    }
    res.json({ message: 'Logged out successfully' });
  });
});

app.get('/api/projects', isAuthenticated, async (req: any, res, next) => {
  try {
    const userId = req.user?.claims?.sub;
    if (!userId) {
      throw new AppError('User ID not found', 401);
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

// Simple static file serving for development
function setupSimpleStatic(app: express.Express) {
  const clientPath = path.resolve(import.meta.dirname, "..", "client");
  
  // Serve static files from client directory
  app.use(express.static(clientPath));
  
  // Fallback to index.html for SPA routing - using specific patterns to avoid path-to-regexp errors
  app.get('/', (req, res) => {
    const indexPath = path.join(clientPath, 'index.html');
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      res.status(404).send('Client files not found');
    }
  });
  
  app.get('/dashboard', (req, res) => {
    const indexPath = path.join(clientPath, 'index.html');
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      res.status(404).send('Client files not found');
    }
  });
}

async function startServer() {
  try {
    const server = createServer(app);

    // Use simple static serving to avoid path-to-regexp issues
    if (process.env.NODE_ENV === "development") {
      setupSimpleStatic(app);
    } else {
      // For production, serve from dist directory
      const distPath = path.resolve(import.meta.dirname, "..", "dist", "public");
      if (fs.existsSync(distPath)) {
        app.use(express.static(distPath));
        app.get('/', (req, res) => {
          res.sendFile(path.join(distPath, 'index.html'));
        });
        app.get('/dashboard', (req, res) => {
          res.sendFile(path.join(distPath, 'index.html'));
        });
      } else {
        setupSimpleStatic(app);
      }
    }

    const port = parseInt(process.env.PORT || '3000', 10);
    server.listen(port, "0.0.0.0", () => {
      log(`serving on port ${port}`);
      logger.info('Server started successfully', { port, environment: process.env.NODE_ENV });
    });
  } catch (error) {
    logger.error('Failed to start server', { error: (error as Error).message });
    process.exit(1);
  }
}

startServer();