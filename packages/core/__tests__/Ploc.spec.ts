import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Ploc } from '../src/Ploc';

// Concrete implementations for testing
class CounterPloc extends Ploc<number> {
  constructor(initial = 0) {
    super(initial);
  }
  increment() {
    this.changeState(this.state + 1);
  }
  decrement() {
    this.changeState(this.state - 1);
  }
}

class UserPloc extends Ploc<{ name: string; age: number }> {
  constructor(initial = { name: '', age: 0 }) {
    super(initial);
  }
  updateName(name: string) {
    this.changeState({ ...this.state, name });
  }
  updateAge(age: number) {
    this.changeState({ ...this.state, age });
  }
}

describe('Ploc', () => {
  describe('initialization', () => {
    it('should initialize with the provided state', () => {
      const ploc = new CounterPloc(5);
      expect(ploc.state).toBe(5);
    });

    it('should initialize with default value when not provided', () => {
      const ploc = new CounterPloc();
      expect(ploc.state).toBe(0);
    });

    it('should initialize with complex state', () => {
      const user = { name: 'John', age: 30 };
      const ploc = new UserPloc(user);
      expect(ploc.state).toEqual(user);
    });
  });

  describe('state access', () => {
    it('should expose current state via state getter', () => {
      const ploc = new CounterPloc(10);
      expect(ploc.state).toBe(10);
    });

    it('should return the same reference for unchanged state', () => {
      const ploc = new CounterPloc(5);
      const state1 = ploc.state;
      const state2 = ploc.state;
      expect(state1).toBe(state2);
    });
  });

  describe('changeState', () => {
    it('should update state via changeState', () => {
      const ploc = new CounterPloc(0);
      ploc.changeState(10);
      expect(ploc.state).toBe(10);
    });

    it('should notify subscribers when state changes', () => {
      const ploc = new CounterPloc(0);
      const listener = vi.fn();
      ploc.subscribe(listener);

      ploc.changeState(5);
      expect(listener).toHaveBeenCalledTimes(1);
      expect(listener).toHaveBeenCalledWith(5);
    });

    it('should not notify when state is unchanged', () => {
      const ploc = new CounterPloc(5);
      const listener = vi.fn();
      ploc.subscribe(listener);

      ploc.changeState(5);
      expect(listener).not.toHaveBeenCalled();
    });

    it('should handle multiple state changes', () => {
      const ploc = new CounterPloc(0);
      const listener = vi.fn();
      ploc.subscribe(listener);

      ploc.changeState(1);
      ploc.changeState(2);
      ploc.changeState(3);

      expect(ploc.state).toBe(3);
      expect(listener).toHaveBeenCalledTimes(3);
      expect(listener).toHaveBeenNthCalledWith(1, 1);
      expect(listener).toHaveBeenNthCalledWith(2, 2);
      expect(listener).toHaveBeenNthCalledWith(3, 3);
    });

    it('should handle object state updates', () => {
      const ploc = new UserPloc({ name: 'Alice', age: 25 });
      const listener = vi.fn();
      ploc.subscribe(listener);

      ploc.changeState({ name: 'Bob', age: 30 });
      expect(ploc.state).toEqual({ name: 'Bob', age: 30 });
      expect(listener).toHaveBeenCalledWith({ name: 'Bob', age: 30 });
    });
  });

  describe('subscriptions', () => {
    it('should subscribe and notify listeners', () => {
      const ploc = new CounterPloc(0);
      const listener1 = vi.fn();
      const listener2 = vi.fn();

      ploc.subscribe(listener1);
      ploc.subscribe(listener2);

      ploc.changeState(10);

      expect(listener1).toHaveBeenCalledWith(10);
      expect(listener2).toHaveBeenCalledWith(10);
    });

    it('should unsubscribe and stop notifying', () => {
      const ploc = new CounterPloc(0);
      const listener = vi.fn();

      ploc.subscribe(listener);
      ploc.changeState(1);
      expect(listener).toHaveBeenCalledTimes(1);

      ploc.unsubscribe(listener);
      ploc.changeState(2);
      expect(listener).toHaveBeenCalledTimes(1); // Still 1
    });

    it('should handle multiple subscribers', () => {
      const ploc = new CounterPloc(0);
      const listeners = Array.from({ length: 5 }, () => vi.fn());

      listeners.forEach(listener => ploc.subscribe(listener));
      ploc.changeState(5);

      listeners.forEach(listener => {
        expect(listener).toHaveBeenCalledWith(5);
      });
    });

    it('should handle unsubscribe of non-subscribed listener gracefully', () => {
      const ploc = new CounterPloc(0);
      const listener = vi.fn();

      expect(() => ploc.unsubscribe(listener)).not.toThrow();
    });
  });

  describe('concrete implementations', () => {
    it('should work with CounterPloc methods', () => {
      const ploc = new CounterPloc(0);
      const listener = vi.fn();
      ploc.subscribe(listener);

      ploc.increment();
      expect(ploc.state).toBe(1);
      expect(listener).toHaveBeenCalledWith(1);

      ploc.decrement();
      expect(ploc.state).toBe(0);
      expect(listener).toHaveBeenCalledWith(0);
    });

    it('should work with UserPloc methods', () => {
      const ploc = new UserPloc({ name: 'Alice', age: 25 });
      const listener = vi.fn();
      ploc.subscribe(listener);

      ploc.updateName('Bob');
      expect(ploc.state.name).toBe('Bob');
      expect(ploc.state.age).toBe(25);
      expect(listener).toHaveBeenCalled();

      ploc.updateAge(30);
      expect(ploc.state.name).toBe('Bob');
      expect(ploc.state.age).toBe(30);
    });

    it('should allow custom business logic in subclasses', () => {
      class ValidatedCounterPloc extends Ploc<number> {
        constructor(initial = 0) {
          super(initial);
        }
        increment() {
          if (this.state < 10) {
            this.changeState(this.state + 1);
          }
        }
      }

      const ploc = new ValidatedCounterPloc(9);
      ploc.increment();
      expect(ploc.state).toBe(10);

      ploc.increment(); // Should not increment beyond 10
      expect(ploc.state).toBe(10);
    });
  });

  describe('edge cases', () => {
    it('should handle null state', () => {
      class NullablePloc extends Ploc<string | null> {
        constructor() {
          super(null);
        }
      }

      const ploc = new NullablePloc();
      expect(ploc.state).toBeNull();

      ploc.changeState('value');
      expect(ploc.state).toBe('value');
    });

    it('should handle undefined state', () => {
      class UndefinedPloc extends Ploc<string | undefined> {
        constructor() {
          super(undefined);
        }
      }

      const ploc = new UndefinedPloc();
      expect(ploc.state).toBeUndefined();

      ploc.changeState('value');
      expect(ploc.state).toBe('value');
    });

    it('should handle rapid state changes', () => {
      const ploc = new CounterPloc(0);
      const listener = vi.fn();
      ploc.subscribe(listener);

      for (let i = 1; i <= 100; i++) {
        ploc.changeState(i);
      }

      expect(ploc.state).toBe(100);
      expect(listener).toHaveBeenCalledTimes(100);
    });

    it('should handle subscription during state change notification', () => {
      const ploc = new CounterPloc(0);
      const listener1 = vi.fn(() => {
        ploc.subscribe(listener2);
      });
      const listener2 = vi.fn();

      ploc.subscribe(listener1);
      ploc.changeState(1);

      // Set.forEach iterates over the current set, and adding during iteration
      // may include the new item. The actual behavior shows listener2 IS called.
      expect(listener1).toHaveBeenCalledTimes(1);
      // Note: The actual behavior is that listener2 IS called during the notification
      expect(listener2).toHaveBeenCalledWith(1);

      ploc.changeState(2);
      expect(listener2).toHaveBeenCalledTimes(2);
      expect(listener2).toHaveBeenNthCalledWith(2, 2);
    });
  });

  describe('integration with Pulse', () => {
    it('should use Pulse internally for reactivity', () => {
      const ploc = new CounterPloc(0);
      let callCount = 0;
      const listener = vi.fn(() => callCount++);

      ploc.subscribe(listener);
      ploc.increment();
      ploc.increment();
      ploc.increment();

      expect(callCount).toBe(3);
      expect(listener).toHaveBeenCalledTimes(3);
    });
  });
});
