import { Ploc } from '@c-a-f/core';
import type { User } from '../../../domain';
import { GetUsers, CreateUser } from '../index';

export interface UserState {
  users: User[];
  selectedUser: User | null;
  error: string | null;
  loading: boolean;
  validationErrors: Record<string, string>;
}

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

  async loadUsers(): Promise<void> {
    this.changeState({ ...this.state, loading: true, error: null });
    try {
      const result = await this.getUsersUseCase.execute();
      this.changeState({
        ...this.state,
        loading: result.loading.value,
        users: result.data.value ?? this.state.users,
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

  async createUser(user: Omit<User, 'id'>): Promise<void> {
    this.changeState({ ...this.state, loading: true, error: null, validationErrors: {} });
    try {
      const useCaseResult = await this.createUserUseCase.execute(user);
      if (useCaseResult.error.value) {
        const error = useCaseResult.error.value as Error & { fieldErrors?: Record<string, string> };
        this.changeState({
          ...this.state,
          loading: false,
          error: error.message,
          validationErrors: error.fieldErrors ?? {},
        });
        return;
      }
      const newUser = useCaseResult.data.value;
      if (!newUser?.id) {
        this.changeState({
          ...this.state,
          loading: false,
          error: 'Failed to create user: No user data returned',
          validationErrors: {},
        });
        return;
      }
      // Do not append newUser here: the WebSocket push (usersUpdated) already
      // updates the list. Appending would duplicate when both run.
      this.changeState({
        ...this.state,
        loading: false,
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

  selectUser(user: User | null): void {
    this.changeState({ ...this.state, selectedUser: user });
  }

  clearError(): void {
    this.changeState({ ...this.state, error: null });
  }
}
