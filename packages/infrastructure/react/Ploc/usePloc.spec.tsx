import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { Ploc } from "@c.a.f/core";
import { usePloc } from "./usePloc";

class CounterPloc extends Ploc<number> {
  constructor(initial = 0) {
    super(initial);
  }
  increment() {
    this.changeState(this.state + 1);
  }
}

describe("usePloc", () => {
  let ploc: CounterPloc;

  beforeEach(() => {
    ploc = new CounterPloc(5);
  });

  it("returns initial state and ploc instance", () => {
    const { result } = renderHook(() => usePloc(ploc));

    const [state, returnedPloc] = result.current;
    expect(state).toBe(5);
    expect(returnedPloc).toBe(ploc);
  });

  it("updates state when ploc state changes", () => {
    const { result } = renderHook(() => usePloc(ploc));

    expect(result.current[0]).toBe(5);

    act(() => {
      ploc.increment();
    });

    expect(result.current[0]).toBe(6);

    act(() => {
      ploc.increment();
    });

    expect(result.current[0]).toBe(7);
  });

  it("unsubscribes on unmount", () => {
    const listener = vi.fn();
    const originalSubscribe = ploc.subscribe.bind(ploc);
    ploc.subscribe = vi.fn((fn: (s: number) => void) => {
      listener.mockImplementation(fn);
      return originalSubscribe(fn);
    });
    const originalUnsubscribe = ploc.unsubscribe.bind(ploc);
    ploc.unsubscribe = vi.fn((fn: (s: number) => void) => {
      return originalUnsubscribe(fn);
    });

    const { unmount } = renderHook(() => usePloc(ploc));

    expect(ploc.subscribe).toHaveBeenCalledTimes(1);

    unmount();

    expect(ploc.unsubscribe).toHaveBeenCalledTimes(1);
  });

  it("syncs to new ploc when ploc reference changes", () => {
    const ploc2 = new CounterPloc(10);
    const { result, rerender } = renderHook(
      ({ p }) => usePloc(p),
      { initialProps: { p: ploc } }
    );

    expect(result.current[0]).toBe(5);

    rerender({ p: ploc2 });

    expect(result.current[0]).toBe(10);
    expect(result.current[1]).toBe(ploc2);
  });
});
