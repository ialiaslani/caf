import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ApiRequest } from '@c-a-f/core';
import {
  ApiRequestDevTools,
  createApiRequestDevTools,
  wrapApiRequest,
} from '../src/core/ApiRequestDevTools';

describe('ApiRequestDevTools', () => {
  let apiRequest: ApiRequest<string>;
  let devTools: ApiRequestDevTools<string>;

  beforeEach(() => {
    apiRequest = new ApiRequest(Promise.resolve('test data'));
    devTools = createApiRequestDevTools(apiRequest, {
      name: 'TestRequest',
      enabled: false, // Disable logging for cleaner tests
    });
  });

  describe('wrap', () => {
    it('should wrap ApiRequest and track mutations', async () => {
      const wrapped = devTools.wrap();

      await wrapped.mutate();

      const history = devTools.getRequestHistory();
      expect(history.length).toBeGreaterThan(0);
    });

    it('should track successful requests', async () => {
      const wrapped = devTools.wrap();

      await wrapped.mutate();

      const state = devTools.getCurrentState();
      expect(state.data).toBe('test data');
      expect(state.error).toBeNull();
    });

    it('should track failed requests', async () => {
      const errorRequest = new ApiRequest(Promise.reject(new Error('test error')));
      const errorDevTools = createApiRequestDevTools(errorRequest, {
        name: 'ErrorRequest',
        enabled: false,
      });
      const wrapped = errorDevTools.wrap();

      try {
        await wrapped.mutate();
      } catch (error) {
        // Expected
      }

      const state = errorDevTools.getCurrentState();
      expect(state.error).not.toBeNull();
    });
  });

  describe('getRequestHistory', () => {
    it('should return request history', async () => {
      const wrapped = devTools.wrap();
      await wrapped.mutate();
      await wrapped.mutate();

      const history = devTools.getRequestHistory();
      expect(history.length).toBeGreaterThanOrEqual(2);
    });

    it('should limit history size', async () => {
      const limitedDevTools = createApiRequestDevTools(apiRequest, {
        name: 'Limited',
        maxHistorySize: 2,
        enabled: false,
      });
      const wrapped = limitedDevTools.wrap();

      for (let i = 0; i < 5; i++) {
        await wrapped.mutate();
      }

      const history = limitedDevTools.getRequestHistory();
      expect(history.length).toBeLessThanOrEqual(2);
    });
  });

  describe('getStatistics', () => {
    it('should return statistics', async () => {
      const wrapped = devTools.wrap();
      await wrapped.mutate();

      const stats = devTools.getStatistics();
      expect(stats.totalRequests).toBeGreaterThan(0);
      expect(stats.successfulRequests).toBeGreaterThan(0);
      expect(stats.currentLoading).toBe(false);
    });
  });

  describe('getCurrentState', () => {
    it('should return current state', async () => {
      const wrapped = devTools.wrap();
      await wrapped.mutate();

      const state = devTools.getCurrentState();
      expect(state).toHaveProperty('loading');
      expect(state).toHaveProperty('data');
      expect(state).toHaveProperty('error');
    });
  });

  describe('clearHistory', () => {
    it('should clear request history', async () => {
      const wrapped = devTools.wrap();
      await wrapped.mutate();

      expect(devTools.getRequestHistory().length).toBeGreaterThan(0);
      devTools.clearHistory();
      expect(devTools.getRequestHistory().length).toBe(0);
    });
  });

  describe('enable/disable', () => {
    it('should enable and disable logging', () => {
      devTools.disable();
      devTools.enable();
      // Should not throw
      expect(true).toBe(true);
    });
  });

  describe('cleanup', () => {
    it('should cleanup subscriptions', () => {
      devTools.cleanup();
      // Should not throw
      expect(true).toBe(true);
    });
  });

  describe('wrapApiRequest', () => {
    it('should wrap ApiRequest with DevTools', async () => {
      const wrapped = wrapApiRequest(apiRequest, devTools);
      await wrapped.mutate();

      const history = devTools.getRequestHistory();
      expect(history.length).toBeGreaterThan(0);
    });

    it('should create DevTools if not provided', async () => {
      const wrapped = wrapApiRequest(apiRequest);
      await wrapped.mutate();
      // Should not throw
      expect(true).toBe(true);
    });
  });
});
