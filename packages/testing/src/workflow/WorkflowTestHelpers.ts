/**
 * Test helpers for Workflow.
 * 
 * Provides utilities for testing WorkflowManager instances.
 * 
 * @example
 * ```ts
 * import { createWorkflowTester, waitForWorkflowState } from '@c-a-f/testing/workflow';
 * import { WorkflowManager, WorkflowDefinition } from '@c-a-f/workflow';
 * 
 * const workflow = new WorkflowManager(definition);
 * const tester = createWorkflowTester(workflow);
 * 
 * await tester.dispatch('approve');
 * await waitForWorkflowState(workflow, 'approved');
 * ```
 */

import type { WorkflowManager, WorkflowStateId, WorkflowStateSnapshot } from '@c-a-f/workflow';

/**
 * Workflow tester utility.
 */
export class WorkflowTester {
  private stateHistory: WorkflowStateSnapshot[] = [];
  private listener: ((snapshot: WorkflowStateSnapshot) => void) | null = null;

  constructor(public readonly workflow: WorkflowManager) {
    this.stateHistory.push(workflow.getState());
    this.listener = (snapshot: WorkflowStateSnapshot) => {
      this.stateHistory.push(snapshot);
    };
    workflow.subscribe(this.listener);
  }

  /**
   * Get the current state snapshot.
   */
  getState(): WorkflowStateSnapshot {
    return this.workflow.getState();
  }

  /**
   * Get the current state ID.
   */
  getCurrentState(): WorkflowStateId {
    return this.workflow.getState().currentState;
  }

  /**
   * Get the state history.
   */
  getStateHistory(): WorkflowStateSnapshot[] {
    return [...this.stateHistory];
  }

  /**
   * Dispatch an event and wait for transition.
   */
  async dispatch(event: string, payload?: unknown): Promise<boolean> {
    return await this.workflow.dispatch(event, payload);
  }

  /**
   * Check if a transition is available.
   */
  canTransition(event: string): boolean {
    return this.workflow.canTransition(event);
  }

  /**
   * Reset the workflow.
   */
  async reset(): Promise<void> {
    await this.workflow.reset();
  }

  /**
   * Update workflow context.
   */
  updateContext(context: Record<string, unknown>): void {
    this.workflow.updateContext(context);
  }

  /**
   * Get available transitions from current state.
   */
  getAvailableTransitions(): Record<string, unknown> {
    return this.workflow.getAvailableTransitions();
  }

  /**
   * Cleanup: unsubscribe from state changes.
   */
  cleanup(): void {
    if (this.listener) {
      this.workflow.unsubscribe(this.listener);
      this.listener = null;
    }
  }
}

/**
 * Create a Workflow tester instance.
 */
export function createWorkflowTester(workflow: WorkflowManager): WorkflowTester {
  return new WorkflowTester(workflow);
}

/**
 * Wait for workflow to reach a specific state.
 */
export function waitForWorkflowState(
  workflow: WorkflowManager,
  targetState: WorkflowStateId,
  timeout: number = 5000
): Promise<WorkflowStateSnapshot> {
  return new Promise((resolve, reject) => {
    // Check current state first
    const currentState = workflow.getState();
    if (currentState.currentState === targetState) {
      resolve(currentState);
      return;
    }

    const listener = (snapshot: WorkflowStateSnapshot) => {
      if (snapshot.currentState === targetState) {
        clearTimeout(timer);
        workflow.unsubscribe(listener);
        resolve(snapshot);
      }
    };
    const timer = setTimeout(() => {
      workflow.unsubscribe(listener);
      reject(new Error(`Timeout waiting for workflow state '${targetState}' (${timeout}ms)`));
    }, timeout);
    workflow.subscribe(listener);
  });
}

/**
 * Wait for workflow to reach a final state.
 */
export function waitForFinalState(
  workflow: WorkflowManager,
  timeout: number = 5000
): Promise<WorkflowStateSnapshot> {
  return new Promise((resolve, reject) => {
    // Check current state first
    const currentState = workflow.getState();
    if (currentState.isFinal) {
      resolve(currentState);
      return;
    }

    const listener = (snapshot: WorkflowStateSnapshot) => {
      if (snapshot.isFinal) {
        clearTimeout(timer);
        workflow.unsubscribe(listener);
        resolve(snapshot);
      }
    };
    const timer = setTimeout(() => {
      workflow.unsubscribe(listener);
      reject(new Error(`Timeout waiting for final state (${timeout}ms)`));
    }, timeout);
    workflow.subscribe(listener);
  });
}
