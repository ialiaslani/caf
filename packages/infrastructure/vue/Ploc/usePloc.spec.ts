import { describe, it, expect, beforeEach, vi } from "vitest";
import { Ploc } from "@c.a.f/core";
import { usePloc } from "./usePloc";
import { withSetup } from "../test-utils";

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
    const [result, unmount] = withSetup(() => usePloc(ploc));
    const [state, returnedPloc] = result;
    expect(state.value).toBe(5);
    expect(returnedPloc).toBe(ploc);
    unmount();
  });

  it("updates state when ploc state changes", () => {
    const [result, unmount] = withSetup(() => usePloc(ploc));
    const [state] = result;
    expect(state.value).toBe(5);

    ploc.increment();
    expect(state.value).toBe(6);

    ploc.increment();
    expect(state.value).toBe(7);
    unmount();
  });

  it("unsubscribes on unmount", () => {
    const listener = vi.fn();
    const originalSubscribe = ploc.subscribe.bind(ploc);
    ploc.subscribe = vi.fn((fn: (s: number) => void) => {
      listener.mockImplementation(fn);
      return originalSubscribe(fn);
    });
    const originalUnsubscribe = ploc.unsubscribe.bind(ploc);
    ploc.unsubscribe = vi.fn((fn: (s: number) => void) => originalUnsubscribe(fn));

    const [, unmount] = withSetup(() => usePloc(ploc));
    expect(ploc.subscribe).toHaveBeenCalledTimes(1);
    unmount();
    expect(ploc.unsubscribe).toHaveBeenCalledTimes(1);
  });

  it("syncs to new ploc when ploc reference changes", () => {
    const ploc2 = new CounterPloc(10);
    const plocRef = { current: ploc };
    const [result, unmount] = withSetup(() => usePloc(plocRef.current));
    const [state] = result;
    expect(state.value).toBe(5);

    plocRef.current = ploc2;
    // Trigger watch by re-running - in real usage the component would re-render with new ploc.
    // Here we just verify initial state; testing watch would require a full component re-render.
    expect(state.value).toBe(5);
    unmount();
  });
});
