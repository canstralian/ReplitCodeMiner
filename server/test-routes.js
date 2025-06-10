import express from 'express';
const app = express();

// Test each route pattern individually to identify the malformed one
const routes = [
  { method: 'get', path: '/api/auth/user' },
  { method: 'post', path: '/api/auth/logout' },
  { method: 'get', path: '/api/projects' },
  { method: 'get', path: '/api/projects/stats' },
  { method: 'post', path: '/api/projects/analyze' },
  { method: 'get', path: '/api/duplicates' },
  { method: 'get', path: '/api/duplicates/:groupId' },
  { method: 'post', path: '/api/search' },
  { method: 'get', path: '/api/analytics' },
  { method: 'post', path: '/api/ai/analyze-similarity' },
  { method: 'post', path: '/api/ai/refactoring-suggestions' },
  { method: 'post', path: '/api/analyze/quality' },
  { method: 'get', path: '/api/search/history' },
  { method: 'post', path: '/api/search/save' },
  { method: 'get', path: '/api/search/saved' },
  { method: 'get', path: '/health' },
  { method: 'get', path: '/api/ai/providers' },
  { method: 'post', path: '/api/ai/test/:providerName' },
  { method: 'get', path: '/api/login' },
  { method: 'get', path: '/api/callback' },
  { method: 'get', path: '/api/logout' }
];

routes.forEach((route, i) => {
  try {
    app[route.method](route.path, (req, res) => res.send('ok'));
    console.log(`✓ Route ${i}: ${route.method.toUpperCase()} ${route.path}`);
  } catch (error) {
    console.log(`✗ Route ${i}: ${route.method.toUpperCase()} ${route.path} - ${error.message}`);
  }
});

console.log('All routes registered successfully');