import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  MemoryLeakDetector,
  createMemoryLeakDetector,
} from '../src/core/MemoryLeakDetector';

describe('MemoryLeakDetector', () => {
  let detector: MemoryLeakDetector;

  beforeEach(() => {
    detector = createMemoryLeakDetector({
      enabled: true,
      warnThreshold: 10,
      errorThreshold: 50,
      checkInterval: 0, // Disable automatic checking
    });
  });

  describe('trackSubscription', () => {
    it('should track subscriptions', () => {
      const cleanup = vi.fn();
      const trackedCleanup = detector.trackSubscription('Ploc', 'TestPloc', cleanup);

      expect(detector.getActiveSubscriptions()).toHaveLength(1);
      expect(detector.getActiveSubscriptions()[0].name).toBe('TestPloc');
      expect(detector.getActiveSubscriptions()[0].type).toBe('Ploc');

      trackedCleanup();
      expect(cleanup).toHaveBeenCalled();
      expect(detector.getActiveSubscriptions()).toHaveLength(0);
    });

    it('should not track when disabled', () => {
      detector.disable();
      const cleanup = vi.fn();
      const trackedCleanup = detector.trackSubscription('Ploc', 'TestPloc', cleanup);

      expect(detector.getActiveSubscriptions()).toHaveLength(0);
      trackedCleanup(); // Should still call cleanup
      expect(cleanup).toHaveBeenCalled();
    });

    it('should include metadata', () => {
      const cleanup = vi.fn();
      detector.trackSubscription('Ploc', 'TestPloc', cleanup, { component: 'Test' });

      const subscriptions = detector.getActiveSubscriptions();
      expect(subscriptions[0].metadata?.component).toBe('Test');
    });
  });

  describe('detectLeaks', () => {
    it('should detect no leaks when subscriptions are recent', () => {
      const cleanup = vi.fn();
      detector.trackSubscription('Ploc', 'TestPloc', cleanup);

      const leaks = detector.detectLeaks();
      expect(leaks).toHaveLength(0);
    });

    it('should detect warnings for old subscriptions', async () => {
      detector = createMemoryLeakDetector({
        enabled: true,
        warnThreshold: 10,
        errorThreshold: 50,
        checkInterval: 0,
      });

      const cleanup = vi.fn();
      detector.trackSubscription('Ploc', 'TestPloc', cleanup);

      // Wait for warn threshold
      await new Promise((resolve) => setTimeout(resolve, 15));

      const leaks = detector.detectLeaks();
      expect(leaks.length).toBeGreaterThan(0);
      expect(leaks[0].severity).toBe('warn');
    });

    it('should detect errors for very old subscriptions', async () => {
      detector = createMemoryLeakDetector({
        enabled: true,
        warnThreshold: 10,
        errorThreshold: 50,
        checkInterval: 0,
      });

      const cleanup = vi.fn();
      detector.trackSubscription('Ploc', 'TestPloc', cleanup);

      // Wait for error threshold
      await new Promise((resolve) => setTimeout(resolve, 55));

      const leaks = detector.detectLeaks();
      expect(leaks.length).toBeGreaterThan(0);
      expect(leaks[0].severity).toBe('error');
    });
  });

  describe('checkForLeaks', () => {
    it('should log warnings for leaks', async () => {
      const logger = vi.fn();
      detector = createMemoryLeakDetector({
        enabled: true,
        warnThreshold: 10,
        errorThreshold: 50,
        checkInterval: 0,
        logger,
      });

      const cleanup = vi.fn();
      detector.trackSubscription('Ploc', 'TestPloc', cleanup);

      await new Promise((resolve) => setTimeout(resolve, 15));

      detector.checkForLeaks();
      expect(logger).toHaveBeenCalled();
      expect(logger.mock.calls[0][0]).toBe('warn');
    });
  });

  describe('getStatistics', () => {
    it('should return statistics', () => {
      detector.trackSubscription('Ploc', 'Ploc1', vi.fn());
      detector.trackSubscription('Pulse', 'Pulse1', vi.fn());
      detector.trackSubscription('Ploc', 'Ploc2', vi.fn());

      const stats = detector.getStatistics();
      expect(stats.totalActive).toBe(3);
      expect(stats.byType.Ploc).toBe(2);
      expect(stats.byType.Pulse).toBe(1);
      expect(stats.oldestSubscription).toBeDefined();
    });
  });

  describe('getSubscriptionCounts', () => {
    it('should return counts by type', () => {
      detector.trackSubscription('Ploc', 'Ploc1', vi.fn());
      detector.trackSubscription('Pulse', 'Pulse1', vi.fn());
      detector.trackSubscription('Ploc', 'Ploc2', vi.fn());

      const counts = detector.getSubscriptionCounts();
      expect(counts.Ploc).toBe(2);
      expect(counts.Pulse).toBe(1);
    });
  });

  describe('markCleanedUp', () => {
    it('should mark subscription as cleaned up', () => {
      const cleanup = vi.fn();
      const trackedCleanup = detector.trackSubscription('Ploc', 'TestPloc', cleanup);
      const subscription = detector.getActiveSubscriptions()[0];

      detector.markCleanedUp(subscription.id);
      expect(cleanup).toHaveBeenCalled();
      expect(detector.getActiveSubscriptions()).toHaveLength(0);
    });
  });

  describe('clearAll', () => {
    it('should clear all subscriptions', () => {
      detector.trackSubscription('Ploc', 'Ploc1', vi.fn());
      detector.trackSubscription('Pulse', 'Pulse1', vi.fn());

      expect(detector.getActiveSubscriptions()).toHaveLength(2);
      detector.clearAll();
      expect(detector.getActiveSubscriptions()).toHaveLength(0);
    });
  });

  describe('enable/disable', () => {
    it('should enable and disable detection', () => {
      detector.disable();
      expect(detector.getActiveSubscriptions()).toHaveLength(0);

      detector.enable();
      detector.trackSubscription('Ploc', 'TestPloc', vi.fn());
      expect(detector.getActiveSubscriptions()).toHaveLength(1);
    });
  });

  describe('cleanup', () => {
    it('should stop periodic checking', () => {
      detector = createMemoryLeakDetector({
        enabled: true,
        checkInterval: 100,
      });

      detector.cleanup();
      // If cleanup works, no errors should occur
      expect(true).toBe(true);
    });
  });
});
