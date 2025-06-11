import express from "express";
import { createServer } from "http";
import session from "express-session";
import MemoryStore from "memorystore";
import path from "path";
import fs from "fs";

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
  console.error('Error:', err.message);
  res.status(500).json({
    message: process.env.NODE_ENV === 'development' ? err.message : "Internal Server Error"
  });
});



// Development: Start Vite dev server and proxy frontend requests
if (process.env.NODE_ENV === 'development') {
  const { spawn } = await import('child_process');
  
  // Start Vite dev server
  const viteProcess = spawn('npx', ['vite', '--port', '5173', '--host'], {
    stdio: 'pipe',
    cwd: process.cwd()
  });
  
  viteProcess.stdout?.on('data', (data) => {
    console.log(`[Vite] ${data}`);
  });
  
  viteProcess.stderr?.on('data', (data) => {
    console.error(`[Vite Error] ${data}`);
  });
  
  // Proxy non-API requests to Vite
  app.use((req, res, next) => {
    if (req.path.startsWith('/api/') || req.path === '/health') {
      return next();
    }
    
    // Proxy to Vite dev server
    import('http').then(http => {
      const proxyReq = http.request({
        hostname: 'localhost',
        port: 5173,
        path: req.path,
        method: req.method,
        headers: req.headers
      }, (proxyRes) => {
        res.writeHead(proxyRes.statusCode || 200, proxyRes.headers);
        proxyRes.pipe(res);
      });
      
      proxyReq.on('error', () => {
        res.status(503).send('Frontend development server starting...');
      });
      
      if (req.method !== 'GET' && req.method !== 'HEAD') {
        req.pipe(proxyReq);
      } else {
        proxyReq.end();
      }
    });
  });
} else {
  // Production: serve static files
  const distPath = path.resolve(import.meta.dirname, "..", "dist", "public");
  app.use(express.static(distPath));
  
  app.get('*', (req, res) => {
    const indexPath = path.join(distPath, 'index.html');
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      res.status(404).send('Build files not found');
    }
  });
}

async function startServer() {
  try {
    const server = createServer(app);
    const port = parseInt(process.env.PORT || '3000', 10);
    
    server.listen(port, "0.0.0.0", () => {
      console.log(`Server running on port ${port}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();