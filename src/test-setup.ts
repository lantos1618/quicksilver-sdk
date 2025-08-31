// Test setup for Bun
import { beforeAll, afterAll } from "bun:test";

// Global test setup
beforeAll(() => {
  // Set up test environment
  process.env['NODE_ENV'] = 'test';
});

afterAll(() => {
  // Clean up after tests
  console.log('Tests completed');
}); 