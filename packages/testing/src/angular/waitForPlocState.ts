/**
 * Wait for a Ploc to reach a state that matches a predicate. Useful in Angular tests
 * after triggering an action that updates the Ploc asynchronously.
 *
 * @example
 * ```ts
 * import { createTestPloc, waitForPlocState } from '@c-a-f/testing/angular';
 *
 * const ploc = createTestPloc({ loading: true, items: [] });
 * ploc.changeState({ loading: false, items: [{ id: '1' }] });
 * await waitForPlocState(ploc, (state) => !state.loading && state.items.length > 0);
 * ```
 */

import type { Ploc } from '@c-a-f/core';
import { waitForStateChange } from '../core/PlocTestHelpers';

/**
 * Wait until the Ploc's state satisfies the predicate (or timeout).
 */
export function waitForPlocState<S>(
  ploc: Ploc<S>,
  predicate: (state: S) => boolean,
  timeoutMs: number = 5000
): Promise<S> {
  return waitForStateChange(ploc, predicate, timeoutMs);
}
