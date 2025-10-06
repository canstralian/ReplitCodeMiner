import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import cors from 'cors';

describe('CORS Security Configuration', () => {
  let app: express.Express;

  beforeEach(() => {
    app = express();

    // Apply the same CORS configuration as in server/index.ts
    app.use(
      cors({
        origin:
          process.env.NODE_ENV === 'production'
            ? ['https://*.replit.app', 'https://*.replit.dev']
            : ['http://localhost:5000', 'http://127.0.0.1:5000'],
        credentials: true,
      })
    );

    app.get('/test', (req, res) => {
      res.json({ success: true });
    });
  });

  it('should allow requests from localhost:5000 in development', async () => {
    const response = await request(app)
      .get('/test')
      .set('Origin', 'http://localhost:5000')
      .expect(200);

    expect(response.headers['access-control-allow-origin']).toBe(
      'http://localhost:5000'
    );
    expect(response.headers['access-control-allow-credentials']).toBe('true');
  });

  it('should allow requests from 127.0.0.1:5000 in development', async () => {
    const response = await request(app)
      .get('/test')
      .set('Origin', 'http://127.0.0.1:5000')
      .expect(200);

    expect(response.headers['access-control-allow-origin']).toBe(
      'http://127.0.0.1:5000'
    );
    expect(response.headers['access-control-allow-credentials']).toBe('true');
  });

  it('should reject requests from unauthorized origins', async () => {
    const response = await request(app)
      .get('/test')
      .set('Origin', 'http://malicious.example.com')
      .expect(200); // Request succeeds but CORS header is not set

    // The CORS middleware doesn't set the header for unauthorized origins
    expect(response.headers['access-control-allow-origin']).toBeUndefined();
  });

  it('should reject requests from different localhost ports', async () => {
    const response = await request(app)
      .get('/test')
      .set('Origin', 'http://localhost:8000')
      .expect(200);

    expect(response.headers['access-control-allow-origin']).toBeUndefined();
  });

  it('should handle preflight OPTIONS requests correctly', async () => {
    const response = await request(app)
      .options('/test')
      .set('Origin', 'http://localhost:5000')
      .set('Access-Control-Request-Method', 'GET')
      .expect(204);

    expect(response.headers['access-control-allow-origin']).toBe(
      'http://localhost:5000'
    );
    expect(response.headers['access-control-allow-credentials']).toBe('true');
  });

  it('should reject preflight requests from unauthorized origins', async () => {
    const response = await request(app)
      .options('/test')
      .set('Origin', 'http://malicious.example.com')
      .set('Access-Control-Request-Method', 'GET')
      .expect(204);

    expect(response.headers['access-control-allow-origin']).toBeUndefined();
  });
});

describe('CORS Vulnerability Protection', () => {
  it('should not expose wildcard CORS header', async () => {
    const app = express();

    app.use(
      cors({
        origin: ['http://localhost:5000', 'http://127.0.0.1:5000'],
        credentials: true,
      })
    );

    app.get('/test', (req, res) => {
      res.json({ data: 'sensitive' });
    });

    const response = await request(app)
      .get('/test')
      .set('Origin', 'http://attacker.com')
      .expect(200);

    // Verify that the wildcard is NOT present
    expect(response.headers['access-control-allow-origin']).not.toBe('*');
    // And that no origin header is set for unauthorized origins
    expect(response.headers['access-control-allow-origin']).toBeUndefined();
  });

  it('should prevent cross-origin access to assets from external sites', async () => {
    const app = express();

    app.use(
      cors({
        origin: ['http://localhost:5000', 'http://127.0.0.1:5000'],
        credentials: true,
      })
    );

    app.get('/bundle.js', (req, res) => {
      res.setHeader('Content-Type', 'application/javascript');
      res.send('// sensitive source code');
    });

    const response = await request(app)
      .get('/bundle.js')
      .set('Origin', 'http://malicious.example.com')
      .expect(200);

    // Browser will not allow the malicious site to read the response
    // because the CORS header is not present
    expect(response.headers['access-control-allow-origin']).toBeUndefined();
  });
});
