import { describe, it, expect } from 'vitest';
import {
  extractApiData,
  normalizeApiError,
  type ApiResponse,
  type ApiError,
  type HttpMethod,
  type ApiRequestConfig,
  type IApiClient,
} from '../src/ApiClient/ApiClient';

describe('extractApiData', () => {
  it('should extract data from ApiResponse wrapper', () => {
    const response: ApiResponse<string> = {
      data: 'test-data',
      message: 'Success',
      status: 200,
      success: true,
    };

    const result = extractApiData(response);
    expect(result).toBe('test-data');
  });

  it('should return data directly when not wrapped', () => {
    const data = { id: 1, name: 'test' };
    const result = extractApiData(data);
    expect(result).toBe(data);
  });

  it('should handle primitive values', () => {
    expect(extractApiData('string')).toBe('string');
    expect(extractApiData(42)).toBe(42);
    expect(extractApiData(true)).toBe(true);
    expect(extractApiData(null)).toBe(null);
  });

  it('should handle arrays', () => {
    const array = [1, 2, 3];
    const result = extractApiData(array);
    expect(result).toBe(array);
  });

  it('should handle nested objects', () => {
    const nested = { user: { id: 1, profile: { name: 'John' } } };
    const result = extractApiData(nested);
    expect(result).toBe(nested);
  });

  it('should handle ApiResponse with complex data', () => {
    const response: ApiResponse<{ users: string[] }> = {
      data: { users: ['alice', 'bob'] },
      success: true,
    };

    const result = extractApiData(response);
    expect(result).toEqual({ users: ['alice', 'bob'] });
  });

  it('should handle object with data property that is not ApiResponse', () => {
    // Object that has 'data' property but is not ApiResponse
    const obj = { data: 'value', other: 'property' };
    const result = extractApiData(obj);
    // Should extract 'value' because 'data' in obj is true
    expect(result).toBe('value');
  });

  it('should handle empty object', () => {
    const result = extractApiData({});
    expect(result).toEqual({});
  });

  it('should handle object with data: undefined', () => {
    const obj = { data: undefined };
    const result = extractApiData(obj);
    expect(result).toBeUndefined();
  });

  it('should handle object with data: null', () => {
    const obj = { data: null };
    const result = extractApiData(obj);
    expect(result).toBeNull();
  });

  it('should handle null response', () => {
    const result = extractApiData(null);
    expect(result).toBeNull();
  });

  it('should handle undefined response', () => {
    const result = extractApiData(undefined);
    expect(result).toBeUndefined();
  });
});

