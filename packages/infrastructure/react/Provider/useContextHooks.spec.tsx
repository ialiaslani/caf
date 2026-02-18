import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen, renderHook } from "@testing-library/react";
import { Ploc } from "@c.a.f/core";
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
  execute: async () => ({ loading: { value: false }, data: { value: null }, error: { value: null } }),
};

describe("usePlocFromContext", () => {
  it("returns undefined when used outside CAFProvider (default context)", () => {
    const { result } = renderHook(() => usePlocFromContext<CounterPloc>("user"));
    expect(result.current).toBeUndefined();
  });

  it("returns undefined when key is not registered", () => {
    const ploc = new CounterPloc(5);
    const Consumer = () => {
      const p = usePlocFromContext<CounterPloc>("nonexistent");
      return <span data-testid="out">{p === undefined ? "undefined" : "defined"}</span>;
    };
    render(
      <CAFProvider plocs={{ user: ploc }}>
        <Consumer />
      </CAFProvider>
    );
    expect(screen.getByTestId("out")).toHaveTextContent("undefined");
  });

  it("returns the Ploc when key is registered", () => {
    const ploc = new CounterPloc(42);
    const Consumer = () => {
      const p = usePlocFromContext<CounterPloc>("counter");
      return <span data-testid="state">{p ? p.state : "none"}</span>;
    };
    render(
      <CAFProvider plocs={{ counter: ploc }}>
        <Consumer />
      </CAFProvider>
    );
    expect(screen.getByTestId("state")).toHaveTextContent("42");
  });

  it("returns the same instance as provided (typed)", () => {
    const ploc = new CounterPloc(7);
    let receivedPloc: CounterPloc | undefined;
    const Consumer = () => {
      receivedPloc = usePlocFromContext<CounterPloc>("counter");
      return <span data-testid="ok">{receivedPloc === ploc ? "same" : "different"}</span>;
    };
    render(
      <CAFProvider plocs={{ counter: ploc }}>
        <Consumer />
      </CAFProvider>
    );
    expect(screen.getByTestId("ok")).toHaveTextContent("same");
    expect(receivedPloc).toBe(ploc);
    expect(receivedPloc?.increment).toBeDefined();
  });
});

describe("useUseCaseFromContext", () => {
  it("returns undefined when used outside CAFProvider (default context)", () => {
    const { result } = renderHook(() =>
      useUseCaseFromContext<[string], unknown>("createUser")
    );
    expect(result.current).toBeUndefined();
  });

  it("returns undefined when key is not registered", () => {
    const Consumer = () => {
      const uc = useUseCaseFromContext<[string], unknown>("nonexistent");
      return <span data-testid="out">{uc === undefined ? "undefined" : "defined"}</span>;
    };
    render(
      <CAFProvider useCases={{ createUser: fakeUseCase }}>
        <Consumer />
      </CAFProvider>
    );
    expect(screen.getByTestId("out")).toHaveTextContent("undefined");
  });

  it("returns the UseCase when key is registered", () => {
    const Consumer = () => {
      const uc = useUseCaseFromContext<[], void>("doSomething");
      return (
        <span data-testid="hasExecute">
          {uc && typeof uc.execute === "function" ? "yes" : "no"}
        </span>
      );
    };
    render(
      <CAFProvider useCases={{ doSomething: fakeUseCase }}>
        <Consumer />
      </CAFProvider>
    );
    expect(screen.getByTestId("hasExecute")).toHaveTextContent("yes");
  });

  it("returns the same instance as provided", () => {
    const Consumer = () => {
      const uc = useUseCaseFromContext<[], void>("createUser");
      return (
        <span data-testid="same">
          {uc === fakeUseCase ? "same" : "different"}
        </span>
      );
    };
    render(
      <CAFProvider useCases={{ createUser: fakeUseCase }}>
        <Consumer />
      </CAFProvider>
    );
    expect(screen.getByTestId("same")).toHaveTextContent("same");
  });
});
