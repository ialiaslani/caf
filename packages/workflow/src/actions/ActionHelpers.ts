/**
 * Action helpers and utilities for CAF Workflow.
 * 
 * Provides helper functions to create and compose workflow actions.
 * 
 * @example
 * ```ts
 * import { log, updateContext, callService, sequence, parallel } from '@c-a-f/workflow/actions';
 * 
 * const action = sequence(
 *   log('Processing order...'),
 *   updateContext({ status: 'processing' }),
 *   callService(async (ctx) => {
 *     await orderService.process(ctx.orderId);
 *   })
 * );
 * ```
 */

import type { WorkflowAction, WorkflowContext } from '../IWorkflow';

/**
 * Create an action that logs a message.
 */
export function log(message: string | ((context: WorkflowContext) => string)): WorkflowAction {
  return async (context: WorkflowContext) => {
    const msg = typeof message === 'function' ? message(context) : message;
    console.log(`[Workflow] ${msg}`, context);
  };
}

/**
 * Create an action that updates the workflow context.
 * Note: This should be used with WorkflowManager.updateContext() for proper reactivity.
 */
export function updateContext(updates: Partial<WorkflowContext> | ((context: WorkflowContext) => Partial<WorkflowContext>)): WorkflowAction {
  return async (context: WorkflowContext) => {
    const updatesToApply = typeof updates === 'function' ? updates(context) : updates;
    Object.assign(context, updatesToApply);
  };
}

/**
 * Create an action that calls an async service function.
 */
export function callService(serviceFn: (context: WorkflowContext) => Promise<void> | void): WorkflowAction {
  return async (context: WorkflowContext) => {
    await serviceFn(context);
  };
}

/**
 * Create an action that executes multiple actions in sequence.
 */
export function sequence(...actions: WorkflowAction[]): WorkflowAction {
  return async (context: WorkflowContext) => {
    for (const action of actions) {
      await action(context);
    }
  };
}

/**
 * Create an action that executes multiple actions in parallel.
 */
export function parallel(...actions: WorkflowAction[]): WorkflowAction {
  return async (context: WorkflowContext) => {
    await Promise.all(actions.map(action => action(context)));
  };
}

/**
 * Create an action that conditionally executes another action.
 */
export function conditional(
  condition: (context: WorkflowContext) => boolean | Promise<boolean>,
  trueAction: WorkflowAction,
  falseAction?: WorkflowAction
): WorkflowAction {
  return async (context: WorkflowContext) => {
    const result = await condition(context);
    if (result) {
      await trueAction(context);
    } else if (falseAction) {
      await falseAction(context);
    }
  };
}

/**
 * Create an action that retries another action on failure.
 */
export function retry(
  action: WorkflowAction,
  maxAttempts: number = 3,
  delay: number = 1000
): WorkflowAction {
  return async (context: WorkflowContext) => {
    let lastError: Error | undefined;
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        await action(context);
        return; // Success
      } catch (error) {
        lastError = error as Error;
        if (attempt < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    throw lastError || new Error('Action failed after retries');
  };
}

/**
 * Create an action that times out after a specified duration.
 */
export function timeout(action: WorkflowAction, ms: number): WorkflowAction {
  return async (context: WorkflowContext) => {
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error(`Action timed out after ${ms}ms`)), ms);
    });
    
    await Promise.race([action(context), timeoutPromise]);
  };
}
