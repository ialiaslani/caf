import type { IRequest } from './IRequest';

/**
 * Request handler interface.
 * 
 * Provides a formal interface for handling requests, allowing different implementations
 * (real API calls, mocks, cached implementations, etc.) to be swapped without tying
 * core to one implementation.
 * 
 * @example
 * ```ts
 * // Real API handler
 * class ApiRequestHandler<T> implements IRequestHandler<T> {
 *   constructor(private apiCall: () => Promise<T>) {}
 *   
 *   async execute(): Promise<T> {
 *     return await this.apiCall();
 *   }
 * }
 * 
 * // Mock handler
 * class MockRequestHandler<T> implements IRequestHandler<T> {
 *   constructor(private mockData: T) {}
 *   
 *   async execute(): Promise<T> {
 *     return Promise.resolve(this.mockData);
 *   }
 * }
 * 
 * // Cached handler
 * class CachedRequestHandler<T> implements IRequestHandler<T> {
 *   constructor(
 *     private apiCall: () => Promise<T>,
 *     private cache: Map<string, T>,
 *     private cacheKey: string
 *   ) {}
 *   
 *   async execute(): Promise<T> {
 *     if (this.cache.has(this.cacheKey)) {
 *       return Promise.resolve(this.cache.get(this.cacheKey)!);
 *     }
 *     const result = await this.apiCall();
 *     this.cache.set(this.cacheKey, result);
 *     return result;
 *   }
 * }
 * ```
 */
export interface IRequestHandler<T> {
  /**
   * Execute the request.
   * @returns Promise resolving to the result data
   */
  execute(): Promise<T>;
}

/**
 * Adapter to convert IRequest<T> (Promise<T>) to IRequestHandler<T>.
 * Useful for backward compatibility.
 */
export class PromiseRequestHandler<T> implements IRequestHandler<T> {
  constructor(private request: IRequest<T>) {}

  async execute(): Promise<T> {
    return await this.request;
  }
}

/**
 * Helper function to normalize a request to IRequestHandler.
 * Accepts either IRequest<T> (Promise<T>) or IRequestHandler<T>.
 */
export function toRequestHandler<T>(
  request: IRequest<T> | IRequestHandler<T>
): IRequestHandler<T> {
  if (typeof (request as IRequestHandler<T>).execute === 'function') {
    return request as IRequestHandler<T>;
  }
  return new PromiseRequestHandler(request as IRequest<T>);
}
