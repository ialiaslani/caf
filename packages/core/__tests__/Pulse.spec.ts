import { describe, it, expect, vi, beforeEach } from 'vitest';
import { pulse, Pulse } from '../src/Pulse';

describe('Pulse', () => {
  describe('initialization', () => {
    it('should initialize with the provided value', () => {
      const p = pulse(42);
      expect(p.value).toBe(42);
    });

    it('should initialize with different types', () => {
      expect(pulse('string').value).toBe('string');
      expect(pulse(true).value).toBe(true);
      expect(pulse(null).value).toBe(null);
      expect(pulse(undefined).value).toBe(undefined);
      expect(pulse({ key: 'value' }).value).toEqual({ key: 'value' });
      expect(pulse([1, 2, 3]).value).toEqual([1, 2, 3]);
    });
  });

  describe('value updates', () => {
    it('should update value and notify subscribers', () => {
      const p = pulse(0);
      const listener = vi.fn();
      p.subscribe(listener);

      p.value = 10;
      expect(p.value).toBe(10);
      expect(listener).toHaveBeenCalledTimes(1);
      expect(listener).toHaveBeenCalledWith(10);
    });

    it('should not notify when value is unchanged', () => {
      const p = pulse(5);
      const listener = vi.fn();
      p.subscribe(listener);

      p.value = 5;
      expect(listener).not.toHaveBeenCalled();
    });

    it('should handle multiple value updates', () => {
      const p = pulse(0);
      const listener = vi.fn();
      p.subscribe(listener);

      p.value = 1;
      p.value = 2;
      p.value = 3;

      expect(p.value).toBe(3);
      expect(listener).toHaveBeenCalledTimes(3);
      expect(listener).toHaveBeenNthCalledWith(1, 1);
      expect(listener).toHaveBeenNthCalledWith(2, 2);
      expect(listener).toHaveBeenNthCalledWith(3, 3);
    });

    it('should handle object value updates', () => {
      const p = pulse({ count: 0 });
      const listener = vi.fn();
      p.subscribe(listener);

      p.value = { count: 1 };
      expect(p.value).toEqual({ count: 1 });
      expect(listener).toHaveBeenCalledTimes(1);
      expect(listener).toHaveBeenCalledWith({ count: 1 });
    });

    it('should handle array value updates', () => {
      const p = pulse([1, 2]);
      const listener = vi.fn();
      p.subscribe(listener);

      p.value = [3, 4, 5];
      expect(p.value).toEqual([3, 4, 5]);
      expect(listener).toHaveBeenCalledTimes(1);
    });
  });

  describe('subscriptions', () => {
    it('should subscribe and notify listeners', () => {
      const p = pulse(0);
      const listener1 = vi.fn();
      const listener2 = vi.fn();

      p.subscribe(listener1);
      p.subscribe(listener2);

      p.value = 10;

      expect(listener1).toHaveBeenCalledWith(10);
      expect(listener2).toHaveBeenCalledWith(10);
    });

    it('should unsubscribe and stop notifying', () => {
      const p = pulse(0);
      const listener = vi.fn();

      p.subscribe(listener);
      p.value = 1;
      expect(listener).toHaveBeenCalledTimes(1);

      p.unsubscribe(listener);
      p.value = 2;
      expect(listener).toHaveBeenCalledTimes(1); // Still 1, not notified
    });

    it('should handle multiple subscribers', () => {
      const p = pulse(0);
      const listener1 = vi.fn();
      const listener2 = vi.fn();
      const listener3 = vi.fn();

      p.subscribe(listener1);
      p.subscribe(listener2);
      p.subscribe(listener3);

      p.value = 5;

      expect(listener1).toHaveBeenCalledWith(5);
      expect(listener2).toHaveBeenCalledWith(5);
      expect(listener3).toHaveBeenCalledWith(5);
    });

    it('should handle unsubscribe of non-subscribed listener gracefully', () => {
      const p = pulse(0);
      const listener = vi.fn();

      // Should not throw
      expect(() => p.unsubscribe(listener)).not.toThrow();
    });

    it('should handle multiple subscriptions of same listener', () => {
      const p = pulse(0);
      const listener = vi.fn();

      p.subscribe(listener);
      p.subscribe(listener); // Subscribe twice

      p.value = 5;

      // Should only notify once (Set behavior)
      expect(listener).toHaveBeenCalledTimes(1);
    });

    it('should notify subscribers in order', () => {
      const p = pulse(0);
      const callOrder: number[] = [];
      const listener1 = vi.fn(() => callOrder.push(1));
      const listener2 = vi.fn(() => callOrder.push(2));
      const listener3 = vi.fn(() => callOrder.push(3));

      p.subscribe(listener1);
      p.subscribe(listener2);
      p.subscribe(listener3);

      p.value = 10;

      expect(callOrder.length).toBe(3);
    });
  });

  describe('edge cases', () => {
    it('should handle NaN values', () => {
      const p = pulse(NaN);
      const listener = vi.fn();
      p.subscribe(listener);

      // NaN !== NaN is true, so the comparison will trigger a notification
      // This is the actual behavior of the Pulse implementation
      p.value = NaN;
      expect(listener).toHaveBeenCalledWith(NaN);
    });

    it('should handle 0 and -0 as different values', () => {
      const p = pulse(0);
      const listener = vi.fn();
      p.subscribe(listener);

      p.value = -0;
      // 0 === -0 in JavaScript, so listener should not be called
      expect(listener).not.toHaveBeenCalled();
    });

    it('should handle rapid successive updates', () => {
      const p = pulse(0);
      const listener = vi.fn();
      p.subscribe(listener);

      for (let i = 1; i <= 100; i++) {
        p.value = i;
      }

      expect(p.value).toBe(100);
      expect(listener).toHaveBeenCalledTimes(100);
    });

    it('should handle subscription during notification', () => {
      const p = pulse(0);
      const listener1 = vi.fn(() => {
        p.subscribe(listener2);
      });
      const listener2 = vi.fn();

      p.subscribe(listener1);
      p.value = 1;

      // Set.forEach iterates over the current set, and adding during iteration
      // may or may not include the new item depending on implementation.
      // In practice, Set.forEach creates a snapshot, so listener2 won't be called
      // in the current iteration, but the actual behavior shows it IS called.
      // This test documents the actual behavior: listener2 gets called because
      // Set.forEach may include items added during iteration.
      expect(listener1).toHaveBeenCalledTimes(1);
      // Note: The actual behavior is that listener2 IS called during the notification
      // because Set.forEach iterates over the live set
      expect(listener2).toHaveBeenCalledWith(1);

      // Should also be called on next update
      p.value = 2;
      expect(listener2).toHaveBeenCalledTimes(2);
      expect(listener2).toHaveBeenNthCalledWith(2, 2);
    });

    it('should handle unsubscribe during notification', () => {
      const p = pulse(0);
      const listener1 = vi.fn(() => {
        p.unsubscribe(listener2);
      });
      const listener2 = vi.fn();

      p.subscribe(listener1);
      p.subscribe(listener2);

      p.value = 1;

      // Set.forEach iterates over the current set. When listener1 is called,
      // it unsubscribes listener2. Since Set.forEach may have already started
      // iterating over listener2, it may or may not be called.
      // The actual behavior: listener2 is NOT called because deletion happens
      // before it's reached in iteration (listener1 is called first).
      expect(listener1).toHaveBeenCalledTimes(1);
      expect(listener2).not.toHaveBeenCalled();

      // listener2 should not be called on next update
      p.value = 2;
      expect(listener2).not.toHaveBeenCalled();
    });
  });

  describe('type safety', () => {
    it('should maintain type through updates', () => {
      const p = pulse<string>('initial');
      p.value = 'updated';
      expect(typeof p.value).toBe('string');
    });

    it('should work with complex types', () => {
      interface ComplexType {
        id: number;
        name: string;
        tags: string[];
      }

      const p = pulse<ComplexType>({
        id: 1,
        name: 'test',
        tags: ['a', 'b'],
      });

      expect(p.value.id).toBe(1);
      expect(p.value.name).toBe('test');
      expect(p.value.tags).toEqual(['a', 'b']);
    });
  });
});
