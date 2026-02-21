import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Ploc } from '@c-a-f/core';
import { plocToObservable } from './plocToObservable';
import { firstValueFrom } from 'rxjs';

class CounterPloc extends Ploc<number> {
  constructor(initial = 0) {
    super(initial);
  }
  increment() {
    this.changeState(this.state + 1);
  }
}

describe('plocToObservable', () => {
  let ploc: CounterPloc;

  beforeEach(() => {
    ploc = new CounterPloc(5);
  });

  it('emits current state immediately and on changes', async () => {
    const first = await firstValueFrom(plocToObservable(ploc));
    expect(first).toBe(5);

    const values: number[] = [];
    const sub = plocToObservable(ploc).subscribe((v) => values.push(v));
    expect(values).toEqual([5]);

    ploc.increment();
    expect(values).toEqual([5, 6]);

    ploc.increment();
    expect(values).toEqual([5, 6, 7]);
    sub.unsubscribe();
  });

  it('unsubscribes from ploc when subscription is unsubscribed', () => {
    const listener = vi.fn();
    const origSubscribe = ploc.subscribe.bind(ploc);
    ploc.subscribe = vi.fn((fn: (s: number) => void) => origSubscribe(fn));
    const origUnsubscribe = ploc.unsubscribe.bind(ploc);
    ploc.unsubscribe = vi.fn((fn: (s: number) => void) => origUnsubscribe(fn));

    const sub = plocToObservable(ploc).subscribe(() => {});
    expect(ploc.subscribe).toHaveBeenCalledTimes(1);
    sub.unsubscribe();
    expect(ploc.unsubscribe).toHaveBeenCalledTimes(1);
  });
});
