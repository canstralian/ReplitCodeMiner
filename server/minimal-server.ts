import express from "express";
import { createServer } from "http";
import { logger } from "./logger";

const app = express();

// Basic middleware
app.use(express.json());

// Test routes one by one to isolate the malformed pattern
console.log('Testing minimal server startup...');

try {
  // Basic route
  app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
  });
  
  // Simple parameter route
  app.get('/test/:id', (req, res) => {
    res.json({ id: req.params.id });
  });
  
  console.log('✓ Routes registered successfully');
  
  const server = createServer(app);
  const port = 5001;
  
  server.listen(port, "0.0.0.0", () => {
    console.log(`✓ Minimal server running on port ${port}`);
    process.exit(0);
  });
  
} catch (error) {
  console.error('✗ Server startup failed:', error);
  process.exit(1);
}