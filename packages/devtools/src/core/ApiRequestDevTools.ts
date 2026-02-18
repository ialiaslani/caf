/**
 * DevTools middleware for ApiRequest.
 * 
 * Provides debugging utilities for ApiRequest instances including request tracking,
 * loading states, errors, retries, and performance monitoring.
 * 
 * @example
 * ```ts
 * import { createApiRequestDevTools, wrapApiRequest } from '@c.a.f/devtools/core';
 * import { ApiRequest } from '@c.a.f/core';
 * 
 * const apiRequest = new ApiRequest(fetch('/api/users').then(r => r.json()));
 * const devTools = createApiRequestDevTools(apiRequest, { name: 'GetUsers' });
 * const wrappedRequest = wrapApiRequest(apiRequest, devTools);
 * 
 * // Execute request (will be tracked)
 * await wrappedRequest.mutate();
 * ```
 */

import type { ApiRequest } from '@c.a.f/core';
import type { PerformanceProfiler } from './PerformanceProfiler';

export interface ApiRequestDevToolsOptions {
  /** Name for this ApiRequest (for logging) */
  name?: string;
  /** Enable logging by default */
  enabled?: boolean;
  /** Log execution time */
  logExecutionTime?: boolean;
  /** Maximum history size */
  maxHistorySize?: number;
  /** Custom logger function */
  logger?: (message: string, data?: unknown) => void;
  /** Performance profiler instance (optional) */
  profiler?: PerformanceProfiler;
}

interface RequestSnapshot<T> {
  requestId: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  loading: boolean;
  data?: T;
  error?: Error;
  success: boolean;
  retryCount?: number;
}

/**
 * DevTools for ApiRequest instances.
 */
export class ApiRequestDevTools<T> {
  private requestHistory: RequestSnapshot<T>[] = [];
  private enabled: boolean;
  private maxHistorySize: number;
  private currentRequestId: string | null = null;
  private requestCounter: number = 0;
  private loadingListener: ((value: boolean) => void) | null = null;
  private dataListener: ((value: T) => void) | null = null;
  private errorListener: ((value: Error) => void) | null = null;
  private unsubscribeLoading: (() => void) | null = null;
  private unsubscribeData: (() => void) | null = null;
  private unsubscribeError: (() => void) | null = null;
  private profiler?: PerformanceProfiler;

  constructor(
    private apiRequest: ApiRequest<T>,
    private options: ApiRequestDevToolsOptions = {}
  ) {
    this.enabled = options.enabled ?? false;
    this.maxHistorySize = options.maxHistorySize ?? 100;
    this.profiler = options.profiler;
    this.initialize();
  }

