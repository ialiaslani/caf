/**
 * Example: Testing UseCase execution with @c-a-f/testing
 *
 * - Mock repository with createMockRepository
 * - Test GetUsers.execute() returns success and error
 */

import { describe, it, expect } from 'vitest';
import { createMockRepository } from '@c-a-f/testing/core';
import type { User } from '../../../domain';
import type { IUserRepository } from '../../../domain/User/user.irepository';
import { UserService } from '../../../domain';
import { GetUsers } from '../Queries/GetUsers';

const mockUsers: User[] = [
  { id: '1', name: 'Alice', email: 'alice@example.com' },
  { id: '2', name: 'Bob', email: 'bob@example.com' },
];

describe('GetUsers', () => {
  it('returns users when repository succeeds', async () => {
    const repo = createMockRepository<IUserRepository>({
      getUsers: async () => mockUsers,
    });
    const userService = new UserService(repo);
    const getUsers = new GetUsers(userService);

    const result = await getUsers.execute();

    expect(result.loading.value).toBe(false);
    expect(result.data.value).toEqual(mockUsers);
    expect(result.error.value).toBeNull();
  });

  it('returns error when repository throws', async () => {
    const repo = createMockRepository<IUserRepository>({
      getUsers: async () => {
        throw new Error('Network error');
      },
    });
    const userService = new UserService(repo);
    const getUsers = new GetUsers(userService);

    const result = await getUsers.execute();

    expect(result.loading.value).toBe(false);
    expect(result.error.value?.message).toBe('Network error');
  });
});
