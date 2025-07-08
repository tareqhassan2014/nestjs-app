// Global Jest setup file
// This file runs before all tests and sets up the testing environment

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'mongodb://localhost:27017/nestjs-test';

// Configure global test timeout
jest.setTimeout(30000);

// Global test utilities and mocks can be defined here

// Mock console methods to reduce noise in test output (optional)
// Uncomment if you want cleaner test output
/*
global.console = {
  ...console,
  log: jest.fn(), // Mock console.log
  debug: jest.fn(), // Mock console.debug
  info: jest.fn(), // Mock console.info
  warn: jest.fn(), // Mock console.warn
  error: console.error, // Keep console.error for debugging
};
*/

// Global beforeEach that runs before every test
beforeEach(() => {
  // Clear all mocks before each test
  jest.clearAllMocks();
});

// Global afterEach that runs after every test
afterEach(() => {
  // Cleanup after each test if needed
  // This is where you can add global cleanup logic
});

// Global afterAll hook to ensure cleanup
afterAll(async () => {
  // Force cleanup of any remaining resources
  await new Promise<void>((resolve) => {
    setTimeout(() => resolve(), 100);
  });
});

// Add custom Jest matchers if needed
// expect.extend({
//   toBeValidUser(received) {
//     const pass = received && received.email && received.name;
//     return {
//       message: () => `expected ${received} to be a valid user`,
//       pass,
//     };
//   },
// });

// Global error handling for unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Optionally fail the test
  // throw reason;
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

// Ensure proper cleanup on process exit
process.on('beforeExit', () => {
  // Any final cleanup before process exits
});

export {};
