import express from "express";
import { logger } from "./logger";

const app = express();

// Test basic route registration step by step
console.log('Testing route registration...');

try {
  // Basic routes first
  app.get('/health', (req, res) => res.json({ status: 'ok' }));
  console.log('✓ Basic routes OK');
  
  // Routes with parameters
  app.get('/api/duplicates/:groupId', (req, res) => res.json({ groupId: req.params.groupId }));
  console.log('✓ Parameter route 1 OK');
  
  app.post('/api/ai/test/:provider', (req, res) => res.json({ provider: req.params.provider }));
  console.log('✓ Parameter route 2 OK');
  
  console.log('✓ All routes registered successfully');
  
  const port = 3001;
  app.listen(port, () => {
    console.log(`Debug server running on port ${port}`);
  });
  
} catch (error) {
  console.error('✗ Route registration failed:', error);
}