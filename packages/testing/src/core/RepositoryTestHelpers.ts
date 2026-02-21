/**
 * Test helpers for domain repository interfaces (I*Repository).
 *
 * Provides a generic stub so you can override only the methods your test needs.
 *
 * @example
 * ```ts
 * import { createMockRepository } from '@c-a-f/testing/core';
 * import type { IUserRepository } from '../domain';
 *
 * const mockRepo = createMockRepository<IUserRepository>({
 *   getUsers: async () => [{ id: '1', name: 'John' }],
 *   getUserById: async (id) => ({ id, name: 'User ' + id }),
 * });
 * // getUsers and getUserById are stubbed; other methods return undefined (can be overridden)
 *
 * // Or use an empty stub and assign/spy later
 * const stub = createMockRepository<IUserRepository>();
 * stub.getUsers = async () => [];
 * ```
 */

const defaultAsyncStub = async (): Promise<undefined> => undefined;

/**
 * Create a generic mock repository stub.
 * - With no args: returns a proxy that implements any method as async () => undefined.
 *   You can assign specific methods or use with a test spy.
 * - With methods: returns an object with those methods; any other method call
 *   returns undefined (optional second argument can provide a default).
 *
 * @example
 * ```ts
 * const repo = createMockRepository<IUserRepository>({
 *   getUsers: async () => [],
 *   getUserById: async (id) => ({ id, name: 'Test' }),
 * });
 * ```
 */
export function createMockRepository<T extends Record<string, (...args: any[]) => Promise<any>>>(
  methods?: Partial<T>
): T {
  const base = (methods ?? {}) as Record<string, (...args: any[]) => Promise<any>>;
  return new Proxy(base, {
    get(target, prop: string) {
      if (prop in target && typeof target[prop] === 'function') {
        return target[prop];
      }
      return defaultAsyncStub;
    },
  }) as T;
}

/**
 * Create an empty repository stub. Every method returns Promise.resolve(undefined).
 * Assign or spy on methods as needed.
 *
 * @example
 * ```ts
 * const repo = createMockRepositoryStub<IUserRepository>();
 * repo.getUsers = vi.fn().mockResolvedValue([{ id: '1', name: 'John' }]);
 * ```
 */
export function createMockRepositoryStub<T>(): T {
  const target: Record<string, any> = {};
  return new Proxy(target, {
    get(target, prop: string) {
      // If property exists on target (was assigned), return it
      if (prop in target) {
        return target[prop];
      }
      // Otherwise return default stub
      return defaultAsyncStub;
    },
    set(target, prop: string, value: any) {
      // Allow assignment
      target[prop] = value;
      return true;
    },
  }) as T;
}
