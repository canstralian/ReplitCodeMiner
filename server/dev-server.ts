import express from "express";
import { createServer } from "http";
import session from "express-session";
import MemoryStore from "memorystore";
import { spawn } from "child_process";

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
  return next();
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

// Proxy requests to Vite dev server for frontend
app.use('/', (req, res, next) => {
  if (req.path.startsWith('/api/') || req.path === '/health') {
    return next();
  }
  
  // Proxy to Vite dev server
  const proxyReq = require('http').request({
    hostname: 'localhost',
    port: 5173,
    path: req.path,
    method: req.method,
    headers: req.headers
  }, (proxyRes: any) => {
    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    proxyRes.pipe(res);
  });
  
  proxyReq.on('error', () => {
    res.status(503).send('Frontend server not available');
  });
  
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    req.pipe(proxyReq);
  } else {
    proxyReq.end();
  }
});

const server = createServer(app);
const port = parseInt(process.env.PORT || '3000', 10);

// Start Vite dev server alongside Express
const viteProcess = spawn('npx', ['vite', '--port', '5173', '--host'], {
  stdio: 'inherit',
  cwd: process.cwd()
});

viteProcess.on('error', (err) => {
  console.error('Failed to start Vite:', err);
});

server.listen(port, "0.0.0.0", () => {
  console.log(`Server running on port ${port}`);
  console.log(`Vite dev server running on port 5173`);
});