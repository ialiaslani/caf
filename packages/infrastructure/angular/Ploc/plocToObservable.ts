import type { Ploc } from '@c.a.f/core';
import { Observable } from 'rxjs';

/** Infers state type S from Ploc<P extends Ploc<S>> */
type PlocState<P> = P extends Ploc<infer S> ? S : never;

/**
 * Converts a Ploc to an Observable of its state.
 * Use with toSignal() in components: state = toSignal(plocToObservable(this.userPloc))
 *
 * @param ploc - A Ploc instance (from @c.a.f/core)
 * @returns Observable that emits the current state and every state update
 */
export function plocToObservable<P extends Ploc<PlocState<P>>>(
  ploc: P
): Observable<PlocState<P>> {
  return new Observable<PlocState<P>>((subscriber) => {
    subscriber.next(ploc.state);
    const listener = (s: PlocState<P>) => subscriber.next(s);
    ploc.subscribe(listener);
    return () => ploc.unsubscribe(listener);
  });
}
