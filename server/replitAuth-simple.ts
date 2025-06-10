import session from "express-session";
import type { Express, RequestHandler } from "express";
import connectPg from "connect-pg-simple";

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: false,
    ttl: sessionTtl,
    tableName: "sessions",
  });
  return session({
    secret: process.env.SESSION_SECRET || 'dev-secret-key',
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false, // Set to true in production with HTTPS
      maxAge: sessionTtl,
    },
  });
}

export async function setupAuth(app: Express) {
  app.use(getSession());
  
  // Simplified auth routes for development
  app.get("/api/login", (req, res) => {
    res.json({ 
      message: "Authentication system temporarily simplified for development",
      redirect: "/"
    });
  });

  app.get("/api/callback", (req, res) => {
    res.redirect("/");
  });

  app.get("/api/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        console.error('Session destroy error:', err);
      }
      res.json({ message: "Logged out successfully" });
    });
  });
}

export const isAuthenticated: RequestHandler = (req, res, next) => {
  // For development, allow all requests through
  // In production, this should check actual authentication
  if (process.env.NODE_ENV === 'development') {
    // Mock authenticated user for development
    (req as any).user = {
      claims: {
        sub: 'dev-user-id',
        email: 'dev@example.com',
        preferred_username: 'developer'
      },
      access_token: 'dev-token'
    };
    return next();
  }
  
  res.status(401).json({ message: "Authentication required" });
};