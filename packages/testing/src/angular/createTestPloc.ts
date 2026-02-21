/**
 * Create a Ploc instance for Angular component tests. Same as createMockPloc from core:
 * a Ploc with controllable state and no business logic. Use with provideTestingCAF.
 *
 * @example
 * ```ts
 * import { provideTestingCAF, createTestPloc } from '@c-a-f/testing/angular';
 *
 * const ploc = createTestPloc({ count: 0 });
 * TestBed.configureTestingModule({
 *   providers: [provideTestingCAF({ plocs: { counter: ploc } })],
 * });
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
