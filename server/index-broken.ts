import express, { type Request, Response, NextFunction } from "express";
import { createServer } from "http";
import { registerRoutes } from "./routes-fixed";
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

(async () => {
  // Setup Vite for development BEFORE registering routes to avoid conflicts
  if (app.get("env") === "development") {
    const server = createServer(app);
    await setupVite(app, server);
    
    // Register routes after Vite setup
    await registerRoutes(app);
    
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

    const port = 5000;
    server.listen(port, "0.0.0.0", () => {
      log(`serving on port ${port}`);
      logger.info('Server started successfully', { port, environment: process.env.NODE_ENV });
    });
  } else {
    const server = await registerRoutes(app);
    serveStatic(app);

    const port = 5000;
    server.listen(port, "0.0.0.0", () => {
      log(`serving on port ${port}`);
      logger.info('Server started successfully', { port, environment: process.env.NODE_ENV });
    });
  }
})();
