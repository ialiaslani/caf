/**
 * Memory leak detection for CAF subscriptions.
 * 
 * Tracks subscriptions (Ploc, Pulse, ApiRequest, Workflow) and detects
 * when subscriptions are created but not properly cleaned up.
 * 
 * @example
 * ```ts
 * import { MemoryLeakDetector, createMemoryLeakDetector } from '@c-a-f/devtools/core';
 * 
 * const detector = createMemoryLeakDetector({
 *   enabled: true,
 *   warnThreshold: 10, // Warn after 10 seconds
 *   errorThreshold: 60, // Error after 60 seconds
 * });
 * 
 * // Track a subscription
 * const subscription = detector.trackSubscription('Ploc', 'UserPloc', () => {
 *   ploc.unsubscribe(listener);
 * });
 * 
 * // Later, check for leaks
 * const leaks = detector.detectLeaks();
 * if (leaks.length > 0) {
 *   console.warn('Memory leaks detected:', leaks);
 * }
 * ```
 */

export interface MemoryLeakDetectorOptions {
  /** Enable leak detection */
  enabled?: boolean;
  /** Warn threshold in milliseconds (default: 10000 = 10 seconds) */
  warnThreshold?: number;
  /** Error threshold in milliseconds (default: 60000 = 60 seconds) */
  errorThreshold?: number;
  /** Check for leaks automatically on interval (in milliseconds, 0 to disable) */
  checkInterval?: number;
  /** Custom logger for warnings/errors */
  logger?: (level: 'warn' | 'error', message: string, data?: unknown) => void;
  /** Include stack traces in leak reports */
  includeStackTraces?: boolean;
}

export interface SubscriptionInfo {
  id: string;
  type: 'Ploc' | 'Pulse' | 'ApiRequest' | 'Workflow' | 'DevTools';
  name: string;
  createdAt: number;
  stackTrace?: string;
  metadata?: Record<string, unknown>;
}

export interface LeakReport {
  subscription: SubscriptionInfo;
  age: number; // Age in milliseconds
  severity: 'warn' | 'error';
}

/**
 * Memory leak detector for CAF subscriptions.
 */
export class MemoryLeakDetector {
  private subscriptions: Map<string, SubscriptionInfo> = new Map();
  private cleanupCallbacks: Map<string, () => void> = new Map();
  private enabled: boolean;
  private warnThreshold: number;
  private errorThreshold: number;
  private checkInterval: number;
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private logger: (level: 'warn' | 'error', message: string, data?: unknown) => void;
  private includeStackTraces: boolean;
  private subscriptionCounter: number = 0;

  constructor(options: MemoryLeakDetectorOptions = {}) {
    this.enabled = options.enabled ?? true;
    this.warnThreshold = options.warnThreshold ?? 10000; // 10 seconds
    this.errorThreshold = options.errorThreshold ?? 60000; // 60 seconds
    this.checkInterval = options.checkInterval ?? 0; // Disabled by default
    this.includeStackTraces = options.includeStackTraces ?? true;

    this.logger = options.logger ?? ((level, message, data) => {
      if (level === 'warn') {
        console.warn(`[MemoryLeakDetector] ${message}`, data);
      } else {
        console.error(`[MemoryLeakDetector] ${message}`, data);
      }
    });

    if (this.enabled && this.checkInterval > 0) {
      this.startPeriodicCheck();
    }
  }

  /**
   * Track a subscription.
   * Returns a cleanup function that should be called when the subscription is cleaned up.
   */
  trackSubscription(
    type: SubscriptionInfo['type'],
    name: string,
    cleanup: () => void,
    metadata?: Record<string, unknown>
  ): () => void {
    if (!this.enabled) {
      return cleanup;
    }

    const id = `sub-${++this.subscriptionCounter}`;
    const createdAt = Date.now();
    const stackTrace = this.includeStackTraces ? this.getStackTrace() : undefined;

    const subscription: SubscriptionInfo = {
      id,
      type,
      name,
      createdAt,
      stackTrace,
      metadata,
    };

    this.subscriptions.set(id, subscription);

    // Wrap cleanup to track when it's called
    const trackedCleanup = () => {
      this.subscriptions.delete(id);
      this.cleanupCallbacks.delete(id);
      cleanup();
    };

    this.cleanupCallbacks.set(id, trackedCleanup);

    return trackedCleanup;
  }

  /**
   * Manually mark a subscription as cleaned up.
   */
  markCleanedUp(id: string): void {
    if (this.cleanupCallbacks.has(id)) {
      const cleanup = this.cleanupCallbacks.get(id)!;
      cleanup();
    }
  }

