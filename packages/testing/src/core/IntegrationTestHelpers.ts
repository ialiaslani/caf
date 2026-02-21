/**
 * Integration test helpers for CAF.
 *
 * Utilities to run Ploc + UseCase together, flush async work, and small
 * helpers for integration-style tests.
 *
 * @example
 * ```ts
 * import {
 *   createPlocWithUseCase,
 *   flushPromises,
 *   runWithFakeTimers,
 * } from '@c-a-f/testing/core';
 * import { Ploc } from '@c-a-f/core';
 *
 * const ploc = createPlocWithUseCase(InitialState, (state, useCase) => ({ ... }));
 * await flushPromises();
 * ```
 */

import type { Ploc } from '@c-a-f/core';
import type { UseCase } from '@c-a-f/core';
import { createMockPloc } from './PlocTestHelpers';
import { createMockUseCaseSuccess } from './UseCaseTestHelpers';

/**
 * Resolve all pending promises (microtasks).
 * Call after triggering async code to wait for Promise resolution in tests.
 *
 * @example
 * ```ts
 * ploc.load();
 * await flushPromises();
 * expect(ploc.state.items.length).toBe(1);
 * ```
 */
export function flushPromises(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

/**
 * Run a callback with fake timers (if the test environment supports it).
 * Returns the result of the callback. Does not install/uninstall timers;
 * use your test framework's fake timers (e.g. vi.useFakeTimers()) and this
 * to run a tick or advance time.
 *
 * This helper is a no-op that just runs the callback; use it as a placeholder
 * for "run this in a fake timer context" when you pair it with vi.useFakeTimers()
 * or jest.useFakeTimers() in the test.
 *
 * @example
 * ```ts
 * vi.useFakeTimers();
 * const p = doSomethingAsync();
 * await runWithFakeTimers(async () => {
 *   vi.advanceTimersByTime(1000);
 *   await flushPromises();
 * });
 * vi.useRealTimers();
 * ```
 */
export async function runWithFakeTimers<T>(fn: () => Promise<T>): Promise<T> {
  return fn();
}

/**
 * Minimal context for integration tests: a Ploc and a UseCase.
 * Use when your test needs to wire a Ploc to a UseCase without a full app.
 */
export interface PlocUseCaseTestContext<S, A extends any[], T> {
  ploc: Ploc<S>;
  useCase: UseCase<A, T>;
}

/**
 * Create a minimal integration context with a mock Ploc and a success-returning UseCase.
 * Useful when testing a component or flow that expects both a Ploc and a UseCase from context.
 *
 * @example
 * ```ts
 * const { ploc, useCase } = createPlocUseCaseContext(
 *   { items: [], loading: false },
 *   []
 * );
 * // Inject into CAFProvider or pass as props
 * ```
 */
export function createPlocUseCaseContext<S, T>(
  initialState: S,
  useCaseResult: T
): PlocUseCaseTestContext<S, [], T> {
  return {
    ploc: createMockPloc(initialState),
    useCase: createMockUseCaseSuccess(useCaseResult),
  };
}
