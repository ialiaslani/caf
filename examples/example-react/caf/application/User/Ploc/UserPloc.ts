import { Ploc } from '@c-a-f/core';
import type { User } from '../../../domain';
import { GetUsers, CreateUser } from '../index';

/**
 * User state interface
 */
export interface UserState {
  users: User[];
  selectedUser: User | null;
  error: string | null;
  loading: boolean;
  validationErrors: Record<string, string>;
}

/**
 * User management Ploc extending Ploc for reactive state management
 * Demonstrates how to use Ploc from @c-a-f/core
 */
export class UserPloc extends Ploc<UserState> {
  constructor(
    private getUsersUseCase: GetUsers,
    private createUserUseCase: CreateUser
  ) {
    super({
      users: [],
      selectedUser: null,
      error: null,
      loading: false,
      validationErrors: {},
    });
  }

  // Convenience getters for easier access
  get users(): User[] {
    return this.state.users;
  }

  get selectedUser(): User | null {
    return this.state.selectedUser;
  }

  get error(): string | null {
    return this.state.error;
  }

  get loading(): boolean {
    return this.state.loading;
  }

  get validationErrors(): Record<string, string> {
    return this.state.validationErrors;
  }

  /**
   * Load users using the UseCase pattern
   */
  async loadUsers(): Promise<void> {
    this.changeState({
      ...this.state,
      loading: true,
      error: null,
    });
    
    try {
      const result = await this.getUsersUseCase.execute();
      
      // Update state from RequestResult - Ploc will notify subscribers
      this.changeState({
        ...this.state,
        loading: result.loading.value,
        users: result.data.value || this.state.users,
        error: result.error.value ? result.error.value.message : null,
      });
    } catch (err) {
      this.changeState({
        ...this.state,
        loading: false,
        error: err instanceof Error ? err.message : 'Failed to load users',
      });
    }
  }

  /**
   * Create a user using the UseCase pattern
   */
  async createUser(user: Omit<User, 'id'>): Promise<void> {
    this.changeState({
      ...this.state,
      loading: true,
      error: null,
      validationErrors: {},
    });
    
    try {
      // Execute the use case (validation happens inside the use case)
      const useCaseResult = await this.createUserUseCase.execute(user);

      // Check for errors first
      if (useCaseResult.error.value) {
        const error = useCaseResult.error.value;
        const errorMessage = error.message;
        
        // Try to get field errors from error object or parse from message
        let validationErrors: Record<string, string> = {};
        
        // Check if error has fieldErrors property (attached in CreateUser use case)
        if ((error as Error & { fieldErrors: Record<string, string> }).fieldErrors) {
          validationErrors = (error as Error & { fieldErrors: Record<string, string> }).fieldErrors;
        } else if (errorMessage.includes('Validation failed:')) {
          // Parse validation errors from the error message
          const errorParts = errorMessage.split('Validation failed:')[1]?.split(';') || [];
          errorParts.forEach((part) => {
            const trimmed = part.trim();
            if (trimmed.includes(':')) {
              const [field, ...messageParts] = trimmed.split(':');
              const fieldName = field.trim().toLowerCase();
              validationErrors[fieldName] = messageParts.join(':').trim();
            }
          });
        }

        this.changeState({
          ...this.state,
          loading: false,
          error: errorMessage,
          validationErrors,
        });
        return;
      }

      // Get the created user from the result
      const newUser = useCaseResult.data.value;
      
      // Validate the user object
      if (!newUser) {
        this.changeState({
          ...this.state,
          loading: false,
          error: 'Failed to create user: No user data returned',
          validationErrors: {},
        });
        return;
      }

      if (!newUser.id || typeof newUser.name !== 'string' || !newUser.name.trim() || typeof newUser.email !== 'string' || !newUser.email.trim()) {
        this.changeState({
          ...this.state,
          loading: false,
          error: `Failed to create user: Invalid user data returned. Got: ${JSON.stringify(newUser)}`,
          validationErrors: {},
        });
        return;
      }

      // Add to local state - Ploc will notify subscribers automatically
      this.changeState({
        ...this.state,
        loading: false,
        users: [...this.state.users, newUser],
        error: null,
        validationErrors: {},
      });
    } catch (err) {
      this.changeState({
        ...this.state,
        loading: false,
        error: err instanceof Error ? err.message : 'Failed to create user',
        validationErrors: {},
      });
    }
  }

  /**
   * Select a user
   */
  selectUser(user: User | null): void {
    this.changeState({
      ...this.state,
      selectedUser: user,
    });
  }

  /**
   * Clear error
   */
  clearError(): void {
    this.changeState({
      ...this.state,
      error: null,
    });
  }
}
   