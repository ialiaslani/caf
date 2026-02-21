import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { Ploc } from "@c-a-f/core";
import { usePlocDevTools } from "./usePlocDevTools";

class CounterPloc extends Ploc<number> {
  constructor(initial = 0) {
    super(initial);
  }
  increment() {
    this.changeState(this.state + 1);
  }
}

describe("usePlocDevTools", () => {
  let ploc: CounterPloc;

  beforeEach(() => {
    ploc = new CounterPloc(5);
  });

  it("creates DevTools instance for Ploc", () => {
    const { result } = renderHook(() =>
      usePlocDevTools(ploc, { name: "CounterPloc" })
    );

    expect(result.current).toBeDefined();
    expect(result.current.getCurrentState()).toBe(5);
  });

  it("tracks state changes", () => {
    const { result } = renderHook(() =>
      usePlocDevTools(ploc, { name: "CounterPloc", enabled: true })
    );

    ploc.increment();
    ploc.increment();

    const history = result.current.getStateHistory();
    expect(history.length).toBeGreaterThan(1);
  });

  it("cleans up on unmount", () => {
    const cleanupSpy = vi.fn();
    const { result, unmount } = renderHook(() =>
      usePlocDevTools(ploc, { name: "CounterPloc" })
    );

    // Mock cleanup method
    const originalCleanup = result.current.cleanup;
    result.current.cleanup = cleanupSpy;

    unmount();

    expect(cleanupSpy).toHaveBeenCalled();
  });

  it("recreates DevTools when ploc changes", () => {
    const { result, rerender } = renderHook(
      ({ p }) => usePlocDevTools(p, { name: "CounterPloc" }),
      { initialProps: { p: ploc } }
    );

    const firstDevTools = result.current;

    const newPloc = new CounterPloc(10);
    rerender({ p: newPloc });

    // Should be a new instance
    expect(result.current).toBeDefined();
    expect(result.current.getCurrentState()).toBe(10);
  });
});
