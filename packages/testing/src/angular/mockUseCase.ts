/**
 * Helpers to create mock UseCases for Angular component tests. Use with provideTestingCAF.
 *
 * @example
 * ```ts
 * import { provideTestingCAF, mockUseCase } from '@c-a-f/testing/angular';
 *
 * const submit = mockUseCase.success({ id: '1' });
 * TestBed.configureTestingModule({
 *   providers: [provideTestingCAF({ useCases: { submit } })],
 * });
 * ```
 */

import type { UseCase, RequestResult } from '@c-a-f/core';
import {
  createMockUseCase,
  createMockUseCaseSuccess,
  createMockUseCaseError,
  createMockUseCaseAsync,
} from '../core/UseCaseTestHelpers';

export const mockUseCase = {
  /**
   * UseCase that always returns success with the given data.
   */
  success<T>(data: T): UseCase<[], T> {
    return createMockUseCaseSuccess(data);
  },

  /**
   * UseCase that always returns the given error.
   */
  error<T = unknown>(error: Error): UseCase<[], T> {
    return createMockUseCaseError<T>(error);
  },

  /**
   * UseCase that resolves with data after an optional delay (for loading-state tests).
   */
  async<T>(data: T, delayMs: number = 0): UseCase<[], T> {
    return createMockUseCaseAsync(data, delayMs);
  },

  /**
   * UseCase with a custom implementation (same as createMockUseCase).
   */
  fn<A extends any[], T>(
    implementation: (...args: A) => Promise<RequestResult<T>> | RequestResult<T>
  ): UseCase<A, T> {
    return createMockUseCase(implementation);
  },
};
