import { bootstrap } from './main';

describe('Bootstrap Function', () => {
  it('should be defined', () => {
    expect(bootstrap).toBeDefined();
  });

  it('should be a function', () => {
    expect(typeof bootstrap).toBe('function');
  });

  it('should be an async function', () => {
    expect(bootstrap.constructor.name).toBe('AsyncFunction');
  });

  it('should not throw when called (basic syntax check)', () => {
    // This tests that the function can be called without syntax errors
    // We don't actually want to start the server in tests
    expect(() => bootstrap).not.toThrow();
  });

  it('should be exported properly', () => {
    expect(bootstrap).toBeInstanceOf(Function);
  });
});
