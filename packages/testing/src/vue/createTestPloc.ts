/**
 * Create a Ploc instance for Vue component tests. Same as createMockPloc from core:
 * a Ploc with controllable state and no business logic. Use with mountWithCAF.
 *
 * @example
 * ```ts
 * import { createTestPloc, mountWithCAF } from '@c-a-f/testing/vue';
 *
 * const ploc = createTestPloc({ count: 0 });
 * const wrapper = mountWithCAF(MyComponent, { plocs: { counter: ploc } });
 * ploc.changeState({ count: 1 });
 * expect(wrapper.text()).toContain('1');
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
