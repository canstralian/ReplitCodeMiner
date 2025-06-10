
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
  ai: {
    defaultProvider: process.env.AI_DEFAULT_PROVIDER || 'openai',
    providers: {
      openai: {
        apiKey: process.env.OPENAI_API_KEY,
        baseUrl: process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1',
        model: process.env.OPENAI_MODEL || 'gpt-4',
        maxTokens: parseInt(process.env.OPENAI_MAX_TOKENS || '2000'),
      },
      claude: {
        apiKey: process.env.CLAUDE_API_KEY,
        baseUrl: process.env.CLAUDE_BASE_URL || 'https://api.anthropic.com',
        model: process.env.CLAUDE_MODEL || 'claude-3-sonnet-20240229',
        maxTokens: parseInt(process.env.CLAUDE_MAX_TOKENS || '2000'),
      },
      codepal: {
        apiKey: process.env.CODEPAL_API_KEY,
        baseUrl: process.env.CODEPAL_BASE_URL || 'https://api.codepal.ai/v1',
        model: process.env.CODEPAL_MODEL || 'codepal-pro',
        maxTokens: parseInt(process.env.CODEPAL_MAX_TOKENS || '2000'),
      },
      cohere: {
        apiKey: process.env.COHERE_API_KEY,
        baseUrl: process.env.COHERE_BASE_URL || 'https://api.cohere.ai/v1',
        model: process.env.COHERE_MODEL || 'command-r-plus',
        maxTokens: parseInt(process.env.COHERE_MAX_TOKENS || '2000'),
      },
      google: {
        apiKey: process.env.GOOGLE_AI_API_KEY,
        baseUrl: process.env.GOOGLE_AI_BASE_URL || 'https://generativelanguage.googleapis.com/v1',
        model: process.env.GOOGLE_AI_MODEL || 'gemini-1.5-pro',
        maxTokens: parseInt(process.env.GOOGLE_AI_MAX_TOKENS || '2000'),
      },
      groq: {
        apiKey: process.env.GROQ_API_KEY,
        baseUrl: process.env.GROQ_BASE_URL || 'https://api.groq.com/openai/v1',
        model: process.env.GROQ_MODEL || 'llama3-70b-8192',
        maxTokens: parseInt(process.env.GROQ_MAX_TOKENS || '2000'),
      }
    }
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
  
  // Validate at least one AI provider is configured
  const hasAnyProvider = Object.keys(config.ai.providers).some(provider => 
    config.ai.providers[provider as keyof typeof config.ai.providers].apiKey
  );
  
  if (!hasAnyProvider) {
    console.warn('No AI providers configured. AI analysis features will be limited.');
  }
}

export default config;
