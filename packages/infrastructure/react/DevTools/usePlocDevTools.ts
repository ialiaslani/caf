import { useEffect, useRef } from "react";
import type { Ploc } from "@c-a-f/core";
import {
  createPlocDevTools,
  type PlocDevTools,
  type PlocDevToolsOptions,
} from "@c-a-f/devtools";

/**
 * React hook that provides DevTools for a Ploc instance.
 * Automatically cleans up on unmount.
 *
 * @param ploc - A Ploc instance
 * @param options - DevTools options
 * @returns DevTools instance and current state
 *
 * @example
 * ```tsx
 * const [state, ploc] = usePloc(userPloc);
 * const devTools = usePlocDevTools(ploc, { name: 'UserPloc', enabled: true });
 *
 * // Access state history
 * const history = devTools.getStateHistory();
 *
 * // Time-travel debugging
 * devTools.jumpToState(2);
 * ```
 */
export function usePlocDevTools<T>(
  ploc: Ploc<T>,
  options?: PlocDevToolsOptions
): PlocDevTools<T> {
  const devToolsRef = useRef<PlocDevTools<T> | null>(null);
  const plocRef = useRef<Ploc<T> | null>(null);

  // Create adapter wrapper that matches PlocInstance interface
  // PlocDevTools expects subscribe to return void (not unsubscribe function)
  const createPlocAdapter = (p: Ploc<T>) => {
    return {
      state: p.state,
      changeState: (state: T) => p.changeState(state),
      subscribe: (listener: (state: T) => void) => {
        p.subscribe(listener);
        // Note: PlocDevTools now handles cleanup internally via MemoryLeakDetector
      },
      unsubscribe: (listener: (state: T) => void) => p.unsubscribe(listener),
    };
  };

  // Recreate devtools if ploc changed
  if (plocRef.current !== ploc || !devToolsRef.current) {
    plocRef.current = ploc;
    if (devToolsRef.current) {
      devToolsRef.current.cleanup();
    }
    const adapter = createPlocAdapter(ploc);
    devToolsRef.current = createPlocDevTools(adapter as any, options);
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (devToolsRef.current) {
        devToolsRef.current.cleanup();
        devToolsRef.current = null;
      }
    };
  }, []);

  return devToolsRef.current;
}
