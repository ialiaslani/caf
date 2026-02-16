import { Ploc } from '@caf/core';
import type {
  IWorkflow,
  WorkflowDefinition,
  WorkflowStateSnapshot,
  WorkflowEventId,
  WorkflowStateId,
  WorkflowContext,
  WorkflowState,
  WorkflowTransition,
} from './IWorkflow';

/**
 * Workflow manager built on Ploc for reactive state management.
 * 
 * Manages workflow state and transitions reactively using Ploc.
 * Subscribers are notified when workflow state changes.
 */
export class WorkflowManager extends Ploc<WorkflowStateSnapshot> implements IWorkflow {
  private definition: WorkflowDefinition;
  private context: WorkflowContext;

  constructor(definition: WorkflowDefinition, initialContext: WorkflowContext = {}) {
    super({
      currentState: definition.initialState,
      context: initialContext,
      isFinal: false,
    });
    this.definition = definition;
    this.context = { ...initialContext };
    this.initializeState();
  }

  /**
   * Initialize the initial state (execute onEnter if defined).
   */
  private async initializeState(): Promise<void> {
    const initialState = this.definition.states[this.definition.initialState];
    if (initialState?.onEnter) {
      await initialState.onEnter(this.context);
    }
    this.updateIsFinal();
  }

  /**
   * Get the current workflow state snapshot.
   */
  getState(): WorkflowStateSnapshot {
    return this.state;
  }

  /**
   * Dispatch an event to trigger a state transition.
   */
  async dispatch(event: WorkflowEventId, payload?: unknown): Promise<boolean> {
    const currentStateDef = this.definition.states[this.state.currentState];
    if (!currentStateDef) {
      return false;
    }

    const transition = currentStateDef.transitions[event];
    if (!transition) {
      return false;
    }

    // Check guard if present
    if (transition.guard) {
      const canTransition = await transition.guard(this.context);
      if (!canTransition) {
        return false;
      }
    }

    // Execute onExit action
    if (currentStateDef.onExit) {
      await currentStateDef.onExit(this.context);
    }

    // Update payload in context if provided
    if (payload !== undefined) {
      this.context = { ...this.context, [String(event)]: payload };
    }

    // Execute transition action
    if (transition.action) {
      await transition.action(this.context);
    }

    // Transition to new state
    const newStateId = transition.target;
    const newStateDef = this.definition.states[newStateId];
    if (!newStateDef) {
      return false;
    }

    // Execute onEnter action
    if (newStateDef.onEnter) {
      await newStateDef.onEnter(this.context);
    }

    // Update state reactively
    this.changeState({
      currentState: newStateId,
      context: { ...this.context },
      isFinal: this.isFinalState(newStateId),
    });

    return true;
  }

  /**
   * Check if a transition is allowed from the current state.
   * Note: This checks if the transition exists. Guards are evaluated during dispatch.
   */
  canTransition(event: WorkflowEventId): boolean {
    const currentStateDef = this.definition.states[this.state.currentState];
    if (!currentStateDef) {
      return false;
    }

    const transition = currentStateDef.transitions[event];
    return transition !== undefined;
  }

  /**
   * Reset the workflow to its initial state.
   */
  async reset(): Promise<void> {
    // Execute onExit if current state has it
    const currentStateDef = this.definition.states[this.state.currentState];
    if (currentStateDef?.onExit) {
      await currentStateDef.onExit(this.context);
    }

    // Reset context
    this.context = {};

    // Reset to initial state
    const initialState = this.definition.states[this.definition.initialState];
    if (initialState?.onEnter) {
      await initialState.onEnter(this.context);
    }

    this.changeState({
      currentState: this.definition.initialState,
      context: {},
      isFinal: false,
    });
  }

  /**
   * Update the workflow context.
   */
  updateContext(context: Partial<WorkflowContext>): void {
    this.context = { ...this.context, ...context };
    this.changeState({
      ...this.state,
      context: { ...this.context },
    });
  }

  /**
   * Get the workflow definition.
   */
  getDefinition(): WorkflowDefinition {
    return this.definition;
  }

  /**
   * Get the current state definition.
   */
  getCurrentStateDefinition(): WorkflowState | undefined {
    return this.definition.states[this.state.currentState];
  }

  /**
   * Get available transitions from the current state.
   */
  getAvailableTransitions(): Record<WorkflowEventId, WorkflowTransition> {
    const currentStateDef = this.definition.states[this.state.currentState];
    return currentStateDef?.transitions || {};
  }

  /**
   * Check if the current state is a final state.
   * A state is considered final if it has no outgoing transitions.
   */
  private isFinalState(stateId: WorkflowStateId): boolean {
    const stateDef = this.definition.states[stateId];
    if (!stateDef) {
      return false;
    }
    const transitions = Object.keys(stateDef.transitions);
    return transitions.length === 0;
  }

  /**
   * Update the isFinal flag based on current state.
   */
  private updateIsFinal(): void {
    const isFinal = this.isFinalState(this.state.currentState);
    if (this.state.isFinal !== isFinal) {
      this.changeState({
        ...this.state,
        isFinal,
      });
    }
  }
}
