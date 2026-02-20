import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createApp, h, defineComponent, nextTick } from "vue";
import { CAFErrorBoundary } from "./CAFErrorBoundary";
import { useCAFError } from "./ErrorContext";

const ThrowError = defineComponent({
  props: { shouldThrow: { type: Boolean, default: false } },
  setup(props) {
    return () => {
      if (props.shouldThrow) {
        throw new Error("Test error");
      }
      return h("div", "No error");
    };
  },
});

const ErrorDisplay = defineComponent({
  setup() {
    const errorContext = useCAFError();
    if (!errorContext || !errorContext.error) {
      return () => h("div", "No error in context");
    }
    return () => h("div", `Error: ${errorContext.error.message}`);
  },
});

describe("CAFErrorBoundary", () => {
  beforeEach(() => {
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders children when there is no error", () => {
    const Root = defineComponent({
      setup() {
        return () =>
          h(CAFErrorBoundary, null, { default: () => h("div", "Test content") });
      },
    });
    const app = createApp(Root);
    const el = document.createElement("div");
    app.mount(el);
    expect(el.textContent).toContain("Test content");
    app.unmount();
  });

  it("catches errors and displays default error UI", async () => {
    const Root = defineComponent({
      setup() {
        return () =>
          h(CAFErrorBoundary, null, {
            default: () => h(ThrowError, { shouldThrow: true }),
          });
      },
    });
    const app = createApp(Root);
    const el = document.createElement("div");
    app.mount(el);
    await nextTick();
    expect(el.textContent).toContain("Something went wrong");
    expect(el.textContent).toContain("Try again");
    app.unmount();
  });

  it("calls onError callback when error occurs", () => {
    const onError = vi.fn();
    const Root = defineComponent({
      setup() {
        return () =>
          h(CAFErrorBoundary, { onError }, {
            default: () => h(ThrowError, { shouldThrow: true }),
          });
      },
    });
    const app = createApp(Root);
    const el = document.createElement("div");
    app.mount(el);
    expect(onError).toHaveBeenCalledWith(expect.any(Error));
    expect(onError.mock.calls[0][0].message).toBe("Test error");
    app.unmount();
  });

  it("renders custom fallback when provided", async () => {
    const fallback = vi.fn(({ error, resetError }: { error: Error; resetError: () => void }) =>
      h("div", [
        h("span", { "data-testid": "custom" }, "Custom UI"),
        h("span", error.message),
        h("button", { onClick: resetError }, "Retry"),
      ])
    );
    const Root = defineComponent({
      setup() {
        return () =>
          h(CAFErrorBoundary, { fallback }, {
            default: () => h(ThrowError, { shouldThrow: true }),
          });
      },
    });
    const app = createApp(Root);
    const el = document.createElement("div");
    app.mount(el);
    await nextTick();
    expect(fallback).toHaveBeenCalled();
    expect(el.querySelector("[data-testid=custom]")?.textContent).toBe("Custom UI");
    expect(el.textContent).toContain("Test error");
    app.unmount();
  });

  it("provides error context when using custom fallback that renders a context consumer", async () => {
    const fallback = ({ error }: { error: Error }) =>
      h("div", [h("span", { "data-testid": "err" }, `Error: ${error.message}`), h(ErrorDisplay)]);
    const Root = defineComponent({
      setup() {
        return () =>
          h(CAFErrorBoundary, { fallback }, {
            default: () => h(ThrowError, { shouldThrow: true }),
          });
      },
    });
    const app = createApp(Root);
    const el = document.createElement("div");
    app.mount(el);
    await nextTick();
    expect(el.querySelector("[data-testid=err]")?.textContent).toBe("Error: Test error");
    expect(el.textContent).toMatch(/Error: Test error/);
    app.unmount();
  });
});
