/**
 * Test helpers for UseCase.
 * 
 * Provides utilities for testing UseCase implementations.
 * 
 * @example
 * ```ts
 * import { createMockUseCase, createUseCaseTester } from '@c-a-f/testing/core';
 * import { UseCase, RequestResult, pulse } from '@c-a-f/core';
 * 
 * // Create a mock use case
 * const mockUseCase = createMockUseCase<User[]>((args) => ({
 *   loading: pulse(false),
 *   data: pulse([{ id: '1', name: 'John' }]),
 *   error: pulse(null! as Error),
 * }));
 * 
 * // Test use case
 * const tester = createUseCaseTester(mockUseCase);
 * const result = await tester.execute([], { timeout: 1000 });
 * ```
 */

import type { UseCase, RequestResult } from '@c-a-f/core';
import { pulse } from '@c-a-f/core';

/**
 * Mock UseCase implementation for testing.
 */
export class MockUseCase<A extends any[], T> implements UseCase<A, T> {
  constructor(
    private implementation: (...args: A) => Promise<RequestResult<T>> | RequestResult<T>
  ) {}

  async execute(...args: A): Promise<RequestResult<T>> {
    return await this.implementation(...args);
  }
}

/**
 * Create a mock UseCase from an implementation.
 */
export function createMockUseCase<A extends any[], T>(
  implementation: (...args: A) => Promise<RequestResult<T>> | RequestResult<T>
): UseCase<A, T> {
  return new MockUseCase(implementation);
}

/**
 * Create a mock UseCase that always returns success with the given data.
 * Useful for unit tests that do not care about loading/error states.
 *
 * @example
 * ```ts
 * const useCase = createMockUseCaseSuccess([{ id: '1', name: 'John' }]);
 * const result = await useCase.execute();
 * expect(result.data.value).toEqual([{ id: '1', name: 'John' }]);
 * ```
 */
export function createMockUseCaseSuccess<T>(data: T): UseCase<[], T> {
  return new MockUseCase<[], T>(() => createSuccessResult(data));
}

/**
 * Create a mock UseCase that always returns the given error.
 *
 * @example
 * ```ts
 * const useCase = createMockUseCaseError(new Error('Network failed'));
 * const result = await useCase.execute();
 * expect(result.error.value?.message).toBe('Network failed');
 * ```
 */
export function createMockUseCaseError<T = unknown>(error: Error): UseCase<[], T> {
  return new MockUseCase<[], T>(() => createErrorResult(error));
}

/**
 * Create a mock UseCase that returns loading then success (async).
 * Useful for testing loading states.
 */
export function createMockUseCaseAsync<T>(
  data: T,
  delayMs: number = 0
): UseCase<[], T> {
  return new MockUseCase<[], T>(() =>
    new Promise((resolve) => {
      if (delayMs <= 0) {
        resolve(createSuccessResult(data));
      } else {
        setTimeout(() => resolve(createSuccessResult(data)), delayMs);
      }
    })
  );
}

/**
 * UseCase tester utility.
 */
export class UseCaseTester<A extends any[], T> {
  constructor(public readonly useCase: UseCase<A, T>) {}

  /**
   * Execute the use case and wait for completion.
   */
  async execute(
    args: A,
    options?: { timeout?: number }
  ): Promise<RequestResult<T>> {
    const timeout = options?.timeout || 5000;

    return Promise.race([
      this.useCase.execute(...args),
      new Promise<RequestResult<T>>((_, reject) => {
        setTimeout(() => reject(new Error(`UseCase execution timeout (${timeout}ms)`)), timeout);
      }),
    ]);
  }

  /**
   * Execute the use case and extract data.
   */
  async executeAndGetData(args: A): Promise<T> {
    const result = await this.execute(args);
    if (result.error.value) {
      throw result.error.value;
    }
    return result.data.value;
  }

  /**
   * Execute the use case and check if it succeeds.
   */
  async executeAndCheckSuccess(args: A): Promise<boolean> {
    try {
      const result = await this.execute(args);
      return !result.error.value;
    } catch {
      return false;
    }
  }
}

/**
 * Create a UseCase tester instance.
 */
export function createUseCaseTester<A extends any[], T>(
  useCase: UseCase<A, T>
): UseCaseTester<A, T> {
  return new UseCaseTester(useCase);
}

/**
 * Create a successful RequestResult.
 */
export function createSuccessResult<T>(data: T): RequestResult<T> {
  return {
    loading: pulse(false),
    data: pulse(data),
    error: pulse(null! as Error),
  };
}

/**
 * Create a failed RequestResult.
 */
export function createErrorResult<T>(error: Error): RequestResult<T> {
  return {
    loading: pulse(false),
    data: pulse(null! as T),
    error: pulse(error),
  };
}

/**
 * Create a loading RequestResult.
 */
export function createLoadingResult<T>(): RequestResult<T> {
  return {
    loading: pulse(true),
    data: pulse(null! as T),
    error: pulse(null! as Error),
  };
}
