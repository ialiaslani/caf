import { describe, it, expect, vi } from 'vitest';
import {
  and,
  or,
  not,
  always,
  never,
  equals,
  exists,
  matches,
} from '../src/guards/GuardCombinators';
import type { WorkflowContext } from '../src/IWorkflow';

describe('GuardCombinators', () => {
  describe('and', () => {
    it('should return true when all guards return true', async () => {
      const guard1 = () => Promise.resolve(true);
      const guard2 = () => Promise.resolve(true);
      const guard3 = () => Promise.resolve(true);

      const combined = and(guard1, guard2, guard3);
      const result = await combined({});

      expect(result).toBe(true);
    });

    it('should return false when any guard returns false', async () => {
      const guard1 = () => Promise.resolve(true);
      const guard2 = () => Promise.resolve(false);
      const guard3 = () => Promise.resolve(true);

      const combined = and(guard1, guard2, guard3);
      const result = await combined({});

      expect(result).toBe(false);
    });

    it('should return false when first guard returns false', async () => {
      const guard1 = () => Promise.resolve(false);
      const guard2 = () => Promise.resolve(true);

      const combined = and(guard1, guard2);
      const result = await combined({});

      expect(result).toBe(false);
    });

    it('should work with single guard', async () => {
      const guard = () => Promise.resolve(true);
      const combined = and(guard);
      const result = await combined({});

      expect(result).toBe(true);
    });

    it('should work with empty guards array', async () => {
      const combined = and();
      const result = await combined({});

      expect(result).toBe(true);
    });

    it('should pass context to all guards', async () => {
      const context: WorkflowContext = { userId: '123' };
      const guard1 = vi.fn().mockResolvedValue(true);
      const guard2 = vi.fn().mockResolvedValue(true);

      const combined = and(guard1, guard2);
      await combined(context);

      expect(guard1).toHaveBeenCalledWith(context);
      expect(guard2).toHaveBeenCalledWith(context);
    });

    it('should handle async guards', async () => {
      const guard1 = async () => {
        await new Promise(resolve => setTimeout(resolve, 10));
        return true;
      };
      const guard2 = async () => {
        await new Promise(resolve => setTimeout(resolve, 10));
        return true;
      };

      const combined = and(guard1, guard2);
      const result = await combined({});

      expect(result).toBe(true);
    });
  });

  describe('or', () => {
    it('should return true when any guard returns true', async () => {
      const guard1 = () => Promise.resolve(false);
      const guard2 = () => Promise.resolve(true);
      const guard3 = () => Promise.resolve(false);

      const combined = or(guard1, guard2, guard3);
      const result = await combined({});

      expect(result).toBe(true);
    });

    it('should return false when all guards return false', async () => {
      const guard1 = () => Promise.resolve(false);
      const guard2 = () => Promise.resolve(false);
      const guard3 = () => Promise.resolve(false);

      const combined = or(guard1, guard2, guard3);
      const result = await combined({});

      expect(result).toBe(false);
    });

    it('should return true when first guard returns true', async () => {
      const guard1 = () => Promise.resolve(true);
      const guard2 = () => Promise.resolve(false);

      const combined = or(guard1, guard2);
      const result = await combined({});

      expect(result).toBe(true);
    });

    it('should work with single guard', async () => {
      const guard = () => Promise.resolve(true);
      const combined = or(guard);
      const result = await combined({});

      expect(result).toBe(true);
    });

    it('should work with empty guards array', async () => {
      const combined = or();
      const result = await combined({});

      expect(result).toBe(false);
    });

    it('should pass context to all guards', async () => {
      const context: WorkflowContext = { userId: '123' };
      const guard1 = vi.fn().mockResolvedValue(false);
      const guard2 = vi.fn().mockResolvedValue(true);

      const combined = or(guard1, guard2);
      await combined(context);

      expect(guard1).toHaveBeenCalledWith(context);
      expect(guard2).toHaveBeenCalledWith(context);
    });

    it('should short-circuit on first true', async () => {
      const guard1 = vi.fn().mockResolvedValue(true);
      const guard2 = vi.fn().mockResolvedValue(false);

      const combined = or(guard1, guard2);
      const result = await combined({});

      expect(result).toBe(true);
      expect(guard1).toHaveBeenCalledTimes(1);
      expect(guard2).not.toHaveBeenCalled();
    });
  });

  describe('not', () => {
    it('should return false when guard returns true', async () => {
      const guard = () => Promise.resolve(true);
      const negated = not(guard);
      const result = await negated({});

      expect(result).toBe(false);
    });

    it('should return true when guard returns false', async () => {
      const guard = () => Promise.resolve(false);
      const negated = not(guard);
      const result = await negated({});

      expect(result).toBe(true);
    });

    it('should pass context to guard', async () => {
      const context: WorkflowContext = { userId: '123' };
      const guard = vi.fn().mockResolvedValue(true);

      const negated = not(guard);
      await negated(context);

      expect(guard).toHaveBeenCalledWith(context);
    });
  });

  describe('always', () => {
    it('should always return true', async () => {
      const guard = always();
      const result1 = await guard({});
      const result2 = await guard({ userId: '123' });
      const result3 = await guard({});

      expect(result1).toBe(true);
      expect(result2).toBe(true);
      expect(result3).toBe(true);
    });
  });

  describe('never', () => {
    it('should always return false', async () => {
      const guard = never();
      const result1 = await guard({});
      const result2 = await guard({ userId: '123' });
      const result3 = await guard({});

      expect(result1).toBe(false);
      expect(result2).toBe(false);
      expect(result3).toBe(false);
    });
  });

  describe('equals', () => {
    it('should return true when property equals value', async () => {
      const guard = equals('userId', '123');
      const context: WorkflowContext = { userId: '123' };
      const result = await guard(context);

      expect(result).toBe(true);
    });

    it('should return false when property does not equal value', async () => {
      const guard = equals('userId', '123');
      const context: WorkflowContext = { userId: '456' };
      const result = await guard(context);

      expect(result).toBe(false);
    });

    it('should return false when property does not exist', async () => {
      const guard = equals('userId', '123');
      const context: WorkflowContext = {};
      const result = await guard(context);

      expect(result).toBe(false);
    });

    it('should work with number values', async () => {
      const guard = equals('count', 5);
      const context: WorkflowContext = { count: 5 };
      const result = await guard(context);

      expect(result).toBe(true);
    });

    it('should work with boolean values', async () => {
      const guard = equals('isActive', true);
      const context: WorkflowContext = { isActive: true };
      const result = await guard(context);

      expect(result).toBe(true);
    });

    it('should work with null values', async () => {
      const guard = equals('value', null);
      const context: WorkflowContext = { value: null };
      const result = await guard(context);

      expect(result).toBe(true);
    });
  });

  describe('exists', () => {
    it('should return true when property exists and is not null', async () => {
      const guard = exists('userId');
      const context: WorkflowContext = { userId: '123' };
      const result = await guard(context);

      expect(result).toBe(true);
    });

    it('should return false when property does not exist', async () => {
      const guard = exists('userId');
      const context: WorkflowContext = {};
      const result = await guard(context);

      expect(result).toBe(false);
    });

    it('should return false when property is null', async () => {
      const guard = exists('userId');
      const context: WorkflowContext = { userId: null };
      const result = await guard(context);

      expect(result).toBe(false);
    });

    it('should return false when property is undefined', async () => {
      const guard = exists('userId');
      const context: WorkflowContext = { userId: undefined };
      const result = await guard(context);

      expect(result).toBe(false);
    });

    it('should return true for zero value', async () => {
      const guard = exists('count');
      const context: WorkflowContext = { count: 0 };
      const result = await guard(context);

      expect(result).toBe(true);
    });

    it('should return true for empty string', async () => {
      const guard = exists('name');
      const context: WorkflowContext = { name: '' };
      const result = await guard(context);

      expect(result).toBe(true);
    });

    it('should return true for false boolean', async () => {
      const guard = exists('isActive');
      const context: WorkflowContext = { isActive: false };
      const result = await guard(context);

      expect(result).toBe(true);
    });
  });

  describe('matches', () => {
    it('should return true when predicate returns true', async () => {
      const guard = matches('count', (value) => (value as number) > 5);
      const context: WorkflowContext = { count: 10 };
      const result = await guard(context);

      expect(result).toBe(true);
    });

    it('should return false when predicate returns false', async () => {
      const guard = matches('count', (value) => (value as number) > 5);
      const context: WorkflowContext = { count: 3 };
      const result = await guard(context);

      expect(result).toBe(false);
    });

    it('should pass property value to predicate', async () => {
      const predicate = vi.fn().mockReturnValue(true);
      const guard = matches('userId', predicate);
      const context: WorkflowContext = { userId: '123' };

      await guard(context);

      expect(predicate).toHaveBeenCalledWith('123');
    });

    it('should handle undefined property', async () => {
      const guard = matches('userId', (value) => value !== undefined);
      const context: WorkflowContext = {};
      const result = await guard(context);

      expect(result).toBe(false);
    });

    it('should work with complex predicates', async () => {
      const guard = matches('user', (value) => {
        const user = value as { role: string; age: number };
        return user?.role === 'admin' && user?.age >= 18;
      });
      const context: WorkflowContext = {
        user: { role: 'admin', age: 25 },
      };
      const result = await guard(context);

      expect(result).toBe(true);
    });
  });

  describe('nested combinators', () => {
    it('should work with nested and/or', async () => {
      const guard1 = () => Promise.resolve(true);
      const guard2 = () => Promise.resolve(false);
      const guard3 = () => Promise.resolve(true);

      const combined = and(
        guard1,
        or(guard2, guard3)
      );
      const result = await combined({});

      expect(result).toBe(true);
    });

    it('should work with not and and', async () => {
      const guard1 = () => Promise.resolve(true);
      const guard2 = () => Promise.resolve(true);

      const combined = not(and(guard1, guard2));
      const result = await combined({});

      expect(result).toBe(false);
    });

    it('should work with equals and exists', async () => {
      const combined = and(
        exists('userId'),
        equals('userId', '123')
      );
      const context: WorkflowContext = { userId: '123' };
      const result = await combined(context);

      expect(result).toBe(true);
    });
  });
});
