import express from 'express';
import passport from 'passport';
import session from 'express-session';

const app = express();

console.log('Testing Passport setup...');

try {
  // Add session middleware
  app.use(session({
    secret: 'test-secret',
    resave: false,
    saveUninitialized: false
  }));
  
  console.log('✓ Session middleware added');
  
  // Initialize passport
  app.use(passport.initialize());
  console.log('✓ Passport initialized');
  
  app.use(passport.session());
  console.log('✓ Passport session added');
  
  console.log('✓ Passport setup complete');
  
} catch (error) {
  console.log('✗ Passport setup failed:', error.message);
  console.log('Stack:', error.stack);
}