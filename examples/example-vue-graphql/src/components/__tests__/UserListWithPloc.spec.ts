/**
 * Example: Testing a Vue component that uses Ploc from context
 *
 * - renderWithCAF wraps the component with CAFProvider
 * - createMockPloc for controllable state, or real UserPloc with mock UseCases
 * - wait for async updates with nextTick / flushPromises
 */

import { describe, it, expect, afterEach } from 'vitest';
import { nextTick } from 'vue';
import { renderWithCAF } from './test-utils';
import { createMockPloc } from '@c-a-f/testing/core';
import { createMockUseCaseSuccess } from '@c-a-f/testing/core';
import type { User } from '../../../caf/domain';
import { UserPloc } from '../../../caf/application';
import UserListWithPloc from '../UserListWithPloc.vue';

const mockUsers: User[] = [
  { id: '1', name: 'Alice', email: 'alice@example.com' },
  { id: '2', name: 'Bob', email: 'bob@example.com' },
];

describe('UserListWithPloc', () => {
  afterEach(() => {
    // cleanup happens automatically with mount().unmount()
  });

  it('shows "No Ploc in context" when ploc is not provided', async () => {
    const wrapper = renderWithCAF(UserListWithPloc);
    await nextTick();
    expect(wrapper.find('[data-testid="no-ploc"]').exists()).toBe(true);
    expect(wrapper.text()).toContain('No Ploc in context');
  });

  it('renders with test Ploc state (controllable state, no UseCase)', async () => {
    const ploc = createMockPloc({
      users: mockUsers,
      selectedUser: null,
      error: null,
      loading: false,
      validationErrors: {},
    });
    const wrapper = renderWithCAF(UserListWithPloc, { plocs: { user: ploc } });
    await nextTick();
    expect(wrapper.find('[data-testid="count"]').text()).toBe('Count: 2');
    expect(wrapper.find('[data-testid="user-1"]').text()).toContain('Alice');
    expect(wrapper.find('[data-testid="user-2"]').text()).toContain('Bob');
  });

  it('loads users when Refresh is clicked (real UserPloc + mock UseCases)', async () => {
    const getUsers = createMockUseCaseSuccess(mockUsers);
    const createUser = createMockUseCaseSuccess(mockUsers[0]);
    const ploc = new UserPloc(getUsers as never, createUser as never);
    const wrapper = renderWithCAF(UserListWithPloc, { plocs: { user: ploc } });
    await nextTick();
    expect(wrapper.find('[data-testid="count"]').text()).toBe('Count: 0');
    await wrapper.find('[data-testid="refresh"]').trigger('click');
    await nextTick();
    // Wait for async loadUsers to complete (state update)
    await new Promise((r) => setTimeout(r, 50));
    await nextTick();
    expect(wrapper.find('[data-testid="count"]').text()).toBe('Count: 2');
    expect(wrapper.find('[data-testid="user-1"]').exists()).toBe(true);
  });
});
