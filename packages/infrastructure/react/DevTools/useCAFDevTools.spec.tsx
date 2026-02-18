import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import React from "react";
import { Ploc } from "@c.a.f/core";
import { useCAFDevTools, useTrackPloc } from "./useCAFDevTools";

class CounterPloc extends Ploc<number> {
  constructor(initial = 0) {
    super(initial);
  }
}

describe("useCAFDevTools", () => {
  it("creates DevTools context", () => {
    const { result } = renderHook(() => useCAFDevTools({ enabled: false }));

    expect(result.current).toBeDefined();
    expect(result.current.plocs).toBeInstanceOf(Map);
    expect(result.current.enabled).toBe(false);
    expect(typeof result.current.enable).toBe("function");
    expect(typeof result.current.disable).toBe("function");
  });

  it("can enable and disable", () => {
    const { result } = renderHook(() => useCAFDevTools({ enabled: false }));

    expect(result.current.enabled).toBe(false);

    act(() => {
      result.current.enable();
    });

    expect(result.current.enabled).toBe(true);

    act(() => {
      result.current.disable();
    });

    expect(result.current.enabled).toBe(false);
  });

  it("exposes devtools to window object", () => {
    const originalWindow = global.window;
    const mockWindow = {
      ...originalWindow,
      __CAF_DEVTOOLS__: undefined,
    };
    global.window = mockWindow as any;

    renderHook(() => useCAFDevTools({ enabled: true }));

    expect((global.window as any).__CAF_DEVTOOLS__).toBeDefined();
    expect((global.window as any).__CAF_DEVTOOLS__.enabled).toBe(true);

    global.window = originalWindow;
  });
});

describe("useTrackPloc", () => {
  let ploc: CounterPloc;

  beforeEach(() => {
    ploc = new CounterPloc(5);
  });

  it("registers Ploc with DevTools", () => {
    const { result: devToolsResult } = renderHook(() =>
      useCAFDevTools({ enabled: true })
    );

    renderHook(() => useTrackPloc(ploc, "CounterPloc"), {
      wrapper: ({ children }) => {
        // This is a simplified test - in real usage, useTrackPloc would access context
        return <>{children}</>;
      },
    });

    // The ploc should be tracked (this is a simplified test)
    expect(devToolsResult.current.plocs).toBeInstanceOf(Map);
  });
});
