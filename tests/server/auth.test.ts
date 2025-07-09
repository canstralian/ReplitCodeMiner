
import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import { registerRoutes } from '../../server/routes';

describe('Authentication', () => {
  let app: express.Express;

  beforeEach(async () => {
    app = express();
    await registerRoutes(app);
  });

  it('should return 401 for unauthenticated requests', async () => {
    const response = await request(app)
      .get('/api/settings')
      .expect(401);

    expect(response.body.message).toBe('Unauthorized');
  });

  it('should protect sensitive endpoints', async () => {
    const response = await request(app)
      .get('/api/projects')
      .expect(401);

    expect(response.body.message).toBe('Unauthorized');
  });
});
