import express from 'express';
import { setupAuth } from './server/replitAuth.js';

const app = express();

// Test route registration step by step
console.log('Starting route registration test...');

try {
  console.log('1. Setting up basic Express app...');
  
  console.log('2. Setting up auth...');
  await setupAuth(app);
  
  console.log('3. Adding basic routes...');
  app.get('/api/auth/user', (req, res) => res.send('ok'));
  app.post('/api/auth/logout', (req, res) => res.send('ok'));
  app.get('/api/projects', (req, res) => res.send('ok'));
  
  console.log('4. Adding parameter routes...');
  app.get('/api/duplicates/:groupId', (req, res) => res.send('ok'));
  app.post('/api/ai/test/:providerName', (req, res) => res.send('ok'));
  
  console.log('✓ All routes registered successfully');
  
} catch (error) {
  console.log('✗ Error during route registration:', error.message);
  console.log('Stack:', error.stack);
}