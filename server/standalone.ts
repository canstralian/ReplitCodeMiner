import express from "express";
import { createServer } from "http";
import { logger, AppError } from "./logger";
import { storage } from "./storage";
import session from "express-session";
import MemoryStore from "memorystore";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

// Basic middleware
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

// Mock authentication for development
const isAuthenticated = (req: any, res: any, next: any) => {
  req.user = {
    claims: { sub: 'dev-user-id', email: 'dev@example.com' },
    access_token: 'dev-token'
  };
  next();
};

// API Routes
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
      // Create dev user if not exists
      const newUser = await storage.upsertUser({
        id: userId,
        email: 'dev@example.com',
        firstName: 'Developer',
        lastName: 'User'
      });
      return res.json(newUser);
    }
    
    res.json(user);
  } catch (error) {
    logger.error('Error fetching user', { error: (error as Error).message });
    next(error);
  }
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

// Serve static files for production
app.use(express.static(path.join(__dirname, '../client/dist')));

// Catch-all handler for React routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

// Error handling
app.use((err: any, req: any, res: any, next: any) => {
  logger.error('Server error', { error: err.message, stack: err.stack });
  
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ message: err.message });
  }
  
  res.status(500).json({ message: 'Internal server error' });
});

const server = createServer(app);
const port = 5000;

server.listen(port, "0.0.0.0", () => {
  console.log(`Server running on port ${port}`);
  logger.info('Standalone server started', { port });
});