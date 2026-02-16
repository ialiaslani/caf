/**
 * DevTools middleware for Pulse.
 * 
 * Provides debugging utilities for Pulse instances including value tracking
 * and time-travel debugging.
 * 
 * @example
 * ```ts
 * import { createPulseDevTools } from '@caf/devtools/core';
 * import { pulse } from '@caf/core';
 * 
 * const count = pulse(0);
 * const devTools = createPulseDevTools(count, { name: 'count' });
 * 
 * devTools.enable();
 * count.value = 5;
 * ```
 */

import type { Pulse } from '@caf/core';

type PulseInstance<T> = Pulse<T> & { value: T };

export interface PulseDevToolsOptions {
  /** Name for this Pulse instance (for logging) */
  name?: string;
  /** Enable logging by default */
  enabled?: boolean;
  /** Maximum history size */
  maxHistorySize?: number;
  /** Custom logger function */
  logger?: (message: string, data?: unknown) => void;
}

interface ValueSnapshot<T> {
  value: T;
  timestamp: number;
  action?: string;
}

/**
 * DevTools for Pulse instances.
 */
export class PulseDevTools<T> {
  private valueHistory: ValueSnapshot<T>[] = [];
  private currentIndex: number = -1;
  private enabled: boolean;
  private unsubscribe: (() => void) | null = null;
  private maxHistorySize: number;

  constructor(
    private pulse: PulseInstance<T>,
    private options: PulseDevToolsOptions = {}
  ) {
    this.enabled = options.enabled ?? false;
    this.maxHistorySize = options.maxHistorySize ?? 100;
    this.initialize();
  }

  private initialize(): void {
    // Record initial value
    this.recordValue(this.pulse.value, 'INIT');

    // Subscribe to value changes
    this.unsubscribe = this.pulse.subscribe((value) => {
      if (this.enabled) {
        this.recordValue(value);
      }
    });
  }

  private recordValue(value: T, action?: string): void {
    const snapshot: ValueSnapshot<T> = {
      value,
      timestamp: Date.now(),
      action,
    };

    // Remove future history if we're in the middle of history
    if (this.currentIndex < this.valueHistory.length - 1) {
      this.valueHistory = this.valueHistory.slice(0, this.currentIndex + 1);
    }

    this.valueHistory.push(snapshot);
    this.currentIndex = this.valueHistory.length - 1;

    // Limit history size
    if (this.valueHistory.length > this.maxHistorySize) {
      this.valueHistory.shift();
      this.currentIndex--;
    }

    // Log value change
    if (this.enabled) {
      this.log(`[${this.options.name || 'Pulse'}] Value changed`, {
        value,
        action,
        timestamp: new Date(snapshot.timestamp).toISOString(),
      });
    }
  }

  private log(message: string, data?: unknown): void {
    if (this.options.logger) {
      this.options.logger(message, data);
    } else {
      console.log(message, data);
    }
  }

  /**
   * Enable DevTools logging.
   */
  enable(): void {
    this.enabled = true;
    this.log(`[${this.options.name || 'Pulse'}] DevTools enabled`);
  }

  /**
   * Disable DevTools logging.
   */
  disable(): void {
    this.enabled = false;
    this.log(`[${this.options.name || 'Pulse'}] DevTools disabled`);
  }

  /**
   * Get the current value.
   */
  getCurrentValue(): T {
    return this.pulse.value;
  }

  /**
   * Get value history.
   */
  getValueHistory(): ValueSnapshot<T>[] {
    return [...this.valueHistory];
  }

  /**
   * Get value at a specific index.
   */
  getValueAt(index: number): T | undefined {
    return this.valueHistory[index]?.value;
  }

  /**
   * Jump to a specific value in history (time-travel debugging).
   */
  jumpToValue(index: number): void {
    if (index < 0 || index >= this.valueHistory.length) {
      throw new Error(`Invalid value index: ${index}`);
    }

    const snapshot = this.valueHistory[index];
    this.pulse.value = snapshot.value;
    this.currentIndex = index;

    this.log(`[${this.options.name || 'Pulse'}] Jumped to value ${index}`, {
      value: snapshot.value,
      timestamp: new Date(snapshot.timestamp).toISOString(),
    });
  }

  /**
   * Go to previous value.
   */
  previousValue(): void {
    if (this.currentIndex > 0) {
      this.jumpToValue(this.currentIndex - 1);
    }
  }

  /**
   * Go to next value.
   */
  nextValue(): void {
    if (this.currentIndex < this.valueHistory.length - 1) {
      this.jumpToValue(this.currentIndex + 1);
    }
  }

  /**
   * Reset to initial value.
   */
  reset(): void {
    if (this.valueHistory.length > 0) {
      this.jumpToValue(0);
    }
  }

  /**
   * Get current history index.
   */
  getCurrentIndex(): number {
    return this.currentIndex;
  }

  /**
   * Clear value history.
   */
  clearHistory(): void {
    const initialValue = this.valueHistory[0]?.value;
    this.valueHistory = initialValue ? [{ value: initialValue, timestamp: Date.now() }] : [];
    this.currentIndex = 0;
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
 * Create DevTools for a Pulse instance.
 */
export function createPulseDevTools<T>(
  pulse: PulseInstance<T>,
  options?: PulseDevToolsOptions
): PulseDevTools<T> {
  return new PulseDevTools(pulse, options);
}
