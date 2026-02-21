/**
 * Test helpers for Pulse (reactive values).
 * 
 * Provides utilities for testing Pulse instances.
 * 
 * @example
 * ```ts
 * import { createPulseTester, waitForPulseValue } from '@c-a-f/testing/core';
 * import { pulse } from '@c-a-f/core';
 * 
 * const count = pulse(0);
 * const tester = createPulseTester(count);
 * 
 * count.value = 5;
 * await waitForPulseValue(count, (value) => value === 5);
 * ```
 */

import type { Pulse } from '@c-a-f/core';

/**
 * Pulse tester utility.
 * Tracks value changes and provides testing utilities.
 */
type PulseLike<T> = Pulse<T> & { value: T; subscribe(listener: (value: T) => void): void; unsubscribe(listener: (value: T) => void): void };

export class PulseTester<T> {
  private valueHistory: T[] = [];
  private listener: ((value: T) => void) | null = null;

  constructor(public readonly pulse: PulseLike<T>) {
    this.valueHistory.push(pulse.value);
    this.listener = (value: T) => {
      this.valueHistory.push(value);
    };
    pulse.subscribe(this.listener);
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
    if (this.listener) {
      this.pulse.unsubscribe(this.listener);
      this.listener = null;
    }
  }
}

/**
 * Create a Pulse tester instance.
 */
export function createPulseTester<T>(pulse: PulseLike<T>): PulseTester<T> {
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
  pulse: PulseLike<T>,
  predicate: (value: T) => boolean,
  timeout: number = 5000
): Promise<T> {
  return new Promise((resolve, reject) => {
    // Check current value first
    if (predicate(pulse.value)) {
      resolve(pulse.value);
      return;
    }

    const listener = (value: T) => {
      if (predicate(value)) {
        clearTimeout(timer);
        pulse.unsubscribe(listener);
        resolve(value);
      }
    };
    const timer = setTimeout(() => {
      pulse.unsubscribe(listener);
      reject(new Error(`Timeout waiting for pulse value (${timeout}ms)`));
    }, timeout);
    pulse.subscribe(listener);
  });
}