  /**
   * Detect memory leaks.
   * Returns an array of leak reports.
   */
  detectLeaks(): LeakReport[] {
    const now = Date.now();
    const leaks: LeakReport[] = [];

    for (const [id, subscription] of this.subscriptions.entries()) {
      const age = now - subscription.createdAt;
      let severity: 'warn' | 'error' = 'warn';

      if (age >= this.errorThreshold) {
        severity = 'error';
      } else if (age < this.warnThreshold) {
        continue; // Not old enough to be a leak
      }

      leaks.push({
        subscription,
        age,
        severity,
      });
    }

    return leaks.sort((a, b) => b.age - a.age); // Sort by age, oldest first
  }

  /**
   * Check for leaks and log warnings/errors.
   */
  checkForLeaks(): void {
    if (!this.enabled) {
      return;
    }

    const leaks = this.detectLeaks();

    for (const leak of leaks) {
      const { subscription, age, severity } = leak;
      const ageSeconds = Math.floor(age / 1000);

      const message = `Potential memory leak detected: ${subscription.type} "${subscription.name}" has been active for ${ageSeconds}s`;
      const data = {
        subscription: {
          id: subscription.id,
          type: subscription.type,
          name: subscription.name,
          createdAt: new Date(subscription.createdAt).toISOString(),
          age: `${ageSeconds}s`,
        },
        stackTrace: subscription.stackTrace,
        metadata: subscription.metadata,
      };

      this.logger(severity, message, data);
    }
  }

  /**
   * Get all active subscriptions.
   */
  getActiveSubscriptions(): SubscriptionInfo[] {
    return Array.from(this.subscriptions.values());
  }

  /**
   * Get subscription count by type.
   */
  getSubscriptionCounts(): Record<string, number> {
    const counts: Record<string, number> = {};

    for (const subscription of this.subscriptions.values()) {
      counts[subscription.type] = (counts[subscription.type] || 0) + 1;
    }

    return counts;
  }

  /**
   * Get statistics about subscriptions.
   */
  getStatistics(): {
    totalActive: number;
    byType: Record<string, number>;
    oldestSubscription?: {
      subscription: SubscriptionInfo;
      age: number;
    };
  } {
    const now = Date.now();
    let oldest: { subscription: SubscriptionInfo; age: number } | undefined;

    for (const subscription of this.subscriptions.values()) {
      const age = now - subscription.createdAt;
      if (!oldest || age > oldest.age) {
        oldest = { subscription, age };
      }
    }

    return {
      totalActive: this.subscriptions.size,
      byType: this.getSubscriptionCounts(),
      oldestSubscription: oldest,
    };
  }

  /**
   * Clear all tracked subscriptions (use with caution).
   */
  clearAll(): void {
    this.subscriptions.clear();
    this.cleanupCallbacks.clear();
  }

  /**
   * Enable leak detection.
   */
  enable(): void {
    this.enabled = true;
    if (this.checkInterval > 0 && !this.intervalId) {
      this.startPeriodicCheck();
    }
  }

  /**
   * Disable leak detection.
   */
  disable(): void {
    this.enabled = false;
    this.stopPeriodicCheck();
  }

  /**
   * Start periodic leak checking.
   */
  private startPeriodicCheck(): void {
    if (this.intervalId !== null) {
      return;
    }

    this.intervalId = setInterval(() => {
      this.checkForLeaks();
    }, this.checkInterval);
  }

  /**
   * Stop periodic leak checking.
   */
  private stopPeriodicCheck(): void {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  /**
   * Get stack trace (excluding this function and trackSubscription).
   */
  private getStackTrace(): string {
    try {
      throw new Error();
    } catch (error) {
      const stack = (error as Error).stack;
      if (!stack) {
        return '';
      }

      // Remove first 3 lines (Error, getStackTrace, trackSubscription)
      const lines = stack.split('\n');
      return lines.slice(3).join('\n');
    }
  }

  /**
   * Cleanup: stop periodic checking.
   */
  cleanup(): void {
    this.stopPeriodicCheck();
  }
}

/**
 * Create a memory leak detector instance.
 */
export function createMemoryLeakDetector(
  options?: MemoryLeakDetectorOptions
): MemoryLeakDetector {
  return new MemoryLeakDetector(options);
}

/**
 * Default memory leak detector instance.
 */
export const defaultMemoryLeakDetector = new MemoryLeakDetector({
  enabled: false, // Disabled by default
});
