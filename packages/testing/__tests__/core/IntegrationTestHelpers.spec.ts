import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  flushPromises,
  runWithFakeTimers,
  createPlocUseCaseContext,
} from '../../src/core/IntegrationTestHelpers';

describe('IntegrationTestHelpers', () => {
  describe('flushPromises', () => {
    it('should resolve pending promises', async () => {
      let resolved = false;
      Promise.resolve().then(() => {
        resolved = true;
      });

      expect(resolved).toBe(false);
      await flushPromises();
      expect(resolved).toBe(true);
    });

    it('should handle multiple microtasks', async () => {
      const order: number[] = [];

      Promise.resolve().then(() => order.push(1));
      Promise.resolve().then(() => order.push(2));
      Promise.resolve().then(() => order.push(3));

      await flushPromises();
      expect(order).toEqual([1, 2, 3]);
    });

    it('should work with nested promises', async () => {
      let innerResolved = false;

      Promise.resolve().then(() => {
        Promise.resolve().then(() => {
          innerResolved = true;
        });
      });

      await flushPromises();
      expect(innerResolved).toBe(true);
    });
  });

  describe('runWithFakeTimers', () => {
    it('should execute callback', async () => {
      const fn = vi.fn().mockResolvedValue(42);
      const result = await runWithFakeTimers(fn);

      expect(fn).toHaveBeenCalledTimes(1);
      expect(result).toBe(42);
    });

    it('should work with async callbacks', async () => {
      const result = await runWithFakeTimers(async () => {
        await flushPromises();
        return 'done';
      });

      expect(result).toBe('done');
    });

    it('should propagate errors', async () => {
      const error = new Error('Test error');
      const fn = vi.fn().mockRejectedValue(error);

      await expect(runWithFakeTimers(fn)).rejects.toBe(error);
    });
  });

  describe('createPlocUseCaseContext', () => {
    it('should create a context with ploc and use case', () => {
      const context = createPlocUseCaseContext(
        { items: [], loading: false },
        [{ id: '1', name: 'Item' }]
      );

      expect(context.ploc).toBeDefined();
      expect(context.useCase).toBeDefined();
    });

    it('should initialize ploc with provided state', () => {
      const initialState = { count: 5, name: 'Test' };
      const context = createPlocUseCaseContext(initialState, null);

      expect(context.ploc.state).toEqual(initialState);
    });

    it('should create use case that returns provided result', async () => {
      const useCaseResult = { id: '1', name: 'User' };
      const context = createPlocUseCaseContext({}, useCaseResult);

      const result = await context.useCase.execute();
      expect(result.data.value).toEqual(useCaseResult);
    });

    it('should allow changing ploc state', () => {
      const context = createPlocUseCaseContext({ count: 0 }, null);

      context.ploc.changeState({ count: 1 });
      expect(context.ploc.state).toEqual({ count: 1 });
    });

    it('should work with different state types', () => {
      const stringContext = createPlocUseCaseContext('initial', 'result');
      expect(stringContext.ploc.state).toBe('initial');

      const numberContext = createPlocUseCaseContext(0, 42);
      expect(numberContext.ploc.state).toBe(0);
    });

    it('should work with array results', async () => {
      const items = [
        { id: '1', name: 'Item 1' },
        { id: '2', name: 'Item 2' },
      ];
      const context = createPlocUseCaseContext({}, items);

      const result = await context.useCase.execute();
      expect(result.data.value).toEqual(items);
    });

    it('should work with null results', async () => {
      const context = createPlocUseCaseContext({}, null);

      const result = await context.useCase.execute();
      expect(result.data.value).toBeNull();
    });
  });

  describe('integration scenarios', () => {
    it('should work together in a test flow', async () => {
      const context = createPlocUseCaseContext(
        { items: [], loading: false },
        [{ id: '1', name: 'Loaded' }]
      );

      // Simulate loading
      context.ploc.changeState({ items: [], loading: true });
      expect(context.ploc.state.loading).toBe(true);

      // Execute use case
      const result = await context.useCase.execute();
      expect(result.data.value).toHaveLength(1);

      // Update state with result
      context.ploc.changeState({
        items: result.data.value,
        loading: false,
      });

      expect(context.ploc.state.items).toHaveLength(1);
      expect(context.ploc.state.loading).toBe(false);
    });

    it('should work with flushPromises for async flows', async () => {
      const context = createPlocUseCaseContext({ value: 0 }, 42);

      let resolved = false;
      context.useCase.execute().then(() => {
        resolved = true;
      });

      expect(resolved).toBe(false);
      await flushPromises();
      expect(resolved).toBe(true);
    });
  });
});
