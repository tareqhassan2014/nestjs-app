module.exports = {
  // Use ts-jest preset for TypeScript support
  preset: 'ts-jest',

  // Test environment - Node.js for backend testing
  testEnvironment: 'node',

  // Root directories for Jest to search for tests and modules
  roots: ['<rootDir>/src'],

  // Pattern to find test files
  // Looks for files ending in .spec.ts or .test.ts
  testMatch: [
    '**/__tests__/**/*.+(ts|tsx|js)',
    '**/*.(test|spec).+(ts|tsx|js)',
  ],

  // Transform TypeScript files before running tests
  transform: {
    '^.+\\.(ts|tsx)$': [
      'ts-jest',
      {
        tsconfig: 'tsconfig.json',
      },
    ],
  },

  // Coverage configuration
  collectCoverage: false, // Set to true to always collect coverage
  collectCoverageFrom: [
    'src/**/*.{ts,js}',
    '!src/**/*.d.ts', // Exclude type definition files
    '!src/**/*.interface.ts', // Exclude interface files
    '!src/**/*.enum.ts', // Exclude enum files
    '!src/**/*.module.ts', // Exclude module files from detailed coverage
    '!src/main.ts', // Exclude main bootstrap file
  ],

  // Coverage thresholds - tests will fail if coverage is below these percentages
  coverageThreshold: {
    global: {
      branches: 80, // 80% of branches must be tested
      functions: 80, // 80% of functions must be called
      lines: 80, // 80% of lines must be executed
      statements: 80, // 80% of statements must be executed
    },
  },

  // Coverage reporters - generates different types of coverage reports
  coverageReporters: [
    'text', // Text output in terminal
    'lcov', // LCOV format for CI/CD tools
    'html', // HTML report for browser viewing
    'json', // JSON format for programmatic access
  ],

  // Directory where coverage reports are written
  coverageDirectory: 'coverage',

  // Module file extensions Jest will recognize
  moduleFileExtensions: ['js', 'json', 'ts'],

  // Setup files that run before each test
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],

  // Clear mocks automatically between tests
  clearMocks: true,

  // Restore mocks after each test
  restoreMocks: true,

  // Maximum number of concurrent workers
  maxWorkers: '50%',

  // Test timeout in milliseconds
  testTimeout: 30000,

  // Ignore patterns for test discovery
  testPathIgnorePatterns: ['/node_modules/', '/dist/', '/coverage/'],

  // Module name mapping for path aliases (correct property name)
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@test/(.*)$': '<rootDir>/test/$1',
  },

  // Verbose output - shows individual test results
  verbose: false,

  // Automatically reset mock state between tests
  resetMocks: false,

  // Error handling for unhandled promise rejections
  errorOnDeprecated: true,

  // Watch mode configuration
  watchman: true,

  // Patterns for files that trigger test re-runs in watch mode
  watchPathIgnorePatterns: ['/node_modules/', '/coverage/', '/dist/'],

  // Force exit after tests complete to prevent hanging
  forceExit: true,

  // Detect open handles that prevent Jest from exiting
  detectOpenHandles: true,

  // Exit immediately if a test takes too long
  bail: false,

  // Number of seconds to wait for async operations to complete
  openHandlesTimeout: 5000,
};
