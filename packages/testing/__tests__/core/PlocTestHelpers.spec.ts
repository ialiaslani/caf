import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  createMockPloc,
  createPlocTester,
  waitForStateChange,
  waitForStateChanges,
  assertStateHistory,
  getStateHistorySnapshot,
  getStateHistorySnapshotJson,
} from '../../src/core/PlocTestHelpers';

describe('PlocTestHelpers', () => {
  describe('createMockPloc', () => {
    it('should create a Ploc with initial state', () => {
      const ploc = createMockPloc({ count: 0, name: 'test' });
      expect(ploc.state).toEqual({ count: 0, name: 'test' });
    });

    it('should allow changing state', () => {
      const ploc = createMockPloc({ count: 0 });
      ploc.changeState({ count: 1 });
      expect(ploc.state).toEqual({ count: 1 });
    });

    it('should work with primitive state', () => {
      const ploc = createMockPloc(0);
      expect(ploc.state).toBe(0);
      ploc.changeState(5);
      expect(ploc.state).toBe(5);
    });

    it('should notify subscribers on state change', () => {
      const ploc = createMockPloc({ count: 0 });
      const states: any[] = [];
      ploc.subscribe((state) => {
        states.push(state);
      });

      ploc.changeState({ count: 1 });
      ploc.changeState({ count: 2 });

      expect(states).toEqual([{ count: 1 }, { count: 2 }]);
    });

    it('should allow unsubscribing', () => {
      const ploc = createMockPloc({ count: 0 });
      const states: any[] = [];
      const listener = (state: any) => {
        states.push(state);
      };

      ploc.subscribe(listener);
      ploc.changeState({ count: 1 });
      ploc.unsubscribe(listener);
      ploc.changeState({ count: 2 });

      expect(states).toEqual([{ count: 1 }]);
    });
  });

  describe('PlocTester', () => {
    let tester: ReturnType<typeof createPlocTester<any>>;
    let ploc: ReturnType<typeof createMockPloc<any>>;

    beforeEach(() => {
      ploc = createMockPloc({ count: 0 });
      tester = createPlocTester(ploc);
    });

    afterEach(() => {
      tester.cleanup();
    });

    it('should track initial state', () => {
      expect(tester.getState()).toEqual({ count: 0 });
      expect(tester.getInitialState()).toEqual({ count: 0 });
    });

    it('should track state changes', () => {
      ploc.changeState({ count: 1 });
      ploc.changeState({ count: 2 });

      expect(tester.getState()).toEqual({ count: 2 });
      expect(tester.getStateChangeCount()).toBe(2);
      expect(tester.getLastStateChange()).toEqual({ count: 2 });
    });

    it('should provide state history', () => {
      ploc.changeState({ count: 1 });
      ploc.changeState({ count: 2 });
      ploc.changeState({ count: 3 });

      const history = tester.getStateHistory();
      expect(history).toEqual([
        { count: 0 },
        { count: 1 },
        { count: 2 },
        { count: 3 },
      ]);
    });

    it('should cleanup subscriptions', () => {
      const states: any[] = [];
      const listener = (state: any) => {
        states.push(state);
      };
      ploc.subscribe(listener);

      tester.cleanup();
      ploc.changeState({ count: 999 });

      // Tester's listener should be removed, but our manual listener should still work
      expect(states).toEqual([{ count: 999 }]);
      // Tester should not have recorded the change
      expect(tester.getStateChangeCount()).toBe(0);
    });
  });

  describe('waitForStateChange', () => {
    it('should resolve immediately if predicate matches current state', async () => {
      const ploc = createMockPloc({ count: 5 });
      const result = await waitForStateChange(ploc, (state) => state.count === 5);
      expect(result).toEqual({ count: 5 });
    });

    it('should wait for state change matching predicate', async () => {
      const ploc = createMockPloc({ count: 0 });
      const promise = waitForStateChange(ploc, (state) => state.count === 3);

      setTimeout(() => {
        ploc.changeState({ count: 1 });
        ploc.changeState({ count: 2 });
        ploc.changeState({ count: 3 });
      }, 10);

      const result = await promise;
      expect(result).toEqual({ count: 3 });
    });

    it('should timeout if predicate never matches', async () => {
      const ploc = createMockPloc({ count: 0 });
      const promise = waitForStateChange(
        ploc,
        (state) => state.count === 999,
        50
      );

      setTimeout(() => {
        ploc.changeState({ count: 1 });
      }, 10);

      await expect(promise).rejects.toThrow(/Timeout/);
    });
  });

  describe('waitForStateChanges', () => {
    it('should wait for specific number of state changes', async () => {
      const ploc = createMockPloc({ count: 0 });
      const promise = waitForStateChanges(ploc, 3);

      setTimeout(() => {
        ploc.changeState({ count: 1 });
        ploc.changeState({ count: 2 });
        ploc.changeState({ count: 3 });
      }, 10);

      const states = await promise;
      expect(states).toEqual([{ count: 1 }, { count: 2 }, { count: 3 }]);
    });

    it('should timeout if not enough changes occur', async () => {
      const ploc = createMockPloc({ count: 0 });
      const promise = waitForStateChanges(ploc, 5, 50);

      setTimeout(() => {
        ploc.changeState({ count: 1 });
        ploc.changeState({ count: 2 });
      }, 10);

      await expect(promise).rejects.toThrow(/Timeout/);
    });
  });

  describe('assertStateHistory', () => {
    it('should pass when history matches', () => {
      const ploc = createMockPloc({ count: 0 });
      const tester = createPlocTester(ploc);
      ploc.changeState({ count: 1 });
      ploc.changeState({ count: 2 });

      expect(() => {
        assertStateHistory(tester, [
          { count: 0 },
          { count: 1 },
          { count: 2 },
        ]);
      }).not.toThrow();

      tester.cleanup();
    });

    it('should throw when history does not match', () => {
      const ploc = createMockPloc({ count: 0 });
      const tester = createPlocTester(ploc);
      ploc.changeState({ count: 1 });

      expect(() => {
        assertStateHistory(tester, [{ count: 0 }, { count: 999 }]);
      }).toThrow(/State history mismatch/);

      tester.cleanup();
    });
  });

  describe('getStateHistorySnapshot', () => {
    it('should return state history array', () => {
      const ploc = createMockPloc({ count: 0 });
      const tester = createPlocTester(ploc);
      ploc.changeState({ count: 1 });
      ploc.changeState({ count: 2 });

      const snapshot = getStateHistorySnapshot(tester);
      expect(snapshot).toEqual([{ count: 0 }, { count: 1 }, { count: 2 }]);

      tester.cleanup();
    });
  });

  describe('getStateHistorySnapshotJson', () => {
    it('should return JSON string of state history', () => {
      const ploc = createMockPloc({ count: 0 });
      const tester = createPlocTester(ploc);
      ploc.changeState({ count: 1 });

      const json = getStateHistorySnapshotJson(tester);
      expect(json).toBe(
        JSON.stringify([{ count: 0 }, { count: 1 }], null, 2)
      );

      tester.cleanup();
    });
  });
});
