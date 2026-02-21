import { describe, it, expect, beforeEach } from 'vitest';
import { Ploc } from '@c-a-f/core';
import {
  PlocDevTools,
  createPlocDevTools,
} from '../src/core/PlocDevTools';

class CounterPloc extends Ploc<number> {
  constructor(initial = 0) {
    super(initial);
  }
  increment() {
    this.changeState(this.state + 1);
  }
}

describe('PlocDevTools', () => {
  let ploc: CounterPloc;
  let devTools: PlocDevTools<number>;

  beforeEach(() => {
    ploc = new CounterPloc(0);
    devTools = createPlocDevTools(ploc, {
      name: 'CounterPloc',
      enabled: true, // Enable to track state changes
    });
  });

  describe('state tracking', () => {
    it('should track initial state', () => {
      const history = devTools.getStateHistory();
      expect(history.length).toBeGreaterThan(0);
      expect(history[0].state).toBe(0);
    });

    it('should track state changes', () => {
      ploc.increment();
      ploc.increment();

      const history = devTools.getStateHistory();
      expect(history.length).toBeGreaterThanOrEqual(3); // Initial + 2 changes
    });
  });

  describe('time-travel debugging', () => {
    it('should jump to specific state', () => {
      ploc.increment(); // state = 1
      ploc.increment(); // state = 2
      ploc.increment(); // state = 3

      // History: [0 (init), 1, 2, 3]
      // Index 1 = value 1
      devTools.jumpToState(1);
      expect(ploc.state).toBe(1);
    });

    it('should navigate previous state', () => {
      ploc.increment(); // state = 1
      ploc.increment(); // state = 2
      // Current index should be at 2 (state = 2)

      devTools.previousState(); // Should go to index 1 (state = 1)
      expect(ploc.state).toBe(1);
    });

    it('should navigate next state', () => {
      ploc.increment();
      ploc.increment();
      devTools.previousState();

      devTools.nextState();
      expect(ploc.state).toBe(2);
    });

    it('should reset to initial state', () => {
      ploc.increment();
      ploc.increment();

      devTools.reset();
      expect(ploc.state).toBe(0);
    });
  });

  describe('getCurrentState', () => {
    it('should return current state', () => {
      ploc.increment();
      const state = devTools.getCurrentState();
      expect(state).toBe(1);
    });
  });

  describe('getStateHistory', () => {
    it('should return state history', () => {
      ploc.increment();
      const history = devTools.getStateHistory();
      expect(history.length).toBeGreaterThan(1);
    });
  });

  describe('getStateAt', () => {
    it('should return state at specific index', () => {
      ploc.increment();
      const state = devTools.getStateAt(0);
      expect(state).toBe(0);
    });
  });

  describe('clearHistory', () => {
    it('should clear history', () => {
      ploc.increment();
      devTools.clearHistory();

      const history = devTools.getStateHistory();
      expect(history.length).toBeLessThanOrEqual(1); // May keep initial state
    });
  });

  describe('cleanup', () => {
    it('should cleanup subscriptions', () => {
      devTools.cleanup();
      // Should not throw
      expect(true).toBe(true);
    });
  });
});
