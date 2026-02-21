/**
 * Test helpers for Ploc (Presentation Logic Component).
 * 
 * Provides utilities for testing Ploc instances.
 * 
 * @example
 * ```ts
 * import { createPlocTester, waitForStateChange, createMockPloc } from '@c-a-f/testing/core';
 * import { MyPloc } from './MyPloc';
 * 
 * const tester = createPlocTester(new MyPloc());
 * 
 * // Wait for state change
 * await waitForStateChange(tester.ploc, (state) => state.count === 5);
 * 
 * // Get state history
 * const history = tester.getStateHistory();
 * 
 * // Or use a mock Ploc with controllable state
 * const mockPloc = createMockPloc({ count: 0 });
 * mockPloc.changeState({ count: 1 });
 * ```
 */

import { Ploc } from '@c-a-f/core';

// Ploc is abstract; we use a type that represents any Ploc-like instance (subscribe returns void in core)
type PlocInstance<T> = {
  state: T;
  changeState(state: T): void;
  subscribe(listener: (state: T) => void): void;
  unsubscribe(listener: (state: T) => void): void;
};

/**
 * Concrete Ploc implementation for testing.
 * Provides a Ploc with controllable state and no business logic.
 */
export class MockPloc<S> extends Ploc<S> {
  constructor(initialState: S) {
    super(initialState);
  }
}

/**
 * Create a mock Ploc with controllable state for unit tests.
 * The returned Ploc has no logic; use changeState() to drive state in tests.
 *
 * @example
 * ```ts
 * const ploc = createMockPloc({ count: 0, loading: false });
 * expect(ploc.state.count).toBe(0);
 * ploc.changeState({ count: 1, loading: true });
 * expect(ploc.state.count).toBe(1);
 * ```
 */
export function createMockPloc<S>(initialState: S): Ploc<S> {
  return new MockPloc(initialState);
}

/**
 * Ploc tester utility.
 * Tracks state changes and provides testing utilities.
 */
export class PlocTester<T> {
  private stateHistory: T[] = [];
  private listener: ((state: T) => void) | null = null;

  constructor(public readonly ploc: PlocInstance<T>) {
    this.stateHistory.push(ploc.state);
    this.listener = (state: T) => {
      this.stateHistory.push(state);
    };
    ploc.subscribe(this.listener);
  }

  /**
   * Get the current state.
   */
  getState(): T {
    return this.ploc.state;
  }

  /**
   * Get the state history.
   */
  getStateHistory(): T[] {
    return [...this.stateHistory];
  }

  /**
   * Get the initial state.
   */
  getInitialState(): T {
    return this.stateHistory[0];
  }

  /**
   * Get the last state change.
   */
  getLastStateChange(): T | undefined {
    return this.stateHistory.length > 1
      ? this.stateHistory[this.stateHistory.length - 1]
      : undefined;
  }

  /**
   * Get the number of state changes.
   */
  getStateChangeCount(): number {
    return Math.max(0, this.stateHistory.length - 1);
  }

  /**
   * Cleanup: unsubscribe from state changes.
   */
  cleanup(): void {
    if (this.listener) {
      this.ploc.unsubscribe(this.listener);
      this.listener = null;
    }
  }
}

/**
 * Create a Ploc tester instance.
 */
export function createPlocTester<T>(ploc: PlocInstance<T>): PlocTester<T> {
  return new PlocTester(ploc);
}

/**
 * Wait for a state change that matches a predicate.
 * 
 * @param ploc The Ploc instance to watch
 * @param predicate Function that returns true when the desired state is reached
 * @param timeout Maximum time to wait in milliseconds (default: 5000)
 * @returns Promise that resolves when the predicate returns true
 */
export function waitForStateChange<T>(
  ploc: PlocInstance<T>,
  predicate: (state: T) => boolean,
  timeout: number = 5000
): Promise<T> {
  return new Promise((resolve, reject) => {
    // Check current state first
    if (predicate(ploc.state)) {
      resolve(ploc.state);
      return;
    }

    const listener = (state: T) => {
      if (predicate(state)) {
        clearTimeout(timer);
        ploc.unsubscribe(listener);
        resolve(state);
      }
    };
    const timer = setTimeout(() => {
      ploc.unsubscribe(listener);
      reject(new Error(`Timeout waiting for state change (${timeout}ms)`));
    }, timeout);
    ploc.subscribe(listener);
  });
}

/**
 * Wait for a specific number of state changes.
 */
export function waitForStateChanges<T>(
  ploc: PlocInstance<T>,
  count: number,
  timeout: number = 5000
): Promise<T[]> {
  return new Promise((resolve, reject) => {
    const states: T[] = [];
    const listener = (state: T) => {
      states.push(state);
      if (states.length >= count) {
        clearTimeout(timer);
        ploc.unsubscribe(listener);
        resolve(states);
      }
    };
    const timer = setTimeout(() => {
      ploc.unsubscribe(listener);
      reject(new Error(`Timeout waiting for ${count} state changes (${timeout}ms)`));
    }, timeout);
    ploc.subscribe(listener);
  });
}

// --- Snapshot testing utilities ---

/**
 * Assert that the Ploc tester's state history matches the expected states.
 * Uses JSON comparison so objects are compared by value.
 * Use with your test framework's expect (e.g. expect().toEqual).
 *
 * @example
 * ```ts
 * const tester = createPlocTester(ploc);
 * ploc.changeState({ step: 1 });
 * ploc.changeState({ step: 2 });
 * assertStateHistory(tester, [initialState, { step: 1 }, { step: 2 }]);
 * ```
 */
export function assertStateHistory<T>(tester: PlocTester<T>, expected: T[]): void {
  const actual = tester.getStateHistory();
  const actualJson = JSON.stringify(actual);
  const expectedJson = JSON.stringify(expected);
  if (actualJson !== expectedJson) {
    throw new Error(
      `State history mismatch.\nExpected: ${expectedJson}\nActual: ${actualJson}`
    );
  }
}

/**
 * Return a serializable snapshot of the state history for snapshot testing.
 * Use with your test framework's toMatchSnapshot() or similar.
 *
 * @example
 * ```ts
 * const tester = createPlocTester(ploc);
 * // ... trigger state changes ...
 * expect(getStateHistorySnapshot(tester)).toMatchSnapshot();
 * ```
 */
export function getStateHistorySnapshot<T>(tester: PlocTester<T>): T[] {
  return tester.getStateHistory();
}

/**
 * Return a serialized (JSON) snapshot of the state history for snapshot testing.
 * Useful when state is plain data and you want a string snapshot.
 */
export function getStateHistorySnapshotJson<T>(tester: PlocTester<T>): string {
  return JSON.stringify(tester.getStateHistory(), null, 2);
}
