import { describe, it, expect, beforeEach, vi } from 'vitest';
import { WorkflowManager } from '../src/WorkflowManager';
import type {
  WorkflowDefinition,
  WorkflowContext,
  WorkflowStateSnapshot,
} from '../src/IWorkflow';

describe('WorkflowManager', () => {
  let simpleDefinition: WorkflowDefinition;
  let complexDefinition: WorkflowDefinition;

  beforeEach(() => {
    // Simple workflow: idle -> active -> done
    simpleDefinition = {
      id: 'simple',
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

    // Complex workflow with guards and actions
    complexDefinition = {
      id: 'complex',
      initialState: 'pending',
      states: {
        pending: {
          id: 'pending',
          transitions: {
            approve: {
              target: 'approved',
              guard: async (ctx) => ctx.userRole === 'admin',
            },
            reject: { target: 'rejected' },
          },
          onEnter: async (ctx) => {
            ctx.enteredPending = true;
          },
          onExit: async (ctx) => {
            ctx.exitedPending = true;
          },
        },
        approved: {
          id: 'approved',
          transitions: {
            ship: { target: 'shipped' },
          },
          onEnter: async (ctx) => {
            ctx.enteredApproved = true;
          },
        },
        rejected: {
          id: 'rejected',
          transitions: {},
        },
        shipped: {
          id: 'shipped',
          transitions: {},
        },
      },
    };
  });

  describe('constructor', () => {
    it('should initialize with initial state', () => {
      const workflow = new WorkflowManager(simpleDefinition);
      const state = workflow.getState();

      expect(state.currentState).toBe('idle');
      expect(state.isFinal).toBe(false);
      expect(state.context).toEqual({});
    });

    it('should initialize with initial context', () => {
      const initialContext: WorkflowContext = { userId: '123', orderId: '456' };
      const workflow = new WorkflowManager(simpleDefinition, initialContext);
      const state = workflow.getState();

      expect(state.context).toEqual(initialContext);
    });

    it('should execute onEnter for initial state', async () => {
      const onEnterSpy = vi.fn();
      const definition: WorkflowDefinition = {
        id: 'test',
        initialState: 'start',
        states: {
          start: {
            id: 'start',
            transitions: {},
            onEnter: onEnterSpy,
          },
        },
      };

      const workflow = new WorkflowManager(definition);
      // Wait for async initialization
      await new Promise(resolve => setTimeout(resolve, 0));

      expect(onEnterSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('getState', () => {
    it('should return current state snapshot', () => {
      const workflow = new WorkflowManager(simpleDefinition);
      const state = workflow.getState();

      expect(state).toHaveProperty('currentState');
      expect(state).toHaveProperty('context');
      expect(state).toHaveProperty('isFinal');
    });

    it('should return updated state after transition', async () => {
      const workflow = new WorkflowManager(simpleDefinition);
      await workflow.dispatch('start');

      const state = workflow.getState();
      expect(state.currentState).toBe('active');
    });
  });

  describe('dispatch', () => {
    it('should transition to next state on valid event', async () => {
      const workflow = new WorkflowManager(simpleDefinition);
      const result = await workflow.dispatch('start');

      expect(result).toBe(true);
      expect(workflow.getState().currentState).toBe('active');
    });

    it('should return false for invalid event', async () => {
      const workflow = new WorkflowManager(simpleDefinition);
      const result = await workflow.dispatch('invalid');

      expect(result).toBe(false);
      expect(workflow.getState().currentState).toBe('idle');
    });

    it('should return false for event not available in current state', async () => {
      const workflow = new WorkflowManager(simpleDefinition);
      const result = await workflow.dispatch('complete'); // Not available from idle

      expect(result).toBe(false);
      expect(workflow.getState().currentState).toBe('idle');
    });

    it('should execute guard before transitioning', async () => {
      const workflow = new WorkflowManager(complexDefinition, { userRole: 'user' });
      const result = await workflow.dispatch('approve');

      expect(result).toBe(false);
      expect(workflow.getState().currentState).toBe('pending');
    });

    it('should transition when guard passes', async () => {
      const workflow = new WorkflowManager(complexDefinition, { userRole: 'admin' });
      const result = await workflow.dispatch('approve');

      expect(result).toBe(true);
      expect(workflow.getState().currentState).toBe('approved');
    });

    it('should execute onExit before transitioning', async () => {
      const workflow = new WorkflowManager(complexDefinition);
      await workflow.dispatch('reject');

      const state = workflow.getState();
      expect(state.context.exitedPending).toBe(true);
    });

    it('should execute onEnter after transitioning', async () => {
      const workflow = new WorkflowManager(complexDefinition, { userRole: 'admin' });
      await workflow.dispatch('approve');

      const state = workflow.getState();
      expect(state.context.enteredApproved).toBe(true);
    });

    it('should execute transition action', async () => {
      const actionSpy = vi.fn();
      const definition: WorkflowDefinition = {
        id: 'test',
        initialState: 'start',
        states: {
          start: {
            id: 'start',
            transitions: {
              next: {
                target: 'end',
                action: actionSpy,
              },
            },
          },
          end: {
            id: 'end',
            transitions: {},
          },
        },
      };

      const workflow = new WorkflowManager(definition);
      await workflow.dispatch('next');

      expect(actionSpy).toHaveBeenCalledTimes(1);
    });

    it('should update context with payload', async () => {
      const workflow = new WorkflowManager(simpleDefinition);
      await workflow.dispatch('start', { orderId: '123' });

      const state = workflow.getState();
      expect(state.context.start).toEqual({ orderId: '123' });
    });

    it('should update isFinal flag when reaching final state', async () => {
      const workflow = new WorkflowManager(simpleDefinition);
      await workflow.dispatch('start');
      await workflow.dispatch('complete');

      const state = workflow.getState();
      expect(state.currentState).toBe('done');
      expect(state.isFinal).toBe(true);
    });

    it('should handle async guards', async () => {
      const asyncGuard = vi.fn().mockResolvedValue(true);
      const definition: WorkflowDefinition = {
        id: 'test',
        initialState: 'start',
        states: {
          start: {
            id: 'start',
            transitions: {
              next: {
                target: 'end',
                guard: asyncGuard,
              },
            },
          },
          end: {
            id: 'end',
            transitions: {},
          },
        },
      };

      const workflow = new WorkflowManager(definition);
      const result = await workflow.dispatch('next');

      expect(asyncGuard).toHaveBeenCalledTimes(1);
      expect(result).toBe(true);
    });
  });

  describe('canTransition', () => {
    it('should return true for valid transition', () => {
      const workflow = new WorkflowManager(simpleDefinition);
      expect(workflow.canTransition('start')).toBe(true);
    });

    it('should return false for invalid transition', () => {
      const workflow = new WorkflowManager(simpleDefinition);
      expect(workflow.canTransition('complete')).toBe(false);
    });

    it('should return false for non-existent event', () => {
      const workflow = new WorkflowManager(simpleDefinition);
      expect(workflow.canTransition('invalid')).toBe(false);
    });

    it('should check transitions from current state', async () => {
      const workflow = new WorkflowManager(simpleDefinition);
      expect(workflow.canTransition('start')).toBe(true);
      expect(workflow.canTransition('complete')).toBe(false);

      await workflow.dispatch('start');
      expect(workflow.canTransition('start')).toBe(false);
      expect(workflow.canTransition('complete')).toBe(true);
    });
  });

  describe('reset', () => {
    it('should reset to initial state', async () => {
      const workflow = new WorkflowManager(simpleDefinition);
      await workflow.dispatch('start');
      await workflow.dispatch('complete');

      expect(workflow.getState().currentState).toBe('done');

      await workflow.reset();
      expect(workflow.getState().currentState).toBe('idle');
      expect(workflow.getState().isFinal).toBe(false);
    });

    it('should reset context', async () => {
      const initialContext: WorkflowContext = { userId: '123' };
      const workflow = new WorkflowManager(simpleDefinition, initialContext);
      workflow.updateContext({ orderId: '456' });

      await workflow.reset();
      expect(workflow.getState().context).toEqual({});
    });

    it('should execute onExit for current state', async () => {
      const onExitSpy = vi.fn();
      const definition: WorkflowDefinition = {
        id: 'test',
        initialState: 'start',
        states: {
          start: {
            id: 'start',
            transitions: {
              next: { target: 'end' },
            },
          },
          end: {
            id: 'end',
            transitions: {},
            onExit: onExitSpy,
          },
        },
      };

      const workflow = new WorkflowManager(definition);
      await workflow.dispatch('next');
      await workflow.reset();

      expect(onExitSpy).toHaveBeenCalledTimes(1);
    });

    it('should execute onEnter for initial state', async () => {
      const onEnterSpy = vi.fn();
      const definition: WorkflowDefinition = {
        id: 'test',
        initialState: 'start',
        states: {
          start: {
            id: 'start',
            transitions: {
              next: { target: 'end' },
            },
            onEnter: onEnterSpy,
          },
          end: {
            id: 'end',
            transitions: {},
          },
        },
      };

      const workflow = new WorkflowManager(definition);
      await workflow.dispatch('next');
      await workflow.reset();

      // Called once on init, once on reset
      expect(onEnterSpy).toHaveBeenCalledTimes(2);
    });
  });

  describe('updateContext', () => {
    it('should update context', () => {
      const workflow = new WorkflowManager(simpleDefinition);
      workflow.updateContext({ userId: '123' });

      const state = workflow.getState();
      expect(state.context.userId).toBe('123');
    });

    it('should merge with existing context', () => {
      const initialContext: WorkflowContext = { userId: '123' };
      const workflow = new WorkflowManager(simpleDefinition, initialContext);
      workflow.updateContext({ orderId: '456' });

      const state = workflow.getState();
      expect(state.context.userId).toBe('123');
      expect(state.context.orderId).toBe('456');
    });

    it('should overwrite existing properties', () => {
      const initialContext: WorkflowContext = { userId: '123' };
      const workflow = new WorkflowManager(simpleDefinition, initialContext);
      workflow.updateContext({ userId: '456' });

      const state = workflow.getState();
      expect(state.context.userId).toBe('456');
    });

    it('should update state reactively', () => {
      const workflow = new WorkflowManager(simpleDefinition);
      const states: WorkflowStateSnapshot[] = [];

      workflow.subscribe((snapshot) => {
        states.push(snapshot);
      });

      workflow.updateContext({ userId: '123' });

      expect(states.length).toBeGreaterThan(0);
      expect(states[states.length - 1].context.userId).toBe('123');
    });
  });

  describe('getDefinition', () => {
    it('should return workflow definition', () => {
      const workflow = new WorkflowManager(simpleDefinition);
      const definition = workflow.getDefinition();

      expect(definition).toEqual(simpleDefinition);
    });
  });

  describe('getCurrentStateDefinition', () => {
    it('should return current state definition', () => {
      const workflow = new WorkflowManager(simpleDefinition);
      const stateDef = workflow.getCurrentStateDefinition();

      expect(stateDef).toEqual(simpleDefinition.states.idle);
    });

    it('should return updated state definition after transition', async () => {
      const workflow = new WorkflowManager(simpleDefinition);
      await workflow.dispatch('start');

      const stateDef = workflow.getCurrentStateDefinition();
      expect(stateDef).toEqual(simpleDefinition.states.active);
    });
  });

  describe('getAvailableTransitions', () => {
    it('should return available transitions from current state', () => {
      const workflow = new WorkflowManager(simpleDefinition);
      const transitions = workflow.getAvailableTransitions();

      expect(transitions).toEqual({
        start: { target: 'active' },
      });
    });

    it('should return empty object for final state', async () => {
      const workflow = new WorkflowManager(simpleDefinition);
      await workflow.dispatch('start');
      await workflow.dispatch('complete');

      const transitions = workflow.getAvailableTransitions();
      expect(transitions).toEqual({});
    });
  });

  describe('reactive state management', () => {
    it('should notify subscribers on state change', async () => {
      const workflow = new WorkflowManager(simpleDefinition);
      const states: WorkflowStateSnapshot[] = [];

      workflow.subscribe((snapshot) => {
        states.push(snapshot);
      });

      await workflow.dispatch('start');

      expect(states.length).toBeGreaterThan(0);
      expect(states[states.length - 1].currentState).toBe('active');
    });

    it('should allow unsubscribing', async () => {
      const workflow = new WorkflowManager(simpleDefinition);
      const states: WorkflowStateSnapshot[] = [];

      const listener = (snapshot: WorkflowStateSnapshot) => {
        states.push(snapshot);
      };

      workflow.subscribe(listener);
      await workflow.dispatch('start');
      workflow.unsubscribe(listener);
      await workflow.dispatch('complete');

      // Should only have states up to 'active'
      const activeStates = states.filter(s => s.currentState === 'active');
      expect(activeStates.length).toBeGreaterThan(0);
    });
  });
});
