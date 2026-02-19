import type { WorkflowDefinition, WorkflowContext } from '@c.a.f/workflow';

/**
 * User Creation Workflow Context
 * Extends base context with user creation specific data
 */
export interface UserCreationContext extends WorkflowContext {
  userName?: string;
  userEmail?: string;
  userData?: { name: string; email: string };
  validationErrors?: Record<string, string>;
  createdUser?: unknown;
  error?: Error;
  onCreateUser?: (user: { name: string; email: string }) => Promise<unknown>;
  onValidationComplete?: (errors: Record<string, string> | null) => void;
  onSuccess?: (user: unknown) => void;
  onError?: (error: Error) => void;
}

/**
 * User Creation Workflow
 * Manages the state machine for creating a new user
 * 
 * Flow: idle → validating → creating → success/error
 * 
 * - idle: Initial state, waiting for user input
 * - validating: Validating user input (onEnter triggers validation)
 * - creating: Creating user via API (onEnter triggers creation)
 * - success: User created successfully
 * - error: Validation or creation failed
 */
export const userCreationWorkflow: WorkflowDefinition = {
  id: 'user-creation',
  initialState: 'idle',
  states: {
    idle: {
      id: 'idle',
      label: 'Idle',
      transitions: {
        start: {
          target: 'validating',
          guard: (context: UserCreationContext) => {
            return !!(context.userName && context.userEmail);
          },
        },
      },
    },
    validating: {
      id: 'validating',
      label: 'Validating',
      transitions: {
        proceed: {
          target: 'creating',
        },
        fail: {
          target: 'error',
        },
      },
    },
    creating: {
      id: 'creating',
      label: 'Creating',
      transitions: {
        success: {
          target: 'success',
        },
        error: {
          target: 'error',
        },
        cancel: {
          target: 'idle',
        },
      },
    },
    success: {
      id: 'success',
      label: 'Success',
      transitions: {
        reset: {
          target: 'idle',
        },
      },
    },
    error: {
      id: 'error',
      label: 'Error',
      transitions: {
        retry: {
          target: 'creating',
        },
        reset: {
          target: 'idle',
        },
      },
    },
  },
};
