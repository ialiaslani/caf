/**
 * Test helpers for Pulse (reactive values).
 * 
 * Provides utilities for testing Pulse instances.
 * 
 * @example
 * ```ts
 * import { createPulseTester, waitForPulseValue } from '@c.a.f/testing/core';
 * import { pulse } from '@c.a.f/core';
 * 
 * const count = pulse(0);
 * const tester = createPulseTester(count);
 * 
 * count.value = 5;
 * await waitForPulseValue(count, (value) => value === 5);
 * ```
 */

import type { Pulse } from '@c.a.f/core';

/**
 * Pulse tester utility.
 * Tracks value changes and provides testing utilities.
 */
export class PulseTester<T> {
  private valueHistory: T[] = [];
  private unsubscribe: (() => void) | null = null;

  constructor(public readonly pulse: Pulse<T> & { value: T }) {
    this.valueHistory.push(pulse.value);
    this.unsubscribe = pulse.subscribe((value) => {
      this.valueHistory.push(value);
    });
  }

  /**
   * Get the current value.
   */
  getValue(): T {
    return this.pulse.value;
  }

  /**
   * Get the value history.
   */
  getValueHistory(): T[] {
    return [...this.valueHistory];
  }

  /**
   * Get the initial value.
   */
  getInitialValue(): T {
    return this.valueHistory[0];
  }

  /**
   * Get the last value change.
   */
  getLastValueChange(): T | undefined {
    return this.valueHistory.length > 1
      ? this.valueHistory[this.valueHistory.length - 1]
      : undefined;
  }

  /**
   * Get the number of value changes.
   */
  getValueChangeCount(): number {
    return Math.max(0, this.valueHistory.length - 1);
  }

  /**
   * Cleanup: unsubscribe from value changes.
   */
  cleanup(): void {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }
  }
}

/**
 * Create a Pulse tester instance.
 */
export function createPulseTester<T>(pulse: Pulse<T> & { value: T }): PulseTester<T> {
  return new PulseTester(pulse);
}

/**
 * Wait for a pulse value that matches a predicate.
 * 
 * @param pulse The Pulse instance to watch
 * @param predicate Function that returns true when the desired value is reached
 * @param timeout Maximum time to wait in milliseconds (default: 5000)
 * @returns Promise that resolves when the predicate returns true
 */
export function waitForPulseValue<T>(
  pulse: Pulse<T> & { value: T },
  predicate: (value: T) => boolean,
  timeout: number = 5000
): Promise<T> {
  return new Promise((resolve, reject) => {
    // Check current value first
    if (predicate(pulse.value)) {
      resolve(pulse.value);
      return;
    }

    const timer = setTimeout(() => {
      unsubscribe();
      reject(new Error(`Timeout waiting for pulse value (${timeout}ms)`));
    }, timeout);

    const unsubscribe = pulse.subscribe((value) => {
      if (predicate(value)) {
        clearTimeout(timer);
        unsubscribe();
        resolve(value);
      }
    });
  });
}
