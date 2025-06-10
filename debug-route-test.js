import express from 'express';

const app = express();

// Test each route pattern one by one to find the malformed one
const routes = [
  '/api/auth/user',
  '/api/projects', 
  '/api/duplicates/:groupId',
  '/api/ai/test/:provider',
  '/api/login',
  '/api/callback',
  '/api/logout'
];

console.log('Testing route patterns...');

routes.forEach((route, i) => {
  try {
    app.get(route, (req, res) => res.send('ok'));
    console.log(`✓ Route ${i}: ${route}`);
  } catch (error) {
    console.log(`✗ Route ${i}: ${route} - ERROR: ${error.message}`);
    console.log('Stack:', error.stack);
  }
});

console.log('Route test complete');