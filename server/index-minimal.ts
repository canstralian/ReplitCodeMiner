import express from "express";
import { createServer } from "http";
import { setupVite, serveStatic, log } from "./vite";

const app = express();

// Basic middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy' });
});

// Basic API routes
app.get('/api/auth/user', (req, res) => {
  res.json({ id: 'dev-user', email: 'dev@example.com' });
});

async function startServer() {
  try {
    const server = createServer(app);

    if (process.env.NODE_ENV === "development") {
      await setupVite(app, server);
    } else {
      serveStatic(app);
    }

    const port = 5000;
    server.listen(port, "0.0.0.0", () => {
      log(`serving on port ${port}`);
    });
  } catch (error) {
    console.error('Server startup failed:', error);
    process.exit(1);
  }
}

startServer();