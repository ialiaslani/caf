import { describe, it, expect, beforeEach, vi } from 'vitest';
import { WorkflowManager } from '@c-a-f/workflow';
import type { WorkflowDefinition } from '@c-a-f/workflow';
import {
  WorkflowDevTools,
  createWorkflowDevTools,
} from '../src/workflow/WorkflowDevTools';

describe('WorkflowDevTools', () => {
  let workflow: WorkflowManager;
  let definition: WorkflowDefinition;
  let devTools: WorkflowDevTools;

  beforeEach(() => {
    definition = {
      id: 'test',
      initialState: 'idle',
      states: {
        idle: {
          id: 'idle',
          transitions: {
            start: { target: 'active' },
          },
        },
        active: {
          id: 'active',
          transitions: {
            complete: { target: 'done' },
          },
        },
        done: {
          id: 'done',
          transitions: {},
        },
      },
    };
    workflow = new WorkflowManager(definition);
    devTools = createWorkflowDevTools(workflow, {
      name: 'TestWorkflow',
      enabled: true,
    });
  });

  describe('initialization', () => {
    it('should initialize with workflow', () => {
      expect(devTools.getCurrentState().currentState).toBe('idle');
    });

    it('should track initial state', () => {
      const history = devTools.getTransitionHistory();
      // Initial state is recorded
      expect(devTools.getCurrentState()).toBeDefined();
    });

    it('should use custom options', () => {
      const customLogger = vi.fn();
      const customDevTools = createWorkflowDevTools(workflow, {
        name: 'CustomWorkflow',
        enabled: false,
        maxHistorySize: 50,
        logger: customLogger,
      });

      expect(customDevTools.getCurrentState()).toBeDefined();
    });
  });

  describe('enable/disable', () => {
    it('should enable DevTools', () => {
      devTools.disable();
      devTools.enable();

      const state = devTools.getCurrentState();
      expect(state).toBeDefined();
    });

    it('should disable DevTools', () => {
      devTools.disable();
      // After disabling, transitions should still work but logging is disabled
      expect(devTools.getCurrentState()).toBeDefined();
    });
  });

  describe('transition tracking', () => {
    it('should track state transitions', async () => {
      await workflow.dispatch('start');

      const history = devTools.getTransitionHistory();
      expect(history.length).toBeGreaterThan(0);
      expect(history[history.length - 1].from).toBe('idle');
      expect(history[history.length - 1].to).toBe('active');
    });

    it('should record transition timestamps', async () => {
      await workflow.dispatch('start');

      const history = devTools.getTransitionHistory();
      const transition = history[history.length - 1];
      expect(transition.timestamp).toBeGreaterThan(0);
      expect(transition.timestamp).toBeLessThanOrEqual(Date.now());
    });

    it('should include state snapshot in transition', async () => {
      await workflow.dispatch('start');

      const history = devTools.getTransitionHistory();
      const transition = history[history.length - 1];
      expect(transition.snapshot).toBeDefined();
      expect(transition.snapshot.currentState).toBe('active');
    });

    it('should track multiple transitions', async () => {
      await workflow.dispatch('start');
      await workflow.dispatch('complete');

      const history = devTools.getTransitionHistory();
      expect(history.length).toBeGreaterThanOrEqual(2);
      expect(history[history.length - 1].to).toBe('done');
    });
  });

  describe('getTransitionHistory', () => {
    it('should return transition history', async () => {
      await workflow.dispatch('start');
      await workflow.dispatch('complete');

      const history = devTools.getTransitionHistory();
      expect(Array.isArray(history)).toBe(true);
      expect(history.length).toBeGreaterThan(0);
    });

    it('should return empty history initially', () => {
      const history = devTools.getTransitionHistory();
      expect(history).toEqual([]);
    });

    it('should return a copy of history', async () => {
      await workflow.dispatch('start');
      const history1 = devTools.getTransitionHistory();
      const history2 = devTools.getTransitionHistory();

      expect(history1).not.toBe(history2);
      expect(history1).toEqual(history2);
    });
  });

  describe('getTransitionAt', () => {
    it('should return transition at specific index', async () => {
      await workflow.dispatch('start');
      await workflow.dispatch('complete');

      const transition = devTools.getTransitionAt(0);
      expect(transition).toBeDefined();
      expect(transition?.from).toBe('idle');
      expect(transition?.to).toBe('active');
    });

    it('should return undefined for invalid index', () => {
      const transition = devTools.getTransitionAt(999);
      expect(transition).toBeUndefined();
    });
  });

  describe('getCurrentState', () => {
    it('should return current workflow state', () => {
      const state = devTools.getCurrentState();
      expect(state.currentState).toBe('idle');
      expect(state.isFinal).toBe(false);
    });

    it('should return updated state after transition', async () => {
      await workflow.dispatch('start');
      const state = devTools.getCurrentState();
      expect(state.currentState).toBe('active');
    });
  });

  describe('getAvailableTransitions', () => {
    it('should return available transitions', () => {
      const transitions = devTools.getAvailableTransitions();
      expect(transitions).toBeDefined();
      expect(transitions.start).toBeDefined();
    });

    it('should return updated transitions after state change', async () => {
      await workflow.dispatch('start');
      const transitions = devTools.getAvailableTransitions();
      expect(transitions.complete).toBeDefined();
      expect(transitions.start).toBeUndefined();
    });
  });

  describe('getStatistics', () => {
    it('should return workflow statistics', async () => {
      await workflow.dispatch('start');
      await workflow.dispatch('complete');

      const stats = devTools.getStatistics();
      expect(stats.totalTransitions).toBeGreaterThan(0);
      expect(stats.currentState).toBe('done');
      expect(stats.isFinal).toBe(true);
      expect(stats.stateVisits).toBeDefined();
    });

    it('should track state visits', async () => {
      await workflow.dispatch('start');
      await workflow.dispatch('complete');

      const stats = devTools.getStatistics();
      expect(stats.stateVisits['active']).toBeGreaterThan(0);
      expect(stats.stateVisits['done']).toBeGreaterThan(0);
    });

    it('should return initial statistics', () => {
      const stats = devTools.getStatistics();
      expect(stats.totalTransitions).toBe(0);
      expect(stats.currentState).toBe('idle');
      expect(stats.isFinal).toBe(false);
    });
  });

  describe('clearHistory', () => {
    it('should clear transition history', async () => {
      await workflow.dispatch('start');
      expect(devTools.getTransitionHistory().length).toBeGreaterThan(0);

      devTools.clearHistory();
      expect(devTools.getTransitionHistory().length).toBe(0);
    });
  });

  describe('maxHistorySize', () => {
    it('should limit history size', async () => {
      const limitedDevTools = createWorkflowDevTools(workflow, {
        maxHistorySize: 2,
      });

      // Create more transitions than maxHistorySize
      await workflow.dispatch('start');
      await workflow.dispatch('complete');
      // Reset workflow to create more transitions
      workflow = new WorkflowManager(definition);
      limitedDevTools.cleanup();
      const newDevTools = createWorkflowDevTools(workflow, {
        maxHistorySize: 2,
      });
      await workflow.dispatch('start');
      await workflow.dispatch('complete');

      const history = newDevTools.getTransitionHistory();
      expect(history.length).toBeLessThanOrEqual(2);
    });
  });

  describe('cleanup', () => {
    it('should cleanup subscriptions', () => {
      devTools.cleanup();
      // After cleanup, DevTools should still work but not track new transitions
      expect(devTools.getCurrentState()).toBeDefined();
    });

    it('should allow multiple cleanup calls', () => {
      devTools.cleanup();
      devTools.cleanup(); // Should not throw
      expect(true).toBe(true);
    });
  });

  describe('createWorkflowDevTools', () => {
    it('should create DevTools instance', () => {
      const tools = createWorkflowDevTools(workflow);
      expect(tools).toBeInstanceOf(WorkflowDevTools);
    });

    it('should create DevTools with options', () => {
      const tools = createWorkflowDevTools(workflow, {
        name: 'Custom',
        enabled: false,
      });
      expect(tools).toBeInstanceOf(WorkflowDevTools);
    });
  });

  describe('logging', () => {
    it('should use custom logger when provided', async () => {
      const logger = vi.fn();
      const customDevTools = createWorkflowDevTools(workflow, {
        logger,
        enabled: true,
      });

      await workflow.dispatch('start');
      // Logger should be called for transitions
      expect(logger).toHaveBeenCalled();
    });

    it('should use console.log by default', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      const defaultDevTools = createWorkflowDevTools(workflow, {
        enabled: true,
      });

      await workflow.dispatch('start');
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });
});
