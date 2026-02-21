import { describe, it, expect } from "vitest";
import { createApp, h, defineComponent } from "vue";
import { Ploc } from "@c-a-f/core";
import { CAFProvider } from "./CAFProvider";
import { usePlocFromContext, useUseCaseFromContext } from "./useContextHooks";

class CounterPloc extends Ploc<number> {
  constructor(initial = 0) {
    super(initial);
  }
  increment() {
    this.changeState(this.state + 1);
  }
}

const fakeUseCase = {
  execute: async () =>
    ({ loading: { value: false }, data: { value: null }, error: { value: null } }) as any,
};

describe("usePlocFromContext", () => {
  it("returns undefined when used outside CAFProvider (default context)", () => {
    const Consumer = defineComponent({
      setup() {
        const p = usePlocFromContext<CounterPloc>("user");
        return () => h("span", { "data-testid": "out" }, p === undefined ? "undefined" : "defined");
      },
    });
    const app = createApp(Consumer);
    const el = document.createElement("div");
    app.mount(el);
    expect(el.querySelector("[data-testid=out]")?.textContent).toBe("undefined");
    app.unmount();
  });

  it("returns undefined when key is not registered", () => {
    const ploc = new CounterPloc(5);
    const Consumer = defineComponent({
      setup() {
        const p = usePlocFromContext<CounterPloc>("nonexistent");
        return () => h("span", { "data-testid": "out" }, p === undefined ? "undefined" : "defined");
      },
    });
    const Root = defineComponent({
      setup() {
        return () =>
          h(CAFProvider, { plocs: { user: ploc } }, { default: () => h(Consumer) });
      },
    });
    const app = createApp(Root);
    const el = document.createElement("div");
    app.mount(el);
    expect(el.querySelector("[data-testid=out]")?.textContent).toBe("undefined");
    app.unmount();
  });

  it("returns the Ploc when key is registered", () => {
    const ploc = new CounterPloc(42);
    const Consumer = defineComponent({
      setup() {
        const p = usePlocFromContext<CounterPloc>("counter");
        return () =>
          h("span", { "data-testid": "state" }, p ? String(p.state) : "none");
      },
    });
    const Root = defineComponent({
      setup() {
        return () =>
          h(CAFProvider, { plocs: { counter: ploc } }, { default: () => h(Consumer) });
      },
    });
    const app = createApp(Root);
    const el = document.createElement("div");
    app.mount(el);
    expect(el.querySelector("[data-testid=state]")?.textContent).toBe("42");
    app.unmount();
  });

  it("returns the same instance as provided", () => {
    const ploc = new CounterPloc(7);
    let receivedPloc: CounterPloc | undefined;
    const Consumer = defineComponent({
      setup() {
        receivedPloc = usePlocFromContext<CounterPloc>("counter");
        return () =>
          h(
            "span",
            { "data-testid": "ok" },
            receivedPloc === ploc ? "same" : "different"
          );
      },
    });
    const Root = defineComponent({
      setup() {
        return () =>
          h(CAFProvider, { plocs: { counter: ploc } }, { default: () => h(Consumer) });
      },
    });
    const app = createApp(Root);
    const el = document.createElement("div");
    app.mount(el);
    expect(el.querySelector("[data-testid=ok]")?.textContent).toBe("same");
    expect(receivedPloc).toBe(ploc);
    expect(receivedPloc?.increment).toBeDefined();
    app.unmount();
  });
});

describe("useUseCaseFromContext", () => {
  it("returns undefined when used outside CAFProvider", () => {
    const Consumer = defineComponent({
      setup() {
        const uc = useUseCaseFromContext<[string], unknown>("createUser");
        return () =>
          h("span", { "data-testid": "out" }, uc === undefined ? "undefined" : "defined");
      },
    });
    const app = createApp(Consumer);
    const el = document.createElement("div");
    app.mount(el);
    expect(el.querySelector("[data-testid=out]")?.textContent).toBe("undefined");
    app.unmount();
  });

  it("returns undefined when key is not registered", () => {
    const Consumer = defineComponent({
      setup() {
        const uc = useUseCaseFromContext<[string], unknown>("nonexistent");
        return () =>
          h("span", { "data-testid": "out" }, uc === undefined ? "undefined" : "defined");
      },
    });
    const Root = defineComponent({
      setup() {
        return () =>
          h(CAFProvider, { useCases: { createUser: fakeUseCase } }, { default: () => h(Consumer) });
      },
    });
    const app = createApp(Root);
    const el = document.createElement("div");
    app.mount(el);
    expect(el.querySelector("[data-testid=out]")?.textContent).toBe("undefined");
    app.unmount();
  });

  it("returns the UseCase when key is registered", () => {
    const Consumer = defineComponent({
      setup() {
        const uc = useUseCaseFromContext<[], void>("doSomething");
        return () =>
          h(
            "span",
            { "data-testid": "hasExecute" },
            uc && typeof uc.execute === "function" ? "yes" : "no"
          );
      },
    });
    const Root = defineComponent({
      setup() {
        return () =>
          h(CAFProvider, { useCases: { doSomething: fakeUseCase } }, { default: () => h(Consumer) });
      },
    });
    const app = createApp(Root);
    const el = document.createElement("div");
    app.mount(el);
    expect(el.querySelector("[data-testid=hasExecute]")?.textContent).toBe("yes");
    app.unmount();
  });

  it("returns the same instance as provided", () => {
    const Consumer = defineComponent({
      setup() {
        const uc = useUseCaseFromContext<[], void>("createUser");
        return () =>
          h("span", { "data-testid": "same" }, uc === fakeUseCase ? "same" : "different");
      },
    });
    const Root = defineComponent({
      setup() {
        return () =>
          h(CAFProvider, { useCases: { createUser: fakeUseCase } }, { default: () => h(Consumer) });
      },
    });
    const app = createApp(Root);
    const el = document.createElement("div");
    app.mount(el);
    expect(el.querySelector("[data-testid=same]")?.textContent).toBe("same");
    app.unmount();
  });
});
