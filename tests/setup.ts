
import { beforeAll, afterAll } from 'vitest';
import { db } from '../server/db';

beforeAll(async () => {
  // Setup test database
  process.env.NODE_ENV = 'test';
});

afterAll(async () => {
  // Cleanup after tests
  await db.$client.end();
});
