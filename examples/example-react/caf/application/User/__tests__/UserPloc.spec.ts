/**
 * Example: Unit testing a Ploc with @c.a.f/testing
 *
 * - Mock UseCases with createMockUseCaseSuccess / createMockUseCaseError
 * - Track state with createPlocTester
 * - Assert state after loadUsers / createUser (success and error)
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  createPlocTester,
  createMockUseCaseSuccess,
  createMockUseCaseError,
  createMockUseCase,
  createErrorResult,
} from '@c.a.f/testing/core';
import type { User } from '../../../domain';
import type { UserState } from '../Ploc';
import { UserPloc } from '../Ploc';
import { UserValidationError } from '../Commands/CreateUser';

const mockUsers: User[] = [
  { id: '1', name: 'Alice', email: 'alice@example.com' },
  { id: '2', name: 'Bob', email: 'bob@example.com' },
];

describe('UserPloc', () => {
  let tester: ReturnType<typeof createPlocTester<UserState>>;
  let ploc: UserPloc;

  afterEach(() => {
    tester?.cleanup();
  });

  describe('loadUsers', () => {
    it('updates state with users on success', async () => {
      const getUsers = createMockUseCaseSuccess(mockUsers);
      const createUser = createMockUseCaseSuccess(mockUsers[0]);
      ploc = new UserPloc(getUsers as any, createUser as any);
      tester = createPlocTester(ploc);

      await ploc.loadUsers();

      expect(ploc.state.loading).toBe(false);
      expect(ploc.state.users).toEqual(mockUsers);
      expect(ploc.state.error).toBeNull();
    });

    it('sets error state when GetUsers fails', async () => {
      const getUsers = createMockUseCaseError<User[]>(new Error('Network failed'));
      const createUser = createMockUseCaseSuccess(mockUsers[0]);
      ploc = new UserPloc(getUsers as any, createUser as any);
      tester = createPlocTester(ploc);

      await ploc.loadUsers();

      expect(ploc.state.loading).toBe(false);
      expect(ploc.state.error).toBe('Network failed');
    });
  });

  describe('createUser', () => {
    beforeEach(() => {
      const getUsers = createMockUseCaseSuccess(mockUsers);
      const createUser = createMockUseCaseSuccess({
        id: '3',
        name: 'Carol',
        email: 'carol@example.com',
      });
      ploc = new UserPloc(getUsers as any, createUser as any);
      tester = createPlocTester(ploc);
    });

    it('adds new user to state on success', async () => {
      await ploc.loadUsers(); // load existing users (mockUsers) so state has 2 users
      await ploc.createUser({ name: 'Carol', email: 'carol@example.com' });

      expect(ploc.state.loading).toBe(false);
      expect(ploc.state.users).toHaveLength(3);
      expect(ploc.state.users[2].name).toBe('Carol');
      expect(ploc.state.error).toBeNull();
    });

    it('sets validation errors when CreateUser returns validation error', async () => {
      const validationError = new UserValidationError('Validation failed', {
        name: 'Name too short',
        email: 'Invalid email',
      });
      const createUser = createMockUseCase<[{ name: string; email: string }], User>(() =>
        createErrorResult(validationError)
      );
      ploc = new UserPloc(createMockUseCaseSuccess(mockUsers) as any, createUser as any);
      tester = createPlocTester(ploc);

      await ploc.createUser({ name: 'x', email: 'bad' });

      expect(ploc.state.loading).toBe(false);
      expect(ploc.state.validationErrors).toEqual({ name: 'Name too short', email: 'Invalid email' });
    });
  });

  describe('selectUser / clearError', () => {
    beforeEach(() => {
      const getUsers = createMockUseCaseSuccess(mockUsers);
      const createUser = createMockUseCaseSuccess(mockUsers[0]);
      ploc = new UserPloc(getUsers as any, createUser as any);
      tester = createPlocTester(ploc);
    });

    it('selectUser updates selectedUser', async () => {
      await ploc.loadUsers();
      ploc.selectUser(mockUsers[1]);

      expect(ploc.state.selectedUser).toEqual(mockUsers[1]);
    });

    it('clearError clears error', async () => {
      const getUsersErr = createMockUseCaseError<User[]>(new Error('Fail'));
      ploc = new UserPloc(getUsersErr as any, createMockUseCaseSuccess(mockUsers[0]) as any);
      await ploc.loadUsers();
      expect(ploc.state.error).toBeTruthy();
      ploc.clearError();
      expect(ploc.state.error).toBeNull();
    });
  });
});
