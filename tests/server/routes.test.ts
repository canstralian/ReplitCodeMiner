
import { describe, it, expect, beforeEach, vi } from 'vitest';
import request from 'supertest';
import express from 'express';
import { registerRoutes } from '../../server/routes';

// Mock authentication middleware for testing
vi.mock('../../server/replitAuth', () => ({
  setupAuth: vi.fn(),
  isAuthenticated: (req: any, res: any, next: any) => {
    req.user = { claims: { sub: 'test-user-id' } };
    next();
  }
}));

describe('API Routes', () => {
  let app: express.Express;

  beforeEach(async () => {
    app = express();
    app.use(express.json());
    await registerRoutes(app);
  });

  it('should return performance stats', async () => {
    const response = await request(app)
      .get('/api/performance')
      .expect(200);

    expect(response.body).toHaveProperty('requestCount');
    expect(response.body).toHaveProperty('averageResponseTime');
  });

  it('should handle Taskade task creation', async () => {
    const taskData = {
      title: 'Test Task',
      description: 'Test Description',
      assignee: 'test@example.com'
    };

    const response = await request(app)
      .post('/api/taskade/task')
      .send(taskData)
      .expect(200);

    expect(response.body).toHaveProperty('success');
  });
});
