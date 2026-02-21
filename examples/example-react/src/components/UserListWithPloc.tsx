/**
 * Minimal component for integration testing: displays users from Ploc and a Refresh button.
 * Uses usePlocFromContext + usePloc so tests can use renderWithCAF with a test Ploc.
 */

import { usePlocFromContext, usePloc } from '@c-a-f/infrastructure-react';
import type { UserPloc } from '../../caf/application';

export function UserListWithPloc() {
  const ploc = usePlocFromContext<UserPloc>('user');
  if (!ploc) {
    return <div data-testid="no-ploc">No Ploc in context</div>;
  }
  const [state] = usePloc(ploc);

  return (
    <div data-testid="user-list">
      <div data-testid="count">Count: {state.users.length}</div>
      <div data-testid="loading">{state.loading ? 'Loading' : 'Idle'}</div>
      {state.error && <div data-testid="error">{state.error}</div>}
      <button type="button" data-testid="refresh" onClick={() => ploc.loadUsers()} disabled={state.loading}>
        Refresh
      </button>
      <ul data-testid="users">
        {state.users.map((u) => (
          <li key={u.id} data-testid={`user-${u.id}`}>
            {u.name} – {u.email}
          </li>
        ))}
      </ul>
    </div>
  );
}
