import { describe, it, expect, beforeEach } from 'vitest';
import { pulse } from '@c-a-f/core';
import {
  PulseDevTools,
  createPulseDevTools,
} from '../src/core/PulseDevTools';

describe('PulseDevTools', () => {
  let pulseInstance: ReturnType<typeof pulse<number>>;
  let devTools: PulseDevTools<number>;

  beforeEach(() => {
    pulseInstance = pulse(0);
    devTools = createPulseDevTools(pulseInstance, {
      name: 'count',
      enabled: true, // Enable to track value changes
    });
  });

  describe('value tracking', () => {
    it('should track initial value', () => {
      const history = devTools.getValueHistory();
      expect(history.length).toBeGreaterThan(0);
      expect(history[0].value).toBe(0);
    });

    it('should track value changes', () => {
      pulseInstance.value = 5;
      pulseInstance.value = 10;

      const history = devTools.getValueHistory();
      expect(history.length).toBeGreaterThanOrEqual(3); // Initial + 2 changes
    });
  });

  describe('time-travel debugging', () => {
    it('should jump to specific value', () => {
      pulseInstance.value = 5;  // value = 5
      pulseInstance.value = 10; // value = 10

      // History: [0 (init), 5, 10]
      // Index 1 = value 5
      devTools.jumpToValue(1);
      expect(pulseInstance.value).toBe(5);
    });

    it('should navigate previous value', () => {
      pulseInstance.value = 5;  // value = 5
      pulseInstance.value = 10; // value = 10
      // Current index should be at 2 (value = 10)

      devTools.previousValue(); // Should go to index 1 (value = 5)
      expect(pulseInstance.value).toBe(5);
    });

    it('should navigate next value', () => {
      pulseInstance.value = 5;
      pulseInstance.value = 10;
      devTools.previousValue();

      devTools.nextValue();
      expect(pulseInstance.value).toBe(10);
    });

    it('should reset to initial value', () => {
      pulseInstance.value = 5;
      pulseInstance.value = 10;

      devTools.reset();
      expect(pulseInstance.value).toBe(0);
    });
  });

  describe('getCurrentValue', () => {
    it('should return current value', () => {
      pulseInstance.value = 5;
      const value = devTools.getCurrentValue();
      expect(value).toBe(5);
    });
  });

  describe('getValueHistory', () => {
    it('should return value history', () => {
      pulseInstance.value = 5;
      const history = devTools.getValueHistory();
      expect(history.length).toBeGreaterThan(1);
    });
  });

  describe('getValueAt', () => {
    it('should return value at specific index', () => {
      pulseInstance.value = 5;
      const value = devTools.getValueAt(0);
      expect(value).toBe(0);
    });
  });

  describe('clearHistory', () => {
    it('should clear history', () => {
      pulseInstance.value = 5;
      devTools.clearHistory();

      const history = devTools.getValueHistory();
      expect(history.length).toBeLessThanOrEqual(1); // May keep initial value
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
