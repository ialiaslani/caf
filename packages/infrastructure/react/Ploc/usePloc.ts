import { useEffect, useState } from "react";
import type { Ploc } from "@c.a.f/core";

/**
 * React hook that subscribes to a Ploc and returns the current state and the Ploc instance.
 * Handles subscription on mount, syncs when the ploc reference changes, and unsubscribes on unmount.
 *
 * @param ploc - A Ploc instance (from @c.a.f/core)
 * @returns A tuple of [currentState, ploc]
 *
 * @example
 * ```tsx
 * const [state, userPloc] = usePloc(userPloc);
 * return <span>{state.name}</span>;
 * ```
 */
export function usePloc<T>(ploc: Ploc<T>): [T, Ploc<T>] {
  const [state, setState] = useState<T>(() => ploc.state);

  useEffect(() => {
    setState(ploc.state);
    const listener = (newState: T) => setState(newState);
    ploc.subscribe(listener);
    return () => {
      ploc.unsubscribe(listener);
    };
  }, [ploc]);

  return [state, ploc];
}
