import express from 'express';

const app = express();

console.log('Testing individual route patterns...');

const routes = [
  '/api/auth/user',
  '/api/projects', 
  '/api/duplicates',
  '/api/duplicates/:groupId',
  '/api/ai/test/:provider'
];

routes.forEach((route, index) => {
  try {
    app.get(route, (req, res) => res.json({route}));
    console.log(`✓ Route ${index + 1}: ${route} - OK`);
  } catch (error) {
    console.log(`✗ Route ${index + 1}: ${route} - ERROR: ${error.message}`);
  }
});

console.log('Route testing complete');