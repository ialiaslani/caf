/**
 * Performance profiler for CAF applications.
 * 
 * Tracks execution times, render times, and identifies performance bottlenecks.
 * 
 * @example
 * ```ts
 * import { createPerformanceProfiler, measureExecution } from '@c-a-f/devtools/core';
 * 
 * const profiler = createPerformanceProfiler({
 *   enabled: true,
 *   trackSlowOperations: true,
 *   slowThreshold: 100, // ms
 * });
 * 
 * // Measure execution time
 * const result = await measureExecution('fetchUsers', async () => {
 *   return await fetch('/api/users').then(r => r.json());
 * });
 * 
 * // Get performance report
 * const report = profiler.getReport();
 * ```
 */

export interface PerformanceProfilerOptions {
  /** Enable profiling */
  enabled?: boolean;
  /** Track slow operations automatically */
  trackSlowOperations?: boolean;
  /** Threshold in milliseconds for slow operations (default: 100) */
  slowThreshold?: number;
  /** Maximum number of measurements to keep (default: 1000) */
  maxMeasurements?: number;
  /** Custom logger for slow operations */
  logger?: (message: string, data?: unknown) => void;
  /** Include stack traces in measurements */
  includeStackTraces?: boolean;
}

export interface Measurement {
  id: string;
  name: string;
  type: 'execution' | 'render' | 'custom';
  startTime: number;
  endTime: number;
  duration: number;
  metadata?: Record<string, unknown>;
  stackTrace?: string;
}

export interface PerformanceReport {
  totalMeasurements: number;
  averageDuration: number;
  minDuration: number;
  maxDuration: number;
  slowOperations: Measurement[];
  byType: {
    execution: Measurement[];
    render: Measurement[];
    custom: Measurement[];
  };
  byName: Record<string, Measurement[]>;
}

/**
 * Performance profiler for CAF applications.
 */
export class PerformanceProfiler {
  private measurements: Measurement[] = [];
  private enabled: boolean;
  private trackSlowOperations: boolean;
  private slowThreshold: number;
  private maxMeasurements: number;
  private logger: (message: string, data?: unknown) => void;
  private includeStackTraces: boolean;
  private measurementCounter: number = 0;
  private activeMeasurements: Map<string, number> = new Map();

  constructor(options: PerformanceProfilerOptions = {}) {
    this.enabled = options.enabled ?? true;
    this.trackSlowOperations = options.trackSlowOperations ?? true;
    this.slowThreshold = options.slowThreshold ?? 100; // 100ms
    this.maxMeasurements = options.maxMeasurements ?? 1000;
    this.includeStackTraces = options.includeStackTraces ?? false;

    this.logger = options.logger ?? ((message, data) => {
      console.warn(`[PerformanceProfiler] ${message}`, data);
    });
  }

  /**
   * Start measuring execution time.
   * Returns a function to call when done.
   */
  startMeasure(name: string, type: Measurement['type'] = 'execution', metadata?: Record<string, unknown>): () => void {
    if (!this.enabled) {
      return () => {}; // No-op
    }

    const id = `measure-${++this.measurementCounter}`;
    const startTime = performance.now();
    const stackTrace = this.includeStackTraces ? this.getStackTrace() : undefined;

    this.activeMeasurements.set(id, startTime);

    return () => {
      const endTime = performance.now();
      const duration = endTime - startTime;
      this.activeMeasurements.delete(id);

      const measurement: Measurement = {
        id,
        name,
        type,
        startTime,
        endTime,
        duration,
        metadata,
        stackTrace,
      };

      this.recordMeasurement(measurement);

      // Check if it's a slow operation
      if (this.trackSlowOperations && duration >= this.slowThreshold) {
        this.logger(`Slow operation detected: ${name} took ${duration.toFixed(2)}ms`, {
          measurement,
        });
      }
    };
  }

  /**
   * Measure an async function execution.
   */
  async measureExecution<T>(
    name: string,
    fn: () => Promise<T>,
    metadata?: Record<string, unknown>
  ): Promise<T> {
    const endMeasure = this.startMeasure(name, 'execution', metadata);
    try {
      const result = await fn();
      endMeasure();
      return result;
    } catch (error) {
      endMeasure();
      throw error;
    }
  }

  /**
   * Measure a synchronous function execution.
   */
  measureSync<T>(
    name: string,
    fn: () => T,
    metadata?: Record<string, unknown>
  ): T {
    const endMeasure = this.startMeasure(name, 'execution', metadata);
    try {
      const result = fn();
      endMeasure();
      return result;
    } catch (error) {
      endMeasure();
      throw error;
    }
  }

  /**
   * Measure render time (for React components).
   */
  measureRender(name: string, metadata?: Record<string, unknown>): () => void {
    return this.startMeasure(name, 'render', metadata);
  }

  /**
   * Record a custom measurement.
   */
  recordCustomMeasurement(
    name: string,
    duration: number,
    metadata?: Record<string, unknown>
  ): void {
    if (!this.enabled) {
      return;
    }

    const now = performance.now();
    const measurement: Measurement = {
      id: `measure-${++this.measurementCounter}`,
      name,
      type: 'custom',
      startTime: now - duration,
      endTime: now,
      duration,
      metadata,
      stackTrace: this.includeStackTraces ? this.getStackTrace() : undefined,
    };

    this.recordMeasurement(measurement);
  }

