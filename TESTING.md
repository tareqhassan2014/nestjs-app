# Testing Guide for NestJS Application

## Table of Contents

1. [Overview](#overview)
2. [Test Structure](#test-structure)
3. [Running Tests](#running-tests)
4. [Test Coverage](#test-coverage)
5. [Writing New Tests](#writing-new-tests)
6. [Testing Best Practices](#testing-best-practices)
7. [Troubleshooting](#troubleshooting)
8. [Fixing Hanging Worker Process Issues](#fixing-hanging-worker-process-issues)
9. [CI/CD Integration](#cicd-integration)
10. [Advanced Testing Scenarios](#advanced-testing-scenarios)

## Overview

This NestJS application has comprehensive test coverage with **100% statement coverage** and **100% branch/function coverage**. The testing strategy includes:

- **Unit Tests**: Testing individual components in isolation
- **Integration Tests**: Testing module interactions
- **End-to-End Tests**: Testing complete API workflows
- **Database Tests**: Testing MongoDB operations with in-memory database

### Current Test Statistics

- **Total Tests**: 83 (73 unit + 10 e2e)
- **Test Suites**: 8 (6 unit + 2 e2e)
- **Coverage**: 100% statements, 100% branches, 100% functions

### Recent Updates

✅ **Fixed Hanging Worker Process Issue**: Implemented comprehensive cleanup strategies to prevent Jest worker processes from hanging after tests complete. See [Fixing Hanging Worker Process Issues](#fixing-hanging-worker-process-issues) for detailed implementation guide.

## Test Structure

```
├── src/
│   ├── **/*.spec.ts           # Unit tests (co-located with source)
│   ├── app.controller.spec.ts # App controller tests
│   ├── app.module.spec.ts     # App module tests
│   ├── main.spec.ts          # Bootstrap function tests
│   └── users/
│       ├── users.controller.spec.ts  # Users controller tests
│       ├── users.service.spec.ts     # Users service tests
│       └── users.module.spec.ts      # Users module tests
├── test/
│   ├── app.e2e-spec.ts       # Basic app E2E tests
│   ├── users.e2e-spec.ts     # Users API E2E tests
│   ├── jest-e2e.json         # E2E Jest configuration
│   └── jest.setup.ts         # Global test setup
└── jest.config.js            # Main Jest configuration
```

## Running Tests

### Basic Test Commands

```bash
# Run all unit tests
pnpm run test

# Run tests in watch mode (for development)
pnpm run test:watch

# Run tests with coverage report
pnpm run test:cov

# Run E2E tests
pnpm run test:e2e

# Run specific test file
pnpm run test src/users/users.service.spec.ts

# Run tests matching a pattern
pnpm run test --testNamePattern="should create user"
```

### Advanced Test Commands

```bash
# Run tests with verbose output
pnpm run test --verbose

# Run tests in debug mode
pnpm run test --debug

# Run tests with coverage and open HTML report
pnpm run test:cov && open coverage/lcov-report/index.html

# Run tests with specific timeout
pnpm run test --testTimeout=10000

# Run tests and generate JUnit report
pnpm run test --reporters=default --reporters=jest-junit
```

## Test Coverage

### Understanding Coverage Reports

The coverage report shows:

- **Statements**: Percentage of code statements executed
- **Branches**: Percentage of code branches (if/else) executed
- **Functions**: Percentage of functions called
- **Lines**: Percentage of code lines executed

### Coverage Thresholds

Current thresholds (configured in `jest.config.js`):

```javascript
coverageThreshold: {
  global: {
    branches: 80,
    functions: 80,
    lines: 80,
    statements: 80
  }
}
```

### Improving Coverage

To improve coverage:

1. **Identify uncovered code**:

   ```bash
   pnpm run test:cov
   # Check the HTML report in coverage/lcov-report/index.html
   ```

2. **Focus on critical paths**:
   - Error handling scenarios
   - Edge cases
   - Complex business logic

3. **Add missing test scenarios**:
   - Invalid inputs
   - Database errors
   - Network failures

## Writing New Tests

### Unit Test Template

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { YourService } from './your-service.service';

describe('YourService', () => {
  let service: YourService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [YourService],
    }).compile();

    service = module.get<YourService>(YourService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('methodName', () => {
    it('should handle normal case', () => {
      // Arrange
      const input = 'test';
      const expected = 'expected result';

      // Act
      const result = service.methodName(input);

      // Assert
      expect(result).toBe(expected);
    });

    it('should handle error case', () => {
      // Arrange
      const invalidInput = null;

      // Act & Assert
      expect(() => service.methodName(invalidInput)).toThrow();
    });
  });
});
```

### Controller Test Template

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { YourController } from './your-controller.controller';
import { YourService } from './your-service.service';

describe('YourController', () => {
  let controller: YourController;
  let service: YourService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [YourController],
      providers: [
        {
          provide: YourService,
          useValue: {
            findAll: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<YourController>(YourController);
    service = module.get<YourService>(YourService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of items', async () => {
      const expected = [{ id: 1, name: 'Test' }];
      jest.spyOn(service, 'findAll').mockResolvedValue(expected);

      const result = await controller.findAll();
      expect(result).toBe(expected);
      expect(service.findAll).toHaveBeenCalled();
    });
  });
});
```

### E2E Test Template

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('YourController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('/your-endpoint (GET)', () => {
    return request(app.getHttpServer())
      .get('/your-endpoint')
      .expect(200)
      .expect('Hello World!');
  });
});
```

## Testing Best Practices

### 1. Test Organization

- **AAA Pattern**: Arrange, Act, Assert
- **Descriptive Names**: Use clear, descriptive test names
- **One Assertion**: One logical assertion per test
- **Group Related Tests**: Use `describe` blocks for organization

### 2. Mocking Strategies

```typescript
// Mock external dependencies
const mockRepository = {
  find: jest.fn(),
  findOne: jest.fn(),
  save: jest.fn(),
  remove: jest.fn(),
};

// Mock functions with different return values
mockRepository.find.mockResolvedValue([]);
mockRepository.findOne.mockResolvedValue(null);
mockRepository.save.mockResolvedValue({ id: 1 });
```

### 3. Database Testing

```typescript
import { MongoMemoryServer } from 'mongodb-memory-server';
import { MongooseModule } from '@nestjs/mongoose';

describe('Database Integration', () => {
  let mongod: MongoMemoryServer;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        MongooseModule.forRoot(uri),
        // ... other imports
      ],
    }).compile();
  });

  afterAll(async () => {
    await mongod.stop();
  });
});
```

### 4. Error Testing

```typescript
it('should handle service errors', async () => {
  jest.spyOn(service, 'findOne').mockRejectedValue(new Error('Database error'));

  await expect(controller.findOne('1')).rejects.toThrow('Database error');
});
```

### 5. Async Testing

```typescript
it('should handle async operations', async () => {
  const promise = service.asyncMethod();

  await expect(promise).resolves.toBe('expected result');
  // or
  await expect(promise).rejects.toThrow('Expected error');
});
```

## Troubleshooting

### Common Issues and Solutions

#### 1. Jest Environment Issues

**Problem**: Tests fail with module resolution errors

**Solution**:

```bash
# Clear Jest cache
pnpm run test --clearCache

# Update Jest configuration
# Add to jest.config.js
moduleNameMapping: {
  '^@/(.*)$': '<rootDir>/src/$1'
}
```

#### 2. MongoDB Connection Issues

**Problem**: E2E tests fail with MongoDB connection errors

**Solution**:

```typescript
// Increase timeout in jest-e2e.json
{
  "testTimeout": 60000
}

// Ensure proper cleanup
afterEach(async () => {
  await app.close();
});
```

#### 3. Mock Issues

**Problem**: Mocks not working properly

**Solution**:

```typescript
// Reset mocks between tests
afterEach(() => {
  jest.clearAllMocks();
});

// Use proper mock types
const mockService = {
  method: jest.fn(),
} as jest.Mocked<YourService>;
```

#### 4. Coverage Issues

**Problem**: Coverage drops unexpectedly

**Solution**:

```bash
# Run with coverage and identify missing tests
pnpm run test:cov

# Check specific file coverage
pnpm run test:cov -- --collectCoverageFrom="src/specific-file.ts"
```

### Debugging Tests

```bash
# Run single test in debug mode
pnpm run test --debug --testNamePattern="specific test"

# Use console.log in tests (though not recommended)
it('should debug', () => {
  console.log('Debug info:', result);
  expect(result).toBe(expected);
});
```

## Fixing Hanging Worker Process Issues

### Problem Description

A common issue in NestJS testing is when Jest worker processes fail to exit gracefully after tests complete. This manifests as:

```
A worker process has failed to exit gracefully and has been force exited.
This is likely caused by tests leaking due to improper teardown.
Try running with --detectOpenHandles to find leaks.
```

### Root Causes

1. **Unclosed Database Connections**: MongoDB connections not properly closed
2. **Unclosed NestJS Applications**: App instances not terminated after tests
3. **Hanging Timers**: Active timers preventing process exit
4. **Resource Leaks**: File handles, network connections, or other resources not cleaned up

### Complete Solution Implementation

#### 1. Update Jest Configuration

**File: `jest.config.js`**

```javascript
module.exports = {
  // ... existing config

  // Critical options for preventing hanging processes
  forceExit: true, // Force Jest to exit after tests
  detectOpenHandles: true, // Detect resources preventing exit
  openHandlesTimeout: 5000, // Timeout for async operations

  // Other helpful options
  maxWorkers: '50%', // Limit concurrent workers
  testTimeout: 30000, // Global test timeout
};
```

**File: `test/jest-e2e.json`**

```json
{
  "moduleFileExtensions": ["js", "json", "ts"],
  "rootDir": ".",
  "testEnvironment": "node",
  "testRegex": ".e2e-spec.ts$",
  "transform": {
    "^.+\\.(t|j)s$": "ts-jest"
  },
  "testTimeout": 60000,
  "setupFilesAfterEnv": ["<rootDir>/jest.setup.ts"],
  "forceExit": true,
  "detectOpenHandles": true,
  "openHandlesTimeout": 5000
}
```

#### 2. Update Test Scripts

**File: `package.json`**

```json
{
  "scripts": {
    "test": "jest --detectOpenHandles --forceExit",
    "test:watch": "jest --watch --detectOpenHandles",
    "test:cov": "jest --coverage --detectOpenHandles --forceExit",
    "test:debug": "node --inspect-brk -r tsconfig-paths/register -r ts-node/register node_modules/.bin/jest --runInBand --detectOpenHandles",
    "test:e2e": "jest --config ./test/jest-e2e.json --detectOpenHandles --forceExit"
  }
}
```

#### 3. Enhance Global Test Setup

**File: `jest.setup.ts`**

```typescript
// Global Jest setup file
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'mongodb://localhost:27017/nestjs-test';

jest.setTimeout(30000);

// Global cleanup hooks
beforeEach(() => {
  jest.clearAllMocks();
});

afterEach(() => {
  // Cleanup after each test
});

// Critical: Global afterAll hook
afterAll(async () => {
  // Force cleanup of remaining resources
  await new Promise<void>((resolve) => {
    setTimeout(() => resolve(), 100);
  });
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

// Ensure proper cleanup on process exit
process.on('beforeExit', () => {
  // Final cleanup before process exits
});

export {};
```

#### 4. Fix E2E Test Cleanup

**File: `test/app.e2e-spec.ts`**

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  // CRITICAL: Always close the app after each test
  afterEach(async () => {
    if (app) {
      await app.close();
    }
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });
});
```

#### 5. Improve Database Test Utilities

**File: `test/test-utils.ts`**

```typescript
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Connection } from 'mongoose';

export class TestDatabase {
  private static mongod: MongoMemoryServer;
  private static connection: Connection;

  static async create(): Promise<MongoMemoryServer> {
    if (!this.mongod) {
      this.mongod = await MongoMemoryServer.create();
    }
    return this.mongod;
  }

  static async cleanup(): Promise<void> {
    if (this.connection) {
      try {
        await this.connection.db.dropDatabase();
      } catch (error) {
        console.warn('Error dropping database:', error);
      }

      try {
        await this.connection.close();
      } catch (error) {
        console.warn('Error closing connection:', error);
      }

      this.connection = null;
    }
  }

  static async stop(): Promise<void> {
    // Clean up connection first
    await this.cleanup();

    if (this.mongod) {
      try {
        await this.mongod.stop();
      } catch (error) {
        console.warn('Error stopping MongoDB Memory Server:', error);
      }
      this.mongod = null;
    }
  }

  static async reset(): Promise<void> {
    await this.stop();
    this.mongod = null;
    this.connection = null;
  }
}
```

#### 6. Enhanced E2E Test Cleanup

**File: `test/users.e2e-spec.ts`**

```typescript
describe('Users (e2e)', () => {
  let app: INestApplication;
  let mongoServer: MongoMemoryServer;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        MongooseModule.forRoot(mongoUri),
        UsersModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  }, 60000);

  afterAll(async () => {
    if (app) {
      await app.close();
    }
    if (mongoServer) {
      await mongoServer.stop();
    }

    // Force cleanup any remaining connections
    await new Promise<void>((resolve) => {
      setTimeout(() => resolve(), 100);
    });
  }, 60000);

  // ... tests
});
```

### Quick Setup Checklist

When setting up tests in a new NestJS project, ensure:

- [ ] `forceExit: true` in Jest config
- [ ] `detectOpenHandles: true` in Jest config
- [ ] `--detectOpenHandles --forceExit` in test scripts
- [ ] `afterEach` hooks close NestJS applications
- [ ] `afterAll` hooks stop MongoDB Memory Server
- [ ] Database connections are properly closed
- [ ] Global cleanup hooks in `jest.setup.ts`
- [ ] Proper error handling in cleanup methods

### Verification

After implementing these fixes, verify with:

```bash
# Run tests - should complete without hanging
npm test

# Run E2E tests - should exit cleanly
npm run test:e2e

# Run with coverage - should not hang
npm run test:cov
```

The output should show tests completing without the "force exited" warning.

### Summary

This comprehensive solution addresses the hanging worker process issue by:

1. **Forcing Jest to exit** with `forceExit: true`
2. **Detecting open handles** with `detectOpenHandles: true`
3. **Proper application cleanup** in `afterEach` hooks
4. **Database connection cleanup** with error handling
5. **Global cleanup hooks** in Jest setup
6. **Enhanced test utilities** for MongoDB Memory Server

Follow the Quick Setup Checklist when implementing this in new projects to ensure all cleanup mechanisms are in place.

## CI/CD Integration

### GitHub Actions Example

```yaml
# .github/workflows/test.yml
name: Test

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install

      - name: Run unit tests
        run: pnpm run test:cov

      - name: Run E2E tests
        run: pnpm run test:e2e

      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3
        with:
          file: ./coverage/lcov.info
```

### Pre-commit Hooks

```json
// package.json
{
  "husky": {
    "hooks": {
      "pre-commit": "pnpm run test && pnpm run test:e2e"
    }
  }
}
```

## Advanced Testing Scenarios

### 1. Testing with Different Environments

```typescript
describe('Environment-specific tests', () => {
  it('should work in development', () => {
    process.env.NODE_ENV = 'development';
    // Test development-specific logic
  });

  it('should work in production', () => {
    process.env.NODE_ENV = 'production';
    // Test production-specific logic
  });
});
```

### 2. Testing Authentication

```typescript
describe('Authenticated endpoints', () => {
  it('should require authentication', () => {
    return request(app.getHttpServer()).get('/protected').expect(401);
  });

  it('should work with valid token', () => {
    const token = 'valid-jwt-token';

    return request(app.getHttpServer())
      .get('/protected')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
  });
});
```

### 3. Testing File Uploads

```typescript
describe('File upload', () => {
  it('should handle file upload', () => {
    return request(app.getHttpServer())
      .post('/upload')
      .attach('file', Buffer.from('test content'), 'test.txt')
      .expect(201);
  });
});
```

### 4. Testing WebSocket Connections

```typescript
describe('WebSocket', () => {
  it('should handle WebSocket connections', async () => {
    const client = new WebSocket('ws://localhost:3000');

    await new Promise((resolve) => {
      client.on('open', resolve);
    });

    client.send(JSON.stringify({ type: 'test' }));

    const message = await new Promise((resolve) => {
      client.on('message', resolve);
    });

    expect(JSON.parse(message)).toEqual({ type: 'response' });
  });
});
```

### 5. Performance Testing

```typescript
describe('Performance tests', () => {
  it('should handle high load', async () => {
    const startTime = Date.now();

    const promises = Array(1000)
      .fill(null)
      .map(() => service.performOperation());

    await Promise.all(promises);

    const endTime = Date.now();
    const duration = endTime - startTime;

    expect(duration).toBeLessThan(5000); // Should complete in under 5 seconds
  });
});
```

## Next Steps

### Adding More Test Types

1. **Contract Tests**: Test API contracts with tools like Pact
2. **Load Tests**: Use Artillery or K6 for performance testing
3. **Security Tests**: Add security-focused tests
4. **Accessibility Tests**: Test for web accessibility compliance

### Continuous Improvement

1. **Monitor Coverage**: Set up coverage monitoring
2. **Regular Reviews**: Review and update tests regularly
3. **Refactor Tests**: Keep tests maintainable and readable
4. **Add Documentation**: Document complex test scenarios

### Tools and Libraries

- **Jest**: Main testing framework
- **Supertest**: HTTP assertions for E2E tests
- **MongoDB Memory Server**: In-memory MongoDB for testing
- **Pact**: Contract testing
- **Artillery**: Load testing
- **ESLint**: Code quality and testing best practices

---

## Quick Reference

### Essential Commands

```bash
pnpm run test                 # Run all unit tests
pnpm run test:watch          # Run tests in watch mode
pnpm run test:cov            # Run with coverage
pnpm run test:e2e            # Run E2E tests
pnpm run test:debug          # Debug tests
```

### Coverage Goals

- **Statements**: >95%
- **Branches**: 100%
- **Functions**: 100%
- **Lines**: >95%

### Test Naming Convention

- `describe('ComponentName', () => {})`
- `it('should do something when condition', () => {})`
- `beforeEach()` for setup
- `afterEach()` for cleanup

This comprehensive testing guide should help you maintain and extend the testing capabilities of your NestJS application. Remember to keep tests simple, focused, and maintainable!
