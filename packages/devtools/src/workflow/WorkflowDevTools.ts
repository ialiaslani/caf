/**
 * DevTools middleware for Workflow.
 * 
 * Provides debugging utilities for WorkflowManager instances including
 * state transition tracking, transition history, and workflow inspection.
 * 
 * @example
 * ```ts
 * import { createWorkflowDevTools } from '@c.a.f/devtools/workflow';
 * import { WorkflowManager } from '@c.a.f/workflow';
 * 
 * const workflow = new WorkflowManager(definition);
 * const devTools = createWorkflowDevTools(workflow, { name: 'OrderWorkflow' });
 * 
 * devTools.enable();
 * await workflow.dispatch('approve');
 * ```
 */

import type { WorkflowManager, WorkflowStateId, WorkflowStateSnapshot } from '@c.a.f/workflow';

export interface WorkflowDevToolsOptions {
  /** Name for this Workflow instance (for logging) */
  name?: string;
  /** Enable logging by default */
  enabled?: boolean;
  /** Maximum history size */
  maxHistorySize?: number;
  /** Custom logger function */
  logger?: (message: string, data?: unknown) => void;
}

interface TransitionSnapshot {
  from: WorkflowStateId;
  to: WorkflowStateId;
  event?: string;
  timestamp: number;
  snapshot: WorkflowStateSnapshot;
}

/**
 * DevTools for WorkflowManager instances.
 */
export class WorkflowDevTools {
  private transitionHistory: TransitionSnapshot[] = [];
  private currentIndex: number = -1;
  private enabled: boolean;
  private unsubscribe: (() => void) | null = null;
  private maxHistorySize: number;
  private previousState: WorkflowStateId | null = null;
  private listener: ((snapshot: WorkflowStateSnapshot) => void) | null = null;

  constructor(
    private workflow: WorkflowManager,
    private options: WorkflowDevToolsOptions = {}
  ) {
    this.enabled = options.enabled ?? false;
    this.maxHistorySize = options.maxHistorySize ?? 100;
    this.initialize();
  }

  private initialize(): void {
    // Record initial state
    const initialState = this.workflow.getState();
    this.previousState = initialState.currentState;

    // Subscribe to state changes
    this.listener = (snapshot: WorkflowStateSnapshot) => {
      if (this.enabled && this.previousState !== null) {
        this.recordTransition(this.previousState, snapshot.currentState, snapshot);
      }
      this.previousState = snapshot.currentState;
    };
    this.workflow.subscribe(this.listener);
    this.unsubscribe = () => {
      if (this.listener) {
        this.workflow.unsubscribe(this.listener);
        this.listener = null;
      }
    };
  }

  private recordTransition(
    from: WorkflowStateId,
    to: WorkflowStateId,
    snapshot: WorkflowStateSnapshot,
    event?: string
  ): void {
    const transitionSnapshot: TransitionSnapshot = {
      from,
      to,
      event,
      timestamp: Date.now(),
      snapshot: { ...snapshot },
    };

    // Remove future history if we're in the middle of history
    if (this.currentIndex < this.transitionHistory.length - 1) {
      this.transitionHistory = this.transitionHistory.slice(0, this.currentIndex + 1);
    }

    this.transitionHistory.push(transitionSnapshot);
    this.currentIndex = this.transitionHistory.length - 1;

    // Limit history size
    if (this.transitionHistory.length > this.maxHistorySize) {
      this.transitionHistory.shift();
      this.currentIndex--;
    }

    // Log transition
    if (this.enabled) {
      this.log(`[${this.options.name || 'Workflow'}] Transition: ${from} → ${to}`, {
        from,
        to,
        event,
        timestamp: new Date(transitionSnapshot.timestamp).toISOString(),
        context: snapshot.context,
        isFinal: snapshot.isFinal,
      });
    }
  }

  private log(message: string, data?: unknown): void {
    if (this.options.logger) {
      this.options.logger(message, data);
    } else {
      console.log(message, data);
    }
  }

  /**
   * Enable DevTools logging.
   */
  enable(): void {
    this.enabled = true;
    this.log(`[${this.options.name || 'Workflow'}] DevTools enabled`);
  }

  /**
   * Disable DevTools logging.
   */
  disable(): void {
    this.enabled = false;
    this.log(`[${this.options.name || 'Workflow'}] DevTools disabled`);
  }

  /**
   * Get the current state snapshot.
   */
  getCurrentState(): WorkflowStateSnapshot {
    return this.workflow.getState();
  }

  /**
   * Get transition history.
   */
  getTransitionHistory(): TransitionSnapshot[] {
    return [...this.transitionHistory];
  }

  /**
   * Get transition at a specific index.
   */
  getTransitionAt(index: number): TransitionSnapshot | undefined {
    return this.transitionHistory[index];
  }

  /**
   * Get available transitions from current state.
   */
  getAvailableTransitions(): Record<string, unknown> {
    return this.workflow.getAvailableTransitions();
  }

  /**
   * Get workflow statistics.
   */
  getStatistics(): {
    totalTransitions: number;
    currentState: WorkflowStateId;
    isFinal: boolean;
    stateVisits: Record<string, number>;
  } {
    const stateVisits: Record<string, number> = {};
    
    this.transitionHistory.forEach((transition) => {
      stateVisits[String(transition.to)] = (stateVisits[String(transition.to)] || 0) + 1;
    });

    const currentState = this.workflow.getState();

    return {
      totalTransitions: this.transitionHistory.length,
      currentState: currentState.currentState,
      isFinal: currentState.isFinal,
      stateVisits,
    };
  }

  /**
   * Clear transition history.
   */
  clearHistory(): void {
    this.transitionHistory = [];
    this.currentIndex = -1;
  }

  /**
   * Cleanup: unsubscribe from state changes.
   */
  cleanup(): void {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }
  }
}

/**
 * Create DevTools for a WorkflowManager instance.
 */
export function createWorkflowDevTools(
  workflow: WorkflowManager,
  options?: WorkflowDevToolsOptions
): WorkflowDevTools {
  return new WorkflowDevTools(workflow, options);
}