describe('normalizeApiError', () => {
  it('should normalize Error object', () => {
    const error = new Error('Test error');
    const result = normalizeApiError(error);

    expect(result).toEqual({
      message: 'Test error',
    });
  });

  it('should normalize ApiError-like object', () => {
    const error = {
      message: 'API error',
      code: 'ERR_001',
      status: 400,
      errors: {
        email: ['Invalid email'],
        password: ['Too short'],
      },
    };

    const result = normalizeApiError(error);

    expect(result).toEqual({
      message: 'API error',
      code: 'ERR_001',
      status: 400,
      errors: {
        email: ['Invalid email'],
        password: ['Too short'],
      },
    });
  });

  it('should handle error with code as number', () => {
    const error = {
      message: 'Error',
      code: 404,
    };

    const result = normalizeApiError(error);

    expect(result).toEqual({
      message: 'Error',
      code: 404,
    });
  });

  it('should handle error with code as string', () => {
    const error = {
      message: 'Error',
      code: 'NOT_FOUND',
    };

    const result = normalizeApiError(error);

    expect(result).toEqual({
      message: 'Error',
      code: 'NOT_FOUND',
    });
  });

  it('should handle error without code', () => {
    const error = {
      message: 'Error message',
    };

    const result = normalizeApiError(error);

    expect(result).toEqual({
      message: 'Error message',
    });
  });

  it('should handle error without errors property', () => {
    const error = {
      message: 'Error',
      code: 'ERR',
      status: 500,
    };

    const result = normalizeApiError(error);

    expect(result).toEqual({
      message: 'Error',
      code: 'ERR',
      status: 500,
    });
  });

  it('should handle string error', () => {
    const result = normalizeApiError('String error');

    expect(result).toEqual({
      message: 'String error',
    });
  });

  it('should handle number error', () => {
    const result = normalizeApiError(404);

    expect(result).toEqual({
      message: '404',
    });
  });

  it('should handle null error', () => {
    const result = normalizeApiError(null);

    expect(result).toEqual({
      message: 'null',
    });
  });

  it('should handle undefined error', () => {
    const result = normalizeApiError(undefined);

    expect(result).toEqual({
      message: 'undefined',
    });
  });

  it('should handle error with invalid code type', () => {
    const error = {
      message: 'Error',
      code: { invalid: 'code' }, // Invalid code type
    };

    const result = normalizeApiError(error);

    expect(result).toEqual({
      message: 'Error',
    });
  });

  it('should handle error with invalid status type', () => {
    const error = {
      message: 'Error',
      status: 'invalid', // Should be number
    };

    const result = normalizeApiError(error);

    expect(result).toEqual({
      message: 'Error',
      status: NaN, // Number('invalid') = NaN
    });
  });

  it('should handle complex error structure', () => {
    const error = {
      message: 'Validation failed',
      code: 'VALIDATION_ERROR',
      status: 422,
      errors: {
        field1: ['Error 1', 'Error 2'],
        field2: ['Error 3'],
      },
      extra: 'ignored', // Extra properties are ignored
    };

    const result = normalizeApiError(error);

    expect(result).toEqual({
      message: 'Validation failed',
      code: 'VALIDATION_ERROR',
      status: 422,
      errors: {
        field1: ['Error 1', 'Error 2'],
        field2: ['Error 3'],
      },
    });
  });

  it('should handle Error with custom properties', () => {
    const error = new Error('Custom error');
    (error as any).code = 'CUSTOM_CODE';
    (error as any).status = 500;

    const result = normalizeApiError(error);

    // Error objects with custom properties are treated as ApiError-like objects
    // and their properties are extracted
    expect(result).toEqual({
      message: 'Custom error',
      code: 'CUSTOM_CODE',
      status: 500,
    });
  });

  it('should handle empty object', () => {
    const result = normalizeApiError({});
    // Empty object has no message property, falls through to fallback
    expect(result).toEqual({
      message: '[object Object]',
    });
  });

  it('should handle object without message property', () => {
    const error = { code: 'ERR', status: 500 };
    const result = normalizeApiError(error);
    // No message property, falls through to fallback
    expect(result).toEqual({
      message: '[object Object]',
    });
  });

  it('should handle boolean true', () => {
    const result = normalizeApiError(true);
    expect(result).toEqual({
      message: 'true',
    });
  });

  it('should handle boolean false', () => {
    const result = normalizeApiError(false);
    expect(result).toEqual({
      message: 'false',
    });
  });

  it('should handle empty string', () => {
    const result = normalizeApiError('');
    expect(result).toEqual({
      message: '',
    });
  });

  it('should handle object with non-string message', () => {
    const error = { message: 123 };
    const result = normalizeApiError(error);
    expect(result).toEqual({
      message: '123',
    });
  });

  it('should handle object with object message', () => {
    const error = { message: { nested: 'value' } };
    const result = normalizeApiError(error);
    expect(result).toEqual({
      message: '[object Object]',
    });
  });

  it('should handle Symbol', () => {
    const sym = Symbol('test');
    const result = normalizeApiError(sym);
    expect(result.message).toBe('Symbol(test)');
  });
});

describe('Type definitions', () => {
  it('should have correct HttpMethod type', () => {
    const methods: HttpMethod[] = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];
    expect(methods).toHaveLength(5);
  });

  it('should have correct ApiRequestConfig structure', () => {
    const config: ApiRequestConfig = {
      method: 'POST',
      url: '/api/users',
      data: { name: 'John' },
      headers: { 'Content-Type': 'application/json' },
      params: { page: 1 },
    };

    expect(config.method).toBe('POST');
    expect(config.url).toBe('/api/users');
    expect(config.data).toEqual({ name: 'John' });
    expect(config.headers).toEqual({ 'Content-Type': 'application/json' });
    expect(config.params).toEqual({ page: 1 });
  });

  it('should allow IApiClient implementation', async () => {
    const client: IApiClient = {
      request: async <T>(config: ApiRequestConfig): Promise<T> => {
        return { success: true } as T;
      },
    };

    const result = await client.request({ method: 'GET', url: '/test' });
    expect(result).toEqual({ success: true });
  });
});
