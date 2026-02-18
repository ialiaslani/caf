import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ApiRequest } from '../src/IRequest/Request';
import { IRequestHandler, PromiseRequestHandler, toRequestHandler } from '../src/IRequest/IRequestHandler';

describe('ApiRequest', () => {
  beforeEach(() => {
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  describe('initialization', () => {
    it('should initialize with loading false and null data/error', () => {
      const request = new ApiRequest(Promise.resolve('ok'));
      expect(request.loading.value).toBe(false);
      expect(request.data.value).toBeNull();
      expect(request.error.value).toBeNull();
    });

    it('should accept a Promise', () => {
      const promise = Promise.resolve('result');
      const request = new ApiRequest(promise);
      expect(request).toBeInstanceOf(ApiRequest);
    });

    it('should accept an IRequestHandler', () => {
      const handler: IRequestHandler<string> = {
        execute: () => Promise.resolve('result'),
      };
      const request = new ApiRequest(handler);
      expect(request).toBeInstanceOf(ApiRequest);
    });
  });

  describe('mutate with Promise', () => {
    it('should set loading then data on success', async () => {
      const request = new ApiRequest(Promise.resolve('result'));
      const result = request.mutate();
      
      expect(request.loading.value).toBe(true);
      
      await result;
      
      expect(request.loading.value).toBe(false);
      expect(request.data.value).toBe('result');
      expect(request.error.value).toBeNull();
    });

    it('should set error on rejected promise', async () => {
      const err = new Error('fail');
      const request = new ApiRequest(Promise.reject(err));
      
      await request.mutate();
      
      expect(request.loading.value).toBe(false);
      expect(request.error.value).toBe(err);
      expect(request.data.value).toBeNull();
    });

    it('should handle multiple mutate calls', async () => {
      let callCount = 0;
      // Create a factory function that returns a new promise each time
      const request = new ApiRequest({
        execute: async () => {
          callCount++;
          return `result-${callCount}`;
        },
      });

      await request.mutate();
      expect(request.data.value).toBe('result-1');

      await request.mutate();
      expect(request.data.value).toBe('result-2');
    });

    it('should handle complex data types', async () => {
      const complexData = { id: 1, name: 'test', tags: ['a', 'b'] };
      const request = new ApiRequest(Promise.resolve(complexData));
      
      await request.mutate();
      
      expect(request.data.value).toEqual(complexData);
    });

    it('should handle null response', async () => {
      const request = new ApiRequest(Promise.resolve(null));
      
      await request.mutate();
      
      expect(request.data.value).toBeNull();
      expect(request.error.value).toBeNull();
    });
  });

  describe('mutate with IRequestHandler', () => {
    it('should work with IRequestHandler', async () => {
      const handler: IRequestHandler<string> = {
        execute: () => Promise.resolve('handler-result'),
      };
      const request = new ApiRequest(handler);
      
      await request.mutate();
      
      expect(request.data.value).toBe('handler-result');
    });

    it('should handle errors from IRequestHandler', async () => {
      const error = new Error('handler-error');
      const handler: IRequestHandler<string> = {
        execute: () => Promise.reject(error),
      };
      const request = new ApiRequest(handler);
      
      await request.mutate();
      
      expect(request.error.value).toBe(error);
    });
  });

  describe('onSuccess callback', () => {
    it('should call onSuccess when provided', async () => {
      const request = new ApiRequest(Promise.resolve(100));
      const onSuccess = vi.fn();
      
      await request.mutate({ onSuccess });
      
      expect(onSuccess).toHaveBeenCalledTimes(1);
      expect(onSuccess).toHaveBeenCalledWith(100);
    });

    it('should not call onSuccess on error', async () => {
      const request = new ApiRequest(Promise.reject(new Error('fail')));
      const onSuccess = vi.fn();
      
      await request.mutate({ onSuccess });
      
      expect(onSuccess).not.toHaveBeenCalled();
    });

    it('should call onSuccess with correct data', async () => {
      const data = { id: 1, name: 'test' };
      const request = new ApiRequest(Promise.resolve(data));
      const onSuccess = vi.fn();
      
      await request.mutate({ onSuccess });
      
      expect(onSuccess).toHaveBeenCalledWith(data);
    });
  });

  describe('onSuccess method', () => {
    it('should call callback with current data value', () => {
      const request = new ApiRequest(Promise.resolve('initial'));
      // Manually set data for testing
      request.data.value = 'test-value';
      
      const callback = vi.fn();
      request.onSuccess(callback);
      
      expect(callback).toHaveBeenCalledWith('test-value');
    });

    it('should work even if mutate has not been called', () => {
      const request = new ApiRequest(Promise.resolve('value'));
      const callback = vi.fn();
      
      // onSuccess should work with null data
      request.onSuccess(callback);
      
      expect(callback).toHaveBeenCalledWith(null);
    });
  });

  describe('return value', () => {
    it('should return RequestResult with loading, data, and error', async () => {
      const request = new ApiRequest(Promise.resolve('result'));
      const result = await request.mutate();
      
      expect(result).toHaveProperty('loading');
      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('error');
      expect(result.loading).toBe(request.loading);
      expect(result.data).toBe(request.data);
      expect(result.error).toBe(request.error);
    });
  });

  describe('loading state', () => {
    it('should set loading to true during execution', async () => {
      let loadingDuringExecution = false;
      const request = new ApiRequest(
        Promise.resolve().then(() => {
          loadingDuringExecution = request.loading.value;
          return 'result';
        })
      );

      const mutatePromise = request.mutate();
      expect(request.loading.value).toBe(true);
      
      await mutatePromise;
      expect(request.loading.value).toBe(false);
      expect(loadingDuringExecution).toBe(true);
    });

    it('should set loading to false even on error', async () => {
      const request = new ApiRequest(Promise.reject(new Error('fail')));
      
      await request.mutate();
      
      expect(request.loading.value).toBe(false);
    });
  });

  describe('error handling', () => {
    it('should preserve error object', async () => {
      const error = new Error('test error');
      error.name = 'CustomError';
      const request = new ApiRequest(Promise.reject(error));
      
      await request.mutate();
      
      expect(request.error.value).toBe(error);
      expect(request.error.value.message).toBe('test error');
      expect(request.error.value.name).toBe('CustomError');
    });

    it('should handle non-Error rejections', async () => {
      const request = new ApiRequest(Promise.reject('string error'));
      
      await request.mutate();
      
      expect(request.error.value).toBe('string error');
    });
  });

  describe('edge cases', () => {
    it('should handle rapid successive mutate calls', async () => {
      const request = new ApiRequest(Promise.resolve('result'));
      
      const promises = [
        request.mutate(),
        request.mutate(),
        request.mutate(),
      ];
      
      await Promise.all(promises);
      
      expect(request.data.value).toBe('result');
    });

    it('should handle very slow promises', async () => {
      const request = new ApiRequest(
        new Promise(resolve => setTimeout(() => resolve('slow'), 100))
      );
      
      const mutatePromise = request.mutate();
      expect(request.loading.value).toBe(true);
      
      await mutatePromise;
      expect(request.loading.value).toBe(false);
      expect(request.data.value).toBe('slow');
    });
  });
});

describe('toRequestHandler', () => {
  it('should return handler as-is if it implements IRequestHandler', () => {
    const handler: IRequestHandler<string> = {
      execute: () => Promise.resolve('result'),
    };
    
    const result = toRequestHandler(handler);
    
    expect(result).toBe(handler);
  });

  it('should wrap Promise in PromiseRequestHandler', () => {
    const promise = Promise.resolve('result');
    
    const result = toRequestHandler(promise);
    
    expect(result).toBeInstanceOf(PromiseRequestHandler);
  });

  it('should execute wrapped promise correctly', async () => {
    const promise = Promise.resolve('test');
    const handler = toRequestHandler(promise);
    
    const result = await handler.execute();
    
    expect(result).toBe('test');
  });
});

describe('PromiseRequestHandler', () => {
  it('should execute and return promise result', async () => {
    const promise = Promise.resolve('result');
    const handler = new PromiseRequestHandler(promise);
    
    const result = await handler.execute();
    
    expect(result).toBe('result');
  });

  it('should propagate promise rejections', async () => {
    const error = new Error('fail');
    const promise = Promise.reject(error);
    const handler = new PromiseRequestHandler(promise);
    
    await expect(handler.execute()).rejects.toBe(error);
  });
});
