import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  log,
  updateContext,
  callService,
  sequence,
  parallel,
  conditional,
  retry,
  timeout,
} from '../src/actions/ActionHelpers';
import type { WorkflowContext } from '../src/IWorkflow';

describe('ActionHelpers', () => {
  let mockConsoleLog: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    mockConsoleLog = vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  describe('log', () => {
    it('should log a string message', async () => {
      const action = log('Test message');
      const context: WorkflowContext = {};

      await action(context);

      expect(mockConsoleLog).toHaveBeenCalledWith(
        '[Workflow] Test message',
        context
      );
    });

    it('should log a function-generated message', async () => {
      const action = log((ctx) => `User ${ctx.userId} logged in`);
      const context: WorkflowContext = { userId: '123' };

      await action(context);

      expect(mockConsoleLog).toHaveBeenCalledWith(
        '[Workflow] User 123 logged in',
        context
      );
    });

    it('should pass context to log function', async () => {
      const action = log('Test');
      const context: WorkflowContext = { userId: '123', orderId: '456' };

      await action(context);

      expect(mockConsoleLog).toHaveBeenCalledWith(
        '[Workflow] Test',
        context
      );
    });
  });

  describe('updateContext', () => {
    it('should update context with static values', async () => {
      const action = updateContext({ userId: '123', status: 'active' });
      const context: WorkflowContext = {};

      await action(context);

      expect(context.userId).toBe('123');
      expect(context.status).toBe('active');
    });

    it('should update context with function-generated values', async () => {
      const action = updateContext((ctx) => ({
        orderId: `order-${ctx.userId}`,
        status: 'processing',
      }));
      const context: WorkflowContext = { userId: '123' };

      await action(context);

      expect(context.orderId).toBe('order-123');
      expect(context.status).toBe('processing');
    });

    it('should merge with existing context', async () => {
      const action = updateContext({ status: 'active' });
      const context: WorkflowContext = { userId: '123' };

      await action(context);

      expect(context.userId).toBe('123');
      expect(context.status).toBe('active');
    });

    it('should overwrite existing properties', async () => {
      const action = updateContext({ status: 'active' });
      const context: WorkflowContext = { status: 'pending' };

      await action(context);

      expect(context.status).toBe('active');
    });
  });

  describe('callService', () => {
    it('should call service function with context', async () => {
      const serviceFn = vi.fn().mockResolvedValue(undefined);
      const action = callService(serviceFn);
      const context: WorkflowContext = { userId: '123' };

      await action(context);

      expect(serviceFn).toHaveBeenCalledWith(context);
    });

    it('should handle async service functions', async () => {
      const serviceFn = vi.fn().mockImplementation(async () => {
        await new Promise(resolve => setTimeout(resolve, 10));
      });
      const action = callService(serviceFn);
      const context: WorkflowContext = {};

      await action(context);

      expect(serviceFn).toHaveBeenCalledTimes(1);
    });

    it('should handle synchronous service functions', async () => {
      const serviceFn = vi.fn();
      const action = callService(serviceFn);
      const context: WorkflowContext = {};

      await action(context);

      expect(serviceFn).toHaveBeenCalledTimes(1);
    });
  });

  describe('sequence', () => {
    it('should execute actions in sequence', async () => {
      const order: number[] = [];
      const action1 = vi.fn().mockImplementation(async () => {
        order.push(1);
        await new Promise(resolve => setTimeout(resolve, 10));
      });
      const action2 = vi.fn().mockImplementation(async () => {
        order.push(2);
      });

      const action = sequence(action1, action2);
      const context: WorkflowContext = {};

      await action(context);

      expect(order).toEqual([1, 2]);
      // Verify both actions were called
      expect(action1).toHaveBeenCalledTimes(1);
      expect(action2).toHaveBeenCalledTimes(1);
    });

    it('should pass context to all actions', async () => {
      const action1 = vi.fn();
      const action2 = vi.fn();
      const action = sequence(action1, action2);
      const context: WorkflowContext = { userId: '123' };

      await action(context);

      expect(action1).toHaveBeenCalledWith(context);
      expect(action2).toHaveBeenCalledWith(context);
    });

    it('should work with single action', async () => {
      const action1 = vi.fn();
      const action = sequence(action1);
      const context: WorkflowContext = {};

      await action(context);

      expect(action1).toHaveBeenCalledTimes(1);
    });

    it('should work with empty actions array', async () => {
      const action = sequence();
      const context: WorkflowContext = {};

      await action(context);

      // Should not throw
      expect(true).toBe(true);
    });
  });

  describe('parallel', () => {
    it('should execute actions in parallel', async () => {
      const action1 = vi.fn().mockImplementation(async () => {
        await new Promise(resolve => setTimeout(resolve, 50));
      });
      const action2 = vi.fn().mockImplementation(async () => {
        await new Promise(resolve => setTimeout(resolve, 50));
      });

      const action = parallel(action1, action2);
      const context: WorkflowContext = {};

      const startTime = Date.now();
      await action(context);
      const duration = Date.now() - startTime;

      expect(action1).toHaveBeenCalledTimes(1);
      expect(action2).toHaveBeenCalledTimes(1);
      // Should complete in roughly 50ms (parallel) rather than 100ms (sequential)
      expect(duration).toBeLessThan(100);
    });

    it('should pass context to all actions', async () => {
      const action1 = vi.fn();
      const action2 = vi.fn();
      const action = parallel(action1, action2);
      const context: WorkflowContext = { userId: '123' };

      await action(context);

      expect(action1).toHaveBeenCalledWith(context);
      expect(action2).toHaveBeenCalledWith(context);
    });

    it('should work with single action', async () => {
      const action1 = vi.fn();
      const action = parallel(action1);
      const context: WorkflowContext = {};

      await action(context);

      expect(action1).toHaveBeenCalledTimes(1);
    });

    it('should work with empty actions array', async () => {
      const action = parallel();
      const context: WorkflowContext = {};

      await action(context);

      // Should not throw
      expect(true).toBe(true);
    });
  });

  describe('conditional', () => {
    it('should execute trueAction when condition is true', async () => {
      const trueAction = vi.fn();
      const falseAction = vi.fn();
      const action = conditional(
        () => true,
        trueAction,
        falseAction
      );
      const context: WorkflowContext = {};

      await action(context);

      expect(trueAction).toHaveBeenCalledTimes(1);
      expect(falseAction).not.toHaveBeenCalled();
    });

    it('should execute falseAction when condition is false', async () => {
      const trueAction = vi.fn();
      const falseAction = vi.fn();
      const action = conditional(
        () => false,
        trueAction,
        falseAction
      );
      const context: WorkflowContext = {};

      await action(context);

      expect(trueAction).not.toHaveBeenCalled();
      expect(falseAction).toHaveBeenCalledTimes(1);
    });

    it('should not execute falseAction when not provided and condition is false', async () => {
      const trueAction = vi.fn();
      const action = conditional(
        () => false,
        trueAction
      );
      const context: WorkflowContext = {};

      await action(context);

      expect(trueAction).not.toHaveBeenCalled();
    });

    it('should pass context to condition and actions', async () => {
      const condition = vi.fn().mockReturnValue(true);
      const trueAction = vi.fn();
      const action = conditional(condition, trueAction);
      const context: WorkflowContext = { userId: '123' };

      await action(context);

      expect(condition).toHaveBeenCalledWith(context);
      expect(trueAction).toHaveBeenCalledWith(context);
    });

    it('should handle async conditions', async () => {
      const condition = vi.fn().mockResolvedValue(true);
      const trueAction = vi.fn();
      const action = conditional(condition, trueAction);
      const context: WorkflowContext = {};

      await action(context);

      expect(trueAction).toHaveBeenCalledTimes(1);
    });
  });

  describe('retry', () => {
    it('should succeed on first attempt', async () => {
      const actionFn = vi.fn().mockResolvedValue(undefined);
      const action = retry(actionFn, 3);
      const context: WorkflowContext = {};

      await action(context);

      expect(actionFn).toHaveBeenCalledTimes(1);
    });

    it('should retry on failure and succeed', async () => {
      let attempts = 0;
      const actionFn = vi.fn().mockImplementation(async () => {
        attempts++;
        if (attempts < 2) {
          throw new Error('Failed');
        }
      });
      const action = retry(actionFn, 3);
      const context: WorkflowContext = {};

      await action(context);

      expect(actionFn).toHaveBeenCalledTimes(2);
    });

    it('should throw after max attempts', async () => {
      const actionFn = vi.fn().mockRejectedValue(new Error('Failed'));
      const action = retry(actionFn, 3);
      const context: WorkflowContext = {};

      await expect(action(context)).rejects.toThrow('Failed');
      expect(actionFn).toHaveBeenCalledTimes(3);
    });

    it('should delay between retries', async () => {
      const actionFn = vi.fn().mockRejectedValue(new Error('Failed'));
      const action = retry(actionFn, 2, 50);
      const context: WorkflowContext = {};

      const startTime = Date.now();
      await expect(action(context)).rejects.toThrow();
      const duration = Date.now() - startTime;

      // Should have at least one delay (50ms)
      expect(duration).toBeGreaterThanOrEqual(50);
    });

    it('should use default maxAttempts and delay', async () => {
      const actionFn = vi.fn().mockResolvedValue(undefined);
      const action = retry(actionFn);
      const context: WorkflowContext = {};

      await action(context);

      expect(actionFn).toHaveBeenCalledTimes(1);
    });

    it('should pass context to action', async () => {
      const actionFn = vi.fn().mockResolvedValue(undefined);
      const action = retry(actionFn);
      const context: WorkflowContext = { userId: '123' };

      await action(context);

      expect(actionFn).toHaveBeenCalledWith(context);
    });
  });

  describe('timeout', () => {
    it('should complete before timeout', async () => {
      const actionFn = vi.fn().mockImplementation(async () => {
        await new Promise(resolve => setTimeout(resolve, 10));
      });
      const action = timeout(actionFn, 100);
      const context: WorkflowContext = {};

      await action(context);

      expect(actionFn).toHaveBeenCalledTimes(1);
    });

    it('should throw on timeout', async () => {
      const actionFn = vi.fn().mockImplementation(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
      });
      const action = timeout(actionFn, 50);
      const context: WorkflowContext = {};

      await expect(action(context)).rejects.toThrow('Action timed out after 50ms');
    });

    it('should pass context to action', async () => {
      const actionFn = vi.fn().mockResolvedValue(undefined);
      const action = timeout(actionFn, 100);
      const context: WorkflowContext = { userId: '123' };

      await action(context);

      expect(actionFn).toHaveBeenCalledWith(context);
    });
  });

  describe('composed actions', () => {
    it('should compose sequence and conditional', async () => {
      const action1 = vi.fn();
      const action2 = vi.fn();
      const composed = sequence(
        conditional(() => true, action1),
        conditional(() => false, action2)
      );
      const context: WorkflowContext = {};

      await composed(context);

      expect(action1).toHaveBeenCalledTimes(1);
      expect(action2).not.toHaveBeenCalled();
    });

    it('should compose parallel and updateContext', async () => {
      const action1 = updateContext({ prop1: 'value1' });
      const action2 = updateContext({ prop2: 'value2' });
      const composed = parallel(action1, action2);
      const context: WorkflowContext = {};

      await composed(context);

      expect(context.prop1).toBe('value1');
      expect(context.prop2).toBe('value2');
    });

    it('should compose retry and callService', async () => {
      const serviceFn = vi.fn().mockResolvedValue(undefined);
      const composed = retry(callService(serviceFn), 3);
      const context: WorkflowContext = {};

      await composed(context);

      expect(serviceFn).toHaveBeenCalledTimes(1);
    });
  });
});
