import { describe, it, expect, beforeEach } from 'vitest';
import {
  StateInspector,
  createStateInspector,
  defaultInspector,
  type InspectedState,
} from '../src/inspector/StateInspector';

describe('StateInspector', () => {
  let inspector: StateInspector;

  beforeEach(() => {
    inspector = new StateInspector();
  });

  describe('inspect', () => {
    it('should inspect a state value', () => {
      inspector.inspect('testState', { count: 42 });
      const state = inspector.getState('testState');
      expect(state).toBeDefined();
      expect(state?.name).toBe('testState');
      expect(state?.value).toEqual({ count: 42 });
    });

    it('should store timestamp', () => {
      const before = Date.now();
      inspector.inspect('testState', 'value');
      const after = Date.now();
      const state = inspector.getState('testState');
      expect(state?.timestamp).toBeGreaterThanOrEqual(before);
      expect(state?.timestamp).toBeLessThanOrEqual(after);
    });

    it('should detect type correctly', () => {
      inspector.inspect('stringState', 'hello');
      inspector.inspect('numberState', 42);
      inspector.inspect('booleanState', true);
      inspector.inspect('arrayState', [1, 2, 3]);
      inspector.inspect('objectState', { key: 'value' });
      inspector.inspect('nullState', null);

      expect(inspector.getState('stringState')?.type).toBe('string');
      expect(inspector.getState('numberState')?.type).toBe('number');
      expect(inspector.getState('booleanState')?.type).toBe('boolean');
      expect(inspector.getState('arrayState')?.type).toBe('array');
      expect(inspector.getState('objectState')?.type).toBe('object');
      expect(inspector.getState('nullState')?.type).toBe('null');
    });

    it('should deep clone values', () => {
      const original = { nested: { value: 42 } };
      inspector.inspect('testState', original);
      original.nested.value = 100;

      const state = inspector.getState('testState');
      expect(state?.value).toEqual({ nested: { value: 42 } });
      expect(original.nested.value).toBe(100);
    });

    it('should overwrite existing state with same name', () => {
      inspector.inspect('testState', 'first');
      inspector.inspect('testState', 'second');

      const state = inspector.getState('testState');
      expect(state?.value).toBe('second');
    });

    it('should handle Date objects', () => {
      const date = new Date('2023-01-01');
      inspector.inspect('dateState', date);
      const state = inspector.getState('dateState');
      expect(state?.type).toBe('date');
      expect(state?.value).toBeInstanceOf(Date);
      expect((state?.value as Date).getTime()).toBe(date.getTime());
    });

    it('should handle nested objects', () => {
      const complex = {
        level1: {
          level2: {
            level3: 'deep',
          },
        },
      };
      inspector.inspect('complexState', complex);
      const state = inspector.getState('complexState');
      expect(state?.value).toEqual(complex);
    });

    it('should handle arrays', () => {
      const array = [1, 2, { nested: 'value' }];
      inspector.inspect('arrayState', array);
      const state = inspector.getState('arrayState');
      expect(state?.value).toEqual(array);
    });
  });

  describe('getState', () => {
    it('should return inspected state', () => {
      inspector.inspect('testState', 'value');
      const state = inspector.getState('testState');
      expect(state).toBeDefined();
      expect(state?.name).toBe('testState');
      expect(state?.value).toBe('value');
    });

    it('should return undefined for non-existent state', () => {
      const state = inspector.getState('nonExistent');
      expect(state).toBeUndefined();
    });

    it('should return a copy of the state', () => {
      inspector.inspect('testState', { count: 42 });
      const state1 = inspector.getState('testState');
      const state2 = inspector.getState('testState');
      expect(state1).not.toBe(state2);
      expect(state1).toEqual(state2);
    });
  });

  describe('getAllStates', () => {
    it('should return all inspected states', () => {
      inspector.inspect('state1', 'value1');
      inspector.inspect('state2', 'value2');
      inspector.inspect('state3', 'value3');

      const allStates = inspector.getAllStates();
      expect(Object.keys(allStates)).toHaveLength(3);
      expect(allStates.state1?.value).toBe('value1');
      expect(allStates.state2?.value).toBe('value2');
      expect(allStates.state3?.value).toBe('value3');
    });

    it('should return empty object when no states', () => {
      const allStates = inspector.getAllStates();
      expect(allStates).toEqual({});
    });

    it('should return copies of states', () => {
      inspector.inspect('testState', { count: 42 });
      const allStates = inspector.getAllStates();
      const state = inspector.getState('testState');
      expect(allStates.testState).not.toBe(state);
      expect(allStates.testState).toEqual(state);
    });
  });

  describe('removeState', () => {
    it('should remove a state', () => {
      inspector.inspect('testState', 'value');
      expect(inspector.getState('testState')).toBeDefined();

      inspector.removeState('testState');
      expect(inspector.getState('testState')).toBeUndefined();
    });

    it('should not throw when removing non-existent state', () => {
      expect(() => {
        inspector.removeState('nonExistent');
      }).not.toThrow();
    });
  });

  describe('clear', () => {
    it('should clear all states', () => {
      inspector.inspect('state1', 'value1');
      inspector.inspect('state2', 'value2');
      expect(Object.keys(inspector.getAllStates())).toHaveLength(2);

      inspector.clear();
      expect(Object.keys(inspector.getAllStates())).toHaveLength(0);
    });

    it('should work when already empty', () => {
      expect(() => {
        inspector.clear();
      }).not.toThrow();
    });
  });

  describe('getStateNames', () => {
    it('should return all state names', () => {
      inspector.inspect('state1', 'value1');
      inspector.inspect('state2', 'value2');
      inspector.inspect('state3', 'value3');

      const names = inspector.getStateNames();
      expect(names).toHaveLength(3);
      expect(names).toContain('state1');
      expect(names).toContain('state2');
      expect(names).toContain('state3');
    });

    it('should return empty array when no states', () => {
      const names = inspector.getStateNames();
      expect(names).toEqual([]);
    });
  });

  describe('compare', () => {
    it('should compare two states', () => {
      inspector.inspect('state1', { count: 42 });
      inspector.inspect('state2', { count: 42 });

      const comparison = inspector.compare('state1', 'state2');
      expect(comparison.equal).toBe(true);
    });

    it('should detect differences', () => {
      inspector.inspect('state1', { count: 42 });
      inspector.inspect('state2', { count: 100 });

      const comparison = inspector.compare('state1', 'state2');
      expect(comparison.equal).toBe(false);
      expect(comparison.differences).toBeDefined();
      expect(comparison.differences?.count).toBeDefined();
    });

    it('should throw when comparing non-existent states', () => {
      inspector.inspect('state1', 'value1');
      expect(() => {
        inspector.compare('state1', 'nonExistent');
      }).toThrow('State not found: nonExistent');

      expect(() => {
        inspector.compare('nonExistent', 'state1');
      }).toThrow('State not found: nonExistent');
    });

    it('should compare nested objects', () => {
      inspector.inspect('state1', { nested: { value: 42 } });
      inspector.inspect('state2', { nested: { value: 100 } });

      const comparison = inspector.compare('state1', 'state2');
      expect(comparison.equal).toBe(false);
    });

    it('should compare arrays', () => {
      inspector.inspect('state1', [1, 2, 3]);
      inspector.inspect('state2', [1, 2, 3]);
      inspector.inspect('state3', [1, 2, 4]);

      expect(inspector.compare('state1', 'state2').equal).toBe(true);
      expect(inspector.compare('state1', 'state3').equal).toBe(false);
    });

    it('should compare primitive values', () => {
      inspector.inspect('string1', 'hello');
      inspector.inspect('string2', 'hello');
      inspector.inspect('string3', 'world');

      expect(inspector.compare('string1', 'string2').equal).toBe(true);
      expect(inspector.compare('string1', 'string3').equal).toBe(false);
    });

    it('should handle null values', () => {
      inspector.inspect('null1', null);
      inspector.inspect('null2', null);
      inspector.inspect('value', 'not null');

      expect(inspector.compare('null1', 'null2').equal).toBe(true);
      expect(inspector.compare('null1', 'value').equal).toBe(false);
    });
  });

  describe('deepClone', () => {
    it('should clone objects deeply', () => {
      const original = {
        level1: {
          level2: {
            level3: 'deep',
          },
        },
      };
      inspector.inspect('testState', original);
      original.level1.level2.level3 = 'modified';

      const state = inspector.getState('testState');
      expect((state?.value as typeof original).level1.level2.level3).toBe('deep');
    });

    it('should clone arrays deeply', () => {
      const original = [{ nested: { value: 42 } }];
      inspector.inspect('testState', original);
      original[0].nested.value = 100;

      const state = inspector.getState('testState');
      expect((state?.value as typeof original)[0].nested.value).toBe(42);
    });

    it('should handle Date objects', () => {
      const date = new Date('2023-01-01');
      inspector.inspect('testState', date);
      date.setTime(0);

      const state = inspector.getState('testState');
      expect((state?.value as Date).getTime()).toBe(new Date('2023-01-01').getTime());
    });
  });

  describe('createStateInspector', () => {
    it('should create inspector instance', () => {
      const createdInspector = createStateInspector();
      expect(createdInspector).toBeInstanceOf(StateInspector);
    });

    it('should create independent instances', () => {
      const inspector1 = createStateInspector();
      const inspector2 = createStateInspector();

      inspector1.inspect('test', 'value1');
      inspector2.inspect('test', 'value2');

      expect(inspector1.getState('test')?.value).toBe('value1');
      expect(inspector2.getState('test')?.value).toBe('value2');
    });
  });

  describe('defaultInspector', () => {
    it('should be an inspector instance', () => {
      expect(defaultInspector).toBeInstanceOf(StateInspector);
    });

    it('should be usable', () => {
      defaultInspector.inspect('test', 'value');
      expect(defaultInspector.getState('test')?.value).toBe('value');
    });
  });
});
