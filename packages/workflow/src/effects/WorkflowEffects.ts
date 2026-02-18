/**
 * Workflow effects system for CAF Workflow.
 * 
 * Provides reactive effects that run automatically when workflow state changes.
 * Effects are side-effect handlers that respond to state transitions.
 * 
 * @example
 * ```ts
 * import { WorkflowManager } from '@c.a.f/workflow';
 * import { createEffect, onStateEnter, onStateExit, onTransition } from '@c.a.f/workflow/effects';
 * 
 * const workflow = new WorkflowManager(definition);
 * 
 * // Effect that runs when entering 'approved' state
 * createEffect(workflow, onStateEnter('approved', async (snapshot) => {
 *   await sendNotification(snapshot.context.orderId);
 * }));
 * 
 * // Effect that runs on any transition
 * createEffect(workflow, onTransition(async (from, to, snapshot) => {
 *   console.log(`Transitioned from ${from} to ${to}`);
 * }));
 * ```
 */

import type { WorkflowStateSnapshot, WorkflowStateId } from '../IWorkflow';

/**
 * Workflow manager interface for effects.
 * Effects need access to subscribe and unsubscribe methods.
 */
interface IWorkflowManager {
  subscribe(listener: (snapshot: WorkflowStateSnapshot) => void): void;
  unsubscribe(listener: (snapshot: WorkflowStateSnapshot) => void): void;
  getState(): WorkflowStateSnapshot;
}

/**
 * Effect handler function.
 */
export type EffectHandler = (snapshot: WorkflowStateSnapshot) => void | Promise<void>;

/**
 * Transition effect handler function.
 */
export type TransitionEffectHandler = (
  from: WorkflowStateId,
  to: WorkflowStateId,
  snapshot: WorkflowStateSnapshot
) => void | Promise<void>;

/**
 * Effect subscription (unsubscribe function).
 */
export type EffectSubscription = () => void;

/**
 * Create a workflow effect that runs when a specific state is entered.
 */
export function onStateEnter(
  stateId: WorkflowStateId,
  handler: EffectHandler
): (workflow: IWorkflowManager) => EffectSubscription {
  return (workflow: IWorkflowManager) => {
    // Get initial state from workflow
    const initialState = workflow.getState()?.currentState ?? null;
    let previousState: WorkflowStateId | null = initialState;

    const listener = (snapshot: WorkflowStateSnapshot) => {
      const currentState = snapshot.currentState;

      // Check if we just entered the target state
      if (previousState !== stateId && currentState === stateId) {
        handler(snapshot);
      }

      previousState = currentState;
    };

    workflow.subscribe(listener);

    return () => {
      workflow.unsubscribe(listener);
    };
  };
}

/**
 * Create a workflow effect that runs when a specific state is exited.
 */
export function onStateExit(
  stateId: WorkflowStateId,
  handler: EffectHandler
): (workflow: IWorkflowManager) => EffectSubscription {
  return (workflow: IWorkflowManager) => {
    // Get initial state from workflow
    const initialState = workflow.getState()?.currentState ?? null;
    let previousState: WorkflowStateId | null = initialState;

    const listener = (snapshot: WorkflowStateSnapshot) => {
      const currentState = snapshot.currentState;

      // Check if we just exited the target state
      if (previousState === stateId && currentState !== stateId) {
        handler(snapshot);
      }

      previousState = currentState;
    };

    workflow.subscribe(listener);

    return () => {
      workflow.unsubscribe(listener);
    };
  };
}

/**
 * Create a workflow effect that runs on any state transition.
 */
export function onTransition(
  handler: TransitionEffectHandler
): (workflow: IWorkflowManager) => EffectSubscription {
  return (workflow: IWorkflowManager) => {
    // Get initial state from workflow
    const initialState = workflow.getState()?.currentState ?? null;
    let previousState: WorkflowStateId | null = initialState;

    const listener = (snapshot: WorkflowStateSnapshot) => {
      const currentState = snapshot.currentState;

      // Check if state changed (skip initial state notification)
      if (previousState !== null && previousState !== currentState) {
        handler(previousState, currentState, snapshot);
      }

      previousState = currentState;
    };

    workflow.subscribe(listener);

    return () => {
      workflow.unsubscribe(listener);
    };
  };
}

/**
 * Create a workflow effect that runs when workflow reaches a final state.
 */
export function onFinalState(handler: EffectHandler): (workflow: IWorkflowManager) => EffectSubscription {
  return (workflow: IWorkflowManager) => {
    const listener = (snapshot: WorkflowStateSnapshot) => {
      if (snapshot.isFinal) {
        handler(snapshot);
      }
    };

    workflow.subscribe(listener);

    return () => {
      workflow.unsubscribe(listener);
    };
  };
}

/**
 * Create a workflow effect that runs on every state change.
 */
export function onStateChange(handler: EffectHandler): (workflow: IWorkflowManager) => EffectSubscription {
  return (workflow: IWorkflowManager) => {
    // Trigger handler with initial state immediately
    const initialState = workflow.getState();
    if (initialState) {
      handler(initialState);
    }

    workflow.subscribe(handler);

    return () => {
      workflow.unsubscribe(handler);
    };
  };
}

/**
 * Create and register a workflow effect.
 * Returns an unsubscribe function.
 */
export function createEffect(
  workflow: IWorkflowManager,
  effectFactory: (workflow: IWorkflowManager) => EffectSubscription
): EffectSubscription {
  return effectFactory(workflow);
}

/**
 * Create multiple effects at once.
 * Returns an unsubscribe function that unsubscribes all effects.
 */
export function createEffects(
  workflow: IWorkflowManager,
  ...effectFactories: Array<(workflow: IWorkflowManager) => EffectSubscription>
): EffectSubscription {
  const subscriptions = effectFactories.map(factory => factory(workflow));

  return () => {
    subscriptions.forEach(unsubscribe => unsubscribe());
  };
}
