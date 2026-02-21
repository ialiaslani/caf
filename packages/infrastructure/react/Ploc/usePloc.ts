import { useEffect, useState } from "react";
import type { Ploc } from "@c-a-f/core";

/** Infers the state type S from a Ploc subclass P (P extends Ploc<S>) */
type PlocState<P> = P extends Ploc<infer S> ? S : never;

/**
 * React hook that subscribes to a Ploc and returns the current state and the Ploc instance.
 * Handles subscription on mount, syncs when the ploc reference changes, and unsubscribes on unmount.
 * The return type preserves the concrete ploc type (e.g. UserPloc) so methods like loadUsers() are typed.
 *
 * @param ploc - A Ploc instance (from @c-a-f/core)
 * @returns A tuple of [currentState, ploc] with the same ploc type as passed in
 *
 * @example
 * ```tsx
 * const [state, userPloc] = usePloc(userPloc);
 * await userPloc.loadUsers(); // typed correctly
 * return <span>{state.name}</span>;
 * ```
 */
export function usePloc<P extends Ploc<PlocState<P>>>(ploc: P): [PlocState<P>, P] {
  const [state, setState] = useState<PlocState<P>>(() => ploc.state);

  useEffect(() => {
    setState(ploc.state);
    const listener = (newState: PlocState<P>) => setState(newState);
    ploc.subscribe(listener);
    return () => {
      ploc.unsubscribe(listener);
    };
  }, [ploc]);

  return [state, ploc];
}
