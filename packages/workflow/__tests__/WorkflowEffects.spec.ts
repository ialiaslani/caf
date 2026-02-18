import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  onStateEnter,
  onStateExit,
  onTransition,
  onFinalState,
  onStateChange,
  createEffect,
  createEffects,
} from '../src/effects/WorkflowEffects';
import { WorkflowManager } from '../src/WorkflowManager';
import type {
  WorkflowDefinition,
  WorkflowStateSnapshot,
} from '../src/IWorkflow';

describe('WorkflowEffects', () => {
  let workflow: WorkflowManager;
  let definition: WorkflowDefinition;

  beforeEach(() => {
    definition = {
      id: 'test',
      initialState: 'start',
      states: {
        start: {
          id: 'start',
          transitions: {
            next: { target: 'middle' },
          },
        },
        middle: {
          id: 'middle',
          transitions: {
            complete: { target: 'end' },
            back: { target: 'start' },
          },
        },
        end: {
          id: 'end',
          transitions: {},
        },
      },
    };
    workflow = new WorkflowManager(definition);
  });

  describe('onStateEnter', () => {
    it('should call handler when entering target state', async () => {
      const handler = vi.fn();
      const effect = onStateEnter('middle', handler);

      createEffect(workflow, effect);
      await workflow.dispatch('next');

      expect(handler).toHaveBeenCalledTimes(1);
      expect(handler).toHaveBeenCalledWith(
        expect.objectContaining({ currentState: 'middle' })
      );
    });

    it('should not call handler when not entering target state', async () => {
      const handler = vi.fn();
      const effect = onStateEnter('end', handler);

      createEffect(workflow, effect);
      await workflow.dispatch('next');

      expect(handler).not.toHaveBeenCalled();
    });

    it('should not call handler on initial state', async () => {
      const handler = vi.fn();
      const effect = onStateEnter('start', handler);

      createEffect(workflow, effect);
      // Wait for initialization
      await new Promise(resolve => setTimeout(resolve, 0));

      expect(handler).not.toHaveBeenCalled();
    });

    it('should call handler multiple times when entering state multiple times', async () => {
      const handler = vi.fn();
      const effect = onStateEnter('start', handler);

      createEffect(workflow, effect);
      await workflow.dispatch('next');
      await workflow.dispatch('back');
      await workflow.dispatch('next');
      await workflow.dispatch('back');

      expect(handler).toHaveBeenCalledTimes(2);
    });

    it('should unsubscribe when unsubscribe is called', async () => {
      const handler = vi.fn();
      const effect = onStateEnter('middle', handler);

      const unsubscribe = createEffect(workflow, effect);
      unsubscribe();
      await workflow.dispatch('next');

      expect(handler).not.toHaveBeenCalled();
    });
  });

  describe('onStateExit', () => {
    it('should call handler when exiting target state', async () => {
      const handler = vi.fn();
      const effect = onStateExit('start', handler);

      createEffect(workflow, effect);
      await workflow.dispatch('next');

      expect(handler).toHaveBeenCalledTimes(1);
      expect(handler).toHaveBeenCalledWith(
        expect.objectContaining({ currentState: 'middle' })
      );
    });

    it('should not call handler when not exiting target state', async () => {
      const handler = vi.fn();
      const effect = onStateExit('end', handler);

      createEffect(workflow, effect);
      await workflow.dispatch('next');

      expect(handler).not.toHaveBeenCalled();
    });

    it('should call handler multiple times when exiting state multiple times', async () => {
      const handler = vi.fn();
      const effect = onStateExit('start', handler);

      createEffect(workflow, effect);
      await workflow.dispatch('next');
      await workflow.dispatch('back');
      await workflow.dispatch('next');

      expect(handler).toHaveBeenCalledTimes(2);
    });

    it('should unsubscribe when unsubscribe is called', async () => {
      const handler = vi.fn();
      const effect = onStateExit('start', handler);

      const unsubscribe = createEffect(workflow, effect);
      unsubscribe();
      await workflow.dispatch('next');

      expect(handler).not.toHaveBeenCalled();
    });
  });

  describe('onTransition', () => {
    it('should call handler on state transition', async () => {
      const handler = vi.fn();
      const effect = onTransition(handler);

      createEffect(workflow, effect);
      await workflow.dispatch('next');

      expect(handler).toHaveBeenCalledTimes(1);
      expect(handler).toHaveBeenCalledWith(
        'start',
        'middle',
        expect.objectContaining({ currentState: 'middle' })
      );
    });

    it('should not call handler on initial state', async () => {
      const handler = vi.fn();
      const effect = onTransition(handler);

      createEffect(workflow, effect);
      // Wait for initialization
      await new Promise(resolve => setTimeout(resolve, 0));

      expect(handler).not.toHaveBeenCalled();
    });

    it('should call handler with correct from and to states', async () => {
      const handler = vi.fn();
      const effect = onTransition(handler);

      createEffect(workflow, effect);
      await workflow.dispatch('next');
      await workflow.dispatch('complete');

      expect(handler).toHaveBeenCalledTimes(2);
      expect(handler).toHaveBeenNthCalledWith(
        1,
        'start',
        'middle',
        expect.any(Object)
      );
      expect(handler).toHaveBeenNthCalledWith(
        2,
        'middle',
        'end',
        expect.any(Object)
      );
    });

    it('should unsubscribe when unsubscribe is called', async () => {
      const handler = vi.fn();
      const effect = onTransition(handler);

      const unsubscribe = createEffect(workflow, effect);
      unsubscribe();
      await workflow.dispatch('next');

      expect(handler).not.toHaveBeenCalled();
    });
  });

  describe('onFinalState', () => {
    it('should call handler when reaching final state', async () => {
      const handler = vi.fn();
      const effect = onFinalState(handler);

      createEffect(workflow, effect);
      await workflow.dispatch('next');
      await workflow.dispatch('complete');

      expect(handler).toHaveBeenCalledTimes(1);
      expect(handler).toHaveBeenCalledWith(
        expect.objectContaining({ currentState: 'end', isFinal: true })
      );
    });

    it('should not call handler when not in final state', async () => {
      const handler = vi.fn();
      const effect = onFinalState(handler);

      createEffect(workflow, effect);
      await workflow.dispatch('next');

      expect(handler).not.toHaveBeenCalled();
    });

    it('should unsubscribe when unsubscribe is called', async () => {
      const handler = vi.fn();
      const effect = onFinalState(handler);

      const unsubscribe = createEffect(workflow, effect);
      unsubscribe();
      await workflow.dispatch('next');
      await workflow.dispatch('complete');

      expect(handler).not.toHaveBeenCalled();
    });
  });

  describe('onStateChange', () => {
    it('should call handler on every state change', async () => {
      const handler = vi.fn();
      const effect = onStateChange(handler);

      createEffect(workflow, effect);
      await workflow.dispatch('next');
      await workflow.dispatch('complete');

      // Called on initial state + 2 transitions
      expect(handler).toHaveBeenCalledTimes(3);
    });

    it('should call handler with current snapshot', async () => {
      const handler = vi.fn();
      const effect = onStateChange(handler);

      createEffect(workflow, effect);
      await workflow.dispatch('next');

      expect(handler).toHaveBeenCalledWith(
        expect.objectContaining({ currentState: 'middle' })
      );
    });

    it('should unsubscribe when unsubscribe is called', async () => {
      const handler = vi.fn();
      const effect = onStateChange(handler);

      const unsubscribe = createEffect(workflow, effect);
      unsubscribe();
      await workflow.dispatch('next');

      // Should only have initial state call
      expect(handler).toHaveBeenCalledTimes(1);
    });
  });

  describe('createEffect', () => {
    it('should create and return unsubscribe function', () => {
      const handler = vi.fn();
      const effect = onStateEnter('middle', handler);

      const unsubscribe = createEffect(workflow, effect);

      expect(typeof unsubscribe).toBe('function');
    });

    it('should allow multiple effects', async () => {
      const handler1 = vi.fn();
      const handler2 = vi.fn();
      const effect1 = onStateEnter('middle', handler1);
      const effect2 = onStateExit('start', handler2);

      createEffect(workflow, effect1);
      createEffect(workflow, effect2);
      await workflow.dispatch('next');

      expect(handler1).toHaveBeenCalledTimes(1);
      expect(handler2).toHaveBeenCalledTimes(1);
    });
  });

  describe('createEffects', () => {
    it('should create multiple effects at once', async () => {
      const handler1 = vi.fn();
      const handler2 = vi.fn();
      const handler3 = vi.fn();

      const unsubscribe = createEffects(
        workflow,
        onStateEnter('middle', handler1),
        onStateExit('start', handler2),
        onTransition(handler3)
      );

      await workflow.dispatch('next');

      expect(handler1).toHaveBeenCalledTimes(1);
      expect(handler2).toHaveBeenCalledTimes(1);
      expect(handler3).toHaveBeenCalledTimes(1);
    });

    it('should unsubscribe all effects when unsubscribe is called', async () => {
      const handler1 = vi.fn();
      const handler2 = vi.fn();

      const unsubscribe = createEffects(
        workflow,
        onStateEnter('middle', handler1),
        onStateExit('start', handler2)
      );

      unsubscribe();
      await workflow.dispatch('next');

      expect(handler1).not.toHaveBeenCalled();
      expect(handler2).not.toHaveBeenCalled();
    });

    it('should work with empty effects array', () => {
      const unsubscribe = createEffects(workflow);

      expect(typeof unsubscribe).toBe('function');
      unsubscribe(); // Should not throw
    });
  });

  describe('effect integration', () => {
    it('should work with async handlers', async () => {
      const handler = vi.fn().mockImplementation(async () => {
        await new Promise(resolve => setTimeout(resolve, 10));
      });
      const effect = onStateEnter('middle', handler);

      createEffect(workflow, effect);
      await workflow.dispatch('next');

      expect(handler).toHaveBeenCalledTimes(1);
    });

    it('should handle multiple transitions correctly', async () => {
      const enterHandler = vi.fn();
      const exitHandler = vi.fn();
      const transitionHandler = vi.fn();

      createEffects(
        workflow,
        onStateEnter('middle', enterHandler),
        onStateExit('middle', exitHandler),
        onTransition(transitionHandler)
      );

      await workflow.dispatch('next'); // start -> middle
      await workflow.dispatch('complete'); // middle -> end

      expect(enterHandler).toHaveBeenCalledTimes(1);
      expect(exitHandler).toHaveBeenCalledTimes(1);
      expect(transitionHandler).toHaveBeenCalledTimes(2);
    });

    it('should handle back-and-forth transitions', async () => {
      const startEnterHandler = vi.fn();
      const middleEnterHandler = vi.fn();

      createEffects(
        workflow,
        onStateEnter('start', startEnterHandler),
        onStateEnter('middle', middleEnterHandler)
      );

      await workflow.dispatch('next'); // start -> middle
      await workflow.dispatch('back'); // middle -> start
      await workflow.dispatch('next'); // start -> middle

      expect(startEnterHandler).toHaveBeenCalledTimes(1);
      expect(middleEnterHandler).toHaveBeenCalledTimes(2);
    });
  });
});
