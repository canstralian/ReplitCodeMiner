import express from "express";
import { createServer } from "http";
import session from "express-session";
import MemoryStore from "memorystore";
import path from "path";
import fs from "fs";
import { securityHeaders, corsHeaders } from "./security";
import { logger, AppError } from "./logger";

const app = express();

// Security middleware
app.use(securityHeaders);
app.use(corsHeaders);

// Request timing middleware
app.use((req: any, res, next) => {
  req.startTime = Date.now();
  next();
});

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
  if (process.env.NODE_ENV === 'development') {
    req.user = {
      claims: { sub: 'dev-user-id', email: 'dev@example.com' },
      access_token: 'dev-token'
    };
    return next();
  }
  res.status(401).json({ message: "Authentication required" });
};

// API Routes
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

app.get('/api/auth/user', isAuthenticated, (req: any, res) => {
  const user = {
    id: req.user.claims.sub,
    email: req.user.claims.email,
    name: 'Development User'
  };
  res.json(user);
});

app.post('/api/auth/logout', (req, res) => {
  req.session.destroy((err: any) => {
    if (err) {
      return res.status(500).json({ message: 'Session cleanup failed' });
    }
    res.json({ message: 'Logged out successfully' });
  });
});

app.get('/api/projects', isAuthenticated, (req, res) => {
  const mockProjects = [
    {
      id: 1,
      title: "E-commerce App",
      description: "A full-stack e-commerce application",
      language: "javascript",
      url: "https://replit.com/@user/ecommerce-app",
      fileCount: 45,
      lastUpdated: new Date().toISOString(),
      duplicatesFound: 12
    },
    {
      id: 2,
      title: "Portfolio Website",
      description: "Personal portfolio built with React",
      language: "typescript",
      url: "https://replit.com/@user/portfolio-site",
      fileCount: 23,
      lastUpdated: new Date().toISOString(),
      duplicatesFound: 5
    },
    {
      id: 3,
      title: "Blog Platform",
      description: "Content management system for blogging",
      language: "python",
      url: "https://replit.com/@user/blog-platform",
      fileCount: 67,
      lastUpdated: new Date().toISOString(),
      duplicatesFound: 8
    }
  ];
  res.json(mockProjects);
});

app.get('/api/projects/stats', isAuthenticated, (req, res) => {
  const mockStats = {
    totalProjects: 3,
    duplicatesFound: 25,
    similarPatterns: 18,
    languages: {
      javascript: 1,
      typescript: 1,
      python: 1
    }
  };
  res.json(mockStats);
});

app.get('/api/duplicates', isAuthenticated, (req, res) => {
  const mockDuplicates = [
    {
      id: 1,
      patternType: "function",
      description: "Similar calculateTotal functions",
      patterns: ["calculateTotal", "computeTotal"],
      similarityScore: 95
    },
    {
      id: 2,
      patternType: "component",
      description: "Similar UserCard components",
      patterns: ["UserCard", "ProfileCard"],
      similarityScore: 87
    }
  ];
  res.json(mockDuplicates);
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, _next: express.NextFunction) => {
  logger.error('Server error', { 
    error: err.message, 
    stack: err.stack,
    path: req.path,
    method: req.method
  });
  
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ message: err.message });
  }
  
  res.status(500).json({
    message: process.env.NODE_ENV === 'development' ? err.message : "Internal Server Error"
  });
});



// Simple development setup - serve client files directly
const clientPath = path.resolve(import.meta.dirname, "..", "client");

// Serve static files from client directory
app.use(express.static(clientPath));

// Serve main HTML file for SPA routes
app.get('/', (req, res) => {
  const indexPath = path.join(clientPath, 'index.html');
  res.sendFile(indexPath);
});

app.get('/dashboard', (req, res) => {
  const indexPath = path.join(clientPath, 'index.html');
  res.sendFile(indexPath);
});

async function startServer() {
  try {
    const server = createServer(app);
    const port = parseInt(process.env.PORT || '5000', 10);
    
    server.listen(port, "0.0.0.0", () => {
      logger.info(`Server running on port ${port}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();