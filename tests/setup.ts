import { beforeAll, afterAll } from 'vitest';

// Set test environment variables before importing db
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL =
  process.env.DATABASE_URL || 'postgresql://test:test@localhost:5432/testdb';

import { db } from '../server/db';

beforeAll(async () => {
  // Setup test database
  console.log('Test setup complete');
});

afterAll(async () => {
  // Cleanup after tests
  try {
    await db.$client.end();
  } catch (error) {
    console.error('Error closing database connection during test cleanup:', error);
  }
});
