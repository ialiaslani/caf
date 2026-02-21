/**
 * Guard combinators and utilities for CAF Workflow.
 * 
 * Provides helper functions to combine and compose guards.
 * 
 * @example
 * ```ts
 * import { and, or, not, always, never } from '@c-a-f/workflow/guards';
 * 
 * const guard = and(
 *   (ctx) => ctx.userRole === 'admin',
 *   or(
 *     (ctx) => ctx.orderAmount > 1000,
 *     (ctx) => ctx.isVip === true
 *   )
 * );
 * ```
 */

import type { WorkflowGuard, WorkflowContext } from '../IWorkflow';

/**
 * Combine multiple guards with AND logic.
 * All guards must return true for the combined guard to pass.
 */
export function and(...guards: WorkflowGuard[]): WorkflowGuard {
  return async (context: WorkflowContext): Promise<boolean> => {
    for (const guard of guards) {
      const result = await guard(context);
      if (!result) {
        return false;
      }
    }
    return true;
  };
}

/**
 * Combine multiple guards with OR logic.
 * At least one guard must return true for the combined guard to pass.
 */
export function or(...guards: WorkflowGuard[]): WorkflowGuard {
  return async (context: WorkflowContext): Promise<boolean> => {
    for (const guard of guards) {
      const result = await guard(context);
      if (result) {
        return true;
      }
    }
    return false;
  };
}

/**
 * Negate a guard.
 * Returns true if the guard returns false, and vice versa.
 */
export function not(guard: WorkflowGuard): WorkflowGuard {
  return async (context: WorkflowContext): Promise<boolean> => {
    const result = await guard(context);
    return !result;
  };
}

/**
 * Guard that always returns true.
 */
export function always(): WorkflowGuard {
  return () => Promise.resolve(true);
}

/**
 * Guard that always returns false.
 */
export function never(): WorkflowGuard {
  return () => Promise.resolve(false);
}

/**
 * Guard that checks if a context property equals a value.
 */
export function equals(property: string, value: unknown): WorkflowGuard {
  return (context: WorkflowContext) => {
    return Promise.resolve(context[property] === value);
  };
}

/**
 * Guard that checks if a context property exists.
 */
export function exists(property: string): WorkflowGuard {
  return (context: WorkflowContext) => {
    return Promise.resolve(property in context && context[property] != null);
  };
}

/**
 * Guard that checks if a context property matches a condition.
 */
export function matches(property: string, predicate: (value: unknown) => boolean): WorkflowGuard {
  return (context: WorkflowContext) => {
    return Promise.resolve(predicate(context[property]));
  };
}
