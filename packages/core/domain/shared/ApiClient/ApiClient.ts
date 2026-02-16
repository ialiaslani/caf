/**
 * API Client helper for request/response DTO conventions.
 * 
 * Provides framework-agnostic types and helpers for standardizing API requests and responses.
 * Infrastructure implementations (e.g., Axios, Fetch) can use these conventions.
 */

/**
 * Standard API response wrapper.
 * Many APIs wrap their data in a response object with metadata.
 */
export interface ApiResponse<T> {
  data: T;
  message?: string;
  status?: number;
  success?: boolean;
}

/**
 * Standard API error response.
 */
export interface ApiError {
  message: string;
  code?: string | number;
  errors?: Record<string, string[]>;
  status?: number;
}

/**
 * HTTP method types.
 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

/**
 * API request configuration.
 * Infrastructure implementations can extend this with framework-specific options.
 */
export interface ApiRequestConfig {
  method: HttpMethod;
  url: string;
  data?: unknown;
  headers?: Record<string, string>;
  params?: Record<string, string | number | boolean>;
}

/**
 * Base API client interface.
 * Infrastructure implementations should implement this interface.
 */
export interface IApiClient {
  /**
   * Execute an API request.
   * @param config Request configuration
   * @returns Promise resolving to the response data
   */
  request<T>(config: ApiRequestConfig): Promise<T>;
}

/**
 * Helper function to extract data from a wrapped API response.
 * Handles both direct data and wrapped ApiResponse<T> formats.
 */
export function extractApiData<T>(response: T | ApiResponse<T>): T {
  if (response && typeof response === 'object' && 'data' in response) {
    return (response as ApiResponse<T>).data;
  }
  return response as T;
}

/**
 * Helper function to create a standardized error from various error formats.
 */
export function normalizeApiError(error: unknown): ApiError {
  if (error && typeof error === 'object') {
    // If it's already an ApiError-like object
    if ('message' in error) {
      const code = 'code' in error ? error.code : undefined;
      const codeValue = typeof code === 'string' || typeof code === 'number' ? code : undefined;
      return {
        message: String(error.message),
        code: codeValue,
        errors: 'errors' in error ? error.errors as Record<string, string[]> : undefined,
        status: 'status' in error ? Number(error.status) : undefined,
      };
    }
  }
  
  // Fallback for unknown error formats
  return {
    message: error instanceof Error ? error.message : String(error),
  };
}