  /**
   * Record a measurement.
   */
  private recordMeasurement(measurement: Measurement): void {
    this.measurements.push(measurement);

    // Limit measurements
    if (this.measurements.length > this.maxMeasurements) {
      this.measurements.shift();
    }
  }

  /**
   * Get performance report.
   */
  getReport(): PerformanceReport {
    if (this.measurements.length === 0) {
      return {
        totalMeasurements: 0,
        averageDuration: 0,
        minDuration: 0,
        maxDuration: 0,
        slowOperations: [],
        byType: {
          execution: [],
          render: [],
          custom: [],
        },
        byName: {},
      };
    }

    const durations = this.measurements.map((m) => m.duration);
    const totalDuration = durations.reduce((sum, d) => sum + d, 0);
    const averageDuration = totalDuration / this.measurements.length;
    const minDuration = Math.min(...durations);
    const maxDuration = Math.max(...durations);

    // Slow operations
    const slowOperations = this.measurements
      .filter((m) => m.duration >= this.slowThreshold)
      .sort((a, b) => b.duration - a.duration);

    // Group by type
    const byType = {
      execution: this.measurements.filter((m) => m.type === 'execution'),
      render: this.measurements.filter((m) => m.type === 'render'),
      custom: this.measurements.filter((m) => m.type === 'custom'),
    };

    // Group by name
    const byName: Record<string, Measurement[]> = {};
    for (const measurement of this.measurements) {
      if (!byName[measurement.name]) {
        byName[measurement.name] = [];
      }
      byName[measurement.name].push(measurement);
    }

    return {
      totalMeasurements: this.measurements.length,
      averageDuration,
      minDuration,
      maxDuration,
      slowOperations,
      byType,
      byName,
    };
  }

  /**
   * Get statistics for a specific operation name.
   */
  getStatisticsFor(name: string): {
    count: number;
    averageDuration: number;
    minDuration: number;
    maxDuration: number;
    totalDuration: number;
    measurements: Measurement[];
  } | null {
    const measurements = this.measurements.filter((m) => m.name === name);
    if (measurements.length === 0) {
      return null;
    }

    const durations = measurements.map((m) => m.duration);
    const totalDuration = durations.reduce((sum, d) => sum + d, 0);
    const averageDuration = totalDuration / measurements.length;
    const minDuration = Math.min(...durations);
    const maxDuration = Math.max(...durations);

    return {
      count: measurements.length,
      averageDuration,
      minDuration,
      maxDuration,
      totalDuration,
      measurements,
    };
  }

  /**
   * Get all measurements.
   */
  getMeasurements(): Measurement[] {
    return [...this.measurements];
  }

  /**
   * Get slow operations.
   */
  getSlowOperations(threshold?: number): Measurement[] {
    const thresholdToUse = threshold ?? this.slowThreshold;
    return this.measurements
      .filter((m) => m.duration >= thresholdToUse)
      .sort((a, b) => b.duration - a.duration);
  }

  /**
   * Get active measurements (currently running).
   */
  getActiveMeasurements(): Array<{ id: string; name: string; elapsed: number }> {
    const now = performance.now();
    return Array.from(this.activeMeasurements.entries()).map(([id, startTime]) => {
      // Find the measurement name (we need to track this separately)
      // For now, return basic info
      return {
        id,
        name: 'active',
        elapsed: now - startTime,
      };
    });
  }

  /**
   * Clear all measurements.
   */
  clear(): void {
    this.measurements = [];
    this.activeMeasurements.clear();
  }

  /**
   * Enable profiling.
   */
  enable(): void {
    this.enabled = true;
  }

  /**
   * Disable profiling.
   */
  disable(): void {
    this.enabled = false;
  }

  /**
   * Get stack trace (excluding this function and startMeasure).
   */
  private getStackTrace(): string {
    try {
      throw new Error();
    } catch (error) {
      const stack = (error as Error).stack;
      if (!stack) {
        return '';
      }

      // Remove first 3 lines (Error, getStackTrace, startMeasure)
      const lines = stack.split('\n');
      return lines.slice(3).join('\n');
    }
  }
}

/**
 * Create a performance profiler instance.
 */
export function createPerformanceProfiler(
  options?: PerformanceProfilerOptions
): PerformanceProfiler {
  return new PerformanceProfiler(options);
}

/**
 * Measure execution time of an async function.
 * Convenience function that creates a profiler if needed.
 */
export async function measureExecution<T>(
  name: string,
  fn: () => Promise<T>,
  profiler?: PerformanceProfiler,
  metadata?: Record<string, unknown>
): Promise<T> {
  const profilerToUse = profiler || createPerformanceProfiler({ enabled: true });
  return profilerToUse.measureExecution(name, fn, metadata);
}

/**
 * Measure execution time of a synchronous function.
 * Convenience function that creates a profiler if needed.
 */
export function measureSync<T>(
  name: string,
  fn: () => T,
  profiler?: PerformanceProfiler,
  metadata?: Record<string, unknown>
): T {
  const profilerToUse = profiler || createPerformanceProfiler({ enabled: true });
  return profilerToUse.measureSync(name, fn, metadata);
}

/**
 * Default performance profiler instance.
 */
export const defaultPerformanceProfiler = new PerformanceProfiler({
  enabled: false, // Disabled by default
});
