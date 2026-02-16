/**
 * Workflow interfaces for state machines and multi-step flows.
 * 
 * Provides framework-agnostic interfaces for managing workflows.
 * Built on top of Ploc/Pulse for reactive state management.
 */

/**
 * Workflow state identifier.
 */
export type WorkflowStateId = string | number;

/**
 * Workflow event/action identifier.
 */
export type WorkflowEventId = string | number;

/**
 * Workflow context/data that flows through the workflow.
 */
export type WorkflowContext = Record<string, unknown>;

/**
 * Guard function to determine if a transition is allowed.
 */
export type WorkflowGuard = (context: WorkflowContext) => boolean | Promise<boolean>;

/**
 * Action handler that executes when entering/exiting a state or transitioning.
 */
export type WorkflowAction = (context: WorkflowContext) => void | Promise<void>;

/**
 * Definition of a workflow transition.
 */
export interface WorkflowTransition {
  /** Target state ID */
  target: WorkflowStateId;
  /** Optional guard function to check if transition is allowed */
  guard?: WorkflowGuard;
  /** Optional action to execute on transition */
  action?: WorkflowAction;
}

/**
 * Definition of a workflow state.
 */
export interface WorkflowState {
  /** Unique state identifier */
  id: WorkflowStateId;
  /** Optional label/name for the state */
  label?: string;
  /** Transitions available from this state */
  transitions: Record<WorkflowEventId, WorkflowTransition>;
  /** Optional action to execute when entering this state */
  onEnter?: WorkflowAction;
  /** Optional action to execute when exiting this state */
  onExit?: WorkflowAction;
}

/**
 * Workflow definition.
 */
export interface WorkflowDefinition {
  /** Unique workflow identifier */
  id: string;
  /** Initial state ID */
  initialState: WorkflowStateId;
  /** All states in the workflow */
  states: Record<WorkflowStateId, WorkflowState>;
}

/**
 * Current workflow state.
 */
export interface WorkflowStateSnapshot {
  /** Current state ID */
  currentState: WorkflowStateId;
  /** Workflow context/data */
  context: WorkflowContext;
  /** Whether the workflow is in a final/completed state */
  isFinal: boolean;
}

/**
 * Workflow interface.
 * 
 * Implement this interface to create workflow instances.
 * Can be built on top of Ploc for reactive state management.
 * 
 * @example
 * ```ts
 * class OrderWorkflow implements IWorkflow {
 *   private currentState: WorkflowStateId = 'pending';
 *   private context: WorkflowContext = {};
 *   
 *   getState(): WorkflowStateSnapshot {
 *     return {
 *       currentState: this.currentState,
 *       context: this.context,
 *       isFinal: this.currentState === 'completed' || this.currentState === 'cancelled',
 *     };
 *   }
 *   
 *   async dispatch(event: WorkflowEventId, payload?: unknown): Promise<boolean> {
 *     // Transition logic here
 *     return true;
 *   }
 *   
 *   canTransition(event: WorkflowEventId): boolean {
 *     // Check if transition is allowed
 *     return true;
 *   }
 * }
 * ```
 */
export interface IWorkflow {
  /**
   * Get the current workflow state snapshot.
   */
  getState(): WorkflowStateSnapshot;
  
  /**
   * Dispatch an event to trigger a state transition.
   * @param event Event identifier
   * @param payload Optional payload/data for the event
   * @returns Promise resolving to true if transition succeeded, false otherwise
   */
  dispatch(event: WorkflowEventId, payload?: unknown): Promise<boolean> | boolean;
  
  /**
   * Check if a transition is allowed from the current state.
   * @param event Event identifier
   * @returns True if transition is allowed, false otherwise
   */
  canTransition(event: WorkflowEventId): boolean | Promise<boolean>;
  
  /**
   * Reset the workflow to its initial state.
   */
  reset(): void | Promise<void>;
  
  /**
   * Update the workflow context.
   * @param context Partial context to merge with existing context
   */
  updateContext(context: Partial<WorkflowContext>): void;
  
  /**
   * Get the workflow definition.
   */
  getDefinition(): WorkflowDefinition;
}
