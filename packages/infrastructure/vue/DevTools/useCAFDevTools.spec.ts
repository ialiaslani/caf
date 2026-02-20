import { describe, it, expect } from "vitest";
import { useCAFDevTools } from "./useCAFDevTools";
import { withSetup } from "../test-utils";

describe("useCAFDevTools", () => {
  it("creates DevTools context with enabled ref and methods", () => {
    const [result, unmount] = withSetup(() => useCAFDevTools({ enabled: false }));
    expect(result).toBeDefined();
    expect(result.enabled.value).toBe(false);
    expect(typeof result.enable).toBe("function");
    expect(typeof result.disable).toBe("function");
    unmount();
  });

  it("can enable and disable", () => {
    const [result, unmount] = withSetup(() => useCAFDevTools({ enabled: false }));
    expect(result.enabled.value).toBe(false);

    result.enable();
    expect(result.enabled.value).toBe(true);

    result.disable();
    expect(result.enabled.value).toBe(false);
    unmount();
  });

  it("exposes devtools to window when mounted and cleans up on unmount", () => {
    const [result, unmount] = withSetup(() => useCAFDevTools({ enabled: true }));
    expect(typeof window !== "undefined" && (window as any).__CAF_DEVTOOLS__).toBeDefined();
    expect((window as any).__CAF_DEVTOOLS__.enabled).toBe(result.enabled);

    unmount();
    expect((window as any).__CAF_DEVTOOLS__).toBeUndefined();
  });

  it("defaults enabled to false when no options passed", () => {
    const [result, unmount] = withSetup(() => useCAFDevTools());
    expect(result.enabled.value).toBe(false);
    unmount();
  });
});