  private initialize(): void {
    // Subscribe to loading state changes
    this.loadingListener = (loading: boolean) => {
      if (this.enabled) {
        if (loading && !this.currentRequestId) {
          // Request started
          this.requestCounter++;
          this.currentRequestId = `req-${this.requestCounter}`;
          const snapshot: RequestSnapshot<T> = {
            requestId: this.currentRequestId,
            startTime: Date.now(),
            loading: true,
            success: false,
          };
          this.requestHistory.push(snapshot);
          
          // Limit history size
          if (this.requestHistory.length > this.maxHistorySize) {
            this.requestHistory.shift();
          }

          this.log(`[${this.options.name || 'ApiRequest'}] Request started`, {
            requestId: this.currentRequestId,
          });
        } else if (!loading && this.currentRequestId) {
          // Request completed
          const snapshot = this.requestHistory[this.requestHistory.length - 1];
          if (snapshot && snapshot.requestId === this.currentRequestId) {
            snapshot.endTime = Date.now();
            snapshot.duration = snapshot.endTime - snapshot.startTime;
            snapshot.loading = false;
            snapshot.success = !this.apiRequest.error.value;
            
            if (this.options.logExecutionTime) {
              this.log(`[${this.options.name || 'ApiRequest'}] Request completed`, {
                requestId: this.currentRequestId,
                duration: `${snapshot.duration}ms`,
                success: snapshot.success,
              });
            }
            
            this.currentRequestId = null;
          }
        }
      }
    };

    // Subscribe to data changes
    this.dataListener = (data: T) => {
      if (this.enabled && this.currentRequestId) {
        const snapshot = this.requestHistory[this.requestHistory.length - 1];
        if (snapshot && snapshot.requestId === this.currentRequestId) {
          snapshot.data = data;
          snapshot.success = true;
          
          this.log(`[${this.options.name || 'ApiRequest'}] Data received`, {
            requestId: this.currentRequestId,
            data,
          });
        }
      }
    };

    // Subscribe to error changes
    this.errorListener = (error: Error) => {
      if (this.enabled && error && this.currentRequestId) {
        const snapshot = this.requestHistory[this.requestHistory.length - 1];
        if (snapshot && snapshot.requestId === this.currentRequestId) {
          snapshot.error = error;
          snapshot.success = false;
          
          this.log(`[${this.options.name || 'ApiRequest'}] Error occurred`, {
            requestId: this.currentRequestId,
            error: error.message,
            errorStack: error.stack,
          });
        }
      }
    };

    // Subscribe to pulses
    this.apiRequest.loading.subscribe(this.loadingListener);
    this.apiRequest.data.subscribe(this.dataListener);
    this.apiRequest.error.subscribe(this.errorListener);

    // Create unsubscribe functions
    this.unsubscribeLoading = () => {
      if (this.loadingListener) {
        this.apiRequest.loading.unsubscribe(this.loadingListener);
        this.loadingListener = null;
      }
    };
    this.unsubscribeData = () => {
      if (this.dataListener) {
        this.apiRequest.data.unsubscribe(this.dataListener);
        this.dataListener = null;
      }
    };
    this.unsubscribeError = () => {
      if (this.errorListener) {
        this.apiRequest.error.unsubscribe(this.errorListener);
        this.errorListener = null;
      }
    };
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
    this.log(`[${this.options.name || 'ApiRequest'}] DevTools enabled`);
  }

  /**
   * Disable DevTools logging.
   */
  disable(): void {
    this.enabled = false;
    this.log(`[${this.options.name || 'ApiRequest'}] DevTools disabled`);
  }

  /**
   * Wrap an ApiRequest with DevTools tracking.
   * Returns a new ApiRequest-like object that tracks all mutations.
   */
  wrap(): ApiRequest<T> {
    const originalMutate = this.apiRequest.mutate.bind(this.apiRequest);
    
    // Create an object that wraps mutate while preserving all ApiRequest properties
    const wrapped = Object.create(Object.getPrototypeOf(this.apiRequest));
    wrapped.loading = this.apiRequest.loading;
    wrapped.data = this.apiRequest.data;
    wrapped.error = this.apiRequest.error;
    wrapped.onSuccess = this.apiRequest.onSuccess.bind(this.apiRequest);
    
    wrapped.mutate = async (options?: { onSuccess: (data: T) => void }) => {
        const startTime = Date.now();
        const requestId = `req-${++this.requestCounter}`;
        this.currentRequestId = requestId;

        // Start performance measurement
        const endMeasure = this.profiler?.startMeasure(
          `${this.options.name || 'ApiRequest'}:mutate`,
          'execution',
          { requestId }
        );

        if (this.enabled) {
          this.log(`[${this.options.name || 'ApiRequest'}] mutate() called`, {
            requestId,
          });
        }

        try {
          const result = await originalMutate(options);
          const endTime = Date.now();
          const duration = endTime - startTime;
          
          // End performance measurement
          endMeasure?.();

          // Update or create snapshot
          let snapshot = this.requestHistory.find((s) => s.requestId === requestId);
          if (!snapshot) {
            snapshot = {
              requestId,
              startTime,
              endTime,
              duration,
              loading: false,
              success: !this.apiRequest.error.value,
            };
            this.requestHistory.push(snapshot);
          } else {
            snapshot.endTime = endTime;
            snapshot.duration = duration;
            snapshot.loading = false;
            snapshot.success = !this.apiRequest.error.value;
            snapshot.data = this.apiRequest.data.value;
            if (this.apiRequest.error.value) {
              snapshot.error = this.apiRequest.error.value;
            }
          }

          // Limit history size
          if (this.requestHistory.length > this.maxHistorySize) {
            this.requestHistory.shift();
          }

          if (this.enabled) {
            const logData: Record<string, unknown> = {
              requestId,
              success: snapshot.success,
              duration: `${duration}ms`,
            };

            if (this.options.logExecutionTime) {
              logData.executionTime = duration;
            }

            if (snapshot.error) {
              logData.error = snapshot.error.message;
              this.log(`[${this.options.name || 'ApiRequest'}] Request failed`, logData);
            } else {
              this.log(`[${this.options.name || 'ApiRequest'}] Request succeeded`, logData);
            }
          }

          this.currentRequestId = null;
          return result;
        } catch (error) {
          const endTime = Date.now();
          const duration = endTime - startTime;

          // End performance measurement (even on error)
          endMeasure?.();

          // Update snapshot with error
          let snapshot = this.requestHistory.find((s) => s.requestId === requestId);
          if (snapshot) {
            snapshot.endTime = endTime;
            snapshot.duration = duration;
            snapshot.loading = false;
            snapshot.success = false;
            snapshot.error = error as Error;
          }

          if (this.enabled) {
            this.log(`[${this.options.name || 'ApiRequest'}] Request threw error`, {
              requestId,
              error: (error as Error).message,
              duration: `${duration}ms`,
            });
          }

          this.currentRequestId = null;
          throw error;
        }
      };
    
    return wrapped as ApiRequest<T>;
  }

