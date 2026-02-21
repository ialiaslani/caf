/**
 * Create a Ploc instance for React component tests. Same as createMockPloc from core:
 * a Ploc with controllable state and no business logic. Use with renderWithCAF.
 *
 * @example
 * ```tsx
 * import { createTestPloc, renderWithCAF } from '@c-a-f/testing/react';
 *
 * const ploc = createTestPloc({ count: 0 });
 * const { getByRole } = renderWithCAF(<Counter />, { plocs: { counter: ploc } });
 * ploc.changeState({ count: 1 });
 * expect(screen.getByText('1')).toBeInTheDocument();
 * ```
 */

import type { Ploc } from '@c-a-f/core';
import { createMockPloc } from '../core/PlocTestHelpers';

/**
 * Create a test Ploc with initial state. Use changeState() to drive state in tests.
 */
export function createTestPloc<S>(initialState: S): Ploc<S> {
  return createMockPloc(initialState);
}
