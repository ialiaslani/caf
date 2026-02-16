/**
 * State inspector utilities.
 * 
 * Provides utilities for inspecting and debugging application state.
 * 
 * @example
 * ```ts
 * import { StateInspector } from '@caf/devtools/inspector';
 * 
 * const inspector = new StateInspector();
 * inspector.inspect('MyPloc', ploc.state);
 * inspector.inspect('MyPulse', pulse.value);
 * 
 * // Get all inspected states
 * const states = inspector.getAllStates();
 * ```
 */

export interface InspectedState {
  name: string;
  value: unknown;
  timestamp: number;
  type: string;
}

/**
 * State inspector for debugging.
 */
export class StateInspector {
  private states: Map<string, InspectedState> = new Map();

  /**
   * Inspect a state value.
   */
  inspect(name: string, value: unknown): void {
    const inspected: InspectedState = {
      name,
      value: this.deepClone(value),
      timestamp: Date.now(),
      type: this.getType(value),
    };

    this.states.set(name, inspected);
  }

  /**
   * Get an inspected state.
   */
  getState(name: string): InspectedState | undefined {
    return this.states.get(name);
  }

  /**
   * Get all inspected states.
   */
  getAllStates(): Record<string, InspectedState> {
    const result: Record<string, InspectedState> = {};
    this.states.forEach((state, name) => {
      result[name] = { ...state };
    });
    return result;
  }

  /**
   * Remove an inspected state.
   */
  removeState(name: string): void {
    this.states.delete(name);
  }

  /**
   * Clear all inspected states.
   */
  clear(): void {
    this.states.clear();
  }

  /**
   * Get state names.
   */
  getStateNames(): string[] {
    return Array.from(this.states.keys());
  }

  /**
   * Compare two states.
   */
  compare(name1: string, name2: string): {
    equal: boolean;
    differences?: Record<string, { old: unknown; new: unknown }>;
  } {
    const state1 = this.states.get(name1);
    const state2 = this.states.get(name2);

    if (!state1 || !state2) {
      throw new Error(`State not found: ${!state1 ? name1 : name2}`);
    }

    return this.deepCompare(state1.value, state2.value);
  }

  private deepClone<T>(value: T): T {
    if (value === null || typeof value !== 'object') {
      return value;
    }

    if (value instanceof Date) {
      return new Date(value.getTime()) as unknown as T;
    }

    if (Array.isArray(value)) {
      return value.map((item) => this.deepClone(item)) as unknown as T;
    }

    const cloned: Record<string, unknown> = {};
    for (const key in value) {
      if (Object.prototype.hasOwnProperty.call(value, key)) {
        cloned[key] = this.deepClone((value as Record<string, unknown>)[key]);
      }
    }

    return cloned as T;
  }

  private getType(value: unknown): string {
    if (value === null) return 'null';
    if (Array.isArray(value)) return 'array';
    if (value instanceof Date) return 'date';
    return typeof value;
  }

  private deepCompare(
    oldValue: unknown,
    newValue: unknown
  ): {
    equal: boolean;
    differences?: Record<string, { old: unknown; new: unknown }>;
  } {
    if (oldValue === newValue) {
      return { equal: true };
    }

    if (
      typeof oldValue !== 'object' ||
      typeof newValue !== 'object' ||
      oldValue === null ||
      newValue === null
    ) {
      return {
        equal: false,
        differences: { root: { old: oldValue, new: newValue } },
      };
    }

    const differences: Record<string, { old: unknown; new: unknown }> = {};
    const allKeys = new Set([
      ...Object.keys(oldValue as Record<string, unknown>),
      ...Object.keys(newValue as Record<string, unknown>),
    ]);

    let equal = true;

    for (const key of allKeys) {
      const oldVal = (oldValue as Record<string, unknown>)[key];
      const newVal = (newValue as Record<string, unknown>)[key];

      if (oldVal !== newVal) {
        equal = false;
        differences[key] = { old: oldVal, new: newVal };
      }
    }

    return equal ? { equal: true } : { equal: false, differences };
  }
}

/**
 * Create a state inspector instance.
 */
export function createStateInspector(): StateInspector {
  return new StateInspector();
}

/**
 * Default state inspector instance.
 */
export const defaultInspector = new StateInspector();