  /**
   * Get request history.
   */
  getRequestHistory(): RequestSnapshot<T>[] {
    return [...this.requestHistory];
  }

  /**
   * Get request statistics.
   */
  getStatistics(): {
    totalRequests: number;
    successfulRequests: number;
    failedRequests: number;
    averageDuration: number;
    currentLoading: boolean;
    lastRequestTime?: number;
  } {
    const completedRequests = this.requestHistory.filter((r) => r.duration !== undefined);
    const successful = completedRequests.filter((r) => r.success);
    const failed = completedRequests.filter((r) => !r.success);

    const totalDuration = completedRequests.reduce((sum, r) => sum + (r.duration || 0), 0);
    const averageDuration =
      completedRequests.length > 0 ? totalDuration / completedRequests.length : 0;

    const lastRequest = this.requestHistory[this.requestHistory.length - 1];

    return {
      totalRequests: this.requestHistory.length,
      successfulRequests: successful.length,
      failedRequests: failed.length,
      averageDuration,
      currentLoading: this.apiRequest.loading.value,
      lastRequestTime: lastRequest?.startTime,
    };
  }

  /**
   * Get current request state.
   */
  getCurrentState(): {
    loading: boolean;
    data: T | null;
    error: Error | null;
  } {
    return {
      loading: this.apiRequest.loading.value,
      data: this.apiRequest.data.value,
      error: this.apiRequest.error.value,
    };
  }

  /**
   * Clear request history.
   */
  clearHistory(): void {
    this.requestHistory = [];
  }

  /**
   * Cleanup: unsubscribe from state changes.
   */
  cleanup(): void {
    if (this.unsubscribeLoading) {
      this.unsubscribeLoading();
      this.unsubscribeLoading = null;
    }
    if (this.unsubscribeData) {
      this.unsubscribeData();
      this.unsubscribeData = null;
    }
    if (this.unsubscribeError) {
      this.unsubscribeError();
      this.unsubscribeError = null;
    }
  }
}

/**
 * Create DevTools for an ApiRequest instance.
 */
export function createApiRequestDevTools<T>(
  apiRequest: ApiRequest<T>,
  options?: ApiRequestDevToolsOptions
): ApiRequestDevTools<T> {
  return new ApiRequestDevTools(apiRequest, options);
}

/**
 * Wrap an ApiRequest with DevTools tracking.
 */
export function wrapApiRequest<T>(
  apiRequest: ApiRequest<T>,
  devTools?: ApiRequestDevTools<T>
): ApiRequest<T> {
  const tools = devTools || createApiRequestDevTools(apiRequest, { name: 'ApiRequest' });
  return tools.wrap();
}
