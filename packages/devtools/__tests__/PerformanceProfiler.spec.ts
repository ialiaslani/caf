import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  PerformanceProfiler,
  createPerformanceProfiler,
  measureExecution,
  measureSync,
} from '../src/core/PerformanceProfiler';

describe('PerformanceProfiler', () => {
  let profiler: PerformanceProfiler;

  beforeEach(() => {
    profiler = createPerformanceProfiler({
      enabled: true,
      trackSlowOperations: false, // Disable for cleaner tests
    });
  });

  describe('measureExecution', () => {
    it('should measure async function execution time', async () => {
      const result = await profiler.measureExecution('test', async () => {
        await new Promise((resolve) => setTimeout(resolve, 10));
        return 'done';
      });

      expect(result).toBe('done');

      const report = profiler.getReport();
      expect(report.totalMeasurements).toBe(1);
      expect(report.byType.execution).toHaveLength(1);
      expect(report.byType.execution[0].name).toBe('test');
      expect(report.byType.execution[0].duration).toBeGreaterThan(0);
    });

    it('should handle errors in async functions', async () => {
      await expect(
        profiler.measureExecution('errorTest', async () => {
          throw new Error('test error');
        })
      ).rejects.toThrow('test error');

      const report = profiler.getReport();
      expect(report.totalMeasurements).toBe(1);
    });
  });

  describe('measureSync', () => {
    it('should measure synchronous function execution time', () => {
      const result = profiler.measureSync('syncTest', () => {
        return 42;
      });

      expect(result).toBe(42);

      const report = profiler.getReport();
      expect(report.totalMeasurements).toBe(1);
      expect(report.byType.execution).toHaveLength(1);
      expect(report.byType.execution[0].name).toBe('syncTest');
    });

    it('should handle errors in sync functions', () => {
      expect(() => {
        profiler.measureSync('errorSync', () => {
          throw new Error('sync error');
        });
      }).toThrow('sync error');

      const report = profiler.getReport();
      expect(report.totalMeasurements).toBe(1);
    });
  });

  describe('startMeasure', () => {
    it('should track manual measurements', () => {
      const endMeasure = profiler.startMeasure('manual', 'execution');
      endMeasure();

      const report = profiler.getReport();
      expect(report.totalMeasurements).toBe(1);
      expect(report.byType.execution).toHaveLength(1);
    });

    it('should track render measurements', () => {
      const endRender = profiler.measureRender('Component');
      endRender();

      const report = profiler.getReport();
      expect(report.totalMeasurements).toBe(1);
      expect(report.byType.render).toHaveLength(1);
      expect(report.byType.render[0].name).toBe('Component');
    });
  });

  describe('recordCustomMeasurement', () => {
    it('should record custom measurements', () => {
      profiler.recordCustomMeasurement('custom', 50, { test: true });

      const report = profiler.getReport();
      expect(report.totalMeasurements).toBe(1);
      expect(report.byType.custom).toHaveLength(1);
      expect(report.byType.custom[0].duration).toBe(50);
      expect(report.byType.custom[0].metadata?.test).toBe(true);
    });
  });

  describe('getReport', () => {
    it('should return empty report when no measurements', () => {
      const report = profiler.getReport();

      expect(report.totalMeasurements).toBe(0);
      expect(report.averageDuration).toBe(0);
      expect(report.minDuration).toBe(0);
      expect(report.maxDuration).toBe(0);
      expect(report.slowOperations).toHaveLength(0);
    });

    it('should calculate statistics correctly', async () => {
      await profiler.measureExecution('test1', async () => {
        await new Promise((resolve) => setTimeout(resolve, 10));
      });
      await profiler.measureExecution('test2', async () => {
        await new Promise((resolve) => setTimeout(resolve, 20));
      });

      const report = profiler.getReport();
      expect(report.totalMeasurements).toBe(2);
      expect(report.averageDuration).toBeGreaterThan(0);
      expect(report.minDuration).toBeGreaterThan(0);
      expect(report.maxDuration).toBeGreaterThan(report.minDuration);
    });

    it('should group measurements by name', async () => {
      await profiler.measureExecution('test', async () => {});
      await profiler.measureExecution('test', async () => {});

      const report = profiler.getReport();
      expect(report.byName.test).toHaveLength(2);
    });
  });

  describe('getStatisticsFor', () => {
    it('should return null for non-existent operation', () => {
      const stats = profiler.getStatisticsFor('nonexistent');
      expect(stats).toBeNull();
    });

    it('should return statistics for specific operation', async () => {
      await profiler.measureExecution('test', async () => {
        await new Promise((resolve) => setTimeout(resolve, 10));
      });
      await profiler.measureExecution('test', async () => {
        await new Promise((resolve) => setTimeout(resolve, 20));
      });

      const stats = profiler.getStatisticsFor('test');
      expect(stats).not.toBeNull();
      expect(stats?.count).toBe(2);
      expect(stats?.averageDuration).toBeGreaterThan(0);
      expect(stats?.minDuration).toBeGreaterThan(0);
      expect(stats?.maxDuration).toBeGreaterThan(stats?.minDuration!);
    });
  });

  describe('getSlowOperations', () => {
    it('should return slow operations', async () => {
      profiler = createPerformanceProfiler({
        enabled: true,
        slowThreshold: 10,
      });

      await profiler.measureExecution('fast', async () => {
        await new Promise((resolve) => setTimeout(resolve, 5));
      });
      await profiler.measureExecution('slow', async () => {
        await new Promise((resolve) => setTimeout(resolve, 50));
      });

      const slowOps = profiler.getSlowOperations();
      expect(slowOps.length).toBeGreaterThan(0);
      expect(slowOps[0].name).toBe('slow');
    });

    it('should use custom threshold', async () => {
      await profiler.measureExecution('test', async () => {
        await new Promise((resolve) => setTimeout(resolve, 50));
      });

      const slowOps = profiler.getSlowOperations(100);
      expect(slowOps).toHaveLength(0);
    });
  });

  describe('trackSlowOperations', () => {
    it('should log slow operations', async () => {
      const logger = vi.fn();
      profiler = createPerformanceProfiler({
        enabled: true,
        trackSlowOperations: true,
        slowThreshold: 10,
        logger,
      });

      await profiler.measureExecution('slow', async () => {
        await new Promise((resolve) => setTimeout(resolve, 50));
      });

      expect(logger).toHaveBeenCalled();
      expect(logger.mock.calls[0][0]).toContain('Slow operation detected');
    });
  });

  describe('clear', () => {
    it('should clear all measurements', async () => {
      await profiler.measureExecution('test', async () => {});
      expect(profiler.getReport().totalMeasurements).toBe(1);

      profiler.clear();
      expect(profiler.getReport().totalMeasurements).toBe(0);
    });
  });

  describe('enable/disable', () => {
    it('should not measure when disabled', () => {
      profiler.disable();
      profiler.measureSync('test', () => {});

      expect(profiler.getReport().totalMeasurements).toBe(0);

      profiler.enable();
      profiler.measureSync('test', () => {});

      expect(profiler.getReport().totalMeasurements).toBe(1);
    });
  });

  describe('convenience functions', () => {
    it('measureExecution should work standalone', async () => {
      const result = await measureExecution('standalone', async () => {
        return 'done';
      });

      expect(result).toBe('done');
    });

    it('measureSync should work standalone', () => {
      const result = measureSync('standaloneSync', () => {
        return 42;
      });

      expect(result).toBe(42);
    });
  });
});
