/**
 * Example: Testing a React component that uses Ploc from context
 *
 * - renderWithCAF wraps the component with CAFProvider
 * - createTestPloc or real UserPloc with mock UseCases
 * - waitForPlocState to wait for async updates
 */

import React from 'react';
import { describe, it, expect, afterEach } from 'vitest';
import { screen, waitFor, cleanup } from '@testing-library/react';
import { renderWithCAF, createTestPloc } from '@c-a-f/testing/react';
import { createMockUseCaseSuccess } from '@c-a-f/testing/core';
import type { User } from '../../../caf/domain';
import { UserPloc } from '../../../caf/application/User/Ploc';
import { UserListWithPloc } from '../UserListWithPloc';

const mockUsers: User[] = [
  { id: '1', name: 'Alice', email: 'alice@example.com' },
  { id: '2', name: 'Bob', email: 'bob@example.com' },
];

describe('UserListWithPloc', () => {
  afterEach(() => {
    cleanup();
  });

  it('shows "No Ploc in context" when ploc is not provided', () => {
    renderWithCAF(<UserListWithPloc />);
    expect(screen.getByTestId('no-ploc')).toBeInTheDocument();
  });

  it('renders with test Ploc state (controllable state, no UseCase)', () => {
    const ploc = createTestPloc({
      users: mockUsers,
      selectedUser: null,
      error: null,
      loading: false,
      validationErrors: {},
    });
    renderWithCAF(<UserListWithPloc />, { plocs: { user: ploc } });

    expect(screen.getByTestId('count')).toHaveTextContent('Count: 2');
    expect(screen.getByTestId('user-1')).toHaveTextContent('Alice – alice@example.com');
    expect(screen.getByTestId('user-2')).toHaveTextContent('Bob – bob@example.com');
  });

  it('loads users when Refresh is clicked (real UserPloc + mock UseCases)', async () => {
    const getUsers = createMockUseCaseSuccess(mockUsers);
    const createUser = createMockUseCaseSuccess(mockUsers[0]);
    const ploc = new UserPloc(getUsers as any, createUser as any);
    renderWithCAF(<UserListWithPloc />, { plocs: { user: ploc } });

    expect(screen.getByTestId('count')).toHaveTextContent('Count: 0');
    screen.getByTestId('refresh').click();

    await waitFor(() => {
      expect(screen.getByTestId('count')).toHaveTextContent('Count: 2');
    });
    expect(screen.getByTestId('user-1')).toBeInTheDocument();
  });
});
