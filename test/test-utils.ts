// Test utilities for common testing patterns and helper functions

import { getConnectionToken, MongooseModule } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Connection } from 'mongoose';

/**
 * Creates a test module with in-memory MongoDB
 * Useful for integration tests that need a real database
 */
export class TestDatabase {
  private static mongod: MongoMemoryServer;
  private static connection: Connection;

  static async create(): Promise<MongoMemoryServer> {
    if (!this.mongod) {
      this.mongod = await MongoMemoryServer.create();
    }
    return this.mongod;
  }

  static async getUri(): Promise<string> {
    const mongod = await this.create();
    return mongod.getUri();
  }

  static async getConnection(module: TestingModule): Promise<Connection> {
    if (!this.connection) {
      this.connection = module.get<Connection>(getConnectionToken());
    }
    return this.connection;
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

/**
 * Creates a test module with MongoDB for integration tests
 */
export async function createTestModule(
  imports: any[] = [],
  providers: any[] = [],
): Promise<TestingModule> {
  const uri = await TestDatabase.getUri();

  return Test.createTestingModule({
    imports: [MongooseModule.forRoot(uri), ...imports],
    providers,
  }).compile();
}

/**
 * Mock factory for creating consistent mock objects
 */
export class MockFactory {
  /**
   * Creates a mock repository with common methods
   */
  static createMockRepository() {
    return {
      find: jest.fn(),
      findOne: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      updateOne: jest.fn(),
      deleteOne: jest.fn(),
      remove: jest.fn(),
      exec: jest.fn(),
    };
  }

  /**
   * Creates a mock model with Mongoose-like methods
   */
  static createMockModel() {
    const mockModel = jest.fn().mockImplementation((dto) => ({
      ...dto,
      save: jest.fn().mockResolvedValue({ ...dto, _id: 'mock-id' }),
    })) as any;

    mockModel.find = jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue([]),
    });

    mockModel.findById = jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue(null),
    });

    mockModel.findOne = jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue(null),
    });

    mockModel.findByIdAndUpdate = jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue(null),
    });

    mockModel.findByIdAndDelete = jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue(null),
    });

    return mockModel;
  }

  /**
   * Creates a mock service with CRUD operations
   */
  static createMockService() {
    return {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };
  }

  /**
   * Creates a mock HTTP request object
   */
  static createMockRequest(overrides: any = {}) {
    return {
      body: {},
      params: {},
      query: {},
      headers: {},
      user: null,
      ...overrides,
    };
  }

  /**
   * Creates a mock HTTP response object
   */
  static createMockResponse() {
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
      cookie: jest.fn().mockReturnThis(),
      clearCookie: jest.fn().mockReturnThis(),
    };
    return res;
  }
}

/**
 * Data factory for creating test data
 */
export class DataFactory {
  /**
   * Creates a mock user object
   */
  static createUser(overrides: any = {}) {
    return {
      _id: 'mock-user-id',
      name: 'Test User',
      email: 'test@example.com',
      age: 25,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides,
    };
  }

  /**
   * Creates multiple mock users
   */
  static createUsers(count: number, overrides: any = {}) {
    return Array.from({ length: count }, (_, index) =>
      this.createUser({
        _id: `mock-user-id-${index}`,
        name: `Test User ${index}`,
        email: `test${index}@example.com`,
        ...overrides,
      }),
    );
  }

  /**
   * Creates a CreateUserDto
   */
  static createUserDto(overrides: any = {}) {
    return {
      name: 'Test User',
      email: 'test@example.com',
      age: 25,
      ...overrides,
    };
  }

  /**
   * Creates an UpdateUserDto
   */
  static updateUserDto(overrides: any = {}) {
    return {
      name: 'Updated User',
      age: 26,
      ...overrides,
    };
  }
}

/**
 * Async testing utilities
 */
export class AsyncUtils {
  /**
   * Waits for a specific amount of time
   */
  static async wait(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Retries an async operation until it succeeds or max attempts reached
   */
  static async retry<T>(
    operation: () => Promise<T>,
    maxAttempts = 3,
    delay = 100,
  ): Promise<T> {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await operation();
      } catch (error) {
        if (attempt === maxAttempts) {
          throw error;
        }
        await this.wait(delay);
      }
    }
    throw new Error('Max attempts reached');
  }

  /**
   * Waits for a condition to be true
   */
  static async waitFor(
    condition: () => boolean | Promise<boolean>,
    timeout = 5000,
    interval = 100,
  ): Promise<void> {
    const start = Date.now();

    while (Date.now() - start < timeout) {
      if (await condition()) {
        return;
      }
      await this.wait(interval);
    }

    throw new Error(`Condition not met within ${timeout}ms`);
  }
}

/**
 * Custom Jest matchers for better assertions
 */
export const customMatchers = {
  toBeValidId(received: any) {
    const pass = typeof received === 'string' && received.length > 0;
    return {
      message: () => `expected ${received} to be a valid ID`,
      pass,
    };
  },

  toBeValidEmail(received: any) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const pass = typeof received === 'string' && emailRegex.test(received);
    return {
      message: () => `expected ${received} to be a valid email`,
      pass,
    };
  },

  toBeValidUser(received: any) {
    const hasRequiredFields =
      received &&
      typeof received.name === 'string' &&
      typeof received.email === 'string';
    return {
      message: () => `expected ${JSON.stringify(received)} to be a valid user`,
      pass: hasRequiredFields,
    };
  },
};

/**
 * Extends Jest with custom matchers
 */
export function setupCustomMatchers() {
  expect.extend(customMatchers);
}

/**
 * Global test setup helper
 */
export class TestSetup {
  /**
   * Sets up common test environment
   */
  static async setup() {
    // Set test environment variables
    process.env.NODE_ENV = 'test';

    // Setup custom matchers
    setupCustomMatchers();

    // Any other global setup
  }

  /**
   * Cleans up after tests
   */
  static async cleanup() {
    try {
      await TestDatabase.cleanup();
      await TestDatabase.stop();
    } catch (error) {
      console.warn('Error during test cleanup:', error);
    }
  }

  /**
   * Force cleanup - used when normal cleanup fails
   */
  static async forceCleanup() {
    try {
      await TestDatabase.reset();
    } catch (error) {
      console.warn('Error during force cleanup:', error);
    }
  }
}

// Export types for TypeScript support
export interface MockRepository {
  find: jest.Mock;
  findOne: jest.Mock;
  findById: jest.Mock;
  create: jest.Mock;
  save: jest.Mock;
  update: jest.Mock;
  updateOne: jest.Mock;
  deleteOne: jest.Mock;
  remove: jest.Mock;
  exec: jest.Mock;
}

export interface MockService {
  create: jest.Mock;
  findAll: jest.Mock;
  findOne: jest.Mock;
  update: jest.Mock;
  remove: jest.Mock;
}

// Declare module augmentation for custom matchers
/* eslint-disable @typescript-eslint/no-namespace */
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeValidId(): R;
      toBeValidEmail(): R;
      toBeValidUser(): R;
    }
  }
}
/* eslint-enable @typescript-eslint/no-namespace */
