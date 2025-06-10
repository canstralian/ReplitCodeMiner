#!/usr/bin/env node

// Temporary startup script to bypass authentication issues
process.env.NODE_ENV = 'development';

import('./server/index-clean.js').catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});