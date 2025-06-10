
const config = {
  port: parseInt(process.env.PORT || '5000'),
  host: process.env.HOST || '0.0.0.0',
  nodeEnv: process.env.NODE_ENV || 'development',
  database: {
    url: process.env.DATABASE_URL,
    maxConnections: parseInt(process.env.DB_MAX_CONNECTIONS || '20'),
    idleTimeout: parseInt(process.env.DB_IDLE_TIMEOUT || '30000'),
  },
  session: {
    secret: process.env.SESSION_SECRET || 'fallback-secret-for-dev',
    maxAge: parseInt(process.env.SESSION_MAX_AGE || '86400000'), // 24 hours
  },
  replit: {
    clientId: process.env.REPLIT_CLIENT_ID,
    clientSecret: process.env.REPLIT_CLIENT_SECRET,
    redirectUri: process.env.REPLIT_REDIRECT_URI,
  },
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5000',
  },
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW || '900000'), // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX || '100'),
  }
};

// Validate required environment variables in production
if (config.nodeEnv === 'production') {
  const required = [
    'DATABASE_URL',
    'SESSION_SECRET',
    'REPLIT_CLIENT_ID',
    'REPLIT_CLIENT_SECRET',
    'REPLIT_REDIRECT_URI'
  ];
  
  const missing = required.filter(key => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}

export default config;
