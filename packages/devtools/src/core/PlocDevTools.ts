/**
 * DevTools middleware for Ploc.
 * 
 * Provides debugging utilities for Ploc instances including state tracking,
 * time-travel debugging, and state inspection.
 * 
 * @example
 * ```ts
 * import { createPlocDevTools } from '@caf/devtools/core';
 * import { MyPloc } from './MyPloc';
 * 
 * const ploc = new MyPloc();
 * const devTools = createPlocDevTools(ploc, { name: 'MyPloc' });
 * 
 * // Enable/disable logging
 * devTools.enable();
 * devTools.disable();
 * 
 * // Get state history
 * const history = devTools.getStateHistory();
 * 
 * // Time-travel debugging
 * devTools.jumpToState(2);
 * ```
 */

import type { Ploc } from '@caf/core';

type PlocInstance<T> = {
  state: T;
  changeState(state: T): void;
  subscribe(listener: (state: T) => void): () => void;
  unsubscribe(listener: (state: T) => void): void;
};

export interface PlocDevToolsOptions {
  /** Name for this Ploc instance (for logging) */
  name?: string;
  /** Enable logging by default */
  enabled?: boolean;
  /** Maximum history size */
  maxHistorySize?: number;
  /** Custom logger function */
  logger?: (message: string, data?: unknown) => void;
}

interface StateSnapshot<T> {
  state: T;
  timestamp: number;
  action?: string;
}

/**
 * DevTools for Ploc instances.
 */
export class PlocDevTools<T> {
  private stateHistory: StateSnapshot<T>[] = [];
  private currentIndex: number = -1;
  private enabled: boolean;
  private unsubscribe: (() => void) | null = null;
  private maxHistorySize: number;

  constructor(
    private ploc: PlocInstance<T>,
    private options: PlocDevToolsOptions = {}
  ) {
    this.enabled = options.enabled ?? false;
    this.maxHistorySize = options.maxHistorySize ?? 100;
    this.initialize();
  }

  private initialize(): void {
    // Record initial state
    this.recordState(this.ploc.state, 'INIT');

    // Subscribe to state changes
    this.unsubscribe = this.ploc.subscribe((state) => {
      if (this.enabled) {
        this.recordState(state);
      }
    });
  }

  private recordState(state: T, action?: string): void {
    const snapshot: StateSnapshot<T> = {
      state,
      timestamp: Date.now(),
      action,
    };

    // Remove future history if we're in the middle of history
    if (this.currentIndex < this.stateHistory.length - 1) {
      this.stateHistory = this.stateHistory.slice(0, this.currentIndex + 1);
    }

    this.stateHistory.push(snapshot);
    this.currentIndex = this.stateHistory.length - 1;

    // Limit history size
    if (this.stateHistory.length > this.maxHistorySize) {
      this.stateHistory.shift();
      this.currentIndex--;
    }

    // Log state change
    if (this.enabled) {
      this.log(`[${this.options.name || 'Ploc'}] State changed`, {
        state,
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
    this.log(`[${this.options.name || 'Ploc'}] DevTools enabled`);
  }

  /**
   * Disable DevTools logging.
   */
  disable(): void {
    this.enabled = false;
    this.log(`[${this.options.name || 'Ploc'}] DevTools disabled`);
  }

  /**
   * Get the current state.
   */
  getCurrentState(): T {
    return this.ploc.state;
  }

  /**
   * Get state history.
   */
  getStateHistory(): StateSnapshot<T>[] {
    return [...this.stateHistory];
  }

  /**
   * Get state at a specific index.
   */
  getStateAt(index: number): T | undefined {
    return this.stateHistory[index]?.state;
  }

  /**
   * Jump to a specific state in history (time-travel debugging).
   */
  jumpToState(index: number): void {
    if (index < 0 || index >= this.stateHistory.length) {
      throw new Error(`Invalid state index: ${index}`);
    }

    const snapshot = this.stateHistory[index];
    this.ploc.changeState(snapshot.state);
    this.currentIndex = index;

    this.log(`[${this.options.name || 'Ploc'}] Jumped to state ${index}`, {
      state: snapshot.state,
      timestamp: new Date(snapshot.timestamp).toISOString(),
    });
  }

  /**
   * Go to previous state.
   */
  previousState(): void {
    if (this.currentIndex > 0) {
      this.jumpToState(this.currentIndex - 1);
    }
  }

  /**
   * Go to next state.
   */
  nextState(): void {
    if (this.currentIndex < this.stateHistory.length - 1) {
      this.jumpToState(this.currentIndex + 1);
    }
  }

  /**
   * Reset to initial state.
   */
  reset(): void {
    if (this.stateHistory.length > 0) {
      this.jumpToState(0);
    }
  }

  /**
   * Get current history index.
   */
  getCurrentIndex(): number {
    return this.currentIndex;
  }

  /**
   * Clear state history.
   */
  clearHistory(): void {
    const initialState = this.stateHistory[0]?.state;
    this.stateHistory = initialState ? [{ state: initialState, timestamp: Date.now() }] : [];
    this.currentIndex = 0;
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
 * Create DevTools for a Ploc instance.
 */
export function createPlocDevTools<T>(
  ploc: PlocInstance<T>,
  options?: PlocDevToolsOptions
): PlocDevTools<T> {
  return new PlocDevTools(ploc, options);
}
