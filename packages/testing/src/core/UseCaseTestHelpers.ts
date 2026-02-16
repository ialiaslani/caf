/**
 * Test helpers for UseCase.
 * 
 * Provides utilities for testing UseCase implementations.
 * 
 * @example
 * ```ts
 * import { createMockUseCase, createUseCaseTester } from '@caf/testing/core';
 * import { UseCase, RequestResult, pulse } from '@caf/core';
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

import type { UseCase, RequestResult } from '@caf/core';
import { pulse } from '@caf/core';

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
 * Create a mock UseCase.
 */
export function createMockUseCase<A extends any[], T>(
  implementation: (...args: A) => Promise<RequestResult<T>> | RequestResult<T>
): UseCase<A, T> {
  return new MockUseCase(implementation);
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
