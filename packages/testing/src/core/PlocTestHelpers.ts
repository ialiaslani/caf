/**
 * Test helpers for Ploc (Presentation Logic Component).
 * 
 * Provides utilities for testing Ploc instances.
 * 
 * @example
 * ```ts
 * import { createPlocTester, waitForStateChange } from '@c.a.f/testing/core';
 * import { MyPloc } from './MyPloc';
 * 
 * const tester = createPlocTester(new MyPloc());
 * 
 * // Wait for state change
 * await waitForStateChange(tester.ploc, (state) => state.count === 5);
 * 
 * // Get state history
 * const history = tester.getStateHistory();
 * ```
 */

import type { Ploc } from '@c.a.f/core';

// Ploc is abstract, so we need a type that represents any Ploc instance
type PlocInstance<T> = {
  state: T;
  changeState(state: T): void;
  subscribe(listener: (state: T) => void): () => void;
  unsubscribe(listener: (state: T) => void): void;
};

/**
 * Ploc tester utility.
 * Tracks state changes and provides testing utilities.
 */
export class PlocTester<T> {
  private stateHistory: T[] = [];
  private unsubscribe: (() => void) | null = null;

  constructor(public readonly ploc: PlocInstance<T>) {
    this.stateHistory.push(ploc.state);
    this.unsubscribe = ploc.subscribe((state) => {
      this.stateHistory.push(state);
    });
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
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
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

    const timer = setTimeout(() => {
      unsubscribe();
      reject(new Error(`Timeout waiting for state change (${timeout}ms)`));
    }, timeout);

    const unsubscribe = ploc.subscribe((state) => {
      if (predicate(state)) {
        clearTimeout(timer);
        unsubscribe();
        resolve(state);
      }
    });
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
    const timer = setTimeout(() => {
      unsubscribe();
      reject(new Error(`Timeout waiting for ${count} state changes (${timeout}ms)`));
    }, timeout);

    const unsubscribe = ploc.subscribe((state) => {
      states.push(state);
      if (states.length >= count) {
        clearTimeout(timer);
        unsubscribe();
        resolve(states);
      }
    });
  });
}
