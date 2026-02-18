import { describe, it, expect } from "vitest";
import { renderHook } from "@testing-library/react";
import { useUseCaseDevTools } from "./useUseCaseDevTools";

describe("useUseCaseDevTools", () => {
  it("creates DevTools instance", () => {
    const { result } = renderHook(() =>
      useUseCaseDevTools({ name: "TestUseCase" })
    );

    expect(result.current).toBeDefined();
    expect(typeof result.current.enable).toBe("function");
    expect(typeof result.current.disable).toBe("function");
  });

  it("returns same instance across renders", () => {
    const { result, rerender } = renderHook(() =>
      useUseCaseDevTools({ name: "TestUseCase" })
    );

    const firstInstance = result.current;

    rerender();

    expect(result.current).toBe(firstInstance);
  });

  it("can enable and disable", () => {
    const { result } = renderHook(() =>
      useUseCaseDevTools({ name: "TestUseCase", enabled: false })
    );

    expect(result.current).toBeDefined();
    result.current.enable();
    result.current.disable();
  });
});
