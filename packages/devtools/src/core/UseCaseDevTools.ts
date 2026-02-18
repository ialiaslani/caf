/**
 * DevTools middleware for UseCase.
 * 
 * Provides debugging utilities for UseCase execution including execution tracking,
 * timing, and error logging.
 * 
 * @example
 * ```ts
 * import { createUseCaseDevTools, wrapUseCase } from '@c.a.f/devtools/core';
 * import { MyUseCase } from './MyUseCase';
 * 
 * const useCase = new MyUseCase();
 * const devTools = createUseCaseDevTools({ name: 'MyUseCase' });
 * const wrappedUseCase = wrapUseCase(useCase, devTools);
 * 
 * // Execute use case (will be logged)
 * await wrappedUseCase.execute(args);
 * ```
 */

import type { UseCase, RequestResult } from '@c.a.f/core';
import type { PerformanceProfiler } from './PerformanceProfiler';

export interface UseCaseDevToolsOptions {
  /** Name for this UseCase (for logging) */
  name?: string;
  /** Enable logging by default */
  enabled?: boolean;
  /** Log execution time */
  logExecutionTime?: boolean;
  /** Custom logger function */
  logger?: (message: string, data?: unknown) => void;
  /** Performance profiler instance (optional) */
  profiler?: PerformanceProfiler;
}

interface ExecutionSnapshot {
  args: unknown[];
  result?: RequestResult<unknown>;
  error?: Error;
  startTime: number;
  endTime?: number;
  duration?: number;
}

/**
 * DevTools for UseCase execution.
 */
export class UseCaseDevTools {
  private executionHistory: ExecutionSnapshot[] = [];
  private enabled: boolean;
  private maxHistorySize: number = 100;
  private profiler?: PerformanceProfiler;

  constructor(private options: UseCaseDevToolsOptions = {}) {
    this.enabled = options.enabled ?? false;
    this.profiler = options.profiler;
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
    this.log(`[${this.options.name || 'UseCase'}] DevTools enabled`);
  }

  /**
   * Disable DevTools logging.
   */
  disable(): void {
    this.enabled = false;
    this.log(`[${this.options.name || 'UseCase'}] DevTools disabled`);
  }

  /**
   * Wrap a UseCase with DevTools tracking.
   */
  wrap<A extends any[], T>(useCase: UseCase<A, T>): UseCase<A, T> {
    return {
      execute: async (...args: A): Promise<RequestResult<T>> => {
        const startTime = Date.now();
        const snapshot: ExecutionSnapshot = {
          args,
          startTime,
        };

        // Start performance measurement
        const endMeasure = this.profiler?.startMeasure(
          this.options.name || 'UseCase',
          'execution',
          { args }
        );

        if (this.enabled) {
          this.log(`[${this.options.name || 'UseCase'}] Executing`, { args });
        }

        try {
          const result = await useCase.execute(...args);
          const endTime = Date.now();
          const duration = endTime - startTime;
          
          // End performance measurement
          endMeasure?.();

          snapshot.result = result as RequestResult<unknown>;
          snapshot.endTime = endTime;
          snapshot.duration = duration;

          this.executionHistory.push(snapshot);

          // Limit history size
          if (this.executionHistory.length > this.maxHistorySize) {
            this.executionHistory.shift();
          }

          if (this.enabled) {
            const logData: Record<string, unknown> = {
              args,
              success: !result.error.value,
              duration: `${duration}ms`,
            };

            if (this.options.logExecutionTime) {
              logData.executionTime = duration;
            }

            if (result.error.value) {
              logData.error = result.error.value;
              this.log(`[${this.options.name || 'UseCase'}] Execution failed`, logData);
            } else {
              this.log(`[${this.options.name || 'UseCase'}] Execution succeeded`, logData);
            }
          }

          return result;
        } catch (error) {
          const endTime = Date.now();
          const duration = endTime - startTime;

          // End performance measurement (even on error)
          endMeasure?.();

          snapshot.error = error as Error;
          snapshot.endTime = endTime;
          snapshot.duration = duration;

          this.executionHistory.push(snapshot);

          if (this.enabled) {
            this.log(`[${this.options.name || 'UseCase'}] Execution threw error`, {
              args,
              error,
              duration: `${duration}ms`,
            });
          }

          throw error;
        }
      },
    };
  }

  /**
   * Get execution history.
   */
  getExecutionHistory(): ExecutionSnapshot[] {
    return [...this.executionHistory];
  }

  /**
   * Get execution statistics.
   */
  getStatistics(): {
    totalExecutions: number;
    successfulExecutions: number;
    failedExecutions: number;
    averageDuration: number;
  } {
    const executions = this.executionHistory.filter((e) => e.duration !== undefined);
    const successful = executions.filter((e) => e.result && !e.result.error?.value);
    const failed = executions.filter((e) => e.error || (e.result && e.result.error?.value));

    const totalDuration = executions.reduce((sum, e) => sum + (e.duration || 0), 0);
    const averageDuration = executions.length > 0 ? totalDuration / executions.length : 0;

    return {
      totalExecutions: executions.length,
      successfulExecutions: successful.length,
      failedExecutions: failed.length,
      averageDuration,
    };
  }

  /**
   * Clear execution history.
   */
  clearHistory(): void {
    this.executionHistory = [];
  }
}

/**
 * Create DevTools for UseCase execution.
 */
export function createUseCaseDevTools(options?: UseCaseDevToolsOptions): UseCaseDevTools {
  return new UseCaseDevTools(options);
}

/**
 * Wrap a UseCase with DevTools tracking.
 */
export function wrapUseCase<A extends any[], T>(
  useCase: UseCase<A, T>,
  devTools?: UseCaseDevTools
): UseCase<A, T> {
  const tools = devTools || createUseCaseDevTools({ name: useCase.constructor.name });
  return tools.wrap(useCase);
}
